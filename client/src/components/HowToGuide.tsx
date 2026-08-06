import { useState } from 'react';
import { useI18n } from '../i18n';
import ImagePreview from './ImagePreview';

export default function HowToGuide() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const steps = [
    {
      title: t('guide.step1.title'),
      body: (
        <>
          <ol className="list-decimal list-inside space-y-1">
            <li>{t('guide.step1.s1')}</li>
            <li>{t('guide.step1.s2')}</li>
            <li>{t('guide.step1.s3')}</li>
            <li>{t('guide.step1.s4')}</li>
            <li>{t('guide.step1.s5')}</li>
          </ol>
          <div className="mt-3 px-4 py-3 rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 text-sm flex items-start gap-2">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <span>{t('guide.step1.warning')}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <ImagePreview
              src="/1-account-center.png"
              alt="Accounts Center"
              caption={t('guide.img.accountsCenter')}
            />
            <ImagePreview
              src="/2-export-information.png"
              alt="Export information"
              caption={t('guide.img.exportInfo')}
            />
          </div>
        </>
      ),
    },
    {
      title: t('guide.step2.title'),
      body: <p>{t('guide.step2.body')}</p>,
    },
    {
      title: t('guide.step3.title'),
      body: <p>{t('guide.step3.body')}</p>,
    },
    {
      title: t('guide.step4.title'),
      body: (
        <div className="space-y-2">
          <p>
            {t('guide.step4.body')}{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-black/30 text-xs">unzip instagram-*.zip</code>)
          </p>
          <div className="rounded-lg bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 p-3 font-mono text-xs text-gray-600 dark:text-gray-300">
            <div>instagram-yourusername-…/</div>
            <div>&nbsp;&nbsp;└─ connections/</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ followers_and_following/</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├─ <span className="text-emerald-500 dark:text-emerald-400">followers_1.json</span> {t('guide.step4.followersHint')}</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ <span className="text-purple-500 dark:text-purple-400">following.json</span> {t('guide.step4.followingHint')}</div>
          </div>
        </div>
      ),
    },
    {
      title: t('guide.step5.title'),
      body: (
        <ol className="list-decimal list-inside space-y-1">
          <li>{t('guide.step5.s1')}</li>
          <li>{t('guide.step5.s2')}</li>
          <li>{t('guide.step5.s3')}</li>
        </ol>
      ),
    },
  ];

  return (
    <section className="max-w-3xl mx-auto mt-10">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors group"
      >
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-200 dark:border-emerald-500/30">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <span className="font-semibold text-left text-gray-800 dark:text-white">{t('guide.title')}</span>
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-purple-500 text-white text-sm font-bold">
                  {i + 1}
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-emerald-700 dark:text-emerald-200 mb-1.5">{step.title}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
