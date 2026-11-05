import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Palette,
  BoxSelect,
  Layers,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Code2,
  Wand2,
  Trash2,
} from 'lucide-react';
import {
  OutputLanguage,
  TargetPlatform,
  UIVisionAnalysis,
} from '../types/prompt';

interface UIVisionAnalyzerViewProps {
  visionAnalysis: UIVisionAnalysis | undefined;
  uploadedImagePreview: string | null;
  onUploadImage: (base64: string, mimeType: string) => void;
  onClearImage: () => void;
  onRunVisionAnalysis: (customInstructions: string) => Promise<void>;
  onApplyVisionToProjectPrompt: () => Promise<void>;
  isAnalyzingImage: boolean;
  isApplyingToPrompt: boolean;
  targetPlatform: TargetPlatform;
  outputLanguage: OutputLanguage;
}

const INITIAL_SAMPLE_VISION: UIVisionAnalysis = {
  styleNameAr: 'تصميم بطاقات مالية وطبية عصرية بحواف ناعمة (Modern Clean Bento UI)',
  styleNameEn: 'Clean High-Contrast Bento & Card System',
  overallVisualSummary:
    'تعتمد الشاشة على خلفية فاتحة محايدة (#F8FAFC) تبرز فوقها بطاقات بيضاء نقية (#FFFFFF) محاطة بحدود دقيقة (1px solid #E2E8F0) بدون ظلال ثقيلة، مع بطاقة رئيسية داكنة (#0F172A) لإبراز الموعد أو الرصيد الأساسي، وأزرار تفاعلية بلون أزرق كوبالت (#2563EB) واضحة التباين.',
  layoutStructureType: 'Sticky Top AppBar + Hero Spotlight Card + 2-Column Action Grid + Scrollable List',
  colorPalette: [
    {
      nameAr: 'لون الخلفية الأساسية (Canvas)',
      role: 'Background',
      hex: '#F8FAFC',
      usageNotes: 'خلفية الشاشة العامة لمنح راحة بصرية وإبراز البطاقات البيضاء',
    },
    {
      nameAr: 'سطح البطاقات والحاويات',
      role: 'Card Surface',
      hex: '#FFFFFF',
      usageNotes: 'خلفية بطاقات المحتوى وحقول البحث والقوائم',
    },
    {
      nameAr: 'بطاقة التركيز البصري (Hero Surface)',
      role: 'Primary Surface',
      hex: '#0F172A',
      usageNotes: 'تستخدم في البطاقة العلوية الرئيسية لإبراز أهم معلومة في الشاشة',
    },
    {
      nameAr: 'اللون التفاعلي الأساسي (Primary CTA)',
      role: 'Primary Accent',
      hex: '#2563EB',
      usageNotes: 'أزرار الإجراء الرئيسي، التبويبات النشطة، والروابط التفاعلية',
    },
    {
      nameAr: 'لون الحواف والفواصل (Hairline Border)',
      role: 'Border',
      hex: '#E2E8F0',
      usageNotes: 'إطار دقيق بسمك 1px حول جميع البطاقات والمدخلات',
    },
    {
      nameAr: 'حالة التأكيد والنجاح',
      role: 'Semantic Success',
      hex: '#16A34A',
      usageNotes: 'شارات التوفر والحالات المؤكدة داخل القوائم',
    },
  ],
  geometryAndBorders: {
    borderRadiusScale: 'البطاقات الخارجية: 16px (rounded-2xl) · الأزرار والمدخلات الداخلية: 10px (rounded-lg)',
    borderWidthAndStyle: '1px solid #E2E8F0 (حدود متصلة دقيقة بدون حواف جانبية سميكة)',
    shadowAndElevation: 'سطح مستوٍ (Flat Single-Elevation) مع ظل خفيف جداً 0 1px 2px rgba(15,23,42,0.04)',
    spacingAndPaddingGrid: 'الحشوة الداخلية للبطاقات: 20px (p-5) · المسافة بين العناصر: 16px (gap-4)',
    surfaceContrastNotes: 'تباين 7% بين الخلفية العامة والبطاقات البيضاء مع فصل واضح بالحدود الدقيقة',
  },
  typographyAnalysis: {
    headingStyle: 'وزن عريض (Bold 700) بحجم 18px–22px مع تباعد أسطر متوازن (1.3)',
    bodyStyle: 'وزن متوسط/عادي (400–500) بحجم 14px–15px بلون رمادي داكن (#334155)',
    numericAndDataStyle: 'أرقام محاذاة جدولياً (Tabular Numerals / JetBrains Mono) للتواريخ والأسعار',
    recommendedArabicFonts: 'خط Cairo للعناوين والأزرار + خط Tajawal للنصوص التفصيلية',
  },
  detectedComponents: [
    {
      componentName: 'شريط العنوان والبحث المدمج',
      layoutPosition: 'أعلى الشاشة (Top Sticky Zone)',
      visualStylingDetails: 'خلفية بيضاء مع حد سفلي 1px وحقل بحث بحواف 10px وخلفية #F1F5F9',
      flutterWidgetEquivalent: 'SliverAppBar + TextField with OutlineInputBorder(borderRadius: BorderRadius.circular(10))',
      webTailwindEquivalent: 'sticky top-0 bg-white border-b border-slate-200 px-5 py-3.5',
    },
    {
      componentName: 'بطاقة الملخص البارزة (Hero Card)',
      layoutPosition: 'أول عنصر بعد شريط البحث',
      visualStylingDetails: 'خلفية كحلية داكنة #0F172A، نص أبيض، حواف دائرية 16px، وزر أزرق #2563EB',
      flutterWidgetEquivalent: 'Container(padding: EdgeInsetsDirectional.all(20), decoration: BoxDecoration(color: Color(0xFF0F172A), borderRadius: BorderRadius.circular(16)))',
      webTailwindEquivalent: 'bg-slate-900 text-white rounded-2xl p-5 space-y-3',
    },
    {
      componentName: 'قائمة العناصر التفاعلية (Cards List)',
      layoutPosition: 'وسط وأسفل الشاشة',
      visualStylingDetails: 'بطاقات بيضاء بحدود 1px #E2E8F0 وحواف 12px مع محاذاة أفقية للعنوان والسعر/الحالة',
      flutterWidgetEquivalent: 'ListView.separated + Container(decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Color(0xFFE2E8F0)), borderRadius: BorderRadius.circular(12)))',
      webTailwindEquivalent: 'bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between',
    },
  ],
  generatedOutputs: {
    uiStyleReplicationPrompt: `# برومبت استنساخ نظام التصميم وشكل واجهة المستخدم (UI Visual Replication Prompt)
قم بتطبيق نظام التصميم البصري التالي بدقة متناهية على كافة شاشات التطبيق:

## 1. لوحة الألوان الدقيقة (Color Tokens)
- **الخلفية العامة (Canvas Background)**: \`#F8FAFC\` (وفي الوضع الليلي: \`#020617\`).
- **سطح البطاقات (Card Surface)**: \`#FFFFFF\` (وفي الوضع الليلي: \`#0F172A\`).
- **بطاقة التركيز الرئيسية (Hero Spotlight Card)**: \`#0F172A\` مع نصوص بيضاء \`#FFFFFF\`.
- **اللون التفاعلي الأساسي (Primary Action CTA)**: \`#2563EB\` (Hover: \`#1D4ED8\`).
- **لون الحدود والفواصل (Hairline Borders)**: \`1px solid #E2E8F0\`.
- **ألوان النصوص**: العناوين \`#0F172A\`، النصوص الفرعية \`#475569\`، حالات التوفر \`#16A34A\`.

## 2. دقة الحواف والأبعاد والمسافات (Geometry & Border Radius)
- **حواف البطاقات الخارجية**: \`16px\` (\`rounded-2xl\` / \`BorderRadius.circular(16)\`).
- **حواف الأزرار وحقول الإدخال الداخلية**: \`10px\` (\`rounded-lg\` / \`BorderRadius.circular(10)\`).
- **الحشوة الداخلية للبطاقات (Padding)**: \`20px\` مع فجوة \`16px\` بين العناصر العمودية.
- **العمق والظلال**: تصميم مسطح أنيق (Single-Elevation) يعتمد على حدود \`1px\` الدقيقة بدلاً من الظلال الكثيفة.

## 3. الخطوط والاتجاه (Typography & RTL)
- دعم كامل لاتجاه العربية \`RTL\` مع خط \`Cairo\` للعناوين والأزرار وخط \`Tajawal\` للنصوص، واستخدام \`tabular-nums\` للأرقام.`,

    mergedWithAppIdeaPrompt: `# البرومبت المدمج: بناء فكرة التطبيق بنفس تصميم وألوان وحواف الصورة المرفوعة
قم ببناء التطبيق المطلوب مع الالتزام الصارم بهوية واجهة المستخدم المستخرجة من الصورة المرجعية:
- خلفية الشاشة: \`#F8FAFC\` مع بطاقات بيضاء \`#FFFFFF\` بحدود \`1px solid #E2E8F0\` وانحناء حواف \`16px\`.
- تخصيص بطاقة بارزة في أعلى الشاشة الرئيسية بلون \`#0F172A\` وأزرار تفاعلية بلون \`#2563EB\` وانحناء \`10px\`.
- تقسيم الكود إلى Models و Services و Views مع دعم العربية RTL و Null Safety.`,

    flutterThemeAndScreenCode: `import 'package:flutter/material.dart';

/// الثيم المستخرج من صورة واجهة المستخدم المرفوعة (UI Vision ThemeData)
ThemeData buildExtractedUITheme() {
  const primaryBlue = Color(0xFF2563EB);
  const slateCanvas = Color(0xFFF8FAFC);
  const slateDarkHero = Color(0xFF0F172A);
  const borderGray = Color(0xFFE2E8F0);

  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: slateCanvas,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryBlue,
      primary: primaryBlue,
      surface: Colors.white,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: slateDarkHero,
      elevation: 0,
      scrolledUnderElevation: 0,
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: borderGray, width: 1),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: primaryBlue,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    ),
  );
}`,

    tailwindAndReactCode: `export function ExtractedUIScreenPreview() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FAFC] text-[#0F172A] p-6 space-y-5">
      {/* Hero Spotlight Card */}
      <div className="bg-[#0F172A] text-white rounded-[16px] p-5 space-y-3">
        <div className="text-xs text-slate-300">بطاقة التركيز البصري المستخرجة</div>
        <h2 className="text-lg font-bold">تصميم مطابق لألوان وحواف الصورة المرفوعة</h2>
        <button className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-[10px] transition-colors">
          إجراء رئيسي (#2563EB · Radius 10px)
        </button>
      </div>

      {/* Content Card with 1px solid #E2E8F0 and 16px radius */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 space-y-3">
        <h3 className="text-sm font-bold">بطاقة محتوى بحواف 16px وحدود 1px دقيقة</h3>
        <p className="text-xs text-[#475569] leading-relaxed">
          تم استخراج كافة الألوان والقياسات والمسافات من لقطة الشاشة لتطبيقها مباشرة في مشروعك.
        </p>
      </div>
    </div>
  );
}`,
  },
};

