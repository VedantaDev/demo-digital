import { isValidNIK } from './validateNik';

export const MIN_OCR_CONFIDENCE = 30;

export type KtpScanResult = {
  nik: string;
  name: string;
  confidence: number;
  text: string;
  preprocessing: 'adaptive-threshold' | 'grayscale';
};

type OcrVariant = {
  source: HTMLCanvasElement;
  preprocessing: KtpScanResult['preprocessing'];
};

type OcrRead = {
  text: string;
  confidence: number;
  preprocessing: KtpScanResult['preprocessing'];
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Foto KTP tidak dapat dibaca.'));
    };
    image.src = url;
  });
}

function canvasFromImage(image: HTMLImageElement): HTMLCanvasElement {
  const maxDimension = 1800;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Perangkat tidak mendukung pemrosesan gambar.');
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function rotateCanvas(source: HTMLCanvasElement, degrees: number): HTMLCanvasElement {
  const angle = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(angle));
  const cos = Math.abs(Math.cos(angle));
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(source.width * cos + source.height * sin);
  canvas.height = Math.ceil(source.width * sin + source.height * cos);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Perangkat tidak mendukung pemrosesan gambar.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(angle);
  context.drawImage(source, -source.width / 2, -source.height / 2);
  return canvas;
}

function deskewScore(canvas: HTMLCanvasElement): number {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return 0;
  const sampleWidth = Math.min(canvas.width, 900);
  const sampleHeight = Math.max(1, Math.round((canvas.height / canvas.width) * sampleWidth));
  const sample = document.createElement('canvas');
  sample.width = sampleWidth;
  sample.height = sampleHeight;
  const sampleContext = sample.getContext('2d', { willReadFrequently: true });
  if (!sampleContext) return 0;
  sampleContext.drawImage(canvas, 0, 0, sampleWidth, sampleHeight);
  const pixels = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
  const rowInk = new Array<number>(sampleHeight).fill(0);
  const xStart = Math.round(sampleWidth * 0.06);
  const xEnd = Math.round(sampleWidth * 0.94);
  const yStart = Math.round(sampleHeight * 0.08);
  const yEnd = Math.round(sampleHeight * 0.92);

  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = xStart; x < xEnd; x += 2) {
      const index = (y * sampleWidth + x) * 4;
      const luminance = pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
      if (luminance < 165) rowInk[y] += 1;
    }
  }

  const mean = rowInk.slice(yStart, yEnd).reduce((sum, value) => sum + value, 0) / Math.max(1, yEnd - yStart);
  return rowInk.slice(yStart, yEnd).reduce((score, value) => score + (value - mean) ** 2, 0);
}

function autoDeskew(source: HTMLCanvasElement): HTMLCanvasElement {
  let bestAngle = 0;
  let bestScore = deskewScore(source);

  for (let angle = -12; angle <= 12; angle += 1) {
    if (angle === 0) continue;
    const candidate = rotateCanvas(source, angle);
    const score = deskewScore(candidate);
    if (score > bestScore) {
      bestScore = score;
      bestAngle = angle;
    }
  }

  return bestAngle === 0 ? source : rotateCanvas(source, bestAngle);
}

function grayscaleCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const sourceContext = source.getContext('2d', { willReadFrequently: true });
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!sourceContext || !context) throw new Error('Perangkat tidak mendukung pemrosesan gambar.');

  const imageData = sourceContext.getImageData(0, 0, source.width, source.height);
  for (let index = 0; index < imageData.data.length; index += 4) {
    const value = Math.round(
      imageData.data[index] * 0.299
      + imageData.data[index + 1] * 0.587
      + imageData.data[index + 2] * 0.114,
    );
    imageData.data[index] = value;
    imageData.data[index + 1] = value;
    imageData.data[index + 2] = value;
  }
  context.putImageData(imageData, 0, 0);
  return canvas;
}

function adaptiveThresholdCanvas(grayscale: HTMLCanvasElement): HTMLCanvasElement {
  const width = grayscale.width;
  const height = grayscale.height;
  const sourceContext = grayscale.getContext('2d', { willReadFrequently: true });
  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const outputContext = output.getContext('2d', { willReadFrequently: true });
  if (!sourceContext || !outputContext) throw new Error('Perangkat tidak mendukung pemrosesan gambar.');

  const pixels = sourceContext.getImageData(0, 0, width, height).data;
  const integral = new Float64Array((width + 1) * (height + 1));
  for (let y = 1; y <= height; y += 1) {
    let rowSum = 0;
    for (let x = 1; x <= width; x += 1) {
      rowSum += pixels[((y - 1) * width + (x - 1)) * 4];
      integral[y * (width + 1) + x] = integral[(y - 1) * (width + 1) + x] + rowSum;
    }
  }

  const outputData = outputContext.createImageData(width, height);
  const radius = Math.max(8, Math.round(Math.min(width, height) * 0.018));
  const offset = 10;
  for (let y = 0; y < height; y += 1) {
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x += 1) {
      const left = Math.max(0, x - radius);
      const right = Math.min(width - 1, x + radius);
      const area = (right - left + 1) * (bottom - top + 1);
      const sum = integral[(bottom + 1) * (width + 1) + right + 1]
        - integral[top * (width + 1) + right + 1]
        - integral[(bottom + 1) * (width + 1) + left]
        + integral[top * (width + 1) + left];
      const average = sum / area;
      const value = pixels[(y * width + x) * 4] < average - offset ? 0 : 255;
      const index = (y * width + x) * 4;
      outputData.data[index] = value;
      outputData.data[index + 1] = value;
      outputData.data[index + 2] = value;
      outputData.data[index + 3] = 255;
    }
  }
  outputContext.putImageData(outputData, 0, 0);
  return output;
}

