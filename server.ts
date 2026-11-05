import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const PLATFORM_NAMES: Record<string, string> = {
  all: 'جميع منصات بناء التطبيقات والأكواد بالذكاء الاصطناعي (Universal Full-Stack & Mobile)',
  aistudio: 'Google AI Studio Build (React + TypeScript + Tailwind + Express + Gemini SDK)',
  bolt: 'Bolt.new (Full-Stack WebContainers Vite + React + TypeScript)',
  lovable: 'Lovable.dev (React + Tailwind + Supabase + shadcn/ui)',
  cursor: 'Cursor IDE / Windsurf / GitHub Copilot (Multi-file Modular Architecture + .cursorrules)',
  v0: 'v0 by Vercel (Next.js App Router + React + Tailwind + Lucide)',
  flutter: 'Flutter & Dart (Production-Ready, Null Safety, Clean Architecture: Models / Services / Views, Full RTL Arabic)',
  flutterflow: 'FlutterFlow (Visual Mobile Builder + Custom Actions + Firestore Schema)',
};

// 1. Web Search Grounding endpoint for UI screen inspirations, patterns, and libraries
app.post('/api/prompt/web-search', async (req, res) => {
  try {
    const { ideaText, targetPlatform, scopeMode } = req.body;
    if (!ideaText || typeof ideaText !== 'string') {
      return res.status(400).json({ error: 'يرجى إدخال وصف الفكرة للبحث.' });
    }

    const ai = getGenAIClient();
    const platformLabel = PLATFORM_NAMES[targetPlatform] || PLATFORM_NAMES.all;

    const searchPrompt = `أنت باحث ومهندس برمجيات ومصمم واجهات UX/UI خبير.
الفكرة المطلوبة من المستخدم:
"${ideaText}"
المنصة المستهدفة: ${platformLabel}
النطاق: ${scopeMode === 'feature' ? 'إضافة ميزة محددة لتطبيق قائم' : scopeMode === 'full_app' ? 'بناء تطبيق متكامل من الصفر' : 'تحديد تلقائي'}

ابحث في الإنترنت عن:
1. أفضل نماذج شاشات العرض (UI Screen Patterns & Design Systems) والتطبيقات العالمية المشهورة المشابهة لهذه الفكرة وكيف تعمل شاشاتها.
2. أفضل المكتبات والحزم البرمجية الحديثة وأفضل الممارسات المعمارية لتنفيذ هذه الفكرة (بما يشمل دعم العربية RTL وFlutter/Web).
لخص نتائج البحث بشكل منظم ودقيق باللغة العربية.`;

    const groundedResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundedText = groundedResponse.text || '';
    const rawChunks = groundedResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const extractedSources = rawChunks
      .filter((c: any) => c.web?.uri)
      .map((c: any, idx: number) => ({
        title: c.web?.title || `مرجع ويب تقني #${idx + 1}`,
        uri: c.web?.uri,
        category: idx % 2 === 0 ? 'ui_inspiration' : 'architecture',
      }));

    const structuredResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `بناءً على نتائج البحث التالية حول فكرة المستخدم ("${ideaText}"):
---
${groundedText}
---
قم بتحويل هذه المعلومات إلى هيكل JSON منظم يتضمن ملخصاً تنفيذياً، أنماط التصميم الموصى بها، إلهام شاشات العرض (UI Screen Inspirations)، وأفضل الحزم البرمجية.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryAr: { type: Type.STRING, description: 'ملخص نتائج البحث في الإنترنت لتحسين الإنتاجية وجودة التطبيق' },
            recommendedPatterns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'أفضل الأنماط البرمجية والمعمارية المستخلصة من الويب',
            },
            uiScreenInspirations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  screenTitle: { type: Type.STRING },
                  referenceAppExamples: { type: Type.STRING, description: 'أمثلة لتطبيقات أو منصات عالمية مشابهة' },
                  layoutBestPractice: { type: Type.STRING, description: 'أفضل طريقة لتصميم وتخطيط هذه الشاشة' },
                  keyUXElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['screenTitle', 'referenceAppExamples', 'layoutBestPractice', 'keyUXElements'],
              },
            },
            recommendedPackages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                },
                required: ['name', 'purpose'],
              },
            },
          },
          required: ['summaryAr', 'recommendedPatterns', 'uiScreenInspirations', 'recommendedPackages'],
        },
      },
    });

    const parsed = JSON.parse((structuredResponse.text || '{}').trim());
    return res.json({
      ...parsed,
      sources: extractedSources,
    });
  } catch (error: any) {
    console.error('Web search error:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء البحث في الإنترنت.',
    });
  }
});

// 2. Multimodal UI Screenshot Reverse-Engineering Endpoint (قراءة وتحليل صور شاشات UI)
app.post('/api/prompt/analyze-image', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/png',
      ideaText = '',
      customImageInstructions = '',
      targetPlatform = 'all',
      outputLanguage = 'bilingual',
    } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'يرجى رفع صورة لشاشة العرض (UI Screenshot) أولاً.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
    const ai = getGenAIClient();
    const platformLabel = PLATFORM_NAMES[targetPlatform] || PLATFORM_NAMES.all;

    const languageInstruction =
      outputLanguage === 'ar'
        ? 'اكتب البرومبت المستخرج باللغة العربية الفصحى التقنية الواضحة.'
        : outputLanguage === 'en'
        ? 'Write the extracted UI replication prompts in precise technical English.'
        : 'اكتب البرومبت المستخرج بشكل ثنائي اللغة (شرح وتفصيل بالعربية + القيم التقنية الدقيقة والكلاسات بالإنجليزية).';

    const promptText = `أنت خبير هندسة عكسية لواجهات المستخدم (UI/UX Reverse-Engineering Architect) وخبير Flutter & Dart و React/Tailwind CSS.
قام المستخدم برفع صورة لشاشة عرض (UI Screenshot) أعجبته ويريد قراءة وتحليل نوع الـ UI والأكواد المستخدمة لبنائها بأدق التفاصيل، ثم استخراج برومبت متكامل لتطبيق نفس هذا التصميم والألوان وشكل الحواف داخل تطبيقه.

سياق فكرة المستخدم (إن وجد): "${ideaText || 'تطبيق حديث يعتمد على هذا التصميم البصري'}"
ملاحظات المستخدم على الصورة: "${customImageInstructions || 'استخرج كافة تفاصيل الألوان، الحواف، التخطيط، والأكواد المقابلة بدقة'}"
المنصة المستهدفة: ${platformLabel}
لغة البرومبت المطلوبة: ${languageInstruction}

حلل الصورة المرفقة بدقة متناهية واستخرج:
1. نوع ومدرسة التصميم (Design System & Style Classification) والهيكل العام للشاشة.
2. لوحة الألوان الدقيقة (Color Palette) مع أكواد HEX الحقيقية لكل عنصر (الخلفية، البطاقات، الأزرار الرئيسية، النصوص، الحدود، ألوان الحالة).
3. الهندسة البصرية ودقة الحواف (Border Radius بالبيكسل، سمك ولون الحواف Borders، الظلال والارتفاعات Box Shadows / Elevation، ونظام المسافات والـ Padding).
4. تحليل الخطوط والأوزان وتنسيق الأرقام، مع اقتراح أفضل الخطوط العربية المطابقة لهذا الطابع.
5. تفكيك كل مكون بصري ظاهر في الشاشة (الأشرطة، البطاقات، القوائم، الرسوم، الأزرار) وما يقابله برمجياً في كل من:
   - Flutter & Dart Widgets (مثل Container, BoxDecoration, BorderRadius.circular, Card, SliverAppBar...)
   - Web React & Tailwind CSS classes
6. توليد 4 مخرجات برمجية جاهزة للنسخ:
   - uiStyleReplicationPrompt: برومبت دقيق جداً ينسخه المستخدم لأي منصة برمجة لتطبيق نفس هذا الـ UI والألوان والحواف في أي شاشة.
   - mergedWithAppIdeaPrompt: برومبت يدمج بين فكرة تطبيق المستخدم وهذا التصميم البصري المستخرج من الصورة.
   - flutterThemeAndScreenCode: كود Flutter & Dart كامل (Production-Ready + Null Safety + RTL) يتضمن ThemeData بالألوان والحواف المستخرجة + شاشة تطبق هذا التصميم.
   - tailwindAndReactCode: كود React + Tailwind CSS كامل يطبق نفس تصميم الصورة وألوانها وحوافها.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleNameAr: { type: Type.STRING, description: 'اسم نمط واجهة المستخدم بالعربية' },
            styleNameEn: { type: Type.STRING, description: 'اسم نمط واجهة المستخدم بالإنجليزية' },
            overallVisualSummary: {
              type: Type.STRING,
              description: 'تحليل شامل لطريقة تصميم هذه الشاشة وتوزيع العناصر والتباين البصري فيها',
            },
            layoutStructureType: {
              type: Type.STRING,
              description: 'نوع تخطيط الشاشة مثل Bento Grid / Sticky Header + Scrollable Cards / Split Dashboard',
            },
            colorPalette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nameAr: { type: Type.STRING, description: 'اسم اللون ومكانه بالعربية' },
                  role: { type: Type.STRING, description: 'Background / Surface / Primary CTA / Accent / Border / Text' },
                  hex: { type: Type.STRING, description: 'كود اللون بصيغة #RRGGBB' },
                  usageNotes: { type: Type.STRING, description: 'أين وكيف يستخدم هذا اللون في الشاشة' },
                },
                required: ['nameAr', 'role', 'hex', 'usageNotes'],
              },
            },
            geometryAndBorders: {
              type: Type.OBJECT,
              properties: {
                borderRadiusScale: { type: Type.STRING, description: 'دقة انحناء الحواف للبطاقات والأزرار والمدخلات بالبيكسل' },
                borderWidthAndStyle: { type: Type.STRING, description: 'سمك الحواف ولونها وشفافيتها' },
                shadowAndElevation: { type: Type.STRING, description: 'تفاصيل الظلال والعمق البصري' },
                spacingAndPaddingGrid: { type: Type.STRING, description: 'المسافات الداخلية والخارجية بين العناصر' },
                surfaceContrastNotes: { type: Type.STRING, description: 'كيف تم الفصل بين الخلفية والبطاقات' },
              },
              required: [
                'borderRadiusScale',
                'borderWidthAndStyle',
                'shadowAndElevation',
                'spacingAndPaddingGrid',
                'surfaceContrastNotes',
              ],
            },
            typographyAnalysis: {
              type: Type.OBJECT,
              properties: {
                headingStyle: { type: Type.STRING },
                bodyStyle: { type: Type.STRING },
                numericAndDataStyle: { type: Type.STRING },
                recommendedArabicFonts: { type: Type.STRING },
              },
              required: ['headingStyle', 'bodyStyle', 'numericAndDataStyle', 'recommendedArabicFonts'],
            },
            detectedComponents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  componentName: { type: Type.STRING },
                  layoutPosition: { type: Type.STRING },
                  visualStylingDetails: { type: Type.STRING },
                  flutterWidgetEquivalent: { type: Type.STRING },
                  webTailwindEquivalent: { type: Type.STRING },
                },
                required: [
                  'componentName',
                  'layoutPosition',
                  'visualStylingDetails',
                  'flutterWidgetEquivalent',
                  'webTailwindEquivalent',
                ],
              },
            },
            generatedOutputs: {
              type: Type.OBJECT,
              properties: {
                uiStyleReplicationPrompt: {
                  type: Type.STRING,
                  description: 'برومبت شامل ومفصل لاستنساخ نفس نظام التصميم والألوان والحواف وشكل العرض في أي تطبيق',
                },
                mergedWithAppIdeaPrompt: {
                  type: Type.STRING,
                  description: 'برومبت متكامل يبني فكرة تطبيق المستخدم باستخدام نفس تصميم وألوان وحواف الصورة المرفوعة',
                },
                flutterThemeAndScreenCode: {
                  type: Type.STRING,
                  description: 'كود Flutter & Dart كامل جاهز للعمل (ThemeData + Screen Widget) يدعم العربية RTL و Null Safety بنفس ألوان وحواف الصورة',
                },
                tailwindAndReactCode: {
                  type: Type.STRING,
                  description: 'كود React + Tailwind CSS كامل يعيد بناء تصميم الشاشة المرفوعة بألوانها وحوافها الدقيقة',
                },
              },
              required: [
                'uiStyleReplicationPrompt',
                'mergedWithAppIdeaPrompt',
                'flutterThemeAndScreenCode',
                'tailwindAndReactCode',
              ],
            },
          },
          required: [
            'styleNameAr',
            'styleNameEn',
            'overallVisualSummary',
            'layoutStructureType',
            'colorPalette',
            'geometryAndBorders',
            'typographyAnalysis',
            'detectedComponents',
            'generatedOutputs',
          ],
        },
      },
    });

    const parsedVision = JSON.parse((response.text || '{}').trim());
    return res.json(parsedVision);
  } catch (error: any) {
    console.error('UI Image analysis error:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء قراءة وتحليل صورة واجهة المستخدم.',
    });
  }
});

