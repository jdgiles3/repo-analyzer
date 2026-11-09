export interface TechStackItem {
  category: string;
  tech: string;
  version: string;
  purpose: string;
}

export interface UseCase {
  title: string;
  description: string;
  userValue: string;
}

export interface Capability {
  title: string;
  description: string;
  readiness: "full" | "partial" | "missing" | string;
}

export interface EnvVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface HowToRun {
  prerequisites: string[];
  installCommands: string[];
  runCommands: string[];
  envVariables: EnvVariable[];
  notes?: string;
}

export interface FolderDescription {
  path: string;
  description: string;
}

export interface Architecture {
  pattern: string;
  folders: FolderDescription[];
  dataFlow: string;
  diagramDescription: string;
}

export interface ShippedFeature {
  feature: string;
  category: string;
  status: "shipped" | "partial" | "todo" | string;
  details: string;
}

export interface AnalysisReport {
  appName: string;
  description: string;
  techStack: TechStackItem[];
  useCases: UseCase[];
  capabilities: Capability[];
  howToRun: HowToRun;
  architecture: Architecture;
  shippedFeatures: ShippedFeature[];
  developerDocs: string;
}

export interface AnalysisStats {
  filename: string;
  fileSize: number;
  totalFiles: number;
  analyzedFiles: number;
  scanTime: string;
}

export interface ApiResponse {
  success: boolean;
  stats?: AnalysisStats;
  report?: AnalysisReport;
  error?: string;
}