function normalizeOcrDigits(value: string): string {
  return value
    .toUpperCase()
    .replace(/[OQD]/g, '0')
    .replace(/[IL]/g, '1')
    .replace(/Z/g, '2')
    .replace(/S/g, '5')
    .replace(/B/g, '8')
    .replace(/G/g, '6')
    .replace(/[^0-9]/g, '');
}

function extractNik(text: string): string {
  const lines = text.split(/\r?\n/);
  const candidates: string[] = [];
  for (const line of lines) {
    const token = normalizeOcrDigits(line);
    if (token.length >= 16) {
      for (let start = 0; start <= token.length - 16; start += 1) {
        candidates.push(token.slice(start, start + 16));
      }
    }
  }

  const validCandidate = candidates.find((candidate) => isValidNIK(candidate).valid);
  return validCandidate ?? candidates[0] ?? '';
}

function editDistance(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let previous = row[0];
    row[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const current = row[rightIndex];
      row[rightIndex] = left[leftIndex - 1] === right[rightIndex - 1]
        ? previous
        : 1 + Math.min(previous, row[rightIndex], row[rightIndex - 1]);
      previous = current;
    }
  }
  return row[right.length];
}

function isNameLabel(value: string): boolean {
  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/[450]/g, 'A');
  return normalized.length >= 3 && normalized.length <= 5 && editDistance(normalized, 'NAMA') <= 1;
}

function cleanName(value: string): string {
  return value
    .replace(/^[\s:;.,\-|]+|[\s:;.,\-|]+$/g, '')
    .replace(/[^A-ZÀ-ÖØ-Ýa-zà-öø-ÿ' -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractName(text: string): string {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (let index = 0; index < lines.length; index += 1) {
    const parts = lines[index].split(/\s+/);
    if (!isNameLabel(parts[0])) continue;
    const sameLine = cleanName(parts.slice(1).join(' '));
    if (sameLine.length >= 2) return sameLine;
    const nextLine = cleanName(lines[index + 1] ?? '');
    if (nextLine.length >= 2 && !/^(NIK|TEMPAT|LAHIR|ALAMAT|AGAMA|STATUS|PEKERJAAN|KEWARGANEGARAAN)\b/i.test(nextLine)) {
      return nextLine;
    }
  }
  return '';
}

async function recognizeVariant(variant: OcrVariant): Promise<OcrRead> {
  const { default: Tesseract } = await import('tesseract.js');
  const result = await Tesseract.recognize(variant.source, 'ind+eng');
  return {
    text: result.data.text,
    confidence: Math.round(result.data.confidence ?? 0),
    preprocessing: variant.preprocessing,
  };
}

export async function scanKtpImage(file: File): Promise<KtpScanResult> {
  const image = await loadImage(file);
  const source = canvasFromImage(image);
  const deskewed = autoDeskew(source);
  const grayscale = grayscaleCanvas(deskewed);
  const thresholded = adaptiveThresholdCanvas(grayscale);
  const variants: OcrVariant[] = [
    { source: thresholded, preprocessing: 'adaptive-threshold' },
    { source: grayscale, preprocessing: 'grayscale' },
  ];
  const reads = await Promise.all(variants.map(recognizeVariant));
  const scored = reads.map((read) => {
    const nik = extractNik(read.text);
    const name = extractName(read.text);
    const validNik = isValidNIK(nik).valid;
    return {
      ...read,
      nik: validNik ? nik : '',
      name,
      score: (validNik ? 100 : 0) + (name ? 10 : 0) + read.confidence / 100,
    };
  }).sort((left, right) => right.score - left.score);
  const best = scored[0];

  if (!best || !best.nik || best.confidence < MIN_OCR_CONFIDENCE) {
    throw new Error('Sistem tidak dapat menemukan NIK dengan keyakinan yang cukup.');
  }

  return {
    nik: best.nik,
    name: best.name,
    confidence: best.confidence,
    text: best.text,
    preprocessing: best.preprocessing,
  };
}