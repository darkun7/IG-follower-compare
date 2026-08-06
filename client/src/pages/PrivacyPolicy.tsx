import { useI18n } from '../i18n';
import { Link } from 'react-router-dom';

const id = {
  'privacy.title': 'Kebijakan Privasi',
  'privacy.lastUpdated': 'Terakhir diperbarui: 7 Agustus 2026',
  'privacy.intro':
    'IG SARIA ("kami") menghargai privasi Anda. Kebijakan privasi ini menjelaskan bagaimana kami menangani data Anda saat menggunakan layanan kami.',

  'privacy.storage.title': 'Penyimpanan Data',
  'privacy.storage.p1':
    'Data yang Anda unggah (file ekspor Instagram) diproses secara langsung di peramban Anda. Tidak ada data yang dikirim ke server kami.',
  'privacy.storage.p2':
    'Data analisis (daftar username) disimpan secara sementara di penyimpanan lokal peramban Anda dan ditimpa setiap kali Anda menjalankan analisis baru.',
  'privacy.storage.p3': 'Tidak ada data yang dikirim ke server manapun.',

  'privacy.sharing.title': 'Berbagi Data',
  'privacy.sharing.p1':
    'Kami tidak menjual, memperdagangkan, atau mentransfer data Anda kepada pihak ketiga mana pun.',

  'privacy.remote.title': 'Kode Remote',
  'privacy.remote.p1':
    'Aplikasi ini tidak memuat kode remote apapun. Semua skrip berjalan secara lokal dari package aplikasi.',

  'privacy.thirdParty.title': 'Layanan Pihak Ketiga',
  'privacy.thirdParty.p1':
    'Aplikasi ini hanya berkomunikasi dengan instagram.com menggunakan sesi browser login Anda sendiri. Tidak ada layanan pihak ketiga lain yang digunakan.',

  'privacy.children.title': 'Privasi Anak',
  'privacy.children.p1':
    'Aplikasi ini tidak ditujukan untuk anak-anak di bawah usia 13 tahun dan tidak secara sadar mengumpulkan data dari anak-anak.',

  'privacy.changes.title': 'Perubahan Kebijakan',
  'privacy.changes.p1':
    'Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan akan dicerminkan pada halaman ini dengan tanggal pembaruan.',

  'privacy.contact.title': 'Kontak',
  'privacy.contact.p1':
    'Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, buka issue di',
  'privacy.contact.or': 'atau kunjungi',
};

const en: typeof id = {
  'privacy.title': 'Privacy Policy',
  'privacy.lastUpdated': 'Last updated: August 7, 2026',
  'privacy.intro':
    'IG SARIA ("we") respects your privacy. This privacy policy explains how we handle your data when you use our service.',

  'privacy.storage.title': 'Data Storage',
  'privacy.storage.p1':
    'The data you upload (Instagram export files) is processed directly in your browser. No data is sent to our servers.',
  'privacy.storage.p2':
    'Analysis data (username lists) is stored temporarily in your browser\'s local storage and is overwritten each time you run a new analysis.',
  'privacy.storage.p3': 'No data is sent to any external server.',

  'privacy.sharing.title': 'Data Sharing',
  'privacy.sharing.p1':
    'We do not sell, trade, or transfer your data to any third party.',

  'privacy.remote.title': 'Remote Code',
  'privacy.remote.p1':
    'This application loads no remote code. All scripts run locally from the application package.',

  'privacy.thirdParty.title': 'Third-Party Services',
  'privacy.thirdParty.p1':
    'This application only communicates with instagram.com using your own logged-in browser session. No other third-party services are used.',

  'privacy.children.title': "Children's Privacy",
  'privacy.children.p1':
    'This application is not directed at children under 13 and does not knowingly collect data from children.',

  'privacy.changes.title': 'Changes to This Policy',
  'privacy.changes.p1':
    'We may update this privacy policy from time to time. Changes will be reflected on this page with an updated date.',

  'privacy.contact.title': 'Contact',
  'privacy.contact.p1':
    'If you have questions about this privacy policy, open an issue at',
  'privacy.contact.or': 'or visit',
};

export default function PrivacyPolicy() {
  const { lang } = useI18n();
  const dict = lang === 'id' ? id : en;

  const t2 = (key: keyof typeof id) => dict[key];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="border-b border-gray-200 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link
            to="/"
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">
            <span className="text-gray-900 dark:text-white">IG </span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">SARIA</span>
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t2('privacy.title')}</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">{t2('privacy.lastUpdated')}</p>

        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-10">{t2('privacy.intro')}</p>

        <div className="space-y-10">
          <Section title={t2('privacy.storage.title')}>
            <p>{t2('privacy.storage.p1')}</p>
            <p>{t2('privacy.storage.p2')}</p>
            <p className="font-semibold">{t2('privacy.storage.p3')}</p>
          </Section>

          <Section title={t2('privacy.sharing.title')}>
            <p className="font-semibold">{t2('privacy.sharing.p1')}</p>
          </Section>

          <Section title={t2('privacy.remote.title')}>
            <p>{t2('privacy.remote.p1')}</p>
          </Section>

          <Section title={t2('privacy.thirdParty.title')}>
            <p>{t2('privacy.thirdParty.p1')}</p>
          </Section>

          <Section title={t2('privacy.children.title')}>
            <p>{t2('privacy.children.p1')}</p>
          </Section>

          <Section title={t2('privacy.changes.title')}>
            <p>{t2('privacy.changes.p1')}</p>
          </Section>

          <Section title={t2('privacy.contact.title')}>
            <p>
              {t2('privacy.contact.p1')}{' '}
              <a
                href="https://github.com/darkun7/IG-SARIA/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                GitHub
              </a>{' '}
              {t2('privacy.contact.or')}{' '}
              <a
                href="https://ig-saria.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                ig-saria.vercel.app
              </a>
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
      <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  );
}
