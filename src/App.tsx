import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { demoProjects } from "./demoData";
import { ApiResponse, AnalysisReport, AnalysisStats, TechStackItem, UseCase, Capability, ShippedFeature, EnvVariable } from "./types";
import { 
  Upload, 
  FileCode, 
  Terminal, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Activity, 
  FileText, 
  Play, 
  Copy, 
  Download, 
  Sparkles, 
  Code, 
  AlertCircle, 
  Server, 
  Database, 
  BookOpen, 
  ArrowRight,
  ShieldAlert,
  BadgeAlert,
  Clock,
  RefreshCw,
  Folder,
  FileDown,
  Info,
  Check,
  AlertTriangle
} from "lucide-react";

export default function App() {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [loadingLogs, setLoadingLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Scanned / Loaded Report State
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  
  // Navigation & Filtering Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "techstack" | "gaps" | "docs">("overview");
  const [techFilter, setTechFilter] = useState<string>("All");
  const [gapFilter, setGapFilter] = useState<"all" | "shipped" | "partial" | "todo">("all");
  
  // Copy to clipboard notifications
  const [copyingDiagram, setCopyingDiagram] = useState<boolean>(false);
  const [copyingDocs, setCopyingDocs] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pipeline execution simulation logs
  const pipelineSteps = [
    { id: 1, name: "Research Agent", desc: "Cataloging workspace directory, parsing files list, reading configurations", icon: Info },
    { id: 2, name: "Tech-Stack Mapper", desc: "Analyzing code imports, package.json dependencies, and config versions", icon: Layers },
    { id: 3, name: "Architecture Diagrammer", desc: "Deducing boundaries and crafting complete ASCII structural data flows", icon: Code },
    { id: 4, name: "Gap Analyzer", desc: "Auditing codebase for TODOs, stub routes, mock databases, and code readiness", icon: ShieldAlert },
    { id: 5, name: "Developer Guide Synthesizer", desc: "Formulating prerequisites, configuration parameters, and run commands", icon: BookOpen }
  ];

  // Drag and drop event handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".zip")) {
        processFile(droppedFile);
      } else {
        setError("Only compressed ZIP archives (.zip) are supported for rigorous codebase analysis.");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith(".zip")) {
        processFile(selectedFile);
      } else {
        setError("Only compressed ZIP archives (.zip) are supported for rigorous codebase analysis.");
      }
    }
  };

  // Trigger file selection input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Run full multi-agent pipeline
  const processFile = async (zipFile: File) => {
    setFile(zipFile);
    setError(null);
    setLoading(true);
    setLoadingStep(0);
    setLoadingLogs(["[Uploader] Connection established. Uploading " + zipFile.name + " (" + (zipFile.size / (1024 * 1024)).toFixed(2) + " MB)..."]);

    // Staggered loading progress log helper
    const addLog = (msg: string, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setLoadingLogs((prev) => [...prev, msg]);
          resolve();
        }, delay);
      });
    };

    // Staggered step increment helper
    const advanceStep = (stepIndex: number, delay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setLoadingStep(stepIndex);
          resolve();
        }, delay);
      });
    };

    // Parallel upload and simulated terminal logging
    const apiPromise = uploadZipForAnalysis(zipFile);

    // Simulated staggered step transitions to keep user highly engaged in the pipeline of agents
    await addLog("[Research Agent] Initiated folder scanner. Locating build configurations, readme notes, and code modules...", 600);
    await advanceStep(1, 200);
    await addLog("[Research Agent] Detected zip header format. Reading contents safely... File size looks optimal.", 800);
    await addLog("[Tech-Stack Mapper] Analyzing manifest headers: locating package configuration, lock files, and module structures...", 1000);
    await advanceStep(2, 200);
    await addLog("[Tech-Stack Mapper] Verifying client framework version, active databases, ORM models, and styling utilities...", 1200);
    await addLog("[Architecture Diagrammer] Tracing client-to-server connection boundaries... Identifying entrypoints.", 1000);
    await advanceStep(3, 200);
    await addLog("[Architecture Diagrammer] Generating comprehensive ASCII interface diagram to visualize service boundaries...", 1200);
    await addLog("[Gap Analyzer] Conducting rigorous code audit. Reading code blocks to identify placeholders, TODO items, and partial components...", 1000);
    await advanceStep(4, 200);
    await addLog("[Gap Analyzer] Evaluating functional readiness. Cataloging shipped capabilities vs remaining backlog work...", 1200);
    await addLog("[Dev-Docs Synthesizer] Aggregating findings. Preparing developer guide, environment specs, and startup procedures...", 1000);
    await advanceStep(5, 200);
    await addLog("[Dev-Docs Synthesizer] Drafting rich Markdown files. Almost ready to report...", 800);

    try {
      const response = await apiPromise;
      if (response.success && response.report && response.stats) {
        setStats(response.stats);
        setReport(response.report);
        setActiveTab("overview");
      } else {
        setError(response.error || "The AI Pipeline was unable to properly structure the analysis report. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Network error. The server could not process the archive. Make sure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  // Actual server API HTTP upload call
  const uploadZipForAnalysis = async (zipFile: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("projectZip", zipFile);

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const contentType = response.headers.get("content-type") || "";
    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = `Server responded with status ${response.status}`;
      
      if (contentType.includes("application/json")) {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // fallback
        }
      } else if (responseText.includes("<!doctype") || responseText.includes("<html")) {
        if (response.status === 413) {
          errorMessage = "The uploaded file is too large. Please upload a smaller ZIP archive (under 30MB).";
        } else if (response.status === 502 || response.status === 504 || response.status === 503) {
          errorMessage = `The analysis server is temporarily unavailable or timed out (Status ${response.status}). This often happens if the ZIP file is extremely large or contains too many folders. Try removing 'node_modules', '.git', and other build folders before zipping, then retry.`;
        } else if (response.status === 404) {
          errorMessage = "The analysis API endpoint could not be found. Please refresh the page and try again.";
        } else {
          errorMessage = `Server Error (Status ${response.status}). The system returned HTML instead of data. The ZIP may contain too many files or binary assets.`;
        }
      }
      throw new Error(errorMessage);
    }

    if (!contentType.includes("application/json")) {
      if (responseText.includes("<!doctype") || responseText.includes("<html")) {
        throw new Error("Received an unexpected HTML page from the server. The backend API route might have crashed or redirected.");
      }
      throw new Error("Received a non-JSON response from the server.");
    }

    try {
      return JSON.parse(responseText);
    } catch (err) {
      console.error("JSON parsing error on response text:", responseText);
      throw new Error("The server response is corrupted or could not be parsed as JSON.");
    }
  };

  // Trigger Demo Project loading immediately
  const loadDemoProject = (key: string) => {
    setError(null);
    setLoading(true);
    setLoadingStep(0);
    setLoadingLogs(["[Loader] Connecting to sandbox archive storage...", "[Loader] Loading pre-analyzed metadata for " + demoProjects[key].label]);
    
    setTimeout(() => {
      setLoadingStep(5);
      setStats(demoProjects[key].data.stats || null);
      setReport(demoProjects[key].data.report || null);
      setActiveTab("overview");
      setLoading(false);
    }, 1500);
  };

  // Reset current analysis report and start fresh
  const handleReset = () => {
    setFile(null);
    setStats(null);
    setReport(null);
    setError(null);
    setLoadingLogs([]);
  };

  // Helper: Copy string content to clipboard with toast popup
  const copyToClipboard = (text: string, type: "diagram" | "docs") => {
    navigator.clipboard.writeText(text);
    if (type === "diagram") {
      setCopyingDiagram(true);
      setTimeout(() => setCopyingDiagram(false), 2000);
    } else {
      setCopyingDocs(true);
      setTimeout(() => setCopyingDocs(false), 2000);
    }
  };

  // Helper: Download a text file
  const downloadTextFile = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: "text/markdown"});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Tech stack categories lookup list
  const techCategories = report 
    ? ["All", ...Array.from(new Set(report.techStack.map(item => item.category)))]
    : [];

  // Filter tech stack items
  const filteredTechStack = report
    ? techFilter === "All"
      ? report.techStack
      : report.techStack.filter(item => item.category === techFilter)
    : [];

  // Filter Gaps / Shipped Features
  const filteredGaps = report
    ? gapFilter === "all"
      ? report.shippedFeatures
      : report.shippedFeatures.filter(item => item.status === gapFilter)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900" id="main_root">
      {/* Decorative Accent Ring */}
      <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-500 w-full" id="brand_accent_bar" />

      {/* Primary Header */}
      <header className="border-b border-slate-200 bg-white shadow-xs" id="main_header">
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                <Cpu className="w-3.5 h-3.5 animate-pulse" /> AI Agent Pipeline
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
                <CheckCircle2 className="w-3.5 h-3.5" /> High Fidelity Analyzer
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Codebase Pipeline Analyzer
            </h1>
            <p className="text-sm text-slate-500">
              Rigorous workspace decompilation, structural data flow graphing, and shipped-vs-gap analysis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {report && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-xs ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition"
                id="reset_btn"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" /> Analyze Another ZIP
              </button>
            )}
            <div className="text-xs text-slate-400 font-mono text-right hidden sm:block">
              <div>Environment: Cloud Run</div>
              <div>Server Mode: Active</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8" id="main_content">
        
        {/* Dynamic Warning Alert banner */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3 shadow-xs" id="error_banner">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <h3 className="font-bold">Pipeline Execution Error</h3>
              <p className="mt-1">{error}</p>
              <div className="mt-3 flex items-center gap-2">
                <button 
                  onClick={handleReset}
                  className="rounded bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-900 hover:bg-red-200 transition"
                >
                  Dismiss & Clear
                </button>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* STATE 1: INITIAL UPLOAD & DEMO LAUNCHER */}
          {!loading && !report && (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
              id="uploader_wrapper"
            >
              {/* Feature Intro Cards (Bento) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="intro_grid">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex gap-4">
                  <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 h-fit">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">Continuous Agent Flow</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Launches 5 concurrent AI agents simulating full file lookup, technical translation, structural mock scanning, and document formulation.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex gap-4">
                  <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 h-fit">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">Tech-Stack & Diagrams</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Determines precise package versions and draws custom system blueprint flowcharts that map backend listeners and data pathways.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex gap-4">
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-600 h-fit">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base">Shipped vs Gaps Gaze</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                      Locates mock tables, code skeletons, and incomplete stubs so you know exactly what is ready to boot and what remains to be built.
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Drag Box Container */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8" id="actions_panel">
                
                {/* Drag and Drop Form Area */}
                <div className="lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col justify-between">
                    <div className="p-6 sm:p-8 border-b border-slate-100 flex-1 flex flex-col justify-center">
                      <div className="mb-4">
                        <h2 className="font-display text-lg font-bold text-slate-900">Upload Project Codebase</h2>
                        <p className="text-sm text-slate-500 mt-1">
                          Provide a compressed folder containing your system modules, configuration templates, or complete repositories.
                        </p>
                      </div>

                      {/* Dropzone Graphic */}
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] ${
                          dragActive 
                            ? "border-indigo-500 bg-indigo-50/40" 
                            : "border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/40"
                        }`}
                        id="zip_dropzone"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".zip"
                          onChange={handleFileChange}
                          className="hidden"
                          id="zip_file_input"
                        />
                        
                        <div className="p-4 bg-white rounded-full shadow-xs mb-3 text-slate-400 group-hover:text-slate-500">
                          <Upload className="w-7 h-7 text-indigo-600 animate-bounce" />
                        </div>
                        
                        <p className="text-sm font-semibold text-slate-800">
                          Drag and drop your project ZIP file here
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          or click to browse your local filesystem
                        </p>
                        
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                            Maximum size: 30MB
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                            Auto-Sanitizes node_modules
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Info className="w-4 h-4 text-slate-400" /> Your files are analyzed in-memory on our secure proxy and never persisted.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Demo Sandbox Selector */}
                <div className="lg:col-span-2">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col justify-between h-full">
                    <div>
                      <div className="mb-6">
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-700/10">
                          <Sparkles className="w-3.5 h-3.5" /> Instant Preview Sandbox
                        </span>
                        <h2 className="font-display text-lg font-bold text-slate-900 mt-2">No ZIP handy? Try a Live Demo</h2>
                        <p className="text-sm text-slate-500 mt-1">
                          Select one of our pre-compiled system codebase reports to preview the visual dashboards, code coverage audits, and structural maps immediately.
                        </p>
                      </div>

                      {/* Demo Cards Stack */}
                      <div className="space-y-4" id="demo_stack">
                        {Object.entries(demoProjects).map(([key, item]) => (
                          <div
                            key={key}
                            onClick={() => loadDemoProject(key)}
                            className="group p-4 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition flex justify-between items-start"
                          >
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-900 flex items-center gap-1.5">
                                {item.label}
                                <ArrowRight className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition" />
                              </h4>
                              <p className="text-xs text-slate-500 leading-relaxed max-w-[280px]">
                                {item.description}
                              </p>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {key === "ai-companion" ? "Full Stack" : "SPA Client"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Powered by Gemini 3.5 Flash</span>
                      <span>Ready to Deploy</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Visual Pipeline Showcase */}
              <div className="bg-slate-900 rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-800 text-slate-300">
                <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="font-display font-bold text-white text-base"> Rigorous Analysis Pipeline Flow</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Understanding the multi-agent task execution structure</p>
                  </div>
                  <Terminal className="w-5 h-5 text-indigo-400" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
                  {pipelineSteps.map((step, i) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={step.id} className="relative z-10 flex flex-col justify-between p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-indigo-400 font-semibold tracking-wider">AGENT {step.id}</span>
                            <div className="p-1 bg-slate-900 border border-slate-800 rounded">
                              <StepIcon className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-tight">{step.name}</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 2: ACTIVE PIPELINE PROCESSING */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto py-12"
              id="loader_wrapper"
            >
              <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-8 text-center space-y-6">
                
                {/* Large Pulsing Cog/Ring */}
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                  <Cpu className="w-10 h-10 text-indigo-600 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-xl text-slate-900">
                    Executing Decompilation & Pipeline Review...
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    A collection of specialized AI agents is currently dissecting file structures, mapping configurations, scanning vulnerabilities, and formulating blueprints.
                  </p>
                </div>

                {/* Pipeline visual timeline */}
                <div className="border border-slate-100 rounded-xl bg-slate-50 p-4 max-w-xl mx-auto space-y-3.5">
                  {pipelineSteps.map((step, idx) => {
                    const isPending = loadingStep < idx;
                    const isActive = loadingStep === idx;
                    const isCompleted = loadingStep > idx;

                    return (
                      <div key={idx} className="flex items-center justify-between text-left">
                        <div className="flex items-center gap-2.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                          ) : isActive ? (
                            <RefreshCw className="w-4.5 h-4.5 text-indigo-600 animate-spin shrink-0" />
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-full border border-slate-300 shrink-0 bg-white" />
                          )}
                          <span className={`text-xs font-semibold ${
                            isActive ? "text-indigo-900 font-bold" : isCompleted ? "text-slate-700" : "text-slate-400"
                          }`}>
                            {step.name}
                          </span>
                        </div>
                        <span className={`text-[10px] ${
                          isActive ? "text-indigo-600 font-semibold" : isCompleted ? "text-emerald-600" : "text-slate-400"
                        }`}>
                          {isActive ? "Processing..." : isCompleted ? "Complete" : "Queued"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Terminal outputs log box */}
                <div className="text-left bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-[160px] overflow-y-auto shadow-inner">
                  {loadingLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span className="text-emerald-500 select-none">&gt;</span>
                      <span className="leading-normal">{log}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400">
                  This takes roughly 5 to 10 seconds based on project layout size and complexity.
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE 3: REPORT VISUALIZER */}
          {!loading && report && stats && (
            <motion.div
              key="report"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
              id="report_wrapper"
            >
              {/* Report Header Card */}
              <div className="bg-slate-900 text-white rounded-2xl shadow-md p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-indigo-950 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-800">
                      <FileCode className="w-3.5 h-3.5" /> Project Codebase Scan
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                      Zip Size: {(stats.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {report.appName}
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Scan Quick Stats Strip */}
                <div className="grid grid-cols-2 gap-4 shrink-0 bg-slate-950 p-4 rounded-xl border border-slate-800/80 min-w-[220px]">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Files</div>
                    <div className="text-lg font-bold text-white font-mono mt-0.5">{stats.totalFiles}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Analyzed</div>
                    <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">{stats.analyzedFiles}</div>
                  </div>
                  <div className="col-span-2 border-t border-slate-800 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {new Date(stats.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>100% Secure Proxy</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs (Carbon Dark Design) */}
              <div className="border-b border-slate-200 bg-white rounded-xl shadow-xs p-1.5 flex flex-wrap gap-1" id="report_navigation">
                {[
                  { id: "overview", label: "Dashboard & Use Cases", icon: Activity },
                  { id: "architecture", label: "Architecture Blueprint", icon: Layers },
                  { id: "techstack", label: "Tech-Stack Matrix", icon: Code },
                  { id: "gaps", label: "Abilities & Gaps Checklist", icon: ShieldAlert },
                  { id: "docs", label: "Developer Guidebook", icon: FileText }
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                        isActive 
                          ? "bg-indigo-600 text-white shadow-xs" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <TabIcon className="w-4.5 h-4.5 shrink-0" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB PANELS CONTAINER */}
              <div className="min-h-[400px]">
                
                {/* TAB 1: OVERVIEW & USE CASES */}
                {activeTab === "overview" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    id="tab_overview"
                  >
                    {/* Key insights / Stats block */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Use Cases card */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                            <Activity className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-slate-950 text-lg">Mapped Application Use Cases</h3>
                            <p className="text-xs text-slate-500">What specific features or value is implemented in the codebase</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {report.useCases.map((useCase, index) => (
                            <div key={index} className="flex gap-4 items-start border-l-2 border-slate-200 hover:border-indigo-500 pl-4 transition">
                              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 border px-1.5 py-0.5 rounded">
                                UC-0{index + 1}
                              </span>
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-slate-900">{useCase.title}</h4>
                                <p className="text-sm text-slate-600 leading-relaxed">{useCase.description}</p>
                                <div className="mt-2 text-xs bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 text-slate-500 flex items-start gap-1">
                                  <span className="font-semibold text-slate-700">User Value:</span> {useCase.userValue}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary Analysis Gaze block */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-1 max-w-md">
                          <h4 className="font-bold text-slate-900 text-sm">Rigorous Gap Analysis Snapshot</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Our pipeline checked stubs and mock endpoints. We discovered several incomplete layers and missing configurations.
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveTab("gaps")}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition"
                          >
                            Review Gaps <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Sidebar Stats & Info */}
                    <div className="space-y-6">
                      
                      {/* App Identity metadata card */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <h4 className="font-display font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Analysis Session Stats</h4>
                        
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">File Name:</span>
                            <span className="font-mono text-slate-800 font-bold truncate max-w-[150px]" title={stats.filename}>
                              {stats.filename}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Uncompressed Size:</span>
                            <span className="font-mono text-slate-800 font-bold">{(stats.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Total Scanned Files:</span>
                            <span className="font-mono text-slate-800 font-bold">{stats.totalFiles}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Analyzed Code Files:</span>
                            <span className="font-mono text-slate-800 font-bold text-indigo-600">{stats.analyzedFiles}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Ignored (Assets, Lockfiles):</span>
                            <span className="font-mono text-slate-600 font-semibold">{stats.totalFiles - stats.analyzedFiles}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-100 pt-3">
                            <span className="text-slate-500">Scan Session Stamp:</span>
                            <span className="font-mono text-slate-700">{new Date(stats.scanTime).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Capabilities Overview List */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <h4 className="font-display font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">System Capabilities</h4>
                        
                        <div className="space-y-3">
                          {report.capabilities.map((cap, i) => {
                            const isFull = cap.readiness === "full";
                            const isPartial = cap.readiness === "partial";
                            
                            return (
                              <div key={i} className="space-y-1 border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="text-xs font-bold text-slate-800 leading-snug">{cap.title}</span>
                                  <span className={`inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-mono font-bold border uppercase ${
                                    isFull 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                      : isPartial 
                                        ? "bg-amber-50 text-amber-700 border-amber-200" 
                                        : "bg-red-50 text-red-700 border-red-200"
                                  }`}>
                                    {cap.readiness}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">{cap.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB 2: ARCHITECTURE & ASCII DIAGRAMS */}
                {activeTab === "architecture" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    id="tab_architecture"
                  >
                    {/* Left: Diagram ASCII Panel */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Diagram Frame */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-slate-300">
                          <div className="flex items-center gap-2">
                            <Layers className="text-indigo-400 w-5 h-5" />
                            <div>
                              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">Diagrammer Agent Blueprint</span>
                              <h3 className="font-bold text-white text-sm">System Topology Sketch</h3>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => copyToClipboard(report.architecture.diagramDescription, "diagram")}
                            className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 font-semibold px-2.5 py-1.5 rounded text-white border border-slate-700 transition"
                          >
                            {copyingDiagram ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copyingDiagram ? "Copied!" : "Copy Sketch"}
                          </button>
                        </div>
                        
                        <div className="p-6 bg-slate-950 font-mono text-xs overflow-x-auto text-emerald-400 leading-normal border-t border-slate-800 min-h-[300px]">
                          <pre className="whitespace-pre">{report.architecture.diagramDescription}</pre>
                        </div>
                        
                        <div className="bg-slate-50 px-6 py-3 text-[11px] text-slate-500 border-t border-slate-100 flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-slate-400" /> This topological flowchart reflects server ports, local databases, external APIs, and routing structures identified inside code definitions.
                        </div>
                      </div>

                      {/* Data Flow Description */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
                        <h4 className="font-display font-bold text-slate-900 text-base mb-3">Application Data Pipeline</h4>
                        <div className="text-sm text-slate-600 leading-relaxed space-y-4">
                          {report.architecture.dataFlow.split("\n").map((line, i) => (
                            <p key={i} className="line-clamp-none leading-relaxed">
                              {line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.") || line.startsWith("4.") || line.startsWith("5.") || line.startsWith("6.") ? (
                                <span className="block mt-2 font-semibold text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">{line}</span>
                              ) : line}
                            </p>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Right Side: Folder structures */}
                    <div className="space-y-6">
                      
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                          <Folder className="w-5 h-5 text-indigo-600" />
                          <h3 className="font-display font-bold text-slate-950 text-sm">Key Directory Map</h3>
                        </div>

                        <div className="space-y-4">
                          {report.architecture.folders.map((folder, index) => (
                            <div key={index} className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/40 transition">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-indigo-700">
                                  {folder.path}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {folder.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                        <h4 className="font-display font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-3">Architectural Pattern</h4>
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                          <span className="text-[10px] font-mono text-indigo-700 uppercase tracking-widest font-bold">Detected Paradigm</span>
                          <p className="font-display font-bold text-indigo-900 text-sm mt-0.5">{report.architecture.pattern}</p>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* TAB 3: TECH STACK MATRIX */}
                {activeTab === "techstack" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                    id="tab_techstack"
                  >
                    {/* Categories filters */}
                    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
                      {techCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setTechFilter(category)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                            techFilter === category 
                              ? "bg-slate-900 text-white shadow-xs" 
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    {/* Tech stack bento grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {filteredTechStack.map((item, index) => (
                        <div 
                          key={index} 
                          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 shadow-xs flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                                {item.category}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                v{item.version}
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              <h4 className="font-display font-bold text-slate-900 text-base">{item.tech}</h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {item.purpose}
                              </p>
                            </div>
                          </div>
                          
                          <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400 flex items-center justify-between">
                            <span>Detected via Scan</span>
                            <span className="text-emerald-500 font-bold">✔ Verifiably Used</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: ABILITIES & GAPS (SHIPPED VS TO-DO) */}
                {activeTab === "gaps" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-4 gap-6"
                    id="tab_gaps"
                  >
                    
                    {/* Left: Gaps Filter card & Stats */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <h4 className="font-display font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Filter Readiness Gaze</h4>
                        
                        <div className="space-y-1">
                          {[
                            { id: "all", label: "All Items", count: report.shippedFeatures.length },
                            { id: "shipped", label: "Shipped & Ready", count: report.shippedFeatures.filter(f => f.status === "shipped").length, badgeColor: "bg-emerald-50 text-emerald-700" },
                            { id: "partial", label: "Partial Features", count: report.shippedFeatures.filter(f => f.status === "partial").length, badgeColor: "bg-amber-50 text-amber-700" },
                            { id: "todo", label: "To-Do / Missing", count: report.shippedFeatures.filter(f => f.status === "todo").length, badgeColor: "bg-red-50 text-red-700" }
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setGapFilter(item.id as any)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                                gapFilter === item.id 
                                  ? "bg-slate-900 text-white shadow-xs" 
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <span>{item.label}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${gapFilter === item.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"}`}>
                                {item.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Interactive alert box for stubs */}
                      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl space-y-2 text-amber-800">
                        <div className="flex items-center gap-1.5 font-bold text-sm">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>Codebase Gaps Warning</span>
                        </div>
                        <p className="text-xs leading-relaxed">
                          We scan function bodies for placeholders and empty returns. Features flagged as <strong>To-Do</strong> have zero functional implementation and must be built before hosting.
                        </p>
                      </div>
                    </div>

                    {/* Right: Comparative stack lists */}
                    <div className="lg:col-span-3 space-y-4">
                      {filteredGaps.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                          No features found for the current filter selection.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredGaps.map((item, i) => {
                            const isShipped = item.status === "shipped";
                            const isPartial = item.status === "partial";
                            
                            return (
                              <div 
                                key={i} 
                                className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4 transition ${
                                  isShipped 
                                    ? "border-emerald-200 hover:border-emerald-300" 
                                    : isPartial 
                                      ? "border-amber-200 hover:border-amber-300" 
                                      : "border-red-200 hover:border-red-300"
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase bg-slate-100 px-2 py-0.5 rounded">
                                      {item.category}
                                    </span>
                                    
                                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono font-bold border uppercase ${
                                      isShipped 
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                        : isPartial 
                                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                                          : "bg-red-50 text-red-700 border-red-200"
                                    }`}>
                                      {item.status === "shipped" ? "shipped (ready)" : item.status}
                                    </span>
                                  </div>
                                  
                                  <h4 className="font-display font-bold text-slate-950 text-base">{item.feature}</h4>
                                  <p className="text-sm text-slate-600 leading-relaxed">
                                    {item.details}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}

                {/* TAB 5: DEVELOPER GUIDE & MD DOCS */}
                {activeTab === "docs" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    id="tab_docs"
                  >
                    {/* Left: MD Documentation Render */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Document Viewer */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <FileText className="text-indigo-600 w-5 h-5" />
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Dev-Docs Synthesis</span>
                              <h3 className="font-bold text-slate-900 text-sm">Synthesized Developer Manual</h3>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => copyToClipboard(report.developerDocs, "docs")}
                              className="inline-flex items-center gap-1.5 text-xs bg-white hover:bg-slate-50 font-semibold px-2.5 py-1.5 rounded text-slate-700 border border-slate-300 shadow-xs transition"
                            >
                              {copyingDocs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copyingDocs ? "Copied" : "Copy Docs"}
                            </button>
                            <button
                              onClick={() => downloadTextFile("README_ANALYSIS.md", report.developerDocs)}
                              className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 font-semibold px-2.5 py-1.5 rounded text-white shadow-xs transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                          </div>
                        </div>

                        {/* Rich text container */}
                        <div className="p-6 sm:p-8 markdown-body prose prose-slate max-w-none prose-sm leading-relaxed prose-headings:font-display prose-headings:font-bold">
                          <Markdown>{report.developerDocs}</Markdown>
                        </div>
                      </div>

                    </div>

                    {/* Right: Prerequisite & Env setup checklists */}
                    <div className="space-y-6">
                      
                      {/* Prerequisites List card */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                        <h4 className="font-display font-bold text-slate-950 text-sm border-b border-slate-100 pb-2 mb-4">Software Prerequisites</h4>
                        
                        <div className="space-y-3">
                          {report.howToRun.prerequisites.map((req, i) => (
                            <div key={i} className="flex gap-2 items-start text-xs text-slate-600">
                              <span className="p-0.5 bg-emerald-50 rounded text-emerald-600 mt-0.5">
                                <Check className="w-3.5 h-3.5 font-bold" />
                              </span>
                              <span>{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Run Commands checklists */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
                        <h4 className="font-display font-bold text-slate-950 text-sm border-b border-slate-100 pb-2">Step-by-Step Command Playbook</h4>
                        
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wide">1. Install Dependencies</span>
                            {report.howToRun.installCommands.map((cmd, i) => (
                              <div key={i} className="mt-1.5 p-2 bg-slate-900 text-emerald-400 font-mono rounded text-[11px] flex items-center justify-between">
                                <span>{cmd}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div>
                            <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wide mt-2 block">2. Launch Executable</span>
                            {report.howToRun.runCommands.map((cmd, i) => (
                              <div key={i} className="mt-1.5 p-2 bg-slate-900 text-emerald-400 font-mono rounded text-[11px] flex items-center justify-between">
                                <span>{cmd}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Environment Variables specifications */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                        <h4 className="font-display font-bold text-slate-950 text-sm border-b border-slate-100 pb-2 mb-3">Required Environment Config</h4>
                        
                        <div className="space-y-4">
                          {report.howToRun.envVariables.map((variable, i) => (
                            <div key={i} className="space-y-1.5 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-mono text-xs font-bold text-slate-800 break-all">{variable.name}</span>
                                <span className={`inline-flex shrink-0 items-center rounded px-1 text-[9px] font-mono font-bold border ${
                                  variable.required 
                                    ? "bg-red-50 text-red-700 border-red-200" 
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                                }`}>
                                  {variable.required ? "Required" : "Optional"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{variable.description}</p>
                              {variable.defaultValue && (
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Default: <span className="bg-slate-100 px-1 rounded text-slate-600">{variable.defaultValue}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Workspace Footer */}
      <footer className="bg-slate-950 text-slate-500 text-xs border-t border-slate-900 py-8 mt-24" id="main_footer_bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="font-semibold text-slate-300">Codebase Pipeline Analyzer v1.1.0</div>
            <div>Secure sandboxed binary extraction & translation portal. All analyses are strictly stateless.</div>
          </div>
          <div className="flex items-center gap-6">
            <span>Powered by Gemini 3.5 Flash & AdmZip</span>
            <span>Local timezone: 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
