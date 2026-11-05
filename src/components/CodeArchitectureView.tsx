import React, { useState } from 'react';
import {
  Database,
  ServerCog,
  LayoutTemplate,
  Copy,
  Check,
  ShieldAlert,
  Languages,
  Code2,
} from 'lucide-react';
import { AnalysisBlueprint, CodeModuleItem } from '../types/prompt';

interface CodeArchitectureViewProps {
  blueprint: AnalysisBlueprint;
}

export const CodeArchitectureView: React.FC<CodeArchitectureViewProps> = ({ blueprint }) => {
  const arch = blueprint.codeArchitecture;
  const [activeLayer, setActiveLayer] = useState<'models' | 'services' | 'views'>('models');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const currentItems: CodeModuleItem[] =
    activeLayer === 'models'
      ? arch.models || []
      : activeLayer === 'services'
      ? arch.services || []
      : arch.views || [];

  return (
    <div className="space-y-8">
      {/* Architecture Overview & Null Safety / RTL Rules */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>النمط المعماري: {arch.designPattern}</span>
            <span aria-hidden="true">·</span>
            <span>إدارة الحالة: {arch.stateManagement}</span>
            <span aria-hidden="true">·</span>
            <span>متوافق مع Null Safety و RTL</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            طريقة صناعة الأكواد وطريقة عمل كل كود وترابط الطبقات البرمجية
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {arch.overview}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>قواعد Null Safety ومعالجة الحالات الحدية في الكود</span>
            </h3>
            <ul className="space-y-1.5">
              {(arch.nullSafetyAndEdgeCases || []).map((rule, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2"
                >
                  <span className="font-mono text-slate-400 tabular-nums">0{idx + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Languages className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>قواعد دعم اللغة العربية واتجاه RTL داخل الكود</span>
            </h3>
            <ul className="space-y-1.5">
              {(arch.rtlAndLocalizationRules || []).map((rule, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-start gap-2"
                >
                  <span className="font-mono text-slate-400 tabular-nums">0{idx + 1}.</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3-Layer Code Breakdown: Models / Services / Views */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              تقسيم الكود البرمجي (الموديلات · الخدمات · الواجهات)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              استعرض كل طبقة برمجية لفهم مسؤوليتها، الدوال الأساسية، طريقة عمل الكود، ومقتطف الكود الجاهز للإنتاج.
            </p>
          </div>

          {/* Layer Segmented Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveLayer('models')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeLayer === 'models'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>1. الموديلات (Models) ({arch.models?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('services')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeLayer === 'services'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ServerCog className="w-3.5 h-3.5" />
              <span>2. الخدمات (Services) ({arch.services?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('views')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeLayer === 'views'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>3. الواجهات (Views) ({arch.views?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Module Items */}
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {currentItems.map((mod, idx) => (
            <div key={idx} className="py-6 first:pt-0 last:pb-0 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Code2 className="w-3.5 h-3.5 text-blue-600" />
                    <code className="font-mono text-blue-600 dark:text-blue-400" dir="ltr">
                      {mod.filePath}
                    </code>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {mod.name}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">المسؤولية البرمجية</div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mod.responsibility}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">كيف يعمل هذا الكود؟</div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mod.howItWorks}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="font-bold text-slate-900 dark:text-white">الترابط مع بقية التطبيق</div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mod.interactions}
                  </p>
                </div>
              </div>

              {/* Key Fields / Methods */}
              {mod.keyFieldsOrMethods && mod.keyFieldsOrMethods.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    الحقول والدوال الأساسية:
                  </div>
                  <div className="flex flex-wrap gap-2" dir="ltr">
                    {mod.keyFieldsOrMethods.map((fn, i) => (
                      <code
                        key={i}
                        className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md"
                      >
                        {fn}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Production-Ready Code Snippet */}
              {mod.dartCodeSnippet && (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100">
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400" dir="ltr">
                      {mod.filePath} (Production-Ready · Null Safety · RTL)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(mod.dartCodeSnippet!, `${activeLayer}-${idx}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                    >
                      {copiedId === `${activeLayer}-${idx}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الكود</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre
                    dir="ltr"
                    className="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-slate-200"
                  >
                    <code>{mod.dartCodeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
