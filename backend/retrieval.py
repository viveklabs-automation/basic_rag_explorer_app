import os
import chromadb
from nomic import embed
from groq import Groq

def embed_query(query, api_key=None):
    """
    Generates text embedding for the search query using Nomic Embed Cloud API.
    Uses 'search_query' task type as recommended for search queries.
    """
    nomic_key = api_key or os.getenv("NOMIC_API_KEY")
    if not nomic_key:
        raise ValueError("Nomic API Key not found. Please set it in .env or UI Settings.")
        
    os.environ["NOMIC_API_KEY"] = nomic_key
    
    # Authenticate with Nomic AI
    import nomic
    nomic.login(nomic_key)
    
    response = embed.text(
        texts=[query],
        model='nomic-embed-text-v1.5',
        task_type='search_query'
    )
    return response['embeddings'][0]

def retrieve_chunks(query_embedding, db_dir="db", n_results=4):
    """
    Queries ChromaDB with the query embedding to fetch top N most similar chunks.
    Converts cosine distance to similarity score: similarity = 1.0 - distance.
    """
    client = chromadb.PersistentClient(path=db_dir)
    
    # Check if the database has been initialized
    try:
        collection = client.get_collection(name="rag_collection")
    except Exception:
        raise ValueError("Vector database is empty. Please run PDF ingestion first!")
        
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    
    # Check if we got results
    if not results or not results["documents"] or len(results["documents"][0]) == 0:
        return []
        
    formatted_chunks = []
    
    # Results are returned in lists of lists (since we queried 1 vector)
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]
    ids = results["ids"][0]
    
    for idx in range(len(documents)):
        distance = distances[idx]
        # Cosine distance = 1 - Cosine Similarity
        similarity = round(1.0 - distance, 4)
        
        formatted_chunks.append({
            "id": ids[idx],
            "text": documents[idx],
            "metadata": metadatas[idx],
            "similarity": similarity
        })
        
    return formatted_chunks

def generate_answer(query, chunks, api_key=None):
    """
    Compiles the RAG prompt and uses Groq with OpenGPT 120B model
    to generate the final answer based on the retrieved context.
    """
    groq_key = api_key or os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise ValueError("Groq API Key not found. Please set it in .env or UI Settings.")
        
    # Combine retrieved chunks into context string
    context_text = "\n\n---\n\n".join([f"Chunk {c['metadata']['chunk_index']} (Page {c['metadata']['page_index']}):\n{c['text']}" for c in chunks])
    
    # System and user prompts
    system_prompt = (
        "You are an expert AI assistant providing detailed, accurate, and factual "
        "answers based strictly on the provided context. Format your response strictly using these markdown rules:\n"
        "1. Start with the introductory line (e.g. 'Target audiences identified in the PRD:') as plain text (no bold, no bullets).\n"
        "2. For each section, use a section header formatted as a bullet point and bold (e.g., '- **Primary users**' or '- **Secondary users**').\n"
        "3. Add exactly one blank line before each section header.\n"
        "4. List the items associated with each section header directly below it. Format each item on its own line, indented with exactly 4 spaces (or a tab), and do NOT use bold or bullet points (e.g., '    CRO Specialists'). Do NOT add any blank line between the section header and the indented items.\n"
        "5. Example overall structure:\n"
        "Target audiences identified in the PRD:\n\n"
        "- **Primary users**\n"
        "    CRO Specialists\n"
        "    Product Managers\n"
        "    UX Designers\n\n"
        "- **Secondary users**\n"
        "    Engineering teams (backend and frontend)\n"
        "    Business executives"
    )
    
    user_prompt = f"""Use the following pieces of context to answer the question at the end.

Context:
{context_text}

Question: {query}
Answer:"""

    # Initialize Groq client
    client = Groq(api_key=groq_key)
    
    # Call Groq's OpenGPT 120B model (Model ID: openai/gpt-oss-120b)
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        model="openai/gpt-oss-120b",
        temperature=0.2, # Low temperature for high factual accuracy in RAG
        max_tokens=1024
    )
    
    answer = chat_completion.choices[0].message.content
    return answer, user_prompt, system_prompt

def run_retrieval_pipeline(query, nomic_key=None, groq_key=None, db_dir="db"):
    """
    Orchestrates the retrieval and generation pipeline.
    """
    # 1. Generate query embedding
    query_embedding = embed_query(query, api_key=nomic_key)
    
    # 2. Retrieve top 4 relevant chunks
    chunks = retrieve_chunks(query_embedding, db_dir=db_dir, n_results=4)
    
    if not chunks:
        return {
            "query_embedding_preview": query_embedding[:10],
            "chunks": [],
            "prompt": "",
            "answer": "No context was found to answer the query. Please ensure you have ingested the document."
        }
        
    # 3. Generate answer using Groq + OpenGPT 120B
    answer, compiled_prompt, system_prompt = generate_answer(query, chunks, api_key=groq_key)
    
    return {
        "query_embedding_preview": query_embedding[:15], # First 15 dimensions as a preview for the UI
        "chunks": chunks,
        "system_prompt": system_prompt,
        "prompt": compiled_prompt,
        "answer": answer
    }
