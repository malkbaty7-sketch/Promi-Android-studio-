import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Terminal,
  Smartphone,
  Layout,
  Sparkles,
  FileCode2,
  RefreshCw,
} from 'lucide-react';
import {
  AnalysisBlueprint,
  OutputLanguage,
  TargetPlatform,
} from '../types/prompt';

interface MasterPromptStudioViewProps {
  blueprint: AnalysisBlueprint;
  targetPlatform: TargetPlatform;
  outputLanguage: OutputLanguage;
  onChangePlatform: (platform: TargetPlatform) => void;
  onChangeLanguage: (lang: OutputLanguage) => void;
  onRegenerateForPlatform: (platform: TargetPlatform, lang: OutputLanguage) => Promise<void>;
  isRefining: boolean;
}

const PLATFORMS: { id: TargetPlatform; label: string; badge: string }[] = [
  { id: 'all', label: 'شامل لجميع المنصات', badge: 'Universal' },
  { id: 'aistudio', label: 'Google AI Studio', badge: 'Full-Stack Web' },
  { id: 'bolt', label: 'Bolt.new', badge: 'WebContainers' },
  { id: 'lovable', label: 'Lovable.dev', badge: 'React + Supabase' },
  { id: 'cursor', label: 'Cursor / Windsurf', badge: 'AI IDE' },
  { id: 'v0', label: 'v0 by Vercel', badge: 'Next.js UI' },
  { id: 'flutter', label: 'Flutter & Dart', badge: 'Mobile & RTL' },
  { id: 'flutterflow', label: 'FlutterFlow', badge: 'Visual Mobile' },
];

type PromptTabKey =
  | 'universalMasterPrompt'
  | 'platformSpecificPrompt'
  | 'flutterProductionPrompt'
  | 'uiOnlyPrompt'
  | 'cursorRulesAndSystemSpec';

export const MasterPromptStudioView: React.FC<MasterPromptStudioViewProps> = ({
  blueprint,
  targetPlatform,
  outputLanguage,
  onChangePlatform,
  onChangeLanguage,
  onRegenerateForPlatform,
  isRefining,
}) => {
  const [activePromptTab, setActivePromptTab] = useState<PromptTabKey>('universalMasterPrompt');
  const [editableText, setEditableText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = blueprint.masterPrompts?.[activePromptTab] || '';
    setEditableText(raw);
  }, [blueprint, activePromptTab]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(editableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([editableText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(blueprint.projectTitleEn || 'coding-prompt')
      .toLowerCase()
      .replace(/\s+/g, '-')}-${activePromptTab}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedEnhancements = blueprint.critiquesAndSuggestions.filter((c) => c.selected);

  return (
    <div className="space-y-8">
      {/* Platform & Language Customization Header */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              استوديو البرومبت المتكامل الجاهز للنسخ لمنصات صناعة الأكواد
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              اختر المنصة التي ستضع فيها البرومبت، وانسخ الوثيقة الهندسية الكاملة أو عدّل عليها مباشرة قبل النسخ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Output Language Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(
                [
                  { id: 'bilingual', label: 'ثنائي اللغة (موصى به)' },
                  { id: 'ar', label: 'عربي بالكامل' },
                  { id: 'en', label: 'إنجليزي تقني' },
                ] as const
              ).map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => onChangeLanguage(lang.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    outputLanguage === lang.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={isRefining}
              onClick={() => onRegenerateForPlatform(targetPlatform, outputLanguage)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isRefining ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري التخصيص...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>إعادة صياغة للمنصة واللغة المختارة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Platform Selector Grid */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            اختر منصة صناعة الأكواد المستهدفة:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {PLATFORMS.map((plat) => (
              <button
                key={plat.id}
                type="button"
                onClick={() => {
                  onChangePlatform(plat.id);
                  if (plat.id === 'flutter') {
                    setActivePromptTab('flutterProductionPrompt');
                  } else if (plat.id === 'cursor') {
                    setActivePromptTab('cursorRulesAndSystemSpec');
                  } else if (plat.id !== 'all') {
                    setActivePromptTab('platformSpecificPrompt');
                  } else {
                    setActivePromptTab('universalMasterPrompt');
                  }
                }}
                className={`p-2.5 rounded-lg border text-start transition-colors cursor-pointer ${
                  targetPlatform === plat.id
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold truncate">{plat.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {plat.badge}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActivePromptTab('universalMasterPrompt')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activePromptTab === 'universalMasterPrompt'
                ? 'bg-slate-900 dark:bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>البرومبت الشامل المتكامل (Master Prompt)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePromptTab('platformSpecificPrompt')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activePromptTab === 'platformSpecificPrompt'
                ? 'bg-slate-900 dark:bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>برومبت مخصص للمنصة المختارة</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePromptTab('flutterProductionPrompt')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activePromptTab === 'flutterProductionPrompt'
                ? 'bg-slate-900 dark:bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>برومبت Flutter & Dart (Models / Services / Views + RTL)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePromptTab('uiOnlyPrompt')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activePromptTab === 'uiOnlyPrompt'
                ? 'bg-slate-900 dark:bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>برومبت واجهات المستخدم فقط (UI Screens)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePromptTab('cursorRulesAndSystemSpec')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activePromptTab === 'cursorRulesAndSystemSpec'
                ? 'bg-slate-900 dark:bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>قواعد النظام (.cursorrules)</span>
          </button>
        </div>

        {/* Active Enhancements Summary Line */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-4 py-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              التحسينات المدمجة في هذا البرومبت ({selectedEnhancements.length}):
            </span>
            {selectedEnhancements.map((enh, i) => (
              <React.Fragment key={enh.id}>
                {i > 0 && <span aria-hidden="true">·</span>}
                <span>{enh.title}</span>
              </React.Fragment>
            ))}
          </div>
          <span className="font-mono tabular-nums">
            {editableText.length} حرف
          </span>
        </div>

        {/* Prompt Editor & One-Click Copy Box */}
        <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-300 font-medium">
              يمكنك التعديل المباشر على نص البرومبت أدناه قبل النسخ إلى منصة صناعة الأكواد
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل كملف .md</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPrompt}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>تم نسخ البرومبت بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ البرومبت بالكامل</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <textarea
            value={editableText}
            onChange={(e) => setEditableText(e.target.value)}
            rows={20}
            className="w-full p-5 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-y"
          />
        </div>
      </section>
    </div>
  );
};
