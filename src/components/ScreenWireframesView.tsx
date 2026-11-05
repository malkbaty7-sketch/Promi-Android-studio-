import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Globe,
  ExternalLink,
  Search,
  MousePointerClick,
  Layers,
  RefreshCw,
  CheckCircle2,
  LayoutGrid,
} from 'lucide-react';
import { AnalysisBlueprint, ScreenComponentSpec, ScreenModelSpec } from '../types/prompt';

interface ScreenWireframesViewProps {
  blueprint: AnalysisBlueprint;
  onTriggerWebSearch: () => Promise<void>;
  isSearchingWeb: boolean;
}

export const ScreenWireframesView: React.FC<ScreenWireframesViewProps> = ({
  blueprint,
  onTriggerWebSearch,
  isSearchingWeb,
}) => {
  const screens = blueprint.screens || [];
  const [selectedScreenIdx, setSelectedScreenIdx] = useState(0);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [previewState, setPreviewState] = useState<'populated' | 'loading' | 'empty'>('populated');
  const [activeComponentIdx, setActiveComponentIdx] = useState<number>(0);

  const currentScreen: ScreenModelSpec | undefined =
    screens[selectedScreenIdx] || screens[0];

  const selectedComponent: ScreenComponentSpec | undefined =
    currentScreen?.components?.[activeComponentIdx] || currentScreen?.components?.[0];

  const renderInteractiveWireframeComponent = (comp: ScreenComponentSpec, idx: number) => {
    const isFocused = activeComponentIdx === idx;
    const baseBorder = isFocused
      ? 'border-blue-600 dark:border-blue-400 bg-blue-50/40 dark:bg-blue-950/30'
      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700';

    return (
      <div
        key={idx}
        onClick={() => setActiveComponentIdx(idx)}
        className={`p-3.5 rounded-lg border transition-colors cursor-pointer ${baseBorder}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white">{comp.name}</span>
          <span className="text-[11px] font-mono text-slate-400">{comp.type}</span>
        </div>

        {/* Simulated interactive visual elements based on component type */}
        {comp.type === 'header' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md text-xs text-slate-500">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>ابحث داخل {currentScreen?.screenNameAr}...</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(comp.sampleData || []).map((item, i) => (
                <span
                  key={i}
                  className={`px-2.5 py-1 text-[11px] rounded-md ${
                    i === 0
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {comp.type === 'hero' && (
          <div className="p-3 rounded-lg bg-slate-900 dark:bg-slate-800 text-white space-y-2">
            <div className="text-xs font-bold">{comp.sampleData?.[0] || comp.name}</div>
            <div className="text-[11px] text-slate-300">
              {(comp.sampleData || []).slice(1).join(' · ') || comp.description}
            </div>
            <div className="pt-1">
              <span className="inline-block px-3 py-1 text-[11px] font-semibold bg-blue-600 text-white rounded-md">
                تفاعل مباشر مع الواجهة
              </span>
            </div>
          </div>
        )}

        {(comp.type === 'list' || comp.type === 'card_grid') && (
          <div
            className={
              comp.type === 'card_grid'
                ? 'grid grid-cols-2 gap-2'
                : 'divide-y divide-slate-100 dark:divide-slate-800'
            }
          >
            {(comp.sampleData || []).map((row, i) => (
              <div
                key={i}
                className={
                  comp.type === 'card_grid'
                    ? 'p-2.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium'
                    : 'py-2 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300'
                }
              >
                <span>{row}</span>
                {comp.type === 'list' && (
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    عرض ←
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {(comp.type === 'form' || comp.type === 'modal') && (
          <div className="space-y-2">
            {(comp.sampleData || []).map((field, i) => (
              <div
                key={i}
                className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300"
              >
                {field}
              </div>
            ))}
          </div>
        )}

        {comp.type === 'chart' && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {(comp.sampleData || []).map((stat, i) => (
              <div
                key={i}
                className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-center"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                  {stat}
                </div>
              </div>
            ))}
          </div>
        )}

        {(comp.type === 'action_bar' || comp.type === 'navigation') && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {comp.sampleData?.[0] || comp.description}
            </span>
            <span className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md">
              {comp.sampleData?.[1] || 'تنفيذ الإجراء'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Interactive Screen Wireframe Studio */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              نماذج شاشات العرض التفاعلية وطريقة عمل كل واجهة (UI/UX Screen Wireframes)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              اضغط على أي شاشة أو مكون داخل شاشة العرض لمعرفة كيف يعمل برمجياً وكيف سيتم وصفه في البرومبت.
            </p>
          </div>

          {/* Device & State Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>عرض جوال</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>عرض ويب عريض</span>
              </button>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {(['populated', 'loading', 'empty'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setPreviewState(st)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    previewState === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st === 'populated'
                    ? 'حالة البيانات الكاملة'
                    : st === 'loading'
                    ? 'حالة التحميل'
                    : 'حالة الفراغ'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Screen Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {screens.map((scr, idx) => (
            <button
              key={scr.id || idx}
              type="button"
              onClick={() => {
                setSelectedScreenIdx(idx);
                setActiveComponentIdx(0);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedScreenIdx === idx
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              0{idx + 1}. {scr.screenNameAr}
            </button>
          ))}
        </div>

        {currentScreen && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            {/* Left/Start Column: Interactive Device Frame */}
            <div className="lg:col-span-7 flex justify-center bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <div
                className={`w-full transition-all ${
                  previewDevice === 'mobile' ? 'max-w-[380px]' : 'max-w-full'
                } bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden`}
              >
                {/* Simulated Top Status / Browser Bar */}
                <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {currentScreen.screenNameAr}
                  </span>
                  <span className="font-mono text-[11px]" dir="ltr">
                    {currentScreen.route}
                  </span>
                </div>

                {/* Screen Body */}
                <div className="p-4 space-y-3 min-h-[380px]">
                  {previewState === 'loading' && (
                    <div className="space-y-3 py-4">
                      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                      <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                    </div>
                  )}

                  {previewState === 'empty' && (
                    <div className="py-16 text-center space-y-3">
                      <LayoutGrid className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        لا توجد بيانات مسجلة في هذه الشاشة حتى الآن
                      </div>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto">
                        يتم تضمين هذه الحالة تلقائياً في البرومبت لضمان عدم ظهور شاشة بيضاء فارغة للمستخدم.
                      </p>
                      <button
                        type="button"
                        onClick={() => setPreviewState('populated')}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg cursor-pointer"
                      >
                        عرض الشاشة بالبيانات التفاعلية
                      </button>
                    </div>
                  )}

                  {previewState === 'populated' &&
                    currentScreen.components.map((comp, idx) =>
                      renderInteractiveWireframeComponent(comp, idx)
                    )}
                </div>
              </div>
            </div>

            {/* Right/End Column: Screen Specification & Component Inspector */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>مسار الشاشة:</span>
                  <code className="font-mono text-blue-600 dark:text-blue-400" dir="ltr">
                    {currentScreen.route}
                  </code>
                  <span aria-hidden="true">·</span>
                  <span>{currentScreen.screenNameEn}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  وظيفة الشاشة وطريقة عملها
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentScreen.purpose}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <strong className="text-slate-700 dark:text-slate-300">تدفق المستخدم (User Flow): </strong>
                  {currentScreen.userFlowStep}
                </p>
              </div>

              {/* Active Component Behavior Inspector */}
              {selectedComponent && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <MousePointerClick className="w-3.5 h-3.5" />
                      <span>تفاصيل المكون المحدد في المعاينة</span>
                    </span>
                    <span className="text-xs font-mono text-slate-500">{selectedComponent.type}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedComponent.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedComponent.description}
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                    <strong>السلوك البرمجي عند التفاعل: </strong>
                    {selectedComponent.behavior}
                  </div>
                </div>
              )}

              {/* State Handling Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>حالات الواجهة المضمّنة في البرومبت لهذه الشاشة</span>
                </h4>
                <ul className="space-y-1.5">
                  {(currentScreen.stateHandling || []).map((st, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Web Search Inspiration & Real-World Reference Models */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>نماذج شاشات العرض وأنماط التصميم من البحث في الإنترنت (Web Grounding)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              البحث داخل الإنترنت عن أفضل نماذج الشاشات والتطبيقات المشابهة والحزم البرمجية لرفع جودة البرومبت.
            </p>
          </div>

          <button
            type="button"
            disabled={isSearchingWeb}
            onClick={onTriggerWebSearch}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isSearchingWeb ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>جاري البحث في الإنترنت...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>تحديث البحث الحي في الإنترنت</span>
              </>
            )}
          </button>
        </div>

        {blueprint.webSearch ? (
          <div className="space-y-6">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              {blueprint.webSearch.summaryAr}
            </p>

            {/* UI Screen Inspirations from Web */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                نماذج شاشات مرجعية عالمية مقترحة
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(blueprint.webSearch.uiScreenInspirations || []).map((insp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      نموذج مرجعي: {insp.referenceAppExamples}
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      {insp.screenTitle}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {insp.layoutBestPractice}
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      {(insp.keyUXElements || []).map((el, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span aria-hidden="true">·</span>}
                          <span>{el}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Packages & Grounded Web Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  أفضل المكتبات والحزم البرمجية المقترحة
                </h4>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
                  {(blueprint.webSearch.recommendedPackages || []).map((pkg, idx) => (
                    <div key={idx} className="py-2.5 flex items-start justify-between gap-4">
                      <code className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 shrink-0" dir="ltr">
                        {pkg.name}
                      </code>
                      <span className="text-xs text-slate-600 dark:text-slate-400 text-end">
                        {pkg.purpose}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  روابط ومصادر الويب الموثقة (Google Search Grounding)
                </h4>
                {blueprint.webSearch.sources && blueprint.webSearch.sources.length > 0 ? (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
                    {blueprint.webSearch.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 flex items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <span className="truncate font-medium">{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    اضغط على &quot;تحديث البحث الحي في الإنترنت&quot; لجلب أحدث الروابط المباشرة من Google Search.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              لم يتم تشغيل البحث الحي في الإنترنت لهذا المشروع بعد.
            </p>
            <button
              type="button"
              onClick={onTriggerWebSearch}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg cursor-pointer"
            >
              ابحث الآن عن نماذج شاشات ومكتبات من الإنترنت
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
