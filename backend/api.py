import os
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import chromadb
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
# Import our modular pipelines
from ingestion import run_ingestion_pipeline
from retrieval import run_retrieval_pipeline

# Load environment variables from .env
load_dotenv()

app = FastAPI(
    title="RAG Explorer Backend",
    description="FastAPI backend for document ingestion, retrieval, and LLM answer generation."
)

# Enable CORS for React frontend (standard Vite port is 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_DIR = os.getenv("CHROMA_DB_DIR", "db")

class QueryRequest(BaseModel):
    query: str

def get_pdf_path():
    """
    Finds the PRD PDF path inside data folder.
    Supports running from either the repository root or the backend folder.
    """
    pdf_name = "Product Requirements Document (PRD) VWO.com.pdf"
    paths_to_try = [
        os.path.join("..", "data", pdf_name),
        os.path.join("data", pdf_name),
        pdf_name
    ]
    for path in paths_to_try:
        if os.path.exists(path):
            return path
    return None

@app.get("/api/status")
async def get_status():
    """
    Returns the vector database status, including the number of ingested chunks.
    """
    pdf_path = get_pdf_path()
    pdf_exists = pdf_path is not None
    pdf_name = os.path.basename(pdf_path) if pdf_exists else "Product Requirements Document (PRD) VWO.com.pdf (Not Found)"
    
    # Check ChromaDB
    try:
        client = chromadb.PersistentClient(path=DB_DIR)
        collection = client.get_collection(name="rag_collection")
        count = collection.count()
        initialized = count > 0
    except Exception:
        initialized = False
        count = 0
        
    return {
        "status": "online",
        "initialized": initialized,
        "chunk_count": count,
        "pdf_found": pdf_exists,
        "pdf_name": pdf_name,
        "has_groq_key": bool(os.getenv("GROQ_API_KEY")),
        "has_nomic_key": bool(os.getenv("NOMIC_API_KEY")),
    }

@app.post("/api/ingest")
async def ingest_document(
    x_nomic_api_key: str = Header(None, alias="X-Nomic-Api-Key")
):
    """
    Triggers the RAG ingestion pipeline for the PRD PDF.
    Can receive the Nomic API key from headers to override .env.
    """
    pdf_path = get_pdf_path()
    if not pdf_path:
        raise HTTPException(
            status_code=404, 
            detail="Product Requirements Document (PRD) VWO.com.pdf not found in data/ directory."
        )
        
    nomic_key = x_nomic_api_key or os.getenv("NOMIC_API_KEY")
    if not nomic_key:
        raise HTTPException(
            status_code=400,
            detail="Nomic API Key is missing. Set it in .env or UI Settings."
        )
        
    try:
        result = run_ingestion_pipeline(pdf_path, nomic_key=nomic_key, db_dir=DB_DIR)
        return {
            "success": True,
            "message": f"Successfully ingested {result['pdf_name']}",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query")
async def query_document(
    request: QueryRequest,
    x_nomic_api_key: str = Header(None, alias="X-Nomic-Api-Key"),
    x_groq_api_key: str = Header(None, alias="X-Groq-Api-Key")
):
    """
    Triggers the retrieval & generation pipeline for the user query.
    Can receive Nomic & Groq API keys from headers to override .env.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    nomic_key = x_nomic_api_key or os.getenv("NOMIC_API_KEY")
    groq_key = x_groq_api_key or os.getenv("GROQ_API_KEY")
    
    if not nomic_key:
        raise HTTPException(
            status_code=400,
            detail="Nomic API Key is missing. Set it in .env or UI Settings."
        )
    if not groq_key:
        raise HTTPException(
            status_code=400,
            detail="Groq API Key is missing. Set it in .env or UI Settings."
        )
        
    try:
        result = run_retrieval_pipeline(
            request.query, 
            nomic_key=nomic_key, 
            groq_key=groq_key, 
            db_dir=DB_DIR
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve the React build if present
if os.path.isdir("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="static")

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint – returns a simple HTML page when static files are not built.
    If the React build exists, the static mount will serve `index.html` automatically.
    """
    index_path = "frontend/dist/index.html"
    if os.path.isfile(index_path):
        return FileResponse(index_path, media_type="text/html")
    return HTMLResponse(content="<h1>RAG Explorer API is running</h1><p>Frontend not built – run <code>npm run build</code> or start the Vite dev server.</p>")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("api:app", host=host, port=port, reload=True)
