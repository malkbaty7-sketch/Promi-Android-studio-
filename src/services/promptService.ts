import {
  AnalysisBlueprint,
  OutputLanguage,
  ScopeMode,
  TargetPlatform,
  WebSearchInspiration,
  CritiqueSuggestion,
  UIVisionAnalysis,
} from '../types/prompt';

export async function runWebSearchInspiration(params: {
  ideaText: string;
  targetPlatform: TargetPlatform;
  scopeMode: ScopeMode;
}): Promise<WebSearchInspiration> {
  const response = await fetch('/api/prompt/web-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'تعذر إتمام البحث في الإنترنت.');
  }
  return data as WebSearchInspiration;
}

export async function analyzeUIScreenshot(params: {
  imageBase64: string;
  mimeType: string;
  ideaText?: string;
  customImageInstructions?: string;
  targetPlatform: TargetPlatform;
  outputLanguage: OutputLanguage;
}): Promise<UIVisionAnalysis> {
  const response = await fetch('/api/prompt/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'تعذر قراءة وتحليل صورة واجهة المستخدم.');
  }
  return data as UIVisionAnalysis;
}

export async function analyzeIdeaAndGenerateBlueprint(params: {
  ideaText: string;
  scopeMode: ScopeMode;
  targetPlatform: TargetPlatform;
  outputLanguage: OutputLanguage;
  webSearchContext?: WebSearchInspiration | null;
  uiVisionContext?: UIVisionAnalysis | null;
}): Promise<AnalysisBlueprint> {
  const response = await fetch('/api/prompt/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'تعذر تحليل الفكرة وتوليد البرومبت.');
  }
  return data as AnalysisBlueprint;
}

export async function refineMasterPrompts(params: {
  ideaText: string;
  blueprint: AnalysisBlueprint;
  selectedSuggestions: CritiqueSuggestion[];
  customUserNotes: string;
  targetPlatform: TargetPlatform;
  outputLanguage: OutputLanguage;
  uiVisionContext?: UIVisionAnalysis | null;
}): Promise<AnalysisBlueprint['masterPrompts']> {
  const response = await fetch('/api/prompt/refine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'تعذر تحديث البرومبت النهائي.');
  }
  return data as AnalysisBlueprint['masterPrompts'];
}