// 3. Deep Architectural Analysis, Critique, UI Screen Models & Master Prompt Generator
app.post('/api/prompt/analyze', async (req, res) => {
  try {
    const {
      ideaText,
      scopeMode = 'auto',
      targetPlatform = 'all',
      outputLanguage = 'bilingual',
      webSearchContext = null,
      uiVisionContext = null,
    } = req.body;

    if (!ideaText || typeof ideaText !== 'string') {
      return res.status(400).json({ error: 'يرجى إدخال وصف فكرة التطبيق أو الميزة.' });
    }

    const ai = getGenAIClient();
    const platformLabel = PLATFORM_NAMES[targetPlatform] || PLATFORM_NAMES.all;

    const languageInstruction =
      outputLanguage === 'ar'
        ? 'اكتب جميع البرومبتات النهائية باللغة العربية الفصحى التقنية الواضحة مع المصطلحات البرمجية الأساسية.'
        : outputLanguage === 'en'
        ? 'Write the final generated prompts in precise, production-grade English so AI coding platforms execute them with 100% accuracy.'
        : 'اكتب البرومبتات النهائية بشكل ثنائي اللغة (Bilingual): مقدمة وهيكلة وشرح بالعربية + المواصفات التقنية الدقيقة والتعليمات البرمجية بالإنجليزية والعربية لضمان أعلى دقة في منصات البرمجة.';

    const systemInstruction = `أنت خبير هندسة البرمجيات (Senior Software Architect) وخبير Flutter & Dart وتطوير تطبيقات الويب والجوال، ومتخصص في هندسة البرومبتات البرمجية (Coding Prompt Engineering).
مهمتك هي فهم فكرة المستخدم من خلال شرحه النصي (وأي تصميم بصري مرفق)، والتفكير بشكل مكتمل 100% خالٍ من الثغرات، وتحليلها عبر 5 محاور أساسية:
1. تحديد النطاق بدقة: هل المستخدم يطلب بناء تطبيق متكامل من الصفر (full_app) أم يطلب إضافة ميزة واحدة أو أكثر لتطبيق موجود مسبقاً (feature)؟
2. النقد والاقتراح البنّاء: اكتشاف نقاط القوة، وكشف النواقص أو الحالات الحدية المفقودة (Edge Cases, Null Safety, Security, UX, Performance) وتقديم 4 إلى 6 مقترحات ذكية لتحسين فكرة المستخدم.
3. فهم واجهات المستخدم (UI/UX) ونماذج شاشات العرض: تصميم 3 إلى 5 شاشات رئيسية مفصلة مع تحديد مكونات كل شاشة وكيف تعمل كل واجهة ويتفاعل معها المستخدم وحالاتها (Loading, Empty, Error, Populated).
4. فهم طريقة صناعة الأكواد وطريقة عمل كل كود منها: تقسيم الكود البرمجي بشكل احترافي متوافق مع Null Safety ودعم العربية RTL إلى:
   - الموديلات (Models & Data Entities)
   - الخدمات والمنطق البرمجي (Services, Repositories & APIs)
   - الواجهات وإدارة الحالة (Views, Screens & State Management)
   مع تقديم مقتطفات كود Dart/Flutter أو TypeScript حقيقية جاهزة للعمل (Production-Ready) توضح كيف يعمل كل جزء.
5. توليد البرومبتات النهائية المتكاملة الجاهزة للنسخ واللصق في منصات صناعة الأكواد (${platformLabel}).`;

    const userPrompt = `فكرة المستخدم النصية:
"""
${ideaText}
"""

إعدادات المستخدم:
- النطاق المطلوب: ${scopeMode}
- المنصة المستهدفة: ${platformLabel} (${targetPlatform})
- لغة البرومبت المفضلة: ${languageInstruction}
${
  webSearchContext
    ? `\nنتائج البحث في الإنترنت وأنماط الشاشات المقترحة للاستفادة منها:\n${JSON.stringify(webSearchContext)}`
    : ''
}
${
  uiVisionContext
    ? `\nتفاصيل التصميم البصري والألوان والحواف المستخرجة من صورة شاشة العرض التي رفعها المستخدم (يجب تضمين هذه الألوان والحواف وشكل العرض في البرومبت النهائي):\n${JSON.stringify({
        styleNameAr: uiVisionContext.styleNameAr,
        colorPalette: uiVisionContext.colorPalette,
        geometryAndBorders: uiVisionContext.geometryAndBorders,
        typographyAnalysis: uiVisionContext.typographyAnalysis,
      })}`
    : ''
}

قم بتوليد التحليل الهندسي المتكامل والبرومبتات الشاملة وفق مخطط JSON المطلوب بدقة عالية ودون أي اختصار مخل.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectTitleAr: { type: Type.STRING, description: 'اسم مقترح احترافي للتطبيق أو الميزة بالعربية' },
            projectTitleEn: { type: Type.STRING, description: 'اسم مقترح احترافي للتطبيق أو الميزة بالإنجليزية' },
            executiveSummary: { type: Type.STRING, description: 'ملخص هندسي شامل للفكرة وكيف ستعمل بشكل متكامل' },
            detectedScope: {
              type: Type.STRING,
              description: 'إما full_app أو feature',
            },
            scopeReasoning: {
              type: Type.STRING,
              description: 'شرح لماذا تم تصنيف الطلب كتطبيق كامل أو كميزة لتطبيق موجود وكيف يجب التعامل معه برمجياً',
            },
            existingAppIntegrationNotes: {
              type: Type.STRING,
              description: 'إرشادات دمج الكود مع تطبيق موجود مسبقاً دون كسر الأكواد السابقة',
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'نقاط القوة في فكرة المستخدم (3-4 نقاط)',
            },
            critiquesAndSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'أحد القيم: architecture, ux, security, edge_case, performance',
                  },
                  title: { type: Type.STRING, description: 'عنوان النقد أو الاقتراح التحسيني' },
                  problemAnalysis: { type: Type.STRING, description: 'ما النقص أو التحدي المحتمل في الفكرة الحالية' },
                  proposedSolution: { type: Type.STRING, description: 'الحل البرمجي أو التصميمي المقترح إضافته للبرومبت' },
                  impact: { type: Type.STRING, description: 'high أو medium' },
                  selected: { type: Type.BOOLEAN, description: 'اجعلها true افتراضياً' },
                },
                required: ['id', 'category', 'title', 'problemAnalysis', 'proposedSolution', 'impact', 'selected'],
              },
            },
            screens: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  screenNameAr: { type: Type.STRING },
                  screenNameEn: { type: Type.STRING },
                  route: { type: Type.STRING },
                  deviceType: { type: Type.STRING, description: 'mobile أو desktop أو responsive' },
                  purpose: { type: Type.STRING, description: 'وظيفة الشاشة وطريقة عملها' },
                  userFlowStep: { type: Type.STRING, description: 'كيف ينتقل المستخدم من وإلى هذه الشاشة' },
                  stateHandling: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'حالات الشاشة: التحميل، البيانات الفارغة، التحقق من المدخلات، النجاح',
                  },
                  components: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        type: {
                          type: Type.STRING,
                          description: 'أحد القيم: header, hero, form, list, chart, card_grid, action_bar, navigation, modal',
                        },
                        description: { type: Type.STRING },
                        behavior: { type: Type.STRING, description: 'ماذا يحدث عند تفاعل المستخدم مع هذا المكون برمجياً' },
                        sampleData: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: '3 عناصر بيانات تجريبية واقعية لعرضها داخل معاينة الشاشة',
                        },
                      },
                      required: ['name', 'type', 'description', 'behavior', 'sampleData'],
                    },
                  },
                },
                required: ['id', 'screenNameAr', 'screenNameEn', 'route', 'deviceType', 'purpose', 'userFlowStep', 'stateHandling', 'components'],
              },
            },
            codeArchitecture: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING, description: 'شرح معماري لطريقة صناعة الأكواد وترابطها' },
                designPattern: { type: Type.STRING, description: 'النمط المعماري المتبع مثل Clean Architecture / MVVM / Modular' },
                stateManagement: { type: Type.STRING, description: 'آلية إدارة الحالة وتدفق البيانات' },
                nullSafetyAndEdgeCases: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'قواعد Null Safety ومعالجة الأخطاء والحالات الحدية',
                },
                rtlAndLocalizationRules: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'قواعد دعم اللغة العربية واتجاه RTL في الواجهات والخطوط',
                },
                models: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      filePath: { type: Type.STRING },
                      responsibility: { type: Type.STRING },
                      keyFieldsOrMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
                      howItWorks: { type: Type.STRING },
                      interactions: { type: Type.STRING },
                      dartCodeSnippet: {
                        type: Type.STRING,
                        description: 'كود Dart/Flutter أو TypeScript حقيقي كامل يدعم Null Safety و fromJson/toJson لهذا الموديل',
                      },
                    },
                    required: ['name', 'filePath', 'responsibility', 'keyFieldsOrMethods', 'howItWorks', 'interactions', 'dartCodeSnippet'],
                  },
                },
                services: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      filePath: { type: Type.STRING },
                      responsibility: { type: Type.STRING },
                      keyFieldsOrMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
                      howItWorks: { type: Type.STRING },
                      interactions: { type: Type.STRING },
                      dartCodeSnippet: {
                        type: Type.STRING,
                        description: 'كود خدمة (Service) حقيقي جاهز للعمل مع معالجة الأخطاء و Null Safety',
                      },
                    },
                    required: ['name', 'filePath', 'responsibility', 'keyFieldsOrMethods', 'howItWorks', 'interactions', 'dartCodeSnippet'],
                  },
                },
                views: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      filePath: { type: Type.STRING },
                      responsibility: { type: Type.STRING },
                      keyFieldsOrMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
                      howItWorks: { type: Type.STRING },
                      interactions: { type: Type.STRING },
                      dartCodeSnippet: {
                        type: Type.STRING,
                        description: 'كود واجهة (View/Widget) حقيقي يدعم Directionality RTL و Null Safety',
                      },
                    },
                    required: ['name', 'filePath', 'responsibility', 'keyFieldsOrMethods', 'howItWorks', 'interactions', 'dartCodeSnippet'],
                  },
                },
              },
              required: [
                'overview',
                'designPattern',
                'stateManagement',
                'nullSafetyAndEdgeCases',
                'rtlAndLocalizationRules',
                'models',
                'services',
                'views',
              ],
            },
            masterPrompts: {
              type: Type.OBJECT,
              properties: {
                universalMasterPrompt: {
                  type: Type.STRING,
                  description: 'البرومبت الشامل المتكامل (Master Prompt) الجاهز للنسخ لأي منصة ذكاء اصطناعي برمجية',
                },
                platformSpecificPrompt: {
                  type: Type.STRING,
                  description: 'برومبت مخصص ومهيأ خصيصاً للمنصة التي اختارها المستخدم',
                },
                flutterProductionPrompt: {
                  type: Type.STRING,
                  description: 'برومبت وكود معماري مخصص لبناء تطبيق أو ميزة Flutter & Dart جاهز للإنتاج يدعم العربية وRTL ومتوافق مع Null Safety ومقسم إلى Models و Services و Views',
                },
                cursorRulesAndSystemSpec: {
                  type: Type.STRING,
                  description: 'قواعد هندسية صارمة (.cursorrules / System Prompt) لضبط جودة الكود',
                },
                uiOnlyPrompt: {
                  type: Type.STRING,
                  description: 'برومبت مخصص فقط لصناعة شاشات واجهة المستخدم (UI/UX Screens & Visual Design System)',
                },
              },
              required: [
                'universalMasterPrompt',
                'platformSpecificPrompt',
                'flutterProductionPrompt',
                'cursorRulesAndSystemSpec',
                'uiOnlyPrompt',
              ],
            },
          },
          required: [
            'projectTitleAr',
            'projectTitleEn',
            'executiveSummary',
            'detectedScope',
            'scopeReasoning',
            'existingAppIntegrationNotes',
            'strengths',
            'critiquesAndSuggestions',
            'screens',
            'codeArchitecture',
            'masterPrompts',
          ],
        },
      },
    });

    const parsedBlueprint = JSON.parse((response.text || '{}').trim());
    if (webSearchContext) {
      parsedBlueprint.webSearch = webSearchContext;
    }
    if (uiVisionContext) {
      parsedBlueprint.uiVisionAnalysis = uiVisionContext;
    }

    return res.json(parsedBlueprint);
  } catch (error: any) {
    console.error('Analyze prompt error:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء تحليل الفكرة وتوليد البرومبت.',
    });
  }
});

// 4. Re-synthesize Master Prompt when user toggles critiques/suggestions, adds custom notes, or applies UI Vision style
app.post('/api/prompt/refine', async (req, res) => {
  try {
    const {
      ideaText,
      blueprint,
      selectedSuggestions,
      customUserNotes,
      targetPlatform,
      outputLanguage,
      uiVisionContext = null,
    } = req.body;

    const ai = getGenAIClient();
    const platformLabel = PLATFORM_NAMES[targetPlatform] || PLATFORM_NAMES.all;

    const languageInstruction =
      outputLanguage === 'ar'
        ? 'باللغة العربية الفصحى التقنية بالكامل.'
        : outputLanguage === 'en'
        ? 'In complete, precise technical English.'
        : 'ثنائي اللغة (شرح وتنظيم بالعربية + مصطلحات ومواصفات تقنية دقيقة بالإنجليزية).';

    const activeVision = uiVisionContext || blueprint?.uiVisionAnalysis;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `قم بتحديث وإعادة صياغة البرومبتات النهائية للمشروع التالي بحيث تدمج بدقة جميع المقترحات النقدية المعتمدة، ومواصفات التصميم البصري المستخرجة من الصورة (إن وجدت)، وملاحظات المستخدم، والمنصة المستهدفة:

- الفكرة الأصلية: "${ideaText}"
- اسم المشروع: ${blueprint?.projectTitleAr} (${blueprint?.projectTitleEn})
- النطاق: ${blueprint?.detectedScope === 'feature' ? 'ميزة إضافية لتطبيق موجود' : 'تطبيق متكامل من الصفر'}
- المنصة المستهدفة الآن: ${platformLabel} (${targetPlatform})
- لغة البرومبت المطلوبة: ${languageInstruction}
- المقترحات التحسينية التي اعتمدها المستخدم لدمجها إجبارياً في البرومبت:
${JSON.stringify(selectedSuggestions, null, 2)}
${
  activeVision
    ? `- مواصفات واجهة المستخدم والألوان والحواف المستخرجة من الصورة المرفوعة (يجب إلزام منصة البرمجة بتطبيق هذه الألوان والحواف وشكل العرض بدقة):
${JSON.stringify({
        styleName: activeVision.styleNameAr,
        colors: activeVision.colorPalette,
        geometryAndBorders: activeVision.geometryAndBorders,
        typography: activeVision.typographyAnalysis,
      })}`
    : ''
}
- ملاحظات إضافية من المستخدم: "${customUserNotes || 'لا يوجد'}"
- الشاشات المعتمدة: ${JSON.stringify(blueprint?.screens?.map((s: any) => ({ name: s.screenNameAr, purpose: s.purpose })))}
- هيكلة الأكواد (Models / Services / Views): ${JSON.stringify({
        models: blueprint?.codeArchitecture?.models?.map((m: any) => m.name),
        services: blueprint?.codeArchitecture?.services?.map((s: any) => s.name),
        views: blueprint?.codeArchitecture?.views?.map((v: any) => v.name),
      })}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            universalMasterPrompt: { type: Type.STRING },
            platformSpecificPrompt: { type: Type.STRING },
            flutterProductionPrompt: { type: Type.STRING },
            cursorRulesAndSystemSpec: { type: Type.STRING },
            uiOnlyPrompt: { type: Type.STRING },
          },
          required: [
            'universalMasterPrompt',
            'platformSpecificPrompt',
            'flutterProductionPrompt',
            'cursorRulesAndSystemSpec',
            'uiOnlyPrompt',
          ],
        },
      },
    });

    const updatedMasterPrompts = JSON.parse((response.text || '{}').trim());
    return res.json(updatedMasterPrompts);
  } catch (error: any) {
    console.error('Refine prompt error:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء تحديث البرومبت.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodePrompt Architect server running on http://localhost:${PORT}`);
  });
}

startServer();
