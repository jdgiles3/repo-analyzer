import express from "express";
import path from "path";
import multer from "multer";
import AdmZip from "adm-zip";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON and URL-encoded body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB file size limit
});

interface ExtractedProject {
  allFiles: { path: string; size: number }[];
  keyFileContents: Record<string, string>;
  totalFilesCount: number;
  filteredFilesCount: number;
}

function extractProjectFromZip(buffer: Buffer): ExtractedProject {
  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();
  const allFiles: { path: string; size: number }[] = [];
  const keyFileContents: Record<string, string> = {};
  
  let totalFilesCount = 0;
  let filteredFilesCount = 0;
  let filesContentReadCount = 0;

  // Directories we want to exclude
  const ignoredDirs = [
    "node_modules/", 
    ".git/", 
    ".github/", 
    "dist/", 
    "build/", 
    ".next/", 
    "out/", 
    "target/", 
    "venv/", 
    "env/", 
    ".venv/", 
    "__pycache__/",
    ".parcel-cache/",
    ".cache/"
  ];
  
  const ignoredFiles = [
    "package-lock.json", 
    "yarn.lock", 
    "pnpm-lock.yaml", 
    "pnpm-workspace.yaml", 
    ".DS_Store", 
    "Thumbs.db"
  ];
  
  const ignoredExtensions = [
    ".png", ".jpg", ".jpeg", ".gif", ".zip", ".pdf", ".mp4", ".mp3", ".ico", ".woff", ".woff2", 
    ".ttf", ".eot", ".xlsx", ".docx", ".csv", ".sqlite", ".db", ".exe", ".dll", ".so", ".dylib", 
    ".tar.gz", ".tar", ".gz", ".map"
  ];

  for (const entry of zipEntries) {
    if (entry.isDirectory) continue;
    
    totalFilesCount++;
    const pathName = entry.entryName;
    const isIgnoredDir = ignoredDirs.some((dir) => pathName.includes(dir));
    const isIgnoredFile = ignoredFiles.includes(entry.name) || entry.name.startsWith(".");
    const isIgnoredExt = ignoredExtensions.some((ext) => pathName.toLowerCase().endsWith(ext));

    if (isIgnoredDir || isIgnoredFile || isIgnoredExt) {
      continue;
    }

    filteredFilesCount++;
    const size = entry.header.size;
    allFiles.push({ path: pathName, size });

    // Collect text contents for file analysis
    // We prioritize config files and smaller code files
    const lowerName = entry.name.toLowerCase();
    const isConfig = [
      "package.json", "tsconfig.json", "vite.config.ts", "requirements.txt", 
      "pom.xml", "build.gradle", ".env.example", "readme.md", "gemini.md", "agents.md"
    ].includes(lowerName);

    const isCode = [
      ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs", ".cs", ".php", ".css", ".html", ".sh"
    ].some((ext) => pathName.toLowerCase().endsWith(ext));

    // Limit each file content to ~12KB to avoid exceeding token/payload budgets
    // Only read up to 35 key text files to avoid memory bloat and API timeout issues
    if ((isConfig || (isCode && size < 40000)) && filesContentReadCount < 35) {
      try {
        const text = entry.getData().toString("utf8");
        // Simple binary/text sanity check: make sure it doesn't contain null bytes
        if (!text.includes("\0")) {
          keyFileContents[pathName] = text.length > 12000 
            ? text.slice(0, 12000) + "\n... [TRUNCATED DUE TO SIZE] ..." 
            : text;
          filesContentReadCount++;
        }
      } catch (err) {
        console.error(`Error reading text contents of ${pathName}:`, err);
      }
    }
  }

  return {
    allFiles,
    keyFileContents,
    totalFilesCount,
    filteredFilesCount,
  };
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ZIP Codebase Analysis API
app.post("/api/analyze", upload.single("projectZip"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No zip file uploaded" });
    }

    console.log(`Received file upload: ${req.file.originalname} (${req.file.size} bytes)`);

    // 1. Extract zip contents
    const extraction = extractProjectFromZip(req.file.buffer);

    console.log(`Extracted metadata: total entries: ${extraction.totalFilesCount}, analyzing ${extraction.filteredFilesCount} key code files`);

    if (extraction.filteredFilesCount === 0) {
      return res.status(400).json({
        error: "No readable code or configuration files found in the ZIP archive.",
      });
    }

    // Prepare files summary for the prompt
    const filesSummaryList = extraction.allFiles
      .map((f) => `- ${f.path} (${(f.size / 1024).toFixed(1)} KB)`)
      .slice(0, 100)
      .join("\n");
    
    const filesCountRemaining = Math.max(0, extraction.allFiles.length - 100);
    const filesSummary = filesSummaryList + (filesCountRemaining > 0 ? `\n... and ${filesCountRemaining} more files` : "");

    // Prepare key file contents payload
    let keyContentsPayload = "";
    let contentSizeCount = 0;
    
    // Add file contents but limit total payload size to prevent Gemini token limit or memory overload
    for (const [filePath, content] of Object.entries(extraction.keyFileContents)) {
      const formatBlock = `\n--- FILE: ${filePath} ---\n\`\`\`\n${content}\n\`\`\`\n`;
      if (contentSizeCount + formatBlock.length < 150000) { // Limit prompt code injection to 150KB
        keyContentsPayload += formatBlock;
        contentSizeCount += formatBlock.length;
      } else {
        keyContentsPayload += `\n--- FILE: ${filePath} (metadata only, contents skipped to respect prompt budget) ---\n`;
      }
    }

    // Build the agent pipeline instruction prompt
    const prompt = `
You are an expert full-stack developer and solution architect leading a pipeline of specialized AI analysis agents.
Your task is to conduct a rigorous, high-fidelity codebase analysis of the uploaded project ZIP.

Execute the following pipeline steps internally:
1. [Research Agent]: Read all file names, paths, sizes, and documentation. Build a complete understanding of directory organization and key configuration files.
2. [Tech-Stack Mapping Agent]: Parse package manifests, package.json, requirements, or code imports to identify all major and minor technologies, utilities, styling layers, database tools, and APIs.
3. [Architecture Diagram Agent]: Deduce the structural design pattern (e.g., Express + React Full-Stack, Client-Only SPA, Python serverless, Maven multi-module) and sketch a clear ASCII-art flowchart or map representing modules, client-server data flow, and directories.
4. [Gap Analysis Agent]: Scan the code contents for placeholder text, stub functions, TODO comments, empty directories, unimplemented routes, and mock databases. Identify which features are "Ready to Run (shipped)" vs. "Still needs work".
5. [Developer Guide Agent]: Formulate clear run commands, prerequisite software, environment variables, setup instructions, and future improvements.

Here is the scanned workspace file list:
${filesSummary}

Here are the text contents of the most important files (config, readme, core code modules):
${keyContentsPayload}

Generate a comprehensive, accurate analysis report adhering exactly to the JSON schema. Be highly specific, cite code lines or file paths where appropriate, and do not make up features that are not visible in the code.
`;

    // Define JSON schema for the response
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        appName: { type: Type.STRING },
        description: { type: Type.STRING },
        techStack: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "e.g., Frontend, Backend, Database, Styling, Build Tool" },
              tech: { type: Type.STRING, description: "e.g., React, Express, PostgreSQL, Tailwind" },
              version: { type: Type.STRING, description: "Detected version or 'unknown'" },
              purpose: { type: Type.STRING, description: "What this library is used for in the app" }
            },
            required: ["category", "tech", "purpose"]
          }
        },
        useCases: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              userValue: { type: Type.STRING, description: "Why this matters for the end user" }
            },
            required: ["title", "description", "userValue"]
          }
        },
        capabilities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              readiness: { type: Type.STRING, description: "Must be: 'full', 'partial', or 'missing'" }
            },
            required: ["title", "description", "readiness"]
          }
        },
        howToRun: {
          type: Type.OBJECT,
          properties: {
            prerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
            installCommands: { type: Type.ARRAY, items: { type: Type.STRING } },
            runCommands: { type: Type.ARRAY, items: { type: Type.STRING } },
            envVariables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  required: { type: Type.BOOLEAN },
                  defaultValue: { type: Type.STRING }
                },
                required: ["name", "description", "required"]
              }
            },
            notes: { type: Type.STRING }
          },
          required: ["prerequisites", "installCommands", "runCommands", "envVariables"]
        },
        architecture: {
          type: Type.OBJECT,
          properties: {
            pattern: { type: Type.STRING, description: "e.g., MVC, Full-Stack SPA + Express, Client-only SPA, Python API" },
            folders: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  path: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["path", "description"]
              }
            },
            dataFlow: { type: Type.STRING, description: "How data flows through the application layers" },
            diagramDescription: { type: Type.STRING, description: "An ASCII-art layout or structured diagram illustrating layers" }
          },
          required: ["pattern", "folders", "dataFlow", "diagramDescription"]
        },
        shippedFeatures: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              feature: { type: Type.STRING },
              category: { type: Type.STRING, description: "e.g., UI, Database, Auth, API, Utility" },
              status: { type: Type.STRING, description: "Must be: 'shipped', 'partial', or 'todo'" },
              details: { type: Type.STRING, description: "Why it has this status and what code supports or is missing from it" }
            },
            required: ["feature", "category", "status", "details"]
          }
        },
        developerDocs: { type: Type.STRING, description: "A detailed Markdown document capturing Developer documentation, tips, API details, and roadmap." }
      },
      required: [
        "appName", "description", "techStack", "useCases", "capabilities", 
        "howToRun", "architecture", "shippedFeatures", "developerDocs"
      ]
    };

    // Call Gemini 3.5 Flash server-side
    console.log("Calling Gemini API for analysis...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // lower temperature for highly analytical facts
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const reportData = JSON.parse(resultText.trim());
    
    // Add some metadata about the scanning session itself
    const analysisStats = {
      filename: req.file.originalname,
      fileSize: req.file.size,
      totalFiles: extraction.totalFilesCount,
      analyzedFiles: extraction.filteredFilesCount,
      scanTime: new Date().toISOString(),
    };

    res.json({
      success: true,
      stats: analysisStats,
      report: reportData,
    });

  } catch (error: any) {
    console.error("Error in /api/analyze:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred during codebase analysis.",
    });
  }
});

// Custom global error handler to prevent HTML error responses from Express
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Express Error Handler Caught:", err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: "The uploaded file is too large. The maximum allowed size is 30MB."
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "An unexpected internal server error occurred."
  });
});

// Vite Middleware & Production routing
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
