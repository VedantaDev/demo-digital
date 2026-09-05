import * as faceapi from '@vladmandic/face-api';

export const FACE_MATCH_THRESHOLD = 0.6;

const MODEL_PATH = `${import.meta.env.BASE_URL}models`;
let modelsPromise: Promise<void> | null = null;

function loadImage(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gambar tidak dapat dibaca oleh mesin verifikasi.'));
    };
    image.src = url;
  });
}

async function loadModels() {
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_PATH),
    ]).then(() => undefined);
  }
  return modelsPromise;
}

async function detectDescriptor(input: HTMLImageElement | HTMLCanvasElement) {
  return faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.25 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
}

export async function prepareKtpFace(file: File): Promise<Float32Array> {
  await loadModels();
  const image = await loadImage(file);
  const detection = await detectDescriptor(image);
  if (!detection) throw new Error('FACE_KTP_NOT_FOUND');

  const { box } = detection.detection;
  const paddingX = box.width * 0.3;
  const paddingY = box.height * 0.38;
  const x = Math.max(0, box.x - paddingX);
  const y = Math.max(0, box.y - paddingY);
  const right = Math.min(image.naturalWidth, box.x + box.width + paddingX);
  const bottom = Math.min(image.naturalHeight, box.y + box.height + paddingY);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(right - x));
  canvas.height = Math.max(1, Math.round(bottom - y));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('FACE_KTP_CROP_FAILED');
  context.drawImage(image, x, y, right - x, bottom - y, 0, 0, canvas.width, canvas.height);

  const croppedDetection = await detectDescriptor(canvas);
  return croppedDetection?.descriptor ?? detection.descriptor;
}

export async function matchPreparedFaceToSelfie(ktpDescriptor: Float32Array, selfieBlob: Blob) {
  await loadModels();
  const selfieImage = await loadImage(selfieBlob);
  const selfieDetection = await detectDescriptor(selfieImage);
  if (!selfieDetection) throw new Error('FACE_SELFIE_NOT_FOUND');

  const distance = faceapi.euclideanDistance(ktpDescriptor, selfieDetection.descriptor);
  return {
    distance,
    threshold: FACE_MATCH_THRESHOLD,
    matched: distance <= FACE_MATCH_THRESHOLD,
  };
}