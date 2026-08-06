
import { useI18n } from '../i18n';
import type { TranslationKey } from '../i18n';

const COLORS = {
  mutuals: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500 dark:bg-emerald-400',
    badge: 'bg-emerald-100 dark:bg-black/20 text-emerald-700 dark:text-emerald-400',
  },
  notFolback: {
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    border: 'border-orange-200 dark:border-orange-500/30',
    text: 'text-orange-600 dark:text-orange-400',
    dot: 'bg-orange-500 dark:bg-orange-400',
    badge: 'bg-orange-100 dark:bg-black/20 text-orange-700 dark:text-orange-400',
  },
  onlyFollowers: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/30',
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500 dark:bg-blue-400',
    badge: 'bg-blue-100 dark:bg-black/20 text-blue-700 dark:text-blue-400',
  },
  onlyFollowing: {
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-200 dark:border-purple-500/30',
    text: 'text-purple-600 dark:text-purple-400',
    dot: 'bg-purple-500 dark:bg-purple-400',
    badge: 'bg-purple-100 dark:bg-black/20 text-purple-700 dark:text-purple-400',
  },
} as const;

const KEYS: Record<SectionKey, TranslationKey> = {
  mutuals: 'results.mutuals',
  notFolback: 'results.notFolback',
  onlyFollowers: 'results.onlyFollowers',
  onlyFollowing: 'results.onlyFollowing',
};

type SectionKey = keyof typeof COLORS;

const SECTIONS: SectionKey[] = Object.keys(COLORS) as SectionKey[];

interface Props {
  results: {
    mutuals: ReadonlyArray<{ username: string; profile_url: string }>;
    notFolback: ReadonlyArray<{ username: string; profile_url: string }>;
    onlyFollowers: ReadonlyArray<{ username: string; profile_url: string }>;
    onlyFollowing: ReadonlyArray<{ username: string; profile_url: string }>;
  };
}

export default function ResultsDisplay({ results }: Props) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {SECTIONS.map(key => {
          const colors = COLORS[key];
          const count = results[key].length;
          return (
            <div key={key} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${colors.bg} border ${colors.border}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
              <span className={`${colors.text} font-semibold`}>{count}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{t(KEYS[key])}</span>
            </div>
          );
        })}
      </div>

      {/* Grid of sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SECTIONS.map(key => (
          <SectionCard key={key} section={key} data={results[key]} label={t(KEYS[key])} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Section Card ---------- */

interface SectionProps {
  section: SectionKey;
  data: ReadonlyArray<{ username: string; profile_url: string }>;
  label: string;
}

function SectionCard({ section, data, label }: SectionProps) {
  const { t } = useI18n();
  const colors = COLORS[section];

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden transition-transform hover:scale-[1.01] duration-200`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
          <h3 className={`font-semibold ${colors.text}`}>{label}</h3>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
            {data.length.toLocaleString()}
          </span>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[32rem] overflow-y-auto p-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">{t('results.nothingHere')}</div>
        )}
        {data.map((item) => (
          <a
            key={item.username}
            href={item.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group block"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} opacity-60 shrink-0`} />
            <span className="truncate text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              @{item.username}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
