import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'id' | 'en';

const id = {
  // Header
  'header.title': 'IG SARIA',
  'header.subtitle':
    'Social Account Relationship Inspection & Analysis — Unggah data ekspor Instagram Anda untuk menemukan mutual, follower yang tidak follow balik, dan lainnya.',

  // Upload boxes
  'box.followers.label': 'Followers',
  'box.followers.subtitle': 'Orang yang mengikuti Anda',
  'box.following.label': 'Following',
  'box.following.subtitle': 'Akun yang Anda ikuti',
  'box.chooseFile': 'Pilih File',
  'box.hint': 'CSV atau TXT dari ekspor Instagram',

  // Actions
  'action.compare': 'Bandingkan Sekarang',
  'action.comparing': 'Membandingkan...',
  'action.newComparison': 'Perbandingan Baru',

  // Empty state
  'empty.title': 'Unggah kedua file di atas untuk melihat perbandingan',

  // Footer
  'footer.text': 'Ditenagai oleh Instagram Data Export · Semua pemrosesan terjadi di peramban Anda.',

  // Toasts
  'toast.comparisonDone': 'Perbandingan selesai! 🎉',
  'toast.bothFilesRequired': 'Kedua file wajib diunggah',
  'toast.loaded': 'File "{name}" dimuat',
  'toast.readFailed': 'Gagal membaca "{name}"',
  'toast.emptyFile': '"{name}" terlihat kosong. Pastikan Anda mengunggah file yang benar.',
  'toast.error': 'Terjadi kesalahan',

  // Results
  'results.mutuals': 'Mutual',
  'results.notFolback': 'Tidak Follow Balik',
  'results.onlyFollowers': 'Hanya Followers',
  'results.onlyFollowing': 'Hanya Following',
  'results.showing': 'Menampilkan 1–{max} dari {total}',
  'results.nothingHere': 'Tidak ada data',
  'results.more': '... dan {count} lainnya',

  // How-to guide
  'guide.title': 'Cara mendapatkan data Instagram Anda',
  'guide.step1.title': 'Minta data Anda',
  'guide.step1.s1': 'Buka Instagram lalu buka profil Anda → Pengaturan → Pusat Akun.',
  'guide.step1.s2': 'Ketuk Informasi dan izin Anda → Ekspor informasi Anda → Buat Ekspor → Ekspor ke Perangkat.',
  'guide.step1.s3': 'Pilih profil Anda. Centang Sesuaikan Informasi (di bagian Koneksi, centang ☑ Followers dan following).',
  'guide.step1.s4': 'Atur Format ke JSON (atau HTML), dan yang PALING PENTING: atur Rentang ke Semua waktu agar tidak ada data yang terlewat.',
  'guide.step1.s5': 'Aktifkan Notifikasi email lalu ketuk Kirim permintaan / Buat file.',
  'guide.step1.warning': 'Pastikan Rentang diatur ke Semua waktu! Jika tidak, data akan terpotong dan hasil perbandingan tidak akurat.',
  'guide.step2.title': 'Tunggu email',
  'guide.step2.body':
    'Instagram menyiapkan file — ini bisa memakan waktu dari beberapa menit hingga beberapa hari. Anda akan mendapat email saat unduhan siap.',
  'guide.step3.title': 'Unduh file ZIP',
  'guide.step3.body':
    'Buka email lalu ketuk tombol/tautan Unduh (berlaku sekitar 4 hari) untuk mengunduh arsip ZIP. Jangan ganti namanya — biarkan struktur folder tetap utuh.',
  'guide.step4.title': 'Ekstrak arsip',
  'guide.step4.body':
    'Ekstrak ZIP (Windows: klik kanan → Ekstrak Semua… · macOS: klik dua kali · Linux:',
  'guide.step4.followersHint': '← follower Anda',
  'guide.step4.followingHint': '← akun yang Anda ikuti',
  'guide.step5.title': 'Unggah & bandingkan',
  'guide.step5.s1': 'Letakkan file followers ke kotak Followers di atas.',
  'guide.step5.s2': 'Letakkan file following ke kotak Following di atas.',
  'guide.step5.s3':
    'Klik Bandingkan Sekarang lalu lihat keempat bagian. Klik nama pengguna mana pun untuk membuka profilnya.',

  // Guide images
  'guide.img.accountsCenter': 'Pusat Akun (Accounts Center)',
  'guide.img.exportInfo': 'Ekspor Informasi Anda',
} as const;

