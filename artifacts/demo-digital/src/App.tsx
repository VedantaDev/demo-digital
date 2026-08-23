import { useEffect, useMemo, useState } from 'react';
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from 'react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Bell, Check, ChevronRight, CircleDollarSign,
  Clock3, Compass, Heart, Home, Landmark, LockKeyhole, LogOut, MessageSquare,
  Plus, Radio, Search, ShieldCheck, Sparkles, ThumbsUp, Users, X, Zap,
} from 'lucide-react';

type Issue = {
  id: string; category: string; title: string; description: string; votes: number;
  target: number; supporters: number; comments: number; author: string; time: string; hot?: boolean;
};

const NIKS = ['1111111111111111', '2222222222222222', '3333333333333333', '4444444444444444', '5555555555555555'];
const ASSET_BASE = import.meta.env.BASE_URL;
const initialIssues: Issue[] = [
  { id: 'mbg-tepat-sasaran', category: 'PENDIDIKAN & GIZI', title: 'Pastikan MBG hadir tepat sasaran untuk anak Indonesia', description: 'Dorong transparansi anggaran, kualitas menu, dan pengawasan distribusi agar program Makan Bergizi Gratis benar-benar sampai ke anak yang membutuhkan.', votes: 18240, target: 20000, supporters: 1248, comments: 356, author: 'Suara Pelajar Nusantara', time: '47 menit lalu', hot: true },
  { id: 'berantas-korupsi', category: 'INTEGRITAS PUBLIK', title: 'Perkuat penanganan korupsi tanpa pandang bulu', description: 'Kawal penegakan hukum yang transparan dan tegas. Tidak boleh ada impunitas bagi siapa pun yang merugikan uang rakyat.', votes: 15680, target: 18000, supporters: 1092, comments: 418, author: 'Kawal Anggaran', time: '2 jam lalu', hot: true },
  { id: 'jalan-daerah-layak', category: 'INFRASTRUKTUR', title: 'Jalanan daerah layak dan aman dilalui warga', description: 'Minta pemerintah mempercepat perbaikan jalan rusak di daerah, memasang penerangan, dan membuka progres pengerjaan untuk publik.', votes: 12942, target: 16000, supporters: 867, comments: 241, author: 'Warga Bergerak', time: '5 jam lalu', hot: true },
  { id: 'transparansi-kebijakan', category: 'KEBIJAKAN PUBLIK', title: 'Buka data kebijakan agar publik bisa mengawasi', description: 'Setiap keputusan yang berdampak pada warga harus mudah diakses, dipahami, dan dipertanggungjawabkan secara terbuka.', votes: 7860, target: 12000, supporters: 516, comments: 129, author: 'Forum Warga Terbuka', time: '1 hari lalu' },
];

const formatNum = (n: number) => new Intl.NumberFormat('id-ID').format(n);
const formatRupiah = (n: number) => `Rp ${new Intl.NumberFormat('id-ID').format(n)}`;

function Logo({ compact = false }: { compact?: boolean }) {
  return <Link href="/beranda" className={`flex items-center ${compact ? 'justify-center' : 'gap-3'} group`}><img src={`${ASSET_BASE}logo.png`} alt="Demo Digital" className={compact ? 'h-9 w-9 object-cover object-left rounded' : 'h-10 w-[116px] object-contain object-left'} /><span className="sr-only">Demo Digital</span></Link>;
}

