import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Globe,
  Layers,
  Layout,
  Code2,
  Terminal,
  Trash2,
  History,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  CheckCircle2,
  FolderPlus,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import {
  AnalysisBlueprint,
  OutputLanguage,
  SavedPromptProject,
  ScopeMode,
  TargetPlatform,
  UIVisionAnalysis,
  WebSearchInspiration,
} from './types/prompt';
import { IDEA_PRESETS, INITIAL_SAMPLE_BLUEPRINT } from './data/presets';
import {
  analyzeIdeaAndGenerateBlueprint,
  analyzeUIScreenshot,
  refineMasterPrompts,
  runWebSearchInspiration,
} from './services/promptService';
import { CritiqueAndSuggestionsView } from './components/CritiqueAndSuggestionsView';
import { ScreenWireframesView } from './components/ScreenWireframesView';
import { CodeArchitectureView } from './components/CodeArchitectureView';
import { MasterPromptStudioView } from './components/MasterPromptStudioView';
import { UIVisionAnalyzerView } from './components/UIVisionAnalyzerView';

type StudioTab = 'critique' | 'vision' | 'screens' | 'architecture' | 'prompt';

const STORAGE_KEY = 'codeprompt_architect_saved_projects_v1';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [ideaText, setIdeaText] = useState<string>(IDEA_PRESETS[0].ideaText);
  const [scopeMode, setScopeMode] = useState<ScopeMode>('auto');
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>('all');
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage>('bilingual');
  const [enableWebSearch, setEnableWebSearch] = useState<boolean>(true);

  // UI Screenshot Vision state
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedImageMimeType, setUploadedImageMimeType] = useState<string>('image/png');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const sidebarFileInputRef = useRef<HTMLInputElement | null>(null);

  const [blueprint, setBlueprint] = useState<AnalysisBlueprint>(INITIAL_SAMPLE_BLUEPRINT);
  const [activeTab, setActiveTab] = useState<StudioTab>('vision');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStepText, setAnalysisStepText] = useState<string>('');
  const [isSearchingWeb, setIsSearchingWeb] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [savedProjects, setSavedProjects] = useState<SavedPromptProject[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedProjects(parsed);
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const saveProjectToHistory = (
    currentIdea: string,
    currentBlueprint: AnalysisBlueprint,
    currentScope: ScopeMode,
    currentPlatform: TargetPlatform,
    currentLang: OutputLanguage,
    currentWebSearch: boolean
  ) => {
    const newEntry: SavedPromptProject = {
      id: `proj-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      ideaText: currentIdea,
      scopeMode: currentScope,
      targetPlatform: currentPlatform,
      outputLanguage: currentLang,
      enableWebSearch: currentWebSearch,
      blueprint: currentBlueprint,
    };

    const updated = [newEntry, ...savedProjects.slice(0, 14)];
    setSavedProjects(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
  };

  const handleUploadImage = (base64: string, mimeType: string) => {
    setUploadedImageBase64(base64);
    setUploadedImageMimeType(mimeType);
    showToast('تم إرفاق صورة واجهة المستخدم! يمكنك الآن تحليلها أو دمجها مع فكرتك.');
  };

  const handleSidebarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleUploadImage(reader.result, file.type || 'image/png');
        setActiveTab('vision');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRunVisionAnalysisOnly = async (customInstructions: string) => {
    if (!uploadedImageBase64) {
      setErrorMessage('يرجى رفع صورة لشاشة العرض أولاً.');
      return;
    }

    setIsAnalyzingImage(true);
    setErrorMessage(null);
    try {
      const visionResult = await analyzeUIScreenshot({
        imageBase64: uploadedImageBase64,
        mimeType: uploadedImageMimeType,
        ideaText: ideaText.trim(),
        customImageInstructions: customInstructions,
        targetPlatform,
        outputLanguage,
      });

      setBlueprint((prev) => ({
        ...prev,
        uiVisionAnalysis: visionResult,
      }));
      showToast('تمت قراءة وتحليل تفاصيل الـ UI والألوان والحواف والأكواد بنجاح!');
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء تحليل صورة واجهة المستخدم.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleAnalyzeAndGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ideaText.trim()) {
      setErrorMessage('يرجى كتابة شرح نصي لفكرة التطبيق أو الميزة المطلوبة أولاً.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      let visionContext: UIVisionAnalysis | null = blueprint.uiVisionAnalysis || null;
      if (uploadedImageBase64) {
        setAnalysisStepText('1/3 جاري قراءة صورة الشاشة المرفقة واستخراج الألوان والحواف ونوع الـ UI...');
        try {
          visionContext = await analyzeUIScreenshot({
            imageBase64: uploadedImageBase64,
            mimeType: uploadedImageMimeType,
            ideaText: ideaText.trim(),
            targetPlatform,
            outputLanguage,
          });
        } catch {
          // Continue if image analysis fails
        }
      }

      let webResult: WebSearchInspiration | null = null;
      if (enableWebSearch) {
        setAnalysisStepText('2/3 جاري البحث في الإنترنت عن نماذج شاشات العرض وأفضل الممارسات...');
        try {
          webResult = await runWebSearchInspiration({
            ideaText: ideaText.trim(),
            targetPlatform,
            scopeMode,
          });
        } catch {
          webResult = null;
        }
      }

      setAnalysisStepText(
        '3/3 جاري التفكير المكتمل، تحليل النقد والمقترحات، تصميم الشاشات، وبناء البرومبت المتكامل...'
      );
      const result = await analyzeIdeaAndGenerateBlueprint({
        ideaText: ideaText.trim(),
        scopeMode,
        targetPlatform,
        outputLanguage,
        webSearchContext: webResult,
        uiVisionContext: visionContext,
      });

      setBlueprint(result);
      saveProjectToHistory(
        ideaText.trim(),
        result,
        scopeMode,
        targetPlatform,
        outputLanguage,
        enableWebSearch
      );
      showToast('تم تحليل الفكرة وبناء البرومبت الهندسي المتكامل بنجاح!');
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء تحليل الفكرة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStepText('');
    }
  };

  const handleTriggerWebSearchOnly = async () => {
    if (!ideaText.trim()) return;
    setIsSearchingWeb(true);
    setErrorMessage(null);
    try {
      const webResult = await runWebSearchInspiration({
        ideaText: ideaText.trim(),
        targetPlatform,
        scopeMode,
      });
      setBlueprint((prev) => ({
        ...prev,
        webSearch: webResult,
      }));
      showToast('تم تحديث نماذج شاشات العرض وروابط البحث من الإنترنت!');
    } catch (err: any) {
      setErrorMessage(err?.message || 'تعذر إتمام البحث في الإنترنت.');
    } finally {
      setIsSearchingWeb(false);
    }
  };

  const handleToggleSuggestion = (id: string) => {
    setBlueprint((prev) => ({
      ...prev,
      critiquesAndSuggestions: prev.critiquesAndSuggestions.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ),
    }));
  };

  const handleAddCustomSuggestion = (title: string, proposedSolution: string) => {
    const newItem = {
      id: `custom-${Date.now()}`,
      category: 'architecture' as const,
      title,
      problemAnalysis: 'شرط إضافي مخصص من المستخدم لتعزيز شمولية الكود.',
      proposedSolution,
      impact: 'high' as const,
      selected: true,
    };
    setBlueprint((prev) => ({
      ...prev,
      critiquesAndSuggestions: [newItem, ...prev.critiquesAndSuggestions],
    }));
    showToast('تمت إضافة الشرط وتفعيله في قائمة التحسينات!');
  };

  const handleResynthesizePrompts = async (
    customNotes: string,
    overridePlatform?: TargetPlatform,
    overrideLang?: OutputLanguage
  ) => {
    setIsRefining(true);
    setErrorMessage(null);
    try {
      const selectedSuggestions = blueprint.critiquesAndSuggestions.filter((c) => c.selected);
      const updatedPrompts = await refineMasterPrompts({
        ideaText,
        blueprint,
        selectedSuggestions,
        customUserNotes: customNotes,
        targetPlatform: overridePlatform || targetPlatform,
        outputLanguage: overrideLang || outputLanguage,
        uiVisionContext: blueprint.uiVisionAnalysis || null,
      });

      setBlueprint((prev) => ({
        ...prev,
        masterPrompts: updatedPrompts,
      }));
      setActiveTab('prompt');
      showToast('تم تحديث البرومبت النهائي وتضمين مواصفات التصميم المختارة!');
    } catch (err: any) {
      setErrorMessage(err?.message || 'حدث خطأ أثناء تحديث البرومبت.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleStartNewIdea = () => {
    setIdeaText('');
    setScopeMode('auto');
    setActiveTab('critique');
    const textarea = document.getElementById('idea-input-textarea');
    if (textarea) textarea.focus();
  };

  const handleDeleteSavedProject = (id: string) => {
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mandatory 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          مُهندس البرومبتات البرمجية
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab('critique')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'critique'
                ? 'text-blue-600 dark:text-blue-400 underline underline-offset-8'
                : ''
            }`}
          >
            النقد والتحسين
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vision')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'vision'
                ? 'text-blue-600 dark:text-blue-400 underline underline-offset-8'
                : ''
            }`}
          >
            محلل صور الشاشات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('screens')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'screens'
                ? 'text-blue-600 dark:text-blue-400 underline underline-offset-8'
                : ''
            }`}
          >
            نماذج الشاشات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'architecture'
                ? 'text-blue-600 dark:text-blue-400 underline underline-offset-8'
                : ''
            }`}
          >
            هيكلة الأكواد
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'prompt'
                ? 'text-blue-600 dark:text-blue-400 underline underline-offset-8'
                : ''
            }`}
          >
            البرومبت المتكامل
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleStartNewIdea}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            فكرة برمجية جديدة
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 start-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-semibold shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main 1440px Desktop Workbench Container */}
      <main id="top" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Sub-header Utility Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-balance">
              حوّل شرحك النصي أو صورة أي شاشة تعجبك إلى برومبت برمجي متكامل
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              يفهم فكرتك نصياً، يقرأ تفاصيل صور شاشات العرض (الألوان، الحواف، ونوع الـ UI)، ينقد ويقترح التحسينات، ويولّد البرومبت لأي منصة برمجة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>الوضع النهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span>الوضع الليلي</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-between gap-4 text-xs text-red-800 dark:text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="font-semibold underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* 12-Column Engineering Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1 (4 Cols on Desktop): Idea Input, Screenshot Upload, Scope, Platform & History */}
          <aside className="lg:col-span-4 space-y-6">
            <form
              onSubmit={handleAnalyzeAndGenerate}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>اشرح فكرة التطبيق أو الميزة نصياً</span>
                </h2>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {ideaText.length} حرف
                </span>
              </div>

              {/* Plain-Text Description Input */}
              <div className="space-y-2">
                <textarea
                  id="idea-input-textarea"
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  rows={5}
                  placeholder="اكتب هنا شرحاً نصياً لفكرتك... سواء كنت تريد بناء تطبيق كامل من الصفر أو إضافة ميزة محددة لتطبيقك الحالي."
                  className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed resize-y"
                />

                {/* Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    أمثلة جاهزة للتجربة السريعة:
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {IDEA_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setIdeaText(preset.ideaText);
                          setScopeMode(preset.scopeType);
                          setTargetPlatform(preset.recommendedPlatform);
                        }}
                        className="text-start px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/60 dark:bg-slate-800/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {preset.label}
                          </span>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 shrink-0">
                            {preset.badgeText}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick UI Screenshot Attachment in Sidebar */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <input
                  ref={sidebarFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSidebarFileChange}
                  className="hidden"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>إرفاق صورة شاشة أعجبتك (اختياري):</span>
                  </span>
                  {uploadedImageBase64 && (
                    <button
                      type="button"
                      onClick={() => setUploadedImageBase64(null)}
                      className="text-[11px] text-red-600 hover:underline cursor-pointer"
                    >
                      إزالة الصورة
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => sidebarFileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {uploadedImageBase64
                      ? 'تم إرفاق صورة الشاشة (اضغط لتغييرها)'
                      : 'ارفع لقطة شاشة لاستنساخ ألوانها وتصميمها'}
                  </span>
                </button>
              </div>

              {/* Scope Selector: Auto vs Full App vs Feature */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  1. تحديد المطلوب (نطاق البرومبت):
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {(
                    [
                      { id: 'auto', label: 'اكتشاف تلقائي' },
                      { id: 'full_app', label: 'تطبيق متكامل' },
                      { id: 'feature', label: 'ميزة لتطبيق قائم' },
                    ] as const
                  ).map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => setScopeMode(sc.id)}
                      className={`py-2 px-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        scopeMode === sc.id
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Coding Platform Selector */}
              <div className="space-y-2">
                <label
                  htmlFor="platform-select"
                  className="block text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  2. المنصة التي ستضع فيها البرومبت:
                </label>
                <select
                  id="platform-select"
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value as TargetPlatform)}
                  className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">جميع منصات بناء الأكواد والتطبيقات (شامل)</option>
                  <option value="aistudio">Google AI Studio Build (Full-Stack Web)</option>
                  <option value="flutter">Flutter & Dart (Models / Services / Views + RTL)</option>
                  <option value="bolt">Bolt.new (Full-Stack Vite / React)</option>
                  <option value="lovable">Lovable.dev (React + Tailwind + Supabase)</option>
                  <option value="cursor">Cursor IDE / Windsurf / GitHub Copilot</option>
                  <option value="v0">v0 by Vercel (Next.js UI & Components)</option>
                  <option value="flutterflow">FlutterFlow (تطبيقات الجوال المرئية)</option>
                </select>
              </div>

              {/* Output Language Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  3. لغة البرومبت المستخرج:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {(
                    [
                      { id: 'bilingual', label: 'ثنائي اللغة' },
                      { id: 'ar', label: 'عربي بالكامل' },
                      { id: 'en', label: 'إنجليزي تقني' },
                    ] as const
                  ).map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setOutputLanguage(lang.id)}
                      className={`py-2 px-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        outputLanguage === lang.id
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Web Search Grounding Toggle */}
              <div className="pt-1">
                <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        البحث الحي في الإنترنت (Web Grounding)
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        البحث عن نماذج شاشات العرض وأحدث الحزم البرمجية
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableWebSearch}
                    onChange={(e) => setEnableWebSearch(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-3 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>جاري التحليل وصناعة البرومبت...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>تحليل الفكرة وصناعة البرومبت المتكامل</span>
                  </>
                )}
              </button>

              {isAnalyzing && analysisStepText && (
                <p className="text-xs text-center text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
                  {analysisStepText}
                </p>
              )}
            </form>

            {/* Saved Prompt Projects History */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  <span>سجل البرومبتات المحفوظة ({savedProjects.length})</span>
                </h3>
              </div>

              {savedProjects.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  سيتم حفظ جميع البرومبتات والمشاريع التي تقوم بتوليدها هنا تلقائياً للرجوع إليها في أي وقت.
                </p>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-64 overflow-y-auto">
                  {savedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="py-2.5 flex items-center justify-between gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIdeaText(proj.ideaText);
                          setScopeMode(proj.scopeMode);
                          setTargetPlatform(proj.targetPlatform);
                          setOutputLanguage(proj.outputLanguage);
                          setBlueprint(proj.blueprint);
                          showToast(`تم استرجاع مشروع: ${proj.blueprint.projectTitleAr}`);
                        }}
                        className="text-start flex-1 min-w-0 cursor-pointer group"
                      >
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 truncate">
                          {proj.blueprint.projectTitleAr}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="tabular-nums">{proj.createdAt}</span>
                          <span aria-hidden="true">·</span>
                          <span>
                            {proj.blueprint.detectedScope === 'feature'
                              ? 'ميزة إضافية'
                              : 'تطبيق كامل'}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSavedProject(proj.id)}
                        aria-label="حذف من السجل"
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Column 2 (8 Cols on Desktop): Interactive Engineering & Prompt Studio */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary 5-Stage Studio Navigation Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('critique')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'critique'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>1. التفكير والنقد ({blueprint.critiquesAndSuggestions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('vision')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'vision'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span>2. محلل صور الشاشات (UI Vision)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('screens')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'screens'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layout className="w-4 h-4 shrink-0" />
                <span>3. نماذج الشاشات والويب ({blueprint.screens.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('architecture')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'architecture'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-4 h-4 shrink-0" />
                <span>4. هيكلة الأكواد</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('prompt')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'prompt'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-4 h-4 shrink-0" />
                <span>5. البرومبت النهائي</span>
              </button>
            </div>

            {/* Active Tab Viewport */}
            {activeTab === 'critique' && (
              <CritiqueAndSuggestionsView
                blueprint={blueprint}
                onToggleSuggestion={handleToggleSuggestion}
                onAddCustomSuggestion={handleAddCustomSuggestion}
                onResynthesizePrompts={(notes) => handleResynthesizePrompts(notes)}
                isRefining={isRefining}
                onNavigateToPrompt={() => setActiveTab('prompt')}
              />
            )}

            {activeTab === 'vision' && (
              <UIVisionAnalyzerView
                visionAnalysis={blueprint.uiVisionAnalysis}
                uploadedImagePreview={uploadedImageBase64}
                onUploadImage={handleUploadImage}
                onClearImage={() => setUploadedImageBase64(null)}
                onRunVisionAnalysis={handleRunVisionAnalysisOnly}
                onApplyVisionToProjectPrompt={() =>
                  handleResynthesizePrompts('تطبيق ألوان وتصميم وحواف الشاشة المستخرجة من الصورة المرفوعة')
                }
                isAnalyzingImage={isAnalyzingImage}
                isApplyingToPrompt={isRefining}
                targetPlatform={targetPlatform}
                outputLanguage={outputLanguage}
              />
            )}

            {activeTab === 'screens' && (
              <ScreenWireframesView
                blueprint={blueprint}
                onTriggerWebSearch={handleTriggerWebSearchOnly}
                isSearchingWeb={isSearchingWeb}
              />
            )}

            {activeTab === 'architecture' && (
              <CodeArchitectureView blueprint={blueprint} />
            )}

            {activeTab === 'prompt' && (
              <MasterPromptStudioView
                blueprint={blueprint}
                targetPlatform={targetPlatform}
                outputLanguage={outputLanguage}
                onChangePlatform={(plat) => setTargetPlatform(plat)}
                onChangeLanguage={(lang) => setOutputLanguage(lang)}
                onRegenerateForPlatform={(plat, lang) =>
                  handleResynthesizePrompts('', plat, lang)
                }
                isRefining={isRefining}
              />
            )}
          </div>
        </div>
      </main>

      {/* Clean Quiet Footer */}
      <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-5 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            مُهندس البرومبتات البرمجية (CodePrompt Architect) · تحويل الأفكار النصية وصور الواجهات إلى برومبتات برمجية متكاملة
          </span>
          <div className="flex items-center gap-4">
            <span>يدعم العربية و RTL</span>
            <span aria-hidden="true">·</span>
            <span>UI Screenshot Vision</span>
            <span aria-hidden="true">·</span>
            <span>Models / Services / Views</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