export type TranslationKey = keyof typeof id;

const en: Record<TranslationKey, string> = {
  'header.title': 'IG SARIA',
  'header.subtitle':
    "Social Account Relationship Inspection & Analysis — Upload your Instagram data export to find mutuals, followers you don't follow back, and more.",

  'box.followers.label': 'Followers',
  'box.followers.subtitle': 'People who follow you',
  'box.following.label': 'Following',
  'box.following.subtitle': 'Accounts you follow',
  'box.chooseFile': 'Choose File',
  'box.hint': 'CSV or TXT exported from Instagram',

  'action.compare': 'Compare Now',
  'action.comparing': 'Comparing...',
  'action.newComparison': 'New Comparison',

  'empty.title': 'Upload both files above to see the comparison',

  'footer.text': 'Powered by Instagram Data Export · All processing happens in your browser.',

  'toast.comparisonDone': 'Comparison done! 🎉',
  'toast.bothFilesRequired': 'Both files are required',
  'toast.loaded': 'Loaded "{name}"',
  'toast.readFailed': 'Failed to read "{name}"',
  'toast.emptyFile': '"{name}" looks empty. Make sure you uploaded the correct file.',
  'toast.error': 'Something went wrong',

  'results.mutuals': 'Mutuals',
  'results.notFolback': 'Not Following Back',
  'results.onlyFollowers': 'Only Followers',
  'results.onlyFollowing': 'Only Following',
  'results.showing': 'Showing 1–{max} of {total}',
  'results.nothingHere': 'Nothing here',
  'results.more': '... and {count} more',

  'guide.title': 'How to get your Instagram data',
  'guide.step1.title': 'Request your data',
  'guide.step1.s1': "Open Instagram and go to your profile → Settings → Accounts Center.",
  'guide.step1.s2': 'Tap Your information and permissions → Export your information → Create Export → Export to Device.',
  'guide.step1.s3': 'Select your profile. Check customize Information (Under Connections, tick ☑ Followers and following).',
  'guide.step1.s4': 'Set Format to JSON (or HTML), and MOST IMPORTANTLY: set Range to All time so no data is missed.',
  'guide.step1.s5': 'Turn on Email notification and tap Submit request / Create files.',
  'guide.step1.warning': 'Make sure Range is set to All time! Otherwise the export will be incomplete and results will be inaccurate.',
  'guide.step2.title': 'Wait for the email',
  'guide.step2.body':
    "Instagram prepares the files — this can take from a few minutes up to a few days. You'll get an email when your download is ready.",
  'guide.step3.title': 'Download the ZIP',
  'guide.step3.body':
    "Open the email and tap the Download button/link (it's valid for about 4 days) to download the ZIP archive. Don't rename it — keep the folder structure intact.",
  'guide.step4.title': 'Unzip the archive',
  'guide.step4.body':
    'Extract the ZIP (Windows: right-click → Extract All… · macOS: double-click · Linux:',
  'guide.step4.followersHint': '← your followers',
  'guide.step4.followingHint': '← accounts you follow',
  'guide.step5.title': 'Upload & compare',
  'guide.step5.s1': 'Drop the followers file into the Followers box above.',
  'guide.step5.s2': 'Drop the following file into the Following box above.',
  'guide.step5.s3':
    'Click Compare Now and browse the four sections. Click any username to open their profile.',

  // Guide images
  'guide.img.accountsCenter': 'Accounts Center',
  'guide.img.exportInfo': 'Export your information',
};

const dictionaries: Record<Lang, Record<TranslationKey, string>> = { id, en };

const LANG_STORAGE_KEY = 'ig-compare-lang';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : '',
  );
}

function getInitialLang(): Lang {
  // 1. Check URL query param ?lang=
  try {
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get('lang');
    if (queryLang === 'en' || queryLang === 'id') return queryLang;
  } catch { /* ignore */ }

  // 2. Check localStorage
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'en' || stored === 'id') return stored;
  } catch { /* ignore */ }

  return 'id';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);

  const t = (key: TranslationKey, params?: Record<string, string | number>) =>
    interpolate(dictionaries[lang][key], params);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