function Login() {
  const [, setLocation] = useLocation();
  const [nik, setNik] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (!NIKS.includes(nik)) { setError('NIK tidak terdaftar. Silakan periksa kembali NIK Anda.'); return; }
    setLoading(true); setTimeout(() => { setLocation('/beranda'); }, 650);
  };
  return <div className="noise relative min-h-[100dvh] overflow-hidden bg-zinc-950">
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,.98)_0%,rgba(9,9,11,.82)_45%,rgba(9,9,11,.62)_100%)] z-10" />
    <img src={`${ASSET_BASE}hero.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover object-center opacity-55" />
    <div className="scanline" />
    <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-[1440px] flex-col justify-between px-6 py-7 md:px-12 md:py-9">
      <header className="flex items-center justify-between"><Logo /><div className="mono text-[10px] uppercase tracking-[.25em] text-zinc-500"><span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#ff304f] shadow-[0_0_10px_#ff304f]" />sistem aktif / 2025</div></header>
      <main className="grid items-center gap-14 py-12 md:grid-cols-[minmax(0,580px)_1fr] md:gap-20">
        <section className="animate-rise">
          <div className="mb-7 flex items-center gap-3 text-[#ff6178]"><div className="h-px w-10 bg-[#ff304f]" /><span className="mono text-[10px] font-bold uppercase tracking-[.27em]">suara warga, daya nyata</span></div>
          <h1 className="max-w-xl text-5xl font-semibold leading-[.96] tracking-[-.06em] text-zinc-50 md:text-7xl">Satu suara.<br /><span className="text-[#ff304f]">Banyak perubahan.</span></h1>
          <p className="mt-7 max-w-md text-base leading-7 text-zinc-400 md:text-lg">Temukan isu yang penting bagimu, bergabung dengan gerakan, dan ubah keresahan menjadi aksi kolektif.</p>
          <div className="mt-10 flex flex-wrap gap-7 text-xs text-zinc-500"><div><strong className="block text-xl font-medium text-zinc-100">24.8K</strong>suara terkumpul</div><div className="border-l border-zinc-700 pl-7"><strong className="block text-xl font-medium text-zinc-100">186</strong>isu aktif</div><div className="border-l border-zinc-700 pl-7"><strong className="block text-xl font-medium text-zinc-100">42</strong>kota bergerak</div></div>
        </section>
        <section className="animate-rise animate-delay-2 w-full max-w-md justify-self-end">
          <div className="border border-zinc-800 bg-zinc-950/85 p-6 backdrop-blur-xl red-glow md:p-8">
            <div className="mb-8 flex items-start justify-between"><div><p className="mono mb-2 text-[10px] uppercase tracking-[.22em] text-zinc-500">akses warga</p><h2 className="text-2xl font-medium tracking-tight">Masuk ke Demo Digital</h2></div><div className="flex h-9 w-9 items-center justify-center border border-[#ff304f]/40 text-[#ff304f]"><LockKeyhole size={16} /></div></div>
            <form onSubmit={submit} className="space-y-5">
              <label className="block"><span className="mb-2 block text-sm text-zinc-300">Nomor Induk Kependudukan</span><input value={nik} onChange={e => { setNik(e.target.value.replace(/\D/g, '').slice(0, 16)); setError(''); }} inputMode="numeric" maxLength={16} placeholder="Masukkan 16 digit NIK" className="field mono h-12 w-full px-4 text-sm tracking-[.18em]" /><span className="mt-2 block text-[11px] text-zinc-600">Data kamu aman dan hanya digunakan untuk verifikasi.</span></label>
              {error && <div className="border border-[#ff304f]/40 bg-[#ff304f]/10 px-3 py-2.5 text-sm text-[#ff8495]">{error}</div>}
              <button disabled={loading} className="btn-primary flex h-12 w-full items-center justify-center gap-3 text-sm font-semibold disabled:opacity-70">{loading ? 'Memverifikasi...' : <>Masuk ke ruang isu <ArrowRight size={16} /></>}</button>
            </form>
            <div className="mt-8 border-t border-zinc-800 pt-5 text-center"><p className="text-[11px] leading-5 text-zinc-600">Dengan masuk, kamu menyetujui <span className="text-zinc-400">panduan komunitas</span> Demo Digital.</p></div>
          </div>
        </section>
      </main>
      <footer className="mono flex flex-wrap gap-4 text-[9px] uppercase tracking-[.2em] text-zinc-600"><span>DD / civic action platform</span><span>•</span><span>dibangun untuk perubahan</span></footer>
    </div>
  </div>;
}

function SideNav({ mobile = false }: { mobile?: boolean }) {
  const items = [{ href: '/beranda', label: 'Beranda', icon: Home }, { href: '/beranda?filter=tren', label: 'Jelajahi isu', icon: Compass }, { href: '/beranda?filter=dukungan', label: 'Dukungan saya', icon: Heart }];
  return <nav className={mobile ? 'flex items-center justify-around' : 'space-y-1'}>{items.map(({ href, label, icon: Icon }) => <Link key={label} href={href} className={`group flex items-center ${mobile ? 'flex-col gap-1 px-3 py-2 text-[10px]' : 'gap-3 px-3 py-3 text-sm'} text-zinc-500 transition-colors hover:text-zinc-100`}><Icon size={mobile ? 18 : 17} strokeWidth={1.7} /><span>{label}</span></Link>)}</nav>;
}

function Shell({ children, issuesCount }: { children: ReactNode; issuesCount: number }) {
  const [, setLocation] = useLocation();
  return <div className="noise min-h-[100dvh] bg-zinc-950">
    <div className="scanline" />
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[224px] border-r border-zinc-800/80 bg-zinc-950 md:flex md:flex-col md:px-5 md:py-7">
      <Logo />
      <div className="mt-14"><p className="mono mb-4 px-3 text-[9px] uppercase tracking-[.22em] text-zinc-600">ruang kamu</p><SideNav /></div>
      <div className="mt-auto"><div className="mb-6 border border-zinc-800 bg-zinc-900/70 p-3"><div className="mb-3 flex items-center gap-2 text-[#ff6178]"><Radio size={14} /><span className="mono text-[9px] uppercase tracking-widest">siaran langsung</span></div><p className="text-xs leading-5 text-zinc-400">{formatNum(issuesCount * 138)} warga sedang bergerak.</p><div className="mt-3 h-1 bg-zinc-800"><div className="h-full w-[68%] bg-[#ff304f]" /></div></div><button onClick={() => setLocation('/')} className="flex w-full items-center gap-3 px-3 py-3 text-sm text-zinc-600 transition hover:text-zinc-300"><LogOut size={16} /> Keluar</button></div>
    </aside>
      <div className="md:pl-[224px]"><header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-5 backdrop-blur-xl md:px-10"><div className="flex items-center gap-3 md:hidden"><Logo compact /></div><div className="hidden items-center gap-2 text-sm text-zinc-500 md:flex"><span className="text-zinc-300">Selamat datang kembali</span><span>/</span><span>Jumat, 24 Mei 2025</span></div><div className="ml-auto flex items-center gap-5"><button className="relative text-zinc-500 transition hover:text-zinc-100"><Bell size={18} /><span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-[#ff304f]" /></button><div className="hidden h-5 w-px bg-zinc-800 sm:block" /><button className="flex items-center gap-2 text-left"><img src={`${ASSET_BASE}avatar.png`} alt="Profil warga" className="h-8 w-8 rounded-full border border-[#ff304f]/60 object-cover" /><span className="hidden text-xs text-zinc-300 sm:block">Warga terverifikasi</span></button></div></header><main className="pb-24 md:pb-10">{children}</main></div>
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800 bg-zinc-950/95 px-4 pb-1 backdrop-blur-xl md:hidden"><SideNav mobile /></div>
  </div>;
}

function StatStrip() {
  return <div className="grid grid-cols-3 border-y border-zinc-800 py-5"><div className="border-r border-zinc-800 px-4 md:px-6"><p className="mono text-[9px] uppercase tracking-widest text-zinc-600">isu aktif</p><p className="mt-1 text-xl font-medium text-zinc-100">186</p></div><div className="border-r border-zinc-800 px-4 md:px-6"><p className="mono text-[9px] uppercase tracking-widest text-zinc-600">warga bergerak</p><p className="mt-1 text-xl font-medium text-zinc-100">24.8K</p></div><div className="px-4 md:px-6"><p className="mono text-[9px] uppercase tracking-widest text-zinc-600">dana terkumpul</p><p className="mt-1 text-xl font-medium text-[#ff6178]">Rp 1.2M</p></div></div>;
}

function IssueCard({ issue, voted, onVote }: { issue: Issue; voted: boolean; onVote: () => void }) {
  const percentage = Math.min(100, Math.round((issue.votes / issue.target) * 100));
  return <article className="group relative border border-zinc-800 bg-zinc-900/40 p-5 transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-900/70 md:p-6">
    <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#ff304f]" /><span className="mono text-[9px] font-bold tracking-[.18em] text-[#ff6178]">{issue.category}</span>{issue.hot && <span className="border border-[#ff304f]/30 px-1.5 py-0.5 text-[9px] text-[#ff8495]">RAMAI</span>}</div><span className="mono text-[10px] text-zinc-600">{issue.time}</span></div>
    <Link href={`/isu/${issue.id}`} className="block"><h3 className="mt-5 max-w-xl text-xl font-medium leading-tight tracking-tight text-zinc-100 transition-colors group-hover:text-[#ff8495] md:text-2xl">{issue.title}</h3><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">{issue.description}</p></Link>
    <div className="mt-6"><div className="mb-2 flex justify-between text-[11px]"><span className="text-zinc-400"><strong className="font-medium text-zinc-200">{formatNum(issue.votes)}</strong> suara terkumpul</span><span className="mono text-zinc-600">{percentage}%</span></div><div className="h-1 bg-zinc-800"><div className="h-full bg-[#ff304f] transition-all duration-700" style={{ width: `${percentage}%` }} /></div></div>
    <div className="mt-6 flex items-center justify-between border-t border-zinc-800/70 pt-4"><div className="flex items-center gap-4 text-xs text-zinc-600"><span className="flex items-center gap-1.5"><Users size={14} /> {formatNum(issue.supporters)}</span><span className="flex items-center gap-1.5"><MessageSquare size={14} /> {formatNum(issue.comments)}</span></div><button onClick={onVote} className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition ${voted ? 'border border-[#ff304f]/60 bg-[#ff304f]/10 text-[#ff6178]' : 'btn-quiet'}`}><ThumbsUp size={14} fill={voted ? 'currentColor' : 'none'} /> {voted ? 'Didukung' : 'Dukung isu'}</button></div>
  </article>;
}

function NewIssueModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (title: string, desc: string) => void }) {
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState('');
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="w-full max-w-lg border border-zinc-700 bg-zinc-950 p-6 red-glow sm:p-8">
    <div className="mb-7 flex items-start justify-between"><div><p className="mono mb-2 text-[9px] tracking-[.2em] text-[#ff6178]">MULAI GERAKAN</p><h2 className="text-2xl font-medium">Buat isu baru</h2></div><button onClick={onClose} className="text-zinc-500 hover:text-zinc-100"><X size={20} /></button></div>
    <form onSubmit={e => { e.preventDefault(); if (title.trim() && desc.trim()) onSubmit(title, desc); }} className="space-y-5"><label className="block"><span className="mb-2 block text-sm text-zinc-300">Judul isu</span><input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Apa yang ingin kamu ubah?" className="field h-12 w-full px-4 text-sm" /></label><label className="block"><span className="mb-2 block text-sm text-zinc-300">Ceritakan masalahnya</span><textarea required value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="Beri konteks agar warga lain bisa ikut memahami..." className="field w-full resize-none p-4 text-sm leading-6" /></label><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="btn-quiet px-4 py-2.5 text-sm">Batal</button><button className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-medium">Terbitkan isu <ArrowRight size={15} /></button></div></form>
  </div></div>;
}

