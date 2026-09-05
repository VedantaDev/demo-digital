import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  FileCheck2,
  ImagePlus,
  LockKeyhole,
  RefreshCcw,
  ScanFace,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { matchPreparedFaceToSelfie, prepareKtpFace } from '../utils/faceVerification';
import { clearValidatedKtp, getValidatedKtp } from '../utils/verificationSession';

type VerifyProps = {
  onBack?: () => void;
  onSuccess?: () => void;
};

type VerificationStep = 1 | 2;

function StepMarker({
  number,
  label,
  active,
  complete,
}: {
  number: number;
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${active || complete ? 'text-zinc-100' : 'text-zinc-600'}`}>
      <span
        className={`flex h-8 w-8 items-center justify-center border text-xs font-semibold transition-colors ${
          complete
            ? 'border-[#ff304f] bg-[#ff304f] text-white'
            : active
              ? 'border-[#ff6178] text-[#ff6178]'
              : 'border-zinc-700'
        }`}
        data-testid={`status-langkah-${number}`}
      >
        {complete ? <Check size={15} strokeWidth={2.5} /> : number}
      </span>
      <span className="hidden text-[11px] font-medium uppercase tracking-[.12em] sm:inline">{label}</span>
    </div>
  );
}

export default function Verify({ onBack, onSuccess }: VerifyProps) {
  const sessionKtp = getValidatedKtp();
  const [step, setStep] = useState<VerificationStep>(sessionKtp.file ? 2 : 1);
  const [ktpFile, setKtpFile] = useState<File | null>(sessionKtp.file);
  const [ktpUrl, setKtpUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ktpUrlRef = useRef('');
  const selfieUrlRef = useRef('');
  const initialCameraRequestedRef = useRef(false);
  const ktpFaceDescriptorRef = useRef<Float32Array | null>(null);
  const ktpFacePromiseRef = useRef<Promise<Float32Array> | null>(null);
  const [ktpFaceState, setKtpFaceState] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    sessionKtp.file ? 'loading' : 'idle',
  );

  const revokeKtpUrl = useCallback(() => {
    if (ktpUrlRef.current) {
      URL.revokeObjectURL(ktpUrlRef.current);
      ktpUrlRef.current = '';
    }
  }, []);

  const revokeSelfieUrl = useCallback(() => {
    if (selfieUrlRef.current) {
      URL.revokeObjectURL(selfieUrlRef.current);
      selfieUrlRef.current = '';
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraStream(null);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = cameraStream;
    if (cameraStream) void video.play().catch(() => undefined);
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      revokeKtpUrl();
      revokeSelfieUrl();
    };
  }, [revokeKtpUrl, revokeSelfieUrl]);

  useEffect(() => {
    if (!processing) return;

    const interval = window.setInterval(() => {
      setProcessProgress((current) => Math.min(92, current + 1.8));
    }, 100);

    return () => {
      window.clearInterval(interval);
    };
  }, [processing]);

  useEffect(() => {
    if (!ktpFile || ktpUrl) return;
    const nextUrl = URL.createObjectURL(ktpFile);
    ktpUrlRef.current = nextUrl;
    setKtpUrl(nextUrl);
    return () => {
      URL.revokeObjectURL(nextUrl);
      if (ktpUrlRef.current === nextUrl) ktpUrlRef.current = '';
    };
  }, [ktpFile, ktpUrl]);

  useEffect(() => {
    if (!ktpFile) {
      ktpFaceDescriptorRef.current = null;
      ktpFacePromiseRef.current = null;
      setKtpFaceState('idle');
      return;
    }

    let active = true;
    setKtpFaceState('loading');
    const promise = prepareKtpFace(ktpFile);
    ktpFacePromiseRef.current = promise;
    void promise
      .then((descriptor) => {
        if (!active) return;
        ktpFaceDescriptorRef.current = descriptor;
        setKtpFaceState('ready');
      })
      .catch(() => {
        if (!active) return;
        ktpFaceDescriptorRef.current = null;
        setKtpFaceState('error');
      });

    return () => {
      active = false;
    };
  }, [ktpFile]);

  const clearSelfie = useCallback(() => {
    revokeSelfieUrl();
    setSelfieUrl('');
    setSelfieCaptured(false);
  }, [revokeSelfieUrl]);

  const handleFile = useCallback(
    (file?: File) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Pilih file gambar untuk melanjutkan verifikasi.');
        setErrorOpen(true);
        return;
      }

      stopCamera();
      clearSelfie();
      revokeKtpUrl();
      const nextUrl = URL.createObjectURL(file);
      ktpUrlRef.current = nextUrl;
      setKtpFile(file);
      setKtpUrl(nextUrl);
      setStep(1);
      setCameraError('');
      setErrorOpen(false);
    },
    [clearSelfie, revokeKtpUrl, stopCamera],
  );

  const requestCamera = useCallback(async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Perangkat ini tidak mendukung akses kamera. Gunakan perangkat dengan kamera aktif.');
      return;
    }

    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraStream(stream);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraError('Akses kamera ditolak. Izinkan kamera di pengaturan peramban untuk melanjutkan.');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCameraError('Kamera tidak ditemukan. Pastikan kamera terpasang dan tidak sedang digunakan aplikasi lain.');
      } else {
        setCameraError('Kamera tidak dapat diakses saat ini. Periksa izin kamera lalu coba lagi.');
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    if (!sessionKtp.file || !ktpFile || step !== 2 || initialCameraRequestedRef.current) return;
    initialCameraRequestedRef.current = true;
    void requestCamera();
  }, [ktpFile, requestCamera, sessionKtp.file, step]);

  const openCamera = () => {
    if (!ktpFile) return;
    setStep(2);
    setErrorOpen(false);
    void requestCamera();
  };

  const captureSelfie = () => {
    const video = videoRef.current;
    if (!video || !cameraStream || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setCameraError('Tunggu sampai kamera siap, lalu ambil foto kembali.');
      return;
    }

    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 720, video.videoHeight || 720);
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) {
      setCameraError('Foto belum dapat diambil. Coba aktifkan kamera kembali.');
      return;
    }

    const sourceSize = Math.min(video.videoWidth, video.videoHeight);
    const sourceX = (video.videoWidth - sourceSize) / 2;
    const sourceY = (video.videoHeight - sourceSize) / 2;
    context.translate(size, 0);
    context.scale(-1, 1);
    context.drawImage(video, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Foto belum dapat diproses. Coba ambil foto kembali.');
        return;
      }
      revokeSelfieUrl();
      const nextUrl = URL.createObjectURL(blob);
      selfieUrlRef.current = nextUrl;
      setSelfieUrl(nextUrl);
      setSelfieCaptured(true);
      stopCamera();
      setCameraError('');
    }, 'image/jpeg', 0.88);
  };

  const startProcessing = async () => {
    if (!selfieUrl || !ktpFile || processing) return;
    setErrorOpen(false);
    setProcessProgress(0);
    setProcessing(true);

    try {
      const selfieBlob = await fetch(selfieUrl).then((response) => response.blob());
      const ktpDescriptor = ktpFaceDescriptorRef.current
        ?? await (ktpFacePromiseRef.current ?? prepareKtpFace(ktpFile));
      const result = await matchPreparedFaceToSelfie(ktpDescriptor, selfieBlob);
      setProcessProgress(100);
      setProcessing(false);

      if (result.matched) {
        clearValidatedKtp();
        window.setTimeout(() => onSuccess?.(), 350);
        return;
      }

      setErrorMessage('Wajah tidak cocok. Pastikan pencahayaan terang dan lepas kacamata atau masker, lalu coba ambil foto ulang.');
      setErrorOpen(true);
    } catch (error) {
      setProcessing(false);
      setProcessProgress(100);
      const message = error instanceof Error ? error.message : '';
      const userMessage = message === 'FACE_KTP_NOT_FOUND'
        ? 'Wajah pada KTP tidak terdeteksi. Gunakan foto KTP yang lebih tajam dan tidak tertutup pantulan cahaya.'
        : message === 'FACE_SELFIE_NOT_FOUND'
          ? 'Wajah tidak terdeteksi. Pastikan wajah berada di dalam oval dan pencahayaan menghadap ke wajah.'
          : 'Verifikasi wajah belum dapat diproses. Pastikan kamera dan foto KTP dapat dibaca, lalu coba lagi.';
      setErrorMessage(userMessage);
      setErrorOpen(true);
    }
  };

  const retrySelfie = () => {
    setErrorOpen(false);
    setErrorMessage('');
    setProcessing(false);
    setProcessProgress(0);
    clearSelfie();
    setStep(2);
    void requestCamera();
  };

  const replaceKtp = () => {
    stopCamera();
    clearSelfie();
    setKtpFile(null);
    setKtpUrl('');
    revokeKtpUrl();
    setStep(1);
    setCameraError('');
    fileInputRef.current?.click();
  };

  const handleBack = () => {
    stopCamera();
    if (onBack) onBack();
    else if (step === 2) {
      clearSelfie();
      setStep(1);
    }
  };

  return (
    <div className="noise min-h-[100dvh] overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="scanline" />
      <header className="relative z-10 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center justify-between px-5 md:px-10">
          <button
            type="button"
            onClick={handleBack}
            className="group flex items-center gap-3 text-sm text-zinc-500 transition hover:text-zinc-100"
            data-testid="button-kembali"
          >
            <span className="flex h-8 w-8 items-center justify-center border border-zinc-800 transition group-hover:border-zinc-600">
              <ArrowLeft size={15} />
            </span>
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div className="flex items-center gap-2 text-right">
            <ShieldCheck size={16} className="text-[#ff304f]" />
            <span className="mono text-[10px] uppercase tracking-[.2em] text-zinc-400">Demo Digital / e-KYC</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-8 md:grid-cols-[250px_minmax(0,1fr)] md:px-10 md:py-14">
        <aside className="animate-rise">
          <div className="mb-8">
            <p className="mono text-[10px] uppercase tracking-[.25em] text-[#ff6178]">akses warga / 02</p>
            <h1 className="mt-4 max-w-[220px] text-3xl font-semibold leading-[.98] tracking-[-.055em] text-zinc-50 md:text-[2.55rem]">
              Verifikasi
              <span className="block text-[#ff304f]">identitas.</span>
            </h1>
            <p className="mt-5 max-w-[225px] text-sm leading-6 text-zinc-500">
              Pastikan satu suara berasal dari satu warga. Proses ini berlangsung langsung di perangkatmu.
            </p>
          </div>

          <div className="border-y border-zinc-800 py-5">
            <p className="mono mb-5 text-[9px] uppercase tracking-[.2em] text-zinc-600">alur verifikasi</p>
            <div className="space-y-5">
              <StepMarker number={1} label="Foto KTP" active={step === 1} complete={Boolean(ktpFile)} />
              <div className="ml-4 h-5 w-px bg-zinc-800" />
              <StepMarker number={2} label="Foto wajah" active={step === 2} complete={selfieCaptured && !processing} />
            </div>
          </div>

          <div className="mt-6 hidden items-start gap-2.5 text-[11px] leading-5 text-zinc-600 md:flex">
            <LockKeyhole size={14} className="mt-0.5 shrink-0 text-zinc-500" />
            Data foto diproses sementara dan tidak disimpan.
          </div>
        </aside>

        <section className="animate-rise animate-delay-1 min-w-0">
          <div className="border border-zinc-800 bg-zinc-900/65 red-glow">
            <div className="flex flex-wrap items-start justify-between gap-5 border-b border-zinc-800 px-5 py-5 md:px-8">
              <div>
                <p className="mono text-[9px] uppercase tracking-[.22em] text-zinc-600">
                  langkah {step} dari 2
                </p>
                <h2 className="mt-2 text-xl font-medium tracking-tight text-zinc-100">
                  {step === 1 ? 'Unggah foto KTP' : 'Ambil foto wajah'}
                </h2>
              </div>
              <div className="border border-emerald-500/30 bg-emerald-500/[.06] px-3 py-2 text-[10px] text-emerald-300">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                koneksi aman
              </div>
            </div>

            <div className="p-5 md:p-8">
              {step === 1 && (
                <div>
                  <p className="max-w-xl text-sm leading-6 text-zinc-400">
                    Gunakan foto KTP asli yang tajam. Seluruh sudut kartu dan tulisan harus terlihat tanpa pantulan cahaya.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => handleFile(event.target.files?.[0])}
                    data-testid="input-foto-ktp"
                  />

                  {!ktpUrl ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                        handleFile(event.dataTransfer.files?.[0]);
                      }}
                      className={`group mt-7 flex min-h-[270px] w-full flex-col items-center justify-center border border-dashed px-6 text-center transition ${
                        isDragging
                          ? 'border-[#ff304f] bg-[#ff304f]/[.08]'
                          : 'border-zinc-700 bg-zinc-950/45 hover:border-[#ff304f]/70 hover:bg-[#ff304f]/[.04]'
                      }`}
                      data-testid="button-upload-ktp"
                    >
                      <span className="mb-5 flex h-14 w-14 items-center justify-center border border-[#ff304f]/35 bg-[#ff304f]/[.06] text-[#ff6178] transition group-hover:scale-105">
                        <ImagePlus size={24} strokeWidth={1.6} />
                      </span>
                      <span className="text-sm font-medium text-zinc-200">Tarik foto KTP ke sini</span>
                      <span className="mt-2 text-xs text-zinc-600">atau klik untuk memilih dari perangkat</span>
                      <span className="mono mt-6 text-[9px] uppercase tracking-[.16em] text-zinc-700">JPG / PNG · maksimal 10 MB</span>
                    </button>
                  ) : (
                    <div className="mt-7">
                      <div className="relative overflow-hidden border border-zinc-700 bg-zinc-950">
                        <img src={ktpUrl} alt="Pratinjau foto KTP" className="max-h-[360px] w-full object-contain" data-testid="img-pratinjau-ktp" />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,48,79,.08)_1px,transparent_1px),linear-gradient(rgba(255,48,79,.08)_1px,transparent_1px)] bg-[size:26px_26px] opacity-20" />
                        <div className="absolute left-3 top-3 flex items-center gap-2 border border-emerald-500/35 bg-zinc-950/85 px-2.5 py-1.5 text-[10px] text-emerald-300">
                          <FileCheck2 size={13} />
                          foto siap diperiksa
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-zinc-200" data-testid="text-nama-ktp">{ktpFile?.name}</p>
                          <p className="mono mt-1 text-[10px] uppercase tracking-[.12em] text-zinc-600">
                            {ktpFile ? `${(ktpFile.size / 1024 / 1024).toFixed(2)} MB · gambar lokal` : ''}
                          </p>
                        </div>
                        <button type="button" onClick={replaceKtp} className="btn-quiet flex h-10 items-center gap-2 px-3 text-xs" data-testid="button-ganti-ktp">
                          <RefreshCcw size={14} />
                          Ganti foto
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-7 flex items-start gap-2.5 text-[11px] leading-5 text-zinc-600">
                    <LockKeyhole size={14} className="mt-0.5 shrink-0 text-zinc-500" />
                    Foto hanya digunakan untuk proses verifikasi di sesi ini, lalu dilepas dari perangkat.
                  </div>

                  <button
                    type="button"
                    onClick={openCamera}
                    disabled={!ktpFile}
                    className="btn-primary mt-7 flex h-12 w-full items-center justify-center gap-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto sm:px-6"
                    data-testid="button-lanjut-wajah"
                  >
                    Lanjut ke foto wajah
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}

              {step === 2 && !processing && (
                <div>
                  <p className="max-w-xl text-sm leading-6 text-zinc-400">
                    Posisikan wajahmu di dalam oval. Lepaskan kacamata hitam atau penutup wajah, lalu pastikan cahaya menghadap ke wajah.
                  </p>

                  <div className={`mt-5 flex items-center gap-2 border px-3 py-2 text-[11px] ${
                    ktpFaceState === 'ready'
                      ? 'border-emerald-500/30 bg-emerald-500/[.06] text-emerald-300'
                      : ktpFaceState === 'error'
                        ? 'border-[#ff304f]/40 bg-[#ff304f]/[.06] text-[#ff9aaa]'
                        : 'border-zinc-800 bg-zinc-950/45 text-zinc-500'
                  }`} data-testid="status-wajah-ktp">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      ktpFaceState === 'ready' ? 'bg-emerald-400' : ktpFaceState === 'error' ? 'bg-[#ff304f]' : 'animate-pulse bg-zinc-500'
                    }`} />
                    {ktpFaceState === 'ready'
                      ? 'Wajah pada KTP berhasil diisolasi dan siap dicocokkan.'
                      : ktpFaceState === 'error'
                        ? 'Wajah pada KTP belum berhasil dibaca. Foto ulang KTP dengan wajah yang lebih jelas.'
                        : 'Menyiapkan area wajah dari foto KTP...'}
                  </div>

                  <div className="relative mx-auto mt-7 max-w-[560px] overflow-hidden border border-zinc-700 bg-black">
                    {selfieCaptured && selfieUrl ? (
                      <img src={selfieUrl} alt="Pratinjau foto wajah" className="aspect-square w-full object-cover" data-testid="img-pratinjau-wajah" />
                    ) : cameraStream ? (
                      <video
                        ref={videoRef}
                        muted
                        autoPlay
                        playsInline
                        className="aspect-square w-full scale-x-[-1] object-cover"
                        aria-label="Pratinjau kamera untuk foto wajah"
                        data-testid="video-kamera"
                      />
                    ) : (
                      <div className="flex aspect-square w-full flex-col items-center justify-center bg-zinc-950 px-7 text-center">
                        <Camera size={28} className="mb-4 text-zinc-600" strokeWidth={1.5} />
                        <p className="text-sm text-zinc-400">Kamera belum aktif</p>
                        <button type="button" onClick={() => void requestCamera()} className="btn-quiet mt-5 flex h-10 items-center gap-2 px-4 text-xs" data-testid="button-aktifkan-kamera">
                          <Camera size={14} />
                          Aktifkan kamera
                        </button>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="relative h-[67%] w-[54%] rounded-[50%] border border-[#ff6178] shadow-[0_0_0_999px_rgba(0,0,0,.44),0_0_24px_rgba(255,48,79,.2)]">
                        <span className="absolute -left-px -top-px h-7 w-7 border-l-2 border-t-2 border-[#ff304f]" />
                        <span className="absolute -right-px -top-px h-7 w-7 border-r-2 border-t-2 border-[#ff304f]" />
                        <span className="absolute -bottom-px -left-px h-7 w-7 border-b-2 border-l-2 border-[#ff304f]" />
                        <span className="absolute -bottom-px -right-px h-7 w-7 border-b-2 border-r-2 border-[#ff304f]" />
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4">
                      <span className="bg-zinc-950/80 px-3 py-1.5 text-[10px] text-zinc-300 backdrop-blur-sm">
                        {selfieCaptured ? 'Foto wajah siap diperiksa' : 'Arahkan wajah ke dalam oval'}
                      </span>
                    </div>
                  </div>

                  {cameraError && (
                    <div className="mt-4 flex items-start gap-3 border border-[#ff304f]/45 bg-[#ff304f]/[.08] px-4 py-3 text-sm leading-5 text-[#ff9aaa]" data-testid="status-error-kamera">
                      <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button type="button" onClick={() => { stopCamera(); clearSelfie(); setStep(1); }} className="btn-quiet flex h-11 items-center justify-center gap-2 px-4 text-sm" data-testid="button-kembali-ktp">
                      <ArrowLeft size={15} />
                      Kembali ke KTP
                    </button>
                    {!selfieCaptured ? (
                      <button type="button" onClick={captureSelfie} disabled={!cameraStream} className="btn-primary flex h-11 items-center justify-center gap-2 px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-35" data-testid="button-ambil-selfie">
                        <Camera size={17} />
                        Ambil foto
                      </button>
                    ) : (
                      <button type="button" onClick={startProcessing} className="btn-primary flex h-11 items-center justify-center gap-2 px-5 text-sm font-semibold" data-testid="button-mulai-verifikasi">
                        <ScanFace size={17} />
                        Mulai verifikasi
                      </button>
                    )}
                  </div>
                </div>
              )}

              {processing && ktpUrl && selfieUrl && (
                <div className="animate-rise">
                  <div className="mb-7 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center border border-[#ff304f]/50 bg-[#ff304f]/[.08] text-[#ff6178]">
                      <ScanFace size={18} />
                    </span>
                    <div>
                       <p className="text-sm font-medium text-zinc-100">Sedang memverifikasi...</p>
                      <p className="mono mt-1 text-[9px] uppercase tracking-[.14em] text-zinc-600">jangan tutup halaman ini</p>
                    </div>
                  </div>

                  <div className="relative grid gap-3 sm:grid-cols-2">
                    <div className="relative overflow-hidden border border-zinc-700 bg-black">
                      <img src={ktpUrl} alt="Foto KTP yang sedang diperiksa" className="aspect-[1.55] w-full object-contain opacity-80" data-testid="img-proses-ktp" />
                      <span className="absolute left-3 top-3 border border-zinc-600 bg-zinc-950/85 px-2 py-1 text-[9px] uppercase tracking-[.16em] text-zinc-400">dokumen</span>
                    </div>
                    <div className="relative overflow-hidden border border-zinc-700 bg-black">
                      <img src={selfieUrl} alt="Foto wajah yang sedang diperiksa" className="aspect-[1.55] w-full object-cover opacity-80" data-testid="img-proses-wajah" />
                      <span className="absolute left-3 top-3 border border-zinc-600 bg-zinc-950/85 px-2 py-1 text-[9px] uppercase tracking-[.16em] text-zinc-400">wajah</span>
                    </div>
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-0.5 animate-[scan_1.45s_linear_infinite] bg-[#ff304f] shadow-[0_0_14px_3px_rgba(255,48,79,.7)]" />
                    </div>
                  </div>

                  <div className="mt-7">
                    <div className="mb-2 flex items-center justify-between text-xs">
                       <span className="text-zinc-400" data-testid="status-pemrosesan">Mencocokkan wajah KTP dengan selfie...</span>
                      <span className="mono text-[#ff6178]" data-testid="text-progress">{Math.round(processProgress)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden bg-zinc-800">
                      <div className="h-full bg-[#ff304f] transition-[width] duration-100" style={{ width: `${processProgress}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {errorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 px-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="judul-verifikasi-gagal" data-testid="modal-verifikasi-gagal">
          <div className="w-full max-w-[430px] border border-[#ff304f]/45 bg-zinc-900 p-6 red-glow-strong md:p-8">
            <div className="flex items-start justify-between gap-5">
              <span className="flex h-11 w-11 items-center justify-center border border-[#ff304f]/45 bg-[#ff304f]/[.08] text-[#ff6178]">
                <AlertTriangle size={21} />
              </span>
              <button type="button" onClick={() => setErrorOpen(false)} className="text-zinc-600 transition hover:text-zinc-200" aria-label="Tutup pesan" data-testid="button-tutup-modal">
                <X size={19} />
              </button>
            </div>
            <p className="mono mt-6 text-[9px] uppercase tracking-[.22em] text-[#ff6178]">verifikasi belum berhasil</p>
            <h2 id="judul-verifikasi-gagal" className="mt-2 text-xl font-medium tracking-tight text-zinc-100">Coba sekali lagi</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400" data-testid="text-pesan-gagal">{errorMessage}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
              <button type="button" onClick={retrySelfie} className="btn-primary flex h-11 items-center justify-center gap-2 px-5 text-sm font-semibold" data-testid="button-coba-lagi">
                <RefreshCcw size={15} />
                Coba Lagi
              </button>
              <button type="button" onClick={() => { setErrorOpen(false); setStep(1); }} className="btn-quiet flex h-11 items-center justify-center px-5 text-sm" data-testid="button-ubah-ktp">
                Ubah foto KTP
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="relative z-10 mx-auto flex w-full max-w-[1180px] items-center gap-2 px-5 pb-7 text-[10px] text-zinc-700 md:px-10">
        <Upload size={12} />
        <span>Verifikasi aman · diproses sementara di perangkat ini</span>
      </footer>
    </div>
  );
}