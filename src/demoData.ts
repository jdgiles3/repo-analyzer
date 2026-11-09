import { ApiResponse } from "./types";

export const demoProjects: Record<string, { label: string; description: string; data: ApiResponse }> = {
  "ai-companion": {
    label: "OmniAI Companion (Full-Stack)",
    description: "Full-Stack Next.js & Express API with SQLite, user session logs, and Gemini LLM chat history.",
    data: {
      success: true,
      stats: {
        filename: "omniai-companion-v2.1.zip",
        fileSize: 4124500, // ~4 MB
        totalFiles: 42,
        analyzedFiles: 18,
        scanTime: new Date().toISOString()
      },
      report: {
        appName: "OmniAI Companion",
        description: "A full-stack, personalized AI helper application that supports conversational memory, structured note-taking, local knowledge base search, and customizable assistant personas.",
        techStack: [
          { category: "Frontend", tech: "React", version: "18.3.1", purpose: "Core component architecture for responsive chat screens and notes management." },
          { category: "Frontend", tech: "Next.js", version: "14.2.3", purpose: "Client-side routing, static pages generation, and layout orchestration." },
          { category: "Backend", tech: "Express.js", version: "4.19.2", purpose: "API server proxying LLM requests, administering notes databases, and hosting workspace profiles." },
          { category: "Database", tech: "SQLite", version: "3.45.0", purpose: "Local serverless database storing markdown notes, user configuration details, and history loops." },
          { category: "ORM", tech: "Prisma", version: "5.14.0", purpose: "Type-safe database mapping, migrations controller, and unified database clients." },
          { category: "Styling", tech: "Tailwind CSS", version: "3.4.1", purpose: "Modern visual utility layouts with custom color states and slate-gray palettes." },
          { category: "AI / SDK", tech: "@google/genai", version: "2.1.0", purpose: "Accessing Gemini models for smart summaries, translation hooks, and contextual search." },
          { category: "Build Tool", tech: "Vite", version: "5.2.11", purpose: "Fast development bundler and asset compiler." }
        ],
        useCases: [
          {
            title: "Dynamic Persona Conversationalist",
            description: "Interact with highly customized AI personas (e.g., Code Debugger, Copywriter, Language Tutor) who adapt their vocabulary and formatting rules.",
            userValue: "Boosts day-to-day productivity by tailoring responses specifically to specialized tasks without re-entering instructions."
          },
          {
            title: "Context-Aware Research Summarizer",
            description: "Upload code fragments, rich text files, or URLs to create atomic knowledge collections and get instant visual flowcharts.",
            userValue: "Enables instant comprehension of deep technical structures, reducing onboarding friction for developers."
          },
          {
            title: "Markdown Workspace & Scratchpad",
            description: "A dual-pane markdown editor allowing users to draft notes collaboratively alongside their AI assistant.",
            userValue: "Seamlessly converts conversations into structured documentation and keeps knowledge consolidated in one place."
          }
        ],
        capabilities: [
          { title: "Multi-Persona Dialog engine", description: "System level instruction mapping in chat sessions to adjust behavior.", readiness: "full" },
          { title: "Local SQLite Storage Sync", description: "Saves messages, notes, and profile details persistently on the server filesystem.", readiness: "full" },
          { title: "RAG Knowledge Scanning", description: "Search and read contextual documents from static text files using naive TF-IDF vector embeddings.", readiness: "partial" },
          { title: "Google Cloud Spanner Support", description: "Optional cloud database sync for large-scale enterprise deployments.", readiness: "missing" }
        ],
        howToRun: {
          prerequisites: [
            "Node.js >= 18.0.0",
            "NPM >= 9.0.0",
            "SQLite 3 library (pre-installed on most operating systems)"
          ],
          installCommands: [
            "npm install",
            "npx prisma db push"
          ],
          runCommands: [
            "npm run dev (boots Express backend + Vite client)",
            "npm run build (bundles frontend static files and server entry)"
          ],
          envVariables: [
            { name: "GEMINI_API_KEY", description: "Required for interacting with Gemini models. Obtain from Google AI Studio.", required: true },
            { name: "PORT", description: "The port number on which the API and frontend gateway runs.", required: false, defaultValue: "3000" },
            { name: "DATABASE_URL", description: "Prisma connector string. Points to file-based sqlite store.", required: true, defaultValue: "file:./dev.db" },
            { name: "JWT_SECRET", description: "Symmetric key used to sign and verify cookie session tokens.", required: true }
          ],
          notes: "Ensure the node process has write permission in the root folder so prisma can create and update 'dev.db' successfully."
        },
        architecture: {
          pattern: "Full-Stack Express + Next.js (Proxied)",
          folders: [
            { path: "/server.js", description: "Main API entry point, registers Express middleware, starts the HTTP listener, and proxies AI requests." },
            { path: "/prisma/schema.prisma", description: "Relational database model definitions for Users, Notes, ChatSessions, and Messages." },
            { path: "/src/pages", description: "Next.js routing structures for UI dashboard, active chat screens, and settings panel." },
            { path: "/src/components", description: "Reusable interactive React parts: ChatBubble, PersonaSelector, MarkdownEditor, and Sidebar." },
            { path: "/src/lib/gemini.ts", description: "Utility module encapsulating the @google/genai initialization and prompt building routines." }
          ],
          dataFlow: "1. The user inputs text or attaches a code clip in the Next.js Frontend UI.\n2. React makes an HTTP POST request to /api/chat with the session state.\n3. The Express server validates the JWT session, loads previous chat history from SQLite via Prisma, and appends the new message.\n4. Server crafts a cohesive system instruction prompt and sends it to the Gemini API using @google/genai.\n5. Gemini streams or returns the structured reply.\n6. Express records the assistant's reply in the DB and returns the response payload back to the React UI.",
          diagramDescription: `
+--------------------------------------------------------------+
|                        BROWSER CLIENT                        |
|                                                              |
|   +-----------------------+      +-----------------------+   |
|   |   React Chat Panel    | ---> | Markdown Notes Editor |   |
|   +-----------------------+      +-----------------------+   |
+-----------------------|--------------------------------------+
                        | (HTTP / JSON / JWT)
                        v
+--------------------------------------------------------------+
|                     EXPRESS GATEWAY SERVER                   |
|                                                              |
|   +-----------------------+      +-----------------------+   |
|   |  JWT Authentication   | ---> |  API Router / Proxy   |   |
|   +-----------------------+      +-----------------------+   |
+-----------------------|----------------------|---------------+
                        |                      |
                        v (ORM Queries)        v (RPC / Secure HTTPS)
+-------------------------------+   +--------------------------+
|      SQLITE LOCAL DB          |   |        GOOGLE GEMINI     |
| (Notes, Personas, History)    |   |     (gemini-2.5-flash)   |
+-------------------------------+   +--------------------------+
`
        },
        shippedFeatures: [
          { feature: "Responsive Multi-Persona Chat Screen", category: "UI", status: "shipped", details: "Implemented in /src/components/ChatPanel.tsx. Features dynamic bubble sizing, typing indicator animation, and custom avatar rendering." },
          { feature: "Local Markdown Note Editor", category: "UI", status: "shipped", details: "Uses standard react-textarea with side-by-side split screen preview. Configured inside /src/pages/notes.tsx." },
          { feature: "Persistent Session Archiving", category: "Database", status: "shipped", details: "Express routes in /server.js save and query histories from database using Prisma findUnique query chains." },
          { feature: "AI Model Config Panel", category: "UI", status: "partial", details: "Settings layout exists but changing temperature or maxOutputTokens values does not connect to the backend API requests yet." },
          { feature: "TF-IDF Local File Embedding RAG", category: "API", status: "partial", details: "Basic script written in /src/lib/rag.ts. However, it only indexes .txt files, lacks file watch triggers, and runs entirely in-memory." },
          { feature: "Google Calendar Workspace sync", category: "API", status: "todo", details: "Draft schema models show GoogleCalendarToken, but no OAuth controllers, scopes, or cron syncing scripts have been written." }
        ],
        developerDocs: `# OmniAI Companion - Developer Guide & Roadmap

Welcome to the **OmniAI Companion** development guide! This project is designed to bridge local text databases and advanced generative memory using Express and Google Gemini.

## Architectural Notes
The project is built on an **offline-first local backend** philosophy:
- We prioritize low-latency client state. Note changes are auto-saved to local memory first and then synced in the background.
- LLM interactions are always gated server-side inside \`/server.js\` to safeguard the Gemini API Key from extraction.

## API Endpoints List

### Authentication
- \`POST /api/auth/login\` - Verify password hash, issue JWT cookie.
- \`POST /api/auth/logout\` - Clear user cookie tokens.

### Notes Management
- \`GET /api/notes\` - Fetch all Markdown notes.
- \`POST /api/notes\` - Create a new note.
- \`PUT /api/notes/:id\` - Save note edits.

### AI Engine
- \`POST /api/chat\` - Send conversation message, trigger Gemini model, record response loop.

## Roadmap & Gaps
1. **Optimize RAG Search Engine (Current Priority)**: Move from naive tf-idf search to an actual vector database like Drizzle pgvector or Pinecone.
2. **Add Custom System Prompt Profiles**: Allow users to save their own instructions so they don't have to rewrite them.
3. **Connect Google Calendar (Upcoming)**: Add Google OAuth consent screens to fetch today's tasks and auto-summarize key goals.
`
      }
    }
  },
  "taskmaster": {
    label: "TaskMaster Pro (Client-Only SPA)",
    description: "Interactive task organizer with Kanban board, local storage, custom filters, and statistical analytics.",
    data: {
      success: true,
      stats: {
        filename: "taskmaster-pro-master.zip",
        fileSize: 1890200, // ~1.8 MB
        totalFiles: 28,
        analyzedFiles: 11,
        scanTime: new Date().toISOString()
      },
      report: {
        appName: "TaskMaster Pro",
        description: "A client-side task manager offering drag-and-drop Kanban workflow mapping, detailed habit tracking calendars, local statistics charts, and custom label systems.",
        techStack: [
          { category: "Frontend", tech: "React", version: "18.2.0", purpose: "Build modular interfaces, reactive board state, and custom hooks." },
          { category: "State", tech: "Zustand", version: "4.5.2", purpose: "Manage core task lists, status transitions, filter criteria, and history loops client-side." },
          { category: "Drag-Drop", tech: "@hello-pangea/dnd", version: "16.5.0", purpose: "Enable buttery smooth drag and drop Kanban columns and cards." },
          { category: "Charts", tech: "Recharts", version: "2.12.7", purpose: "Render elegant weekly completion ratios, burn-down lists, and categorizations." },
          { category: "Styling", tech: "Tailwind CSS", version: "3.4.3", purpose: "Quick modern styling with responsive panels, gradients, and custom themes." },
          { category: "Icons", tech: "Lucide React", version: "0.378.0", purpose: "Beautiful SVG action symbols for priority markers, calendar dates, and trash bins." }
        ],
        useCases: [
          {
            title: "Agile Kanban Workflow Planning",
            description: "Categorize individual ideas into 'Backlog', 'In Progress', and 'Completed' boards with custom tags.",
            userValue: "Improves clarity and focus of task status, mimicking enterprise work environments for personal projects."
          },
          {
            title: "Weekly Habit Consistency Tracker",
            description: "Log daily micro-habits and watch visual grids fill up like Github contribution graphs.",
            userValue: "Boosts positive psychological reinforcement and habit adherence through beautiful grid feedback."
          },
          {
            title: "Velocity & Productivity Analytics",
            description: "A dashboard displaying task completion trends, average lead times, and workload distribution by tags.",
            userValue: "Helps users identify time sinks and analyze work velocity to plan upcoming sprints intelligently."
          }
        ],
        capabilities: [
          { title: "Kanban Drag and Drop columns", description: "Smooth drag-and-drop state updates that persist immediately.", readiness: "full" },
          { title: "Habit Tracker Matrix", description: "Visual heatmap displaying daily activity consistency of up to 5 habits.", readiness: "full" },
          { title: "Local Storage Persistence Backup", description: "Saves entire database state to localStorage on every change.", readiness: "full" },
          { title: "Server-side Shared Boards", description: "Sync tasks in real-time with other remote developers.", readiness: "missing" }
        ],
        howToRun: {
          prerequisites: [
            "Node.js >= 16.0.0",
            "NPM >= 8.0.0"
          ],
          installCommands: [
            "npm install"
          ],
          runCommands: [
            "npm run dev (launches Vite dev server on local port)",
            "npm run build (bundles production-ready HTML/JS/CSS assets)"
          ],
          envVariables: [
            { name: "VITE_ANALYTICS_ID", description: "Optional token to report interface metrics to dashboard.", required: false }
          ],
          notes: "This is a 100% client-side application. No custom server or database is required. Simply build and deploy the 'dist' folder to Netlify, Vercel, or GitHub Pages."
        },
        architecture: {
          pattern: "Client-Side Single Page Application (SPA)",
          folders: [
            { path: "/src/store/useTaskStore.ts", description: "Zustand store containing task, category, board states, local storage serialization, and event functions." },
            { path: "/src/components/KanbanBoard.tsx", description: "Interactive boards featuring columns, tasks, and drag handler wrappers." },
            { path: "/src/components/AnalyticsPanel.tsx", description: "Analytics layout utilizing Recharts to draw lines, circles, and bars of task counts." },
            { path: "/src/hooks/useLocalStorage.ts", description: "Custom hook to synchronizes form data or modal states locally." }
          ],
          dataFlow: "1. The user creates, drags, or deletes tasks in the React View component.\n2. State changes are received and computed instantly by the Zustand global store.\n3. Zustand updates React components triggering animations.\n4. A middleware subscriber detects state changes and serializes the complete object to the user's browser LocalStorage under the 'taskmaster_db' key.",
          diagramDescription: `
+-------------------------------------------------------------+
|                        BROWSER BROWSER                      |
|                                                              |
|   +-------------------+      +--------------------------+    |
|   |   React UI Views  | ---> |   Zustand Store Manager  |    |
|   |  (Kanban / Charts)| <--- | (Single Source of Truth) |    |
|   +-------------------+      +------------|-------------+    |
|                                           |                  |
+-------------------------------------------|------------------+
                                            v (Auto-Serialize)
                               +--------------------------+
                               |    BROWSER LOCALSTORAGE  |
                               |    ('taskmaster_db' key) |
                               +--------------------------+
`
        },
        shippedFeatures: [
          { feature: "Full Drag & Drop Kanban Columns", category: "UI", status: "shipped", details: "Powered by @hello-pangea/dnd. Smooth animations, drop triggers, and card rearrangement verified in board.tsx." },
          { feature: "Interactive Recharts Statistics Dashboard", category: "UI", status: "shipped", details: "Line graphs and Category Pie charts successfully render dynamic completed tasks inside /src/components/AnalyticsPanel.tsx." },
          { feature: "Offline LocalStorage Backups", category: "Utility", status: "shipped", details: "State subscription defined in Zustand store manages backup hooks flawlessly." },
          { feature: "Habit Grid Heatmap", category: "UI", status: "partial", details: "The visual grid works and logs dates correctly, but users cannot edit logs for previous months or change individual habit priorities once created." },
          { feature: "Export to CSV/JSON", category: "Utility", status: "partial", details: "JSON export works perfectly. However, the CSV export lacks support for custom labels containing commas, which causes misaligned columns." },
          { feature: "Team Collaboration WebSockets Link", category: "API", status: "todo", details: "The 'Share Board' button exists in settings but displays a 'Coming Soon' placeholder. No web socket listeners are set up." }
        ],
        developerDocs: `# TaskMaster Pro - Developer Documentation

Welcome! TaskMaster Pro is engineered as a lightweight, lightning-fast static task planner. It operates entirely inside client state.

## Zustand State Strategy
All events follow a **unidirectional model**:
1. Components emit action signals: \`createTask(task)\`, \`moveTask(id, targetColumn)\`, etc.
2. The Zustand store mutates its in-memory draft and triggers React virtual DOM recalculation.
3. Store middleware intercepts the updated snapshot and flushes it to local storage.

## Future Roadmap & Tasks
- **Implement Server-Side Collaborative Rooms**: Create a lightweight Node/Socket.io backend to allow shared boards with secure keys.
- **Support Nested Sub-Tasks**: Add a nested hierarchy layer to cards to support breaking down multi-stage deliverables.
`
      }
    }
  }
};