function Beranda({ issues, setIssues }: { issues: Issue[]; setIssues: Dispatch<SetStateAction<Issue[]>> }) {
  const [search, setSearch] = useState(''); const [modal, setModal] = useState(false); const [voted, setVoted] = useState<string[]>([]);
  const filtered = useMemo(() => issues.filter(i => `${i.title} ${i.description} ${i.category}`.toLowerCase().includes(search.toLowerCase())), [issues, search]);
  const vote = (id: string) => { if (voted.includes(id)) return; setVoted(v => [...v, id]); setIssues(all => all.map(i => i.id === id ? { ...i, votes: i.votes + 1, supporters: i.supporters + 1 } : i)); };
  const addIssue = (title: string, desc: string) => { const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `isu-${Date.now()}`; setIssues(all => [{ id, category: 'SUARA WARGA', title, description: desc, votes: 1, target: 5000, supporters: 1, comments: 0, author: 'Kamu', time: 'baru saja' }, ...all]); setModal(false); };
  return <Shell issuesCount={issues.length}><div className="mx-auto max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
    <section className="animate-rise relative min-h-[310px] overflow-hidden border border-[#ff304f]/40 bg-zinc-900/50 p-6 red-glow md:p-10"><img src={`${ASSET_BASE}hero-pecintakalah.jpeg`} alt="Aksi warga menyuarakan perubahan" className="absolute inset-0 h-full w-full object-cover object-center opacity-35" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,.98)_0%,rgba(9,9,11,.78)_52%,rgba(9,9,11,.26)_100%)]" /><div className="absolute right-0 top-0 h-full w-1/2 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #ff304f 0, transparent 1px)', backgroundSize: '18px 18px' }} /><div className="relative max-w-2xl"><div className="mb-5 flex items-center gap-2 text-[#ff6178]"><Zap size={15} fill="currentColor" /><span className="mono text-[10px] font-bold uppercase tracking-[.24em]">pecintaKalah / ruang isu nasional</span></div><h1 className="text-4xl font-semibold tracking-[-.05em] md:text-6xl">Keresahanmu<br /><span className="text-[#ff304f]">punya tempat.</span></h1><p className="mt-5 max-w-lg text-sm leading-6 text-zinc-300 md:text-base">Baca. Pilih. Bergerak. Setiap dukungan menambah tekanan yang terlihat dan membuat perubahan tak bisa diabaikan.</p><button onClick={() => setModal(true)} className="btn-primary mt-7 flex items-center gap-2 px-5 py-3 text-sm font-medium"><Plus size={17} /> Buat isu baru</button></div><div className="absolute bottom-5 right-7 hidden text-right md:block"><p className="mono text-[9px] uppercase tracking-[.2em] text-zinc-400">sinyal warga</p><p className="mt-1 text-4xl font-medium text-zinc-100">+24.8K</p></div></section>
    <div className="my-9"><StatStrip /></div>
    <section className="animate-rise animate-delay-1"><div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mono mb-2 text-[10px] uppercase tracking-[.2em] text-[#ff6178]">prioritas komunitas</p><h2 className="text-2xl font-medium tracking-tight md:text-3xl">Isu yang sedang bergerak</h2></div><div className="flex flex-col gap-3 sm:flex-row"><div className="relative"><Search size={16} className="absolute left-3 top-3 text-zinc-600" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari isu..." className="field h-10 w-full pl-9 pr-3 text-sm sm:w-52" /></div><button className="btn-quiet flex h-10 items-center justify-center gap-2 px-3 text-xs"><Sparkles size={14} /> Paling ramai <ChevronRight size={13} /></button></div></div><div className="grid gap-4">{filtered.map((issue, idx) => <div key={issue.id} className={`animate-rise animate-delay-${Math.min(idx + 1, 3)}`}><IssueCard issue={issue} voted={voted.includes(issue.id)} onVote={() => vote(issue.id)} /></div>)}{filtered.length === 0 && <div className="border border-dashed border-zinc-700 py-16 text-center"><Search className="mx-auto mb-3 text-zinc-600" size={25} /><p className="text-zinc-300">Isu tidak ditemukan</p><p className="mt-1 text-sm text-zinc-600">Coba kata kunci lain atau buat isu baru.</p></div>}</div></section>
    <div className="mt-12 flex items-center justify-between border-t border-zinc-800 pt-5 text-xs text-zinc-600"><span>Menampilkan {filtered.length} dari {issues.length} isu</span><span className="mono">data diperbarui langsung</span></div>
  </div>{modal && <NewIssueModal onClose={() => setModal(false)} onSubmit={addIssue} />}</Shell>;
}

