# 📚 RAG Explorer

A simple end-to-end Retrieval-Augmented Generation (RAG) application built to demonstrate how documents can be ingested, indexed, retrieved, and queried using modern AI technologies.

## 🚀 Objective

Build a RAG application that:

- Reads a PDF from the `data/` folder
- Splits the document into chunks
- Generates embeddings using **Nomic Embed**
- Stores embeddings in **ChromaDB**
- Retrieves the **Top 4** relevant chunks for a user query
- Uses **Groq (OpenGPT 120B)** to generate contextual answers
- Visualizes the complete RAG pipeline through a React UI

## 🏗️ Tech Stack

- **Frontend:** React
- **Backend:** Python (FastAPI)
- **Vector Database:** ChromaDB
- **Embedding Model:** Nomic Embed
- **LLM:** Groq (OpenGPT 120B)

## 🔄 RAG Workflow

```
PDF
  ↓
Load Document
  ↓
Split into Chunks
  ↓
Generate Embeddings
  ↓
Store in ChromaDB
  ↓
User Query
  ↓
Retrieve Top 4 Relevant Chunks
  ↓
Groq (OpenGPT 120B)
  ↓
AI Generated Answer
```

## 📁 Project Structure

```
backend/
 ├── ingestion.py
 ├── retrieval.py
 ├── api.py

frontend/
 ├── IngestionPanel
 ├── QueryPanel
 ├── ChunksDisplay
 └── AnswerDisplay

data/
 └── Product Requirements Document.pdf

.env
README.md
```

## ⚙️ Features

- PDF ingestion and processing
- Semantic chunking and embeddings
- Local vector search with ChromaDB
- AI-powered question answering
- Interactive React UI to visualize the complete RAG pipeline

## ▶️ Getting Started

1. Add the PDF to the `data/` folder.
2. Configure API keys in the `.env` file.
3. Start the FastAPI backend.
4. Start the React frontend.
5. Ingest the PDF.
6. Ask questions and explore the RAG workflow.

## 💡 Sample Query

> What are the key features of VWO?

The application retrieves the most relevant document chunks and generates an AI-powered answer using Groq.