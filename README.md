---
title: Basic RAG Explorer
emoji: 🔍
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# RAG Explorer Application

An interactive, visual **Retrieval-Augmented Generation (RAG)** explorer that lets you ingest PDF documents, analyze chunking breakdowns inside a local vector database, visualize dimensional grids, and query documents with real-time pipeline status trackers.

---

## Features

### 📄 Intelligent PDF Ingestion
- Extract pages, map metadata, and split contents using a precise page-by-page sliding window algorithm.
- Prevent chunk-splitting redundancy and character shifts, generating clean context segments.
- Save source, chunk index, and page number metadata directly into the database.

### 📊 Vector DB Preview Grid
- Interactive grid visualization of high-dimensional document vectors.
- Highlights rank, dimensions index, and similarity scores of retrieved context.
- Solid vanilla theme borders and high-contrast styling ensure maximum readability.

### ⚡ Live Pipeline Stage Tracker
- Visual stages card dashboard tracking RAG pipeline stage completions dynamically.
- Real-time indicator checkpoints tracking Nomic embeddings request, ChromaDB queries, and Groq LLM synthesis.
- Dynamic completion progress bar (33% -> 66% -> 100%).

### 🎨 Flat Vanilla Visual Theme
- Cozy Vanilla background (`#fcfaf6`) with crisp solid white cards (`#ffffff`).
- Removed animation-mesh glowing background blobs and blurred overlays to guarantee zero text distraction and elite contrast.
- Fully responsive layout suited for both desktop and mobile screens.

---

## Technology Stack

- **Backend**: Python 3.10+, FastAPI, ChromaDB (Persistent local SQLite), PyPDF.
- **APIs**: Nomic AI (`nomic-embed-text-v1.5` embeddings), Groq Cloud (`llama3-8b-8192` or similar model).
- **Frontend**: React 18, Vite, Vanilla CSS.

---

## Project Structure

```text
rag-explorer-application/
├── backend/
│   ├── api.py            # FastAPI main router and routes
│   ├── ingestion.py      # PDF parsing and Chroma vector database seeding
│   ├── retrieval.py      # Vector DB querying and LLM response generation
│   ├── db/               # Local persistent Chroma vector store folder
│   └── .env              # Backend configuration and API keys
├── frontend/
│   ├── src/
│   │   ├── components/   # React Dashboard elements (QueryPanel, IngestionPanel, etc.)
│   │   ├── App.jsx       # Main App controller
│   │   ├── index.css     # Theme CSS rules and variables
│   │   └── main.jsx      # Entry point
│   ├── package.json
│   └── vite.config.js
├── data/
│   └── Product Requirements Document (PRD) VWO.com.pdf # Document source
└── README.md
```

---

## Setup and Installation

### 1. Prerequisites
- **Python**: Version 3.10 or higher.
- **Node.js**: Version 18 or higher (along with npm).
- **API Keys**: Account credentials for Nomic AI and Groq Cloud.

### 2. Backend Configuration
Navigate to the `backend` folder, copy the environment template, and install requirements:

```bash
cd backend
# Create your configuration file
copy .env.example .env
```

Open `.env` and fill in your keys:
```env
GROQ_API_KEY=gsk_...
NOMIC_API_KEY=nk_...
CHROMA_DB_DIR=db
```

Install Python packages:
```bash
pip install -r requirements.txt
```

### 3. Frontend Configuration
Navigate to the `frontend` folder and install NPM packages:

```bash
cd ../frontend
npm install
```

---

## Running Locally

To run the application locally in development mode (with hot-reloading active):

### 1. Launch FastAPI Backend
From the repository root, launch the FastAPI server:

```bash
python backend/api.py
```
The backend server runs at `http://127.0.0.1:8000`.

### 2. Launch Vite Frontend Dev Server
In a separate terminal, start the Vite development server:

```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Unified Production Serving

To run the entire stack on a single server port (ideal for local testing and cloud deployments):

1. Compile the React frontend assets:
   ```bash
   cd frontend
   npm run build
   ```
   This generates a static build folder under `frontend/dist/`.

2. The FastAPI backend is configured to automatically detect and serve this compiled `dist/` directory at the root (`/`) route. 
3. Run the backend directly:
   ```bash
   python backend/api.py
   ```
4. Access the fully functional web application at: `http://localhost:8000`.