function Countdown({ end }: { end: number }) {
  const [remaining, setRemaining] = useState(Math.max(0, end - Date.now()));
  useEffect(() => { const timer = setInterval(() => setRemaining(Math.max(0, end - Date.now())), 1000); return () => clearInterval(timer); }, [end]);
  const total = Math.floor(remaining / 1000); const h = Math.floor(total / 3600); const m = Math.floor((total % 3600) / 60); const s = total % 60;
  return <div className="flex gap-2 md:gap-3">{[[h, 'JAM'], [m, 'MENIT'], [s, 'DETIK']].map(([n, label]) => <div key={label} className="min-w-[68px] border border-zinc-700 bg-zinc-900/80 px-2 py-2.5 text-center md:min-w-[78px]"><div className="mono text-xl font-bold text-[#ff6178] md:text-2xl">{String(n).padStart(2, '0')}</div><div className="mt-1 text-[8px] tracking-widest text-zinc-600">{label}</div></div>)}</div>;
}

function DonationModal({ onClose, onDonate }: { onClose: () => void; onDonate: (amount: number) => void }) {
  const [amount, setAmount] = useState(10000); const [loading, setLoading] = useState(false);
  const pay = () => { setLoading(true); setTimeout(() => onDonate(amount), 1000); };
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="w-full max-w-md border border-zinc-700 bg-zinc-950 p-6 red-glow sm:p-8">
    {loading ? <div className="flex min-h-[270px] flex-col items-center justify-center text-center"><div className="mb-5 h-10 w-10 animate-[spin_1s_linear_infinite] rounded-full border-2 border-zinc-700 border-t-[#ff304f]" /><p className="text-lg">Menghubungkan ke pembayaran</p><p className="mt-2 text-sm text-zinc-600">Sebentar, jangan tutup halaman ini.</p></div> : <><div className="mb-7 flex items-start justify-between"><div><p className="mono mb-2 text-[9px] tracking-[.2em] text-[#ff6178]">DUKUNG AKSI</p><h2 className="text-2xl font-medium">Kirim dukungan</h2></div><button onClick={onClose} className="text-zinc-500 hover:text-zinc-100"><X size={20} /></button></div><p className="mb-5 text-sm leading-6 text-zinc-500">Kontribusimu membantu gerakan ini menjangkau lebih banyak warga dan pengambil keputusan.</p><div className="grid grid-cols-2 gap-3">{[10000, 50000].map(n => <button key={n} onClick={() => setAmount(n)} className={`border px-4 py-4 text-left transition ${amount === n ? 'border-[#ff304f] bg-[#ff304f]/10 text-[#ff8495]' : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'}`}><CircleDollarSign size={17} className="mb-3" /><span className="block text-lg font-medium">{formatRupiah(n)}</span><span className="mt-1 block text-[10px] text-zinc-600">sekali dukung</span></button>)}</div><div className="mt-7 flex items-center justify-between border-t border-zinc-800 pt-5"><div><p className="text-[10px] uppercase tracking-widest text-zinc-600">total dukungan</p><p className="mt-1 text-xl font-medium">{formatRupiah(amount)}</p></div><button onClick={pay} className="btn-primary flex items-center gap-2 px-5 py-3 text-sm font-medium">Lanjut bayar <ArrowRight size={15} /></button></div><div className="mt-5 flex items-center gap-2 text-[10px] text-zinc-600"><ShieldCheck size={14} /> Transaksi aman dan transparan</div></>}</div></div>;
}

