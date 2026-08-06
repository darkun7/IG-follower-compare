import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { compareFiles } from './api';
import { useI18n } from './i18n';
import { useTheme } from './theme';
import ResultsDisplay from './components/ResultsDisplay';
import HowToGuide from './components/HowToGuide';

type FileType = 'followers_export' | 'following_export' | 'csv' | 'unknown';

interface ParsedFile {
  file: File;
  name: string;
  type: FileType;
}

let comparing = false;

export default function App() {
  const { t } = useI18n();
  const [files, setFiles] = useState<{
    followers: ParsedFile | null;
    following: ParsedFile | null;
  }>({ followers: null, following: null });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof ResultsDisplay>['props']['results'] | null>(null);
  const [dragging, setDragging] = useState<'followers' | 'following' | null>(null);

  const detectFileType = useCallback((file: File): FileType => {
    const lower = file.name.toLowerCase();
    if (lower.includes('follow')) return 'followers_export';
    if (lower.includes('follow') && lower.includes('fwiel')) return 'following_export';
    return 'csv';
  }, []);

  const parseFile = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file, 'UTF-8');
    });
  }, []);

  const onFileChange = useCallback(async (side: 'followers' | 'following', file: File) => {
    try {
      const content = await parseFile(file);
      const isEmpty = content.trim().length < 100;
      if (isEmpty) {
        toast.error(t('toast.emptyFile', { name: file.name }));
        return;
      }
      setFiles(prev => ({ ...prev, [side]: { file, name: file.name, type: detectFileType(file) } }));
      toast.success(t('toast.loaded', { name: file.name }), { position: 'top-center' });
    } catch {
      toast.error(t('toast.readFailed', { name: file.name }));
    }
  }, [parseFile, detectFileType, t]);

  const handleCompare = useCallback(async () => {
    if (!files.followers || !files.following) {
      toast.error(t('toast.bothFilesRequired'));
      return;
    }
    if (comparing) return;

    setLoading(true);
    comparing = true;

    try {
      const result = await compareFiles(files.followers.file, files.following.file);
      setResults(result);
      toast.success(t('toast.comparisonDone'));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || err?.message || t('toast.error'));
      setResults(null);
    } finally {
      setLoading(false);
      comparing = false;
    }
  }, [files, t]);

  const reset = useCallback(() => {
    setFiles({ followers: null, following: null });
    setResults(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-gray-200 dark:border-white/5">
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/5 dark:bg-emerald-600/10 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
          <div className="flex justify-end items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          <h1 className="text-center text-4xl md:text-5xl font-bold mb-3">
            <span className="text-gray-900 dark:text-white">IG </span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-purple-400 bg-clip-text text-transparent">SARIA</span>
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto text-base leading-relaxed">
            {t('header.subtitle')}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-24">
        {/* How-to guide */}
        <HowToGuide />

        {/* Upload Area */}
        <section className="mt-10 -mb-8">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <FileUploadBox
              label={t('box.followers.label')}
              subtitle={t('box.followers.subtitle')}
              fileName={files.followers?.name ?? null}
              dragging={dragging === 'followers'}
              side="followers"
              onDragEnter={() => setDragging('followers')}
              onDragLeave={() => setDragging(null)}
              onDrop={(e) => { e.preventDefault(); setDragging(null); const f = e.dataTransfer.files[0]; if (f) onFileChange('followers', f); }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChange('followers', f); }}
            />
            <FileUploadBox
              label={t('box.following.label')}
              subtitle={t('box.following.subtitle')}
              fileName={files.following?.name ?? null}
              dragging={dragging === 'following'}
              side="following"
              onDragEnter={() => setDragging('following')}
              onDragLeave={() => setDragging(null)}
              onDrop={(e) => { e.preventDefault(); setDragging(null); const f = e.dataTransfer.files[0]; if (f) onFileChange('following', f); }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChange('following', f); }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            {results && (
              <button onClick={reset} className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors font-medium text-sm">
                {t('action.newComparison')}
              </button>
            )}
            <button
              disabled={!files.followers || !files.following || loading}
              onClick={handleCompare}
              className={`px-10 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200
                ${files.followers && files.following
                  ? 'bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-600 hover:to-purple-600 shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
                  {t('action.comparing')}
                </span>
              ) : t('action.compare')}
            </button>
          </div>
        </section>

        <hr className="border-gray-200 dark:border-white/5 my-16" />

        {/* Results */}
        {results && <ResultsDisplay results={results} />}

        {/* Empty State */}
        {!results && !loading && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 mb-6">
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"/>
              </svg>
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-lg">{t('empty.title')}</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-white/5 py-8 text-center">
        <p className="text-gray-400 dark:text-gray-600 text-sm">
          {t('footer.text')}
        </p>
      </footer>
    </div>
  );
}


/* ---------- Theme Toggle ---------- */

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.03] hover:bg-gray-200 dark:hover:bg-white/[0.06] transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <svg className="w-4 h-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}


/* ---------- File Upload Box Component ---------- */

interface BoxProps {
  label: string;
  subtitle: string;
  fileName: string | null;
  dragging: boolean;
  side: 'followers' | 'following';
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FileUploadBox({
  label, subtitle, fileName, dragging, side,
  onDragEnter, onDragLeave, onDrop, onChange,
}: BoxProps) {
  const { t } = useI18n();
  const colorMap = {
    followers: { accent: 'from-emerald-400 to-green-500', dot: 'bg-emerald-400' },
    following: { accent: 'from-purple-400 to-violet-500', dot: 'bg-purple-400' },
  };
  const colors = colorMap[side];

  return (
    <div
      onDragEnter={onDragEnter}
      onDragOver={(e) => { e.preventDefault(); }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative rounded-2xl border-2 transition-all duration-200 ${
        dragging
          ? `${colors.dot.replace('bg-', 'border-')} bg-gray-50 dark:bg-white/[0.02] scale-[1.01]`
          : fileName
            ? 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]'
            : 'border-dashed border-gray-300 dark:border-white/15 bg-white dark:bg-white/[0.01] hover:bg-gray-50 dark:hover:bg-white/[0.03] hover:border-gray-400 dark:hover:border-white/25'
      } p-6`}
    >
      {/* Accent line at top */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${colors.accent} to-transparent opacity-50`} />

      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gray-100 dark:${colors.dot}/10 flex items-center justify-center mb-4`}>
          <span className={`text-xl ${fileName ? '' : 'opacity-50'}`}>
            {fileName ? '📄' : '⬆️'}
          </span>
        </div>

        {/* Label */}
        <h3 className={`font-semibold mb-1 ${fileName ? '' : 'text-gray-500 dark:text-gray-400'}`}>{label}</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{subtitle}</p>

        {fileName ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5">
            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[180px]">{fileName}</span>
          </div>
        ) : (
          <label className="cursor-pointer group">
            <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-purple-500 text-sm font-medium text-white group-hover:from-emerald-600 group-hover:to-purple-600 transition-all">
              {t('box.chooseFile')}
            </span>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={onChange}
            />
          </label>
        )}

        {!fileName && (
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">{t('box.hint')}</p>
        )}
      </div>

      <input
        type="file"
        accept=".csv,.txt,application/json"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={onChange}
        title=""
        aria-label={label}
      />
    </div>
  );
}

/* ---------- Language Toggle ---------- */

function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/[0.03] p-1">
      <button
        onClick={() => setLang('id')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          lang === 'id' ? 'bg-gradient-to-r from-emerald-500 to-purple-500 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Indonesia
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          lang === 'en' ? 'bg-gradient-to-r from-emerald-500 to-purple-500 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        English
      </button>
    </div>
  );
}
