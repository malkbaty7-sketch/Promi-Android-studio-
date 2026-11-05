import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Check,
  ShieldCheck,
  Layers,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { AnalysisBlueprint, CritiqueSuggestion } from '../types/prompt';

interface CritiqueAndSuggestionsViewProps {
  blueprint: AnalysisBlueprint;
  onToggleSuggestion: (id: string) => void;
  onAddCustomSuggestion: (title: string, solution: string) => void;
  onResynthesizePrompts: (customNotes: string) => Promise<void>;
  isRefining: boolean;
  onNavigateToPrompt: () => void;
}

const CATEGORY_LABELS: Record<CritiqueSuggestion['category'], string> = {
  architecture: 'الهيكلة المعمارية',
  ux: 'تجربة المستخدم والواجهات',
  security: 'الأمان والصلاحيات',
  edge_case: 'الحالات الحدية و Null Safety',
  performance: 'الأداء والمزامنة',
};

export const CritiqueAndSuggestionsView: React.FC<CritiqueAndSuggestionsViewProps> = ({
  blueprint,
  onToggleSuggestion,
  onAddCustomSuggestion,
  onResynthesizePrompts,
  isRefining,
  onNavigateToPrompt,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const selectedCount = blueprint.critiquesAndSuggestions.filter((c) => c.selected).length;

  const filteredCritiques =
    activeCategory === 'all'
      ? blueprint.critiquesAndSuggestions
      : blueprint.critiquesAndSuggestions.filter((c) => c.category === activeCategory);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSolution.trim()) return;
    onAddCustomSuggestion(newTitle.trim(), newSolution.trim());
    setNewTitle('');
    setNewSolution('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Scope & Holistic Understanding Summary */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>التفكير المكتمل وتحليل النطاق</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {blueprint.detectedScope === 'feature'
                  ? 'نطاق العمل: إضافة ميزة محددة لتطبيق قائم'
                  : 'نطاق العمل: بناء تطبيق متكامل من الصفر'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {selectedCount} من {blueprint.critiquesAndSuggestions.length} تحسينات مفعّلة في البرومبت
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {blueprint.projectTitleAr}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {blueprint.executiveSummary}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateToPrompt}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              استعراض البرومبت المتكامل
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>تفسير النطاق البرمجي المكتشف</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {blueprint.scopeReasoning}
            </p>
            {blueprint.existingAppIntegrationNotes && (
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed">
                <strong className="text-slate-700 dark:text-slate-300">إرشادات الربط والتكامل: </strong>
                {blueprint.existingAppIntegrationNotes}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>نقاط القوة الأساسية في فكرتك</span>
            </h3>
            <ul className="space-y-2">
              {blueprint.strengths.map((strength, idx) => (
                <li
                  key={idx}
                  className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Constructive Critique & Smart Suggestions */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              النقد البنّاء والمقترحات لتحسين الفكرة وسد الثغرات
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              حدد المقترحات التي ترغب في تضمينها داخل البرومبت النهائي لضمان كود خالٍ من الأخطاء والحالات الحدية المفقودة.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة شرط أو تحسين خاص</span>
          </button>
        </div>

        {/* Category Filter Tabs (Interactive Functional Buttons) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الكل ({blueprint.critiquesAndSuggestions.length})
          </button>
          {(['edge_case', 'architecture', 'ux', 'security', 'performance'] as const).map((cat) => {
            const count = blueprint.critiquesAndSuggestions.filter((c) => c.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Custom Suggestion Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان الملاحظة أو الشرط البرمجي
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: دعم الدفع عبر Apple Pay و مدى"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  التنفيذ المطلوب داخل الكود
                </label>
                <input
                  type="text"
                  value={newSolution}
                  onChange={(e) => setNewSolution(e.target.value)}
                  placeholder="مثال: إنشاء PaymentGatewayService مع معالجة حالات فشل العملية"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
              >
                إضافة وتفعيل في البرومبت
              </button>
            </div>
          </form>
        )}

        {/* Critique List (Divide-y layout, no nested card shadows) */}
        <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
          {filteredCritiques.map((item, idx) => (
            <div
              key={item.id}
              className="py-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                    0{idx + 1}.
                  </span>
                  <span>{CATEGORY_LABELS[item.category] || 'تحسين معماري'}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      item.impact === 'high'
                        ? 'text-amber-600 dark:text-amber-400 font-medium'
                        : 'text-slate-500'
                    }
                  >
                    {item.impact === 'high' ? 'أولوية عالية لمنع الأخطاء' : 'تحسين موصى به'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>

                <div className="space-y-1.5 text-sm">
                  <p className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200">النقد / الثغرة المحتملة: </strong>
                      {item.problemAnalysis}
                    </span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900 dark:text-white">الحل المقترح في البرومبت: </strong>
                      {item.proposedSolution}
                    </span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => onToggleSuggestion(item.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    item.selected
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${item.selected ? 'opacity-100' : 'opacity-40'}`} />
                  <span>{item.selected ? 'مُدرج في البرومبت النهائي' : 'تضمين في البرومبت'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Re-synthesize Bar */}
        <div className="pt-2 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="هل لديك أي تعديلات إضافية تريد دمجها عند تحديث البرومبت؟ (اختياري)..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="button"
            disabled={isRefining}
            onClick={() => onResynthesizePrompts(customNotes)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isRefining ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري تحديث البرومبت...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>تحديث البرومبت بالمقترحات المختارة ({selectedCount})</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