function Detail({ issues, setIssues }: { issues: Issue[]; setIssues: Dispatch<SetStateAction<Issue[]>> }) {
  const params = useParams<{ id: string }>(); const [, setLocation] = useLocation(); const issue = issues.find(i => i.id === params.id) || issues[0]; const [voted, setVoted] = useState(false); const [donate, setDonate] = useState(false);
  const [end] = useState(() => Date.now() + 3 * 24 * 60 * 60 * 1000);
  if (!issue) return null;
  const vote = () => { if (voted) return; setVoted(true); setIssues(all => all.map(i => i.id === issue.id ? { ...i, votes: i.votes + 1, supporters: i.supporters + 1 } : i)); };
  return <Shell issuesCount={issues.length}><div className="mx-auto max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
    <button onClick={() => setLocation('/beranda')} className="mb-9 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-100"><ArrowLeft size={16} /> Kembali ke ruang isu</button>
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]"><article className="animate-rise"><div className="mb-6 flex flex-wrap items-center gap-3"><span className="h-2 w-2 rounded-full bg-[#ff304f] shadow-[0_0_12px_#ff304f]" /><span className="mono text-[10px] tracking-[.22em] text-[#ff6178]">{issue.category}</span><span className="text-zinc-700">/</span><span className="text-xs text-zinc-600">ISU AKTIF</span></div><h1 className="max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-.05em] text-zinc-50 md:text-6xl">{issue.title}</h1><div className="mt-6 flex items-center gap-3 text-xs text-zinc-500"><img src={`${ASSET_BASE}avatar.png`} alt="" className="h-7 w-7 rounded-full object-cover" /><span>Diprakarsai oleh <strong className="font-medium text-zinc-300">{issue.author}</strong></span><span className="text-zinc-700">•</span><span>{issue.time}</span></div><div className="mt-10 border-l-2 border-[#ff304f] pl-5 text-base leading-8 text-zinc-300 md:text-lg">{issue.description}</div><div className="mt-10 border-y border-zinc-800 py-7"><div className="mb-3 flex items-end justify-between"><div><p className="mono text-[9px] uppercase tracking-widest text-zinc-600">batas dukungan</p><p className="mt-1 text-3xl font-medium">{formatNum(issue.votes)} <span className="text-base font-normal text-zinc-600">/ {formatNum(issue.target)} suara</span></p></div><span className="text-sm text-[#ff6178]">{Math.round((issue.votes / issue.target) * 100)}%</span></div><div className="h-2 bg-zinc-800"><div className="h-full bg-[#ff304f] shadow-[0_0_15px_rgba(255,48,79,.5)]" style={{ width: `${Math.min(100, issue.votes / issue.target * 100)}%` }} /></div></div><div className="mt-9"><h2 className="text-xl font-medium">Kenapa dukunganmu penting?</h2><div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="border border-zinc-800 p-4"><Users size={19} className="mb-4 text-[#ff6178]" /><p className="text-sm font-medium text-zinc-200">{formatNum(issue.supporters)} warga</p><p className="mt-1 text-xs leading-5 text-zinc-600">sudah berdiri bersama</p></div><div className="border border-zinc-800 p-4"><Landmark size={19} className="mb-4 text-[#ff6178]" /><p className="text-sm font-medium text-zinc-200">Suara terlihat</p><p className="mt-1 text-xs leading-5 text-zinc-600">disampaikan ke pemangku kebijakan</p></div><div className="border border-zinc-800 p-4"><ShieldCheck size={19} className="mb-4 text-[#ff6178]" /><p className="text-sm font-medium text-zinc-200">Terverifikasi</p><p className="mt-1 text-xs leading-5 text-zinc-600">satu warga, satu suara</p></div></div></div></article>
      <aside className="animate-rise animate-delay-2"><div className="sticky top-[96px] space-y-4"><div className="border border-[#ff304f]/50 bg-[#ff304f]/[.06] p-5 red-glow-strong"><div className="mb-4 flex items-center gap-2 text-[#ff6178]"><Clock3 size={16} /><span className="mono text-[9px] font-bold tracking-[.2em]">WAKTU TERSISA</span></div><Countdown end={end} /><p className="mt-4 text-xs leading-5 text-zinc-500">Kumpulkan dukungan sebelum momentum ini berakhir.</p></div><div className="border border-zinc-800 bg-zinc-900/50 p-5"><button onClick={vote} className={`flex h-12 w-full items-center justify-center gap-2 text-sm font-medium ${voted ? 'border border-[#ff304f] bg-[#ff304f]/10 text-[#ff6178]' : 'btn-primary'}`}><ThumbsUp size={17} fill={voted ? 'currentColor' : 'none'} /> {voted ? 'Kamu sudah mendukung' : 'Saya dukung isu ini'}</button><button onClick={() => setDonate(true)} className="btn-quiet mt-3 flex h-12 w-full items-center justify-center gap-2 text-sm font-medium"><CircleDollarSign size={17} /> Dukung dengan donasi</button><p className="mt-5 text-center text-[10px] leading-5 text-zinc-600">Dukunganmu tercatat secara anonim<br />dan tidak dapat diperjualbelikan.</p></div><div className="flex items-center justify-between px-1 text-xs text-zinc-600"><span className="flex items-center gap-1.5"><MessageSquare size={14} /> {formatNum(issue.comments)} komentar</span><button className="text-zinc-400 hover:text-[#ff6178]">Bagikan isu <ArrowRight className="ml-1 inline" size={13} /></button></div></div></aside>
    </div>
  </div>{donate && <DonationModal onClose={() => setDonate(false)} onDonate={() => setLocation('/payment-success')} />}</Shell>;
}

