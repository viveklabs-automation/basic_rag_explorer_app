import os
import pypdf
import chromadb
from nomic import embed

def load_pdf(pdf_path):
    """
    Reads a PDF file and extracts text page by page.
    Returns:
        tuple: (full_text, pages_metadata, pages_texts)
        - full_text: The complete text content of the PDF.
        - pages_metadata: A list of dicts containing page-level info (page index, characters).
        - pages_texts: A list of extracted text strings for each page.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found at: {pdf_path}")
        
    reader = pypdf.PdfReader(pdf_path)
    full_text = ""
    pages_metadata = []
    pages_texts = []
    
    for idx, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        full_text += text + "\n"
        pages_metadata.append({
            "page_index": idx + 1,
            "char_count": len(text)
        })
        pages_texts.append(text)
        
    return full_text, pages_metadata, pages_texts

def split_text(text, chunk_size=1000, chunk_overlap=200):
    """
    Splits text into chunks of specified size and overlap.
    Aims to split at paragraph/line/sentence boundaries to preserve context.
    """
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        # Determine current window end
        end = min(start + chunk_size, text_len)
        
        # If we are not at the end of the text, look for a good split point in the overlap range
        if end < text_len:
            split_pos = -1
            # Search for double-newline (paragraphs), single newline, or space
            for sep in ["\n\n", "\n", " "]:
                pos = text.rfind(sep, start + chunk_size - chunk_overlap, end)
                if pos != -1:
                    split_pos = pos + len(sep)
                    break
            
            # If a split boundary is found, adjust 'end'
            if split_pos != -1:
                end = split_pos
                
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
            
        if end >= text_len:
            break
            
        # Shift start window for the next chunk, ensuring forward progress
        start = max(start + 1, end - chunk_overlap)
        
    return chunks

def generate_embeddings(chunks, api_key=None):
    """
    Generates text embeddings using the Nomic Embed Cloud API.
    Uses 'search_document' task type for ingestion.
    """
    nomic_key = api_key or os.getenv("NOMIC_API_KEY")
    if not nomic_key:
        raise ValueError("Nomic API Key not found. Please set it in .env or UI Settings.")
        
    # Set the environment variable so Nomic SDK picks it up
    os.environ["NOMIC_API_KEY"] = nomic_key
    
    # Authenticate with Nomic AI
    import nomic
    nomic.login(nomic_key)
    
    # Nomic API call
    response = embed.text(
        texts=chunks,
        model='nomic-embed-text-v1.5',
        task_type='search_document'
    )
    return response['embeddings']

def store_in_chroma(chunks, embeddings, metadatas, db_dir="db"):
    """
    Saves chunks and their corresponding embeddings into a persistent ChromaDB instance.
    Uses cosine space for easy distance-to-similarity conversion.
    """
    client = chromadb.PersistentClient(path=db_dir)
    
    # Delete the collection if it already exists to guarantee a clean rebuild
    try:
        client.delete_collection("rag_collection")
    except Exception:
        pass
        
    collection = client.create_collection(
        name="rag_collection",
        metadata={"hnsw:space": "cosine"} # cosine distance: 1 - cosine_similarity
    )
    
    ids = [f"chunk_{i}" for i in range(len(chunks))]
    
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas
    )
    return len(chunks)

def run_ingestion_pipeline(pdf_path, nomic_key=None, db_dir="db"):
    """
    Orchestrates the entire ingestion pipeline: Load -> Chunk -> Embed -> Store.
    """
    print(f"[RAG Ingestion] Starting ingestion for PDF: {pdf_path}")
    
    # 1. Load PDF
    text, pages_meta, pages_texts = load_pdf(pdf_path)
    print(f"[RAG Ingestion] Loaded {len(pages_meta)} pages. Total character count: {len(text)}")
    
    # 2. Split PDF content into chunks page by page
    chunks = []
    metadatas = []
    pdf_name = os.path.basename(pdf_path)
    
    for idx, page_text in enumerate(pages_texts):
        page_chunks = split_text(page_text)
        for chunk in page_chunks:
            chunks.append(chunk)
            metadatas.append({
                "source": pdf_name,
                "chunk_index": len(chunks) - 1,
                "page_index": idx + 1
            })
            
    print(f"[RAG Ingestion] Split content into {len(chunks)} chunks.")
    
    # 3. Generate embeddings
    print(f"[RAG Ingestion] Generating Nomic Embeddings (model: nomic-embed-text-v1.5)...")
    embeddings = generate_embeddings(chunks, api_key=nomic_key)
    print(f"[RAG Ingestion] Generated {len(embeddings)} embeddings (dimension: {len(embeddings[0])})")
    
    # 4. Store embeddings in local ChromaDB
    count = store_in_chroma(chunks, embeddings, metadatas, db_dir)
    print(f"[RAG Ingestion] Ingestion complete. Stored {count} chunks in ChromaDB.")
    
    return {
        "pdf_name": pdf_name,
        "total_pages": len(pages_meta),
        "total_characters": len(text),
        "total_chunks": count,
        "chunks": chunks[:10]  # Return first 10 chunks as preview
    }
