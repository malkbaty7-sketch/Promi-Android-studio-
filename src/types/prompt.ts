export type ScopeMode = 'auto' | 'full_app' | 'feature';

export type TargetPlatform =
  | 'all'
  | 'aistudio'
  | 'bolt'
  | 'lovable'
  | 'cursor'
  | 'v0'
  | 'flutter'
  | 'flutterflow';

export type OutputLanguage = 'bilingual' | 'ar' | 'en';

export interface CritiqueSuggestion {
  id: string;
  category: 'architecture' | 'ux' | 'security' | 'edge_case' | 'performance';
  title: string;
  problemAnalysis: string;
  proposedSolution: string;
  impact: 'high' | 'medium';
  selected: boolean;
}

export interface ScreenComponentSpec {
  name: string;
  type: 'header' | 'hero' | 'form' | 'list' | 'chart' | 'card_grid' | 'action_bar' | 'navigation' | 'modal';
  description: string;
  behavior: string;
  sampleData: string[];
}

export interface ScreenModelSpec {
  id: string;
  screenNameAr: string;
  screenNameEn: string;
  route: string;
  deviceType: 'mobile' | 'desktop' | 'responsive';
  purpose: string;
  userFlowStep: string;
  stateHandling: string[];
  components: ScreenComponentSpec[];
}

export interface CodeModuleItem {
  name: string;
  filePath: string;
  responsibility: string;
  keyFieldsOrMethods: string[];
  howItWorks: string;
  interactions: string;
  dartCodeSnippet?: string;
}

export interface CodeArchitectureSpec {
  overview: string;
  designPattern: string;
  stateManagement: string;
  nullSafetyAndEdgeCases: string[];
  rtlAndLocalizationRules: string[];
  models: CodeModuleItem[];
  services: CodeModuleItem[];
  views: CodeModuleItem[];
}

export interface WebReferenceItem {
  title: string;
  uri: string;
  snippet?: string;
  category: 'ui_inspiration' | 'library' | 'architecture';
}

export interface WebSearchInspiration {
  summaryAr: string;
  recommendedPatterns: string[];
  uiScreenInspirations: {
    screenTitle: string;
    referenceAppExamples: string;
    layoutBestPractice: string;
    keyUXElements: string[];
  }[];
  recommendedPackages: {
    name: string;
    purpose: string;
  }[];
  sources: WebReferenceItem[];
}

export interface ExtractedColorToken {
  nameAr: string;
  role: string;
  hex: string;
  usageNotes: string;
}

export interface UIVisionComponentBreakdown {
  componentName: string;
  layoutPosition: string;
  visualStylingDetails: string;
  flutterWidgetEquivalent: string;
  webTailwindEquivalent: string;
}

export interface UIVisionAnalysis {
  styleNameAr: string;
  styleNameEn: string;
  overallVisualSummary: string;
  layoutStructureType: string;
  colorPalette: ExtractedColorToken[];
  geometryAndBorders: {
    borderRadiusScale: string;
    borderWidthAndStyle: string;
    shadowAndElevation: string;
    spacingAndPaddingGrid: string;
    surfaceContrastNotes: string;
  };
  typographyAnalysis: {
    headingStyle: string;
    bodyStyle: string;
    numericAndDataStyle: string;
    recommendedArabicFonts: string;
  };
  detectedComponents: UIVisionComponentBreakdown[];
  generatedOutputs: {
    uiStyleReplicationPrompt: string;
    mergedWithAppIdeaPrompt: string;
    flutterThemeAndScreenCode: string;
    tailwindAndReactCode: string;
  };
}

export interface AnalysisBlueprint {
  projectTitleAr: string;
  projectTitleEn: string;
  executiveSummary: string;
  detectedScope: 'full_app' | 'feature';
  scopeReasoning: string;
  existingAppIntegrationNotes?: string;
  strengths: string[];
  critiquesAndSuggestions: CritiqueSuggestion[];
  screens: ScreenModelSpec[];
  codeArchitecture: CodeArchitectureSpec;
  webSearch?: WebSearchInspiration;
  uiVisionAnalysis?: UIVisionAnalysis;
  masterPrompts: {
    universalMasterPrompt: string;
    platformSpecificPrompt: string;
    flutterProductionPrompt: string;
    cursorRulesAndSystemSpec: string;
    uiOnlyPrompt: string;
  };
}

export interface SavedPromptProject {
  id: string;
  createdAt: string;
  ideaText: string;
  scopeMode: ScopeMode;
  targetPlatform: TargetPlatform;
  outputLanguage: OutputLanguage;
  enableWebSearch: boolean;
  blueprint: AnalysisBlueprint;
}
