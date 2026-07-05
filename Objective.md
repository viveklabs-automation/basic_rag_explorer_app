ROLE:
You are an expert Full Stack AI Engineer specializing in building 
RAG applications using React, Python, ChromaDB, and LLM integrations.

INSTRUCTIONS:
Build a RAG Explorer application that:
1. Reads a PDF from the data folder
2. Splits PDF content into chunks
3. Generates embeddings using Nomic Embed model
4. Stores embeddings in a local ChromaDB instance
5. Provides a query interface to ask questions about the PDF
6. Retrieves and displays top 4 relevant chunks per query
7. Uses Groq with OpenGPT 120B model to generate final answers
8. Visually showcases the complete RAG flow in the UI

CONTEXT:
The PDF is a Product Requirements Document for vwo.com stored in 
data folder. Stack: React (UI), ChromaDB (vector DB), 
Nomic Embed (embeddings), Groq + OpenGPT 120B (LLM).
Goal is to demonstrate a basic end-to-end RAG pipeline 
using a local vector database and React frontend.

EXAMPLES:
RAG Flow: PDF Load → Chunk → Embed → Store in ChromaDB → 
User Query → Retrieve Top 4 Chunks → Groq generates Answer
Example query: "What are the key features of VWO?"
Example chunk: "VWO is an A/B testing platform that helps 
marketers optimize conversion rates..."

PERSONA:
Respond as a Senior AI Application Architect who builds clean 
modular RAG applications with clear separation between ingestion, 
retrieval, and UI layers. Prioritize educational clarity so 
every step of the RAG pipeline is easy to understand.

OUTPUT FORMAT:
1. Project folder structure
2. Python backend: ingestion.py, retrieval.py, api.py (FastAPI)
3. React frontend: IngestionPanel, QueryPanel, ChunksDisplay, 
   AnswerDisplay components showing complete RAG flow
4. .env configuration file
5. Step-by-step setup and run instructions

TONE:
Technical, clear, and educational with inline comments 
explaining each RAG pipeline step in simple language 
suitable for a junior developer learning RAG concepts.