export const UIVisionAnalyzerView: React.FC<UIVisionAnalyzerViewProps> = ({
  visionAnalysis,
  uploadedImagePreview,
  onUploadImage,
  onClearImage,
  onRunVisionAnalysis,
  onApplyVisionToProjectPrompt,
  isAnalyzingImage,
  isApplyingToPrompt,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [activeOutputTab, setActiveOutputTab] = useState<
    'uiStyleReplicationPrompt' | 'mergedWithAppIdeaPrompt' | 'flutterThemeAndScreenCode' | 'tailwindAndReactCode'
  >('uiStyleReplicationPrompt');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeVision = visionAnalysis || INITIAL_SAMPLE_VISION;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadImage(reader.result, file.type || 'image/png');
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate a synthetic high-resolution UI screenshot on HTML5 Canvas so users can test live Vision analysis immediately even without a local image file
  const handleGenerateSampleUIScreenshot = (themeVariant: 'fintech_dark' | 'medical_clean') => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (themeVariant === 'fintech_dark') {
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, 720, 480);

      // Top Header
      ctx.fillStyle = '#111827';
      ctx.fillRect(24, 20, 672, 56);
      ctx.strokeStyle = '#1F2937';
      ctx.strokeRect(24, 20, 672, 56);
      ctx.fillStyle = '#F9FAFB';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('NovaPay Digital Wallet UI', 48, 54);

      // Primary Hero Card
      ctx.fillStyle = '#1E1B4B';
      ctx.fillRect(24, 96, 420, 180);
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 2;
      ctx.strokeRect(24, 96, 420, 180);
      ctx.fillStyle = '#E0E7FF';
      ctx.font = '14px sans-serif';
      ctx.fillText('Total Balance', 48, 132);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px monospace';
      ctx.fillText('SAR 48,920.50', 48, 178);

      // CTA Button inside Hero
      ctx.fillStyle = '#6366F1';
      ctx.fillRect(48, 210, 150, 42);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Transfer Funds', 70, 236);

      // Side Stat Card
      ctx.fillStyle = '#111827';
      ctx.fillRect(464, 96, 232, 180);
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(464, 96, 232, 180);
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('+18.4% Monthly', 488, 160);

      // Bottom List Cards
      ctx.fillStyle = '#111827';
      ctx.fillRect(24, 296, 672, 72);
      ctx.strokeRect(24, 296, 672, 72);
      ctx.fillRect(24, 384, 672, 72);
      ctx.strokeRect(24, 384, 672, 72);
    } else {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, 720, 480);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(24, 20, 672, 56);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(24, 20, 672, 56);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Smart Clinic Appointment UI', 48, 54);

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(24, 96, 672, 140);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Upcoming Video Consultation - 05:30 PM', 48, 145);
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(48, 170, 160, 40);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Join Video Room', 68, 195);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(24, 256, 326, 190);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(24, 256, 326, 190);
      ctx.fillRect(370, 256, 326, 190);
      ctx.strokeRect(370, 256, 326, 190);
    }

    const dataUrl = canvas.toDataURL('image/png');
    onUploadImage(dataUrl, 'image/png');
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload & Vision Analysis Trigger Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>محلل صور شاشات العرض (UI Screenshot Reverse-Engineering)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ارفع لقطة شاشة لأي تطبيق أعجبك ليقوم الذكاء الاصطناعي بقراءة الألوان (#HEX)، دقة الحواف، الظلال، والأكواد المستخدمة، وتوليد برومبت لتطبيق نفس التصميم في مشروعك.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleGenerateSampleUIScreenshot('fintech_dark')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              تجربة لقطة شاشة محفظة داكنة
            </button>
            <button
              type="button"
              onClick={() => handleGenerateSampleUIScreenshot('medical_clean')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              تجربة لقطة شاشة طبية فاتحة
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Image Dropzone / Preview */}
          <div className="lg:col-span-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadedImagePreview ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950">
                  <img
                    src={uploadedImagePreview}
                    alt="لقطة شاشة واجهة المستخدم المرفوعة"
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[260px] object-contain mx-auto"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-lg cursor-pointer"
                  >
                    تغيير الصورة
                  </button>
                  <button
                    type="button"
                    onClick={onClearImage}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>إزالة الصورة</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-8 text-center space-y-3 bg-slate-50/60 dark:bg-slate-800/30 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    اضغط لرفع صورة شاشة العرض (UI Screenshot)
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    يدعم صور PNG, JPG, WebP لشاشات الجوال أو تطبيقات الويب
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Analysis Instructions & Action Buttons */}
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                ما الذي أعجبك في هذه الشاشة وتريد التركيز عليه؟ (اختياري)
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
                placeholder="مثال: أعجبني تناسق الألوان الداكنة مع الأزرار البنفسجية وشكل انحناء البطاقات العلوية، أريد تطبيق نفس هذا الستايل على شاشة الرئيسية في تطبيقي..."
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!uploadedImagePreview || isAnalyzingImage}
                onClick={() => onRunVisionAnalysis(customInstructions)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
              >
                {isAnalyzingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري قراءة تفاصيل الشاشة والألوان والحواف...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>قراءة وتحليل الـ UI من الصورة المرفوعة</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isApplyingToPrompt}
                onClick={onApplyVisionToProjectPrompt}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                {isApplyingToPrompt ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري دمج التصميم في البرومبت الشامل...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>تطبيق هذا التصميم على برومبت مشروعي الحالي</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">كيف يعمل محلل الشاشات؟ </strong>
              يقوم النموذج البصري باستخراج أكواد الألوان الحقيقية (\`#HEX\`)، حساب نسب انحناء الحواف (\`Border Radius\`)، سمك الإطارات (\`Borders\`)، وتفكيك المكونات إلى ما يقابلها في \`Flutter Widgets\` و \`Tailwind CSS\` لتتمكن من نسخها فوراً.
            </div>
          </div>
        </div>
      </section>

      {/* Extracted Visual Specs: Colors, Geometry & Borders */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
        <div className="pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>نمط الواجهة المكتشف: {activeVision.styleNameEn}</span>
            <span aria-hidden="true">·</span>
            <span>تخطيط الشاشة: {activeVision.layoutStructureType}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {activeVision.styleNameAr}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeVision.overallVisualSummary}
          </p>
        </div>

        {/* Extracted Color Swatches Grid */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>لوحة الألوان المستخرجة من الشاشة (اضغط على أي لون لنسخ كود HEX)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(activeVision.colorPalette || []).map((color, idx) => (
              <div
                key={idx}
                onClick={() => handleCopy(color.hex, `color-${idx}`)}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors flex items-start gap-3.5 cursor-pointer"
              >
                <div
                  className="w-11 h-11 rounded-lg border border-slate-300 dark:border-slate-700 shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {color.nameAr}
                    </span>
                    <code className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400" dir="ltr">
                      {copiedKey === `color-${idx}` ? 'تم النسخ!' : color.hex}
                    </code>
                  </div>
                  <div className="text-[11px] text-slate-400">{color.role}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug pt-0.5">
                    {color.usageNotes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geometry, Borders, Radius & Typography Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BoxSelect className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>دقة الحواف والأبعاد والظلال (Geometry & Borders)</span>
            </h4>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="font-bold text-slate-800 dark:text-slate-200">انحناء الحواف (Border Radius):</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeVision.geometryAndBorders.borderRadiusScale}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-800 dark:text-slate-200">سمك وشكل الإطارات (Borders):</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeVision.geometryAndBorders.borderWidthAndStyle}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-800 dark:text-slate-200">الظلال والعمق البصري (Elevation):</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeVision.geometryAndBorders.shadowAndElevation}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-800 dark:text-slate-200">نظام المسافات والـ Padding:</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeVision.geometryAndBorders.spacingAndPaddingGrid}
                </dd>
              </div>
            </dl>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>تحليل الخطوط والتباين البصري</span>
            </h4>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="font-bold text-slate-800 dark:text-slate-200">نمط العناوين (Headings):</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeVision.typographyAnalysis.headingStyle}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-800 dark:text-slate-200">نمط النصوص (Body Text):</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeVision.typographyAnalysis.bodyStyle}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-800 dark:text-slate-200">عرض الأرقام والبيانات:</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeVision.typographyAnalysis.numericAndDataStyle}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-slate-800 dark:text-slate-200">الخطوط العربية المقترحة لهذا التصميم:</dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-0.5">
                  {activeVision.typographyAnalysis.recommendedArabicFonts}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Detected UI Components & Code Equivalents Table */}
        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>تفكيك عناصر الشاشة والأكواد المقابلة لها (Flutter Widgets & Tailwind CSS)</span>
          </h4>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
            {(activeVision.detectedComponents || []).map((comp, idx) => (
              <div key={idx} className="py-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    0{idx + 1}. {comp.componentName}
                  </span>
                  <span className="text-xs text-slate-500">{comp.layoutPosition}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {comp.visualStylingDetails}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs font-mono" dir="ltr">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Flutter: </span>
                    <span className="text-slate-700 dark:text-slate-300">{comp.flutterWidgetEquivalent}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs font-mono" dir="ltr">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Tailwind: </span>
                    <span className="text-slate-700 dark:text-slate-300">{comp.webTailwindEquivalent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Generated UI Replication Prompts & Ready-to-Use Theme Code */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              البرومبت والأكواد المستخرجة لتطبيق نفس شكل وألوان الشاشة
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              انسخ البرومبت المخصص لتطبيقه في أي منصة برمجة، أو انسخ كود الثيم الجاهز مباشرة.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'uiStyleReplicationPrompt', label: '1. برومبت نسخ التصميم والألوان والحواف' },
              { id: 'mergedWithAppIdeaPrompt', label: '2. برومبت مدمج مع فكرة تطبيقي' },
              { id: 'flutterThemeAndScreenCode', label: '3. كود Flutter ThemeData & Screen' },
              { id: 'tailwindAndReactCode', label: '4. كود React + Tailwind CSS' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveOutputTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeOutputTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">
              جاهز للنسخ واللصق مباشرة في منصات صناعة الأكواد
            </span>
            <button
              type="button"
              onClick={() =>
                handleCopy(activeVision.generatedOutputs[activeOutputTab], activeOutputTab)
              }
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
            >
              {copiedKey === activeOutputTab ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ البرومبت / الكود</span>
                </>
              )}
            </button>
          </div>
          <pre
            dir={
              activeOutputTab === 'flutterThemeAndScreenCode' ||
              activeOutputTab === 'tailwindAndReactCode'
                ? 'ltr'
                : 'rtl'
            }
            className="p-5 text-xs sm:text-sm font-mono leading-relaxed overflow-x-auto text-slate-100 whitespace-pre-wrap"
          >
            <code>{activeVision.generatedOutputs[activeOutputTab]}</code>
          </pre>
        </div>
      </section>
    </div>
  );
};