function PaymentSuccess() {
  const [, setLocation] = useLocation();
  return <div className="noise min-h-[100dvh] bg-zinc-950 px-5 py-8"><div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-2xl flex-col items-center justify-center text-center"><Logo /><div className="animate-rise mt-16 flex h-20 w-20 items-center justify-center rounded-full border border-[#ff304f] bg-[#ff304f]/10 text-[#ff6178] red-glow-strong"><Check size={36} /></div><p className="mono mt-8 text-[10px] tracking-[.25em] text-[#ff6178]">DUKUNGAN DITERIMA</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.05em] md:text-6xl">Suaramu sudah<br /><span className="text-[#ff304f]">ikut bergerak.</span></h1><p className="mt-6 max-w-md text-sm leading-6 text-zinc-500">Terima kasih sudah berdiri bersama warga lain. Kontribusimu membantu isu ini terus terdengar dan terlihat.</p><div className="mt-10 grid w-full max-w-sm grid-cols-2 border-y border-zinc-800 py-5 text-left"><div className="border-r border-zinc-800 px-5"><p className="mono text-[9px] uppercase tracking-widest text-zinc-600">status</p><p className="mt-2 flex items-center gap-2 text-sm text-[#ff6178]"><BadgeCheck size={15} /> berhasil</p></div><div className="px-5"><p className="mono text-[9px] uppercase tracking-widest text-zinc-600">ref</p><p className="mono mt-2 text-sm text-zinc-300">DD-7K2M91</p></div></div><button onClick={() => setLocation('/beranda')} className="btn-primary mt-10 flex items-center gap-2 px-6 py-3 text-sm font-medium">Kembali ke beranda <ArrowRight size={16} /></button><p className="mt-10 text-xs text-zinc-700">Setiap aksi kecil menciptakan tekanan besar.</p></div></div>;
}

function NotFound() {
  const [, setLocation] = useLocation();
  return <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-950 px-5 text-center"><div><p className="mono text-xs tracking-[.25em] text-[#ff304f]">404 / SINYAL HILANG</p><h1 className="mt-4 text-4xl font-semibold">Halaman tidak ditemukan.</h1><button onClick={() => setLocation('/beranda')} className="btn-primary mt-7 px-5 py-3 text-sm">Kembali ke beranda</button></div></div>;
}

function RouterView() {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  return <Switch><Route path="/" component={Login} /><Route path="/beranda"><Beranda issues={issues} setIssues={setIssues} /></Route><Route path="/isu/:id"><Detail issues={issues} setIssues={setIssues} /></Route><Route path="/payment-success" component={PaymentSuccess} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><div className="dark"><RouterView /></div></WouterRouter>;
}