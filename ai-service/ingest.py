import os
import shutil
import chromadb

DATA_DIR = "data"
CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "garment_store"

def chunk_text(text, chunk_size=400, overlap=80):
    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap

    return chunks

if os.path.exists(CHROMA_DIR):
    shutil.rmtree(CHROMA_DIR)

client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = client.get_or_create_collection(name=COLLECTION_NAME)

documents = []
ids = []
metadatas = []

chunk_id = 0

for filename in os.listdir(DATA_DIR):
    if filename.endswith(".txt"):
        file_path = os.path.join(DATA_DIR, filename)

        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()

        chunks = chunk_text(text)

        for chunk in chunks:
            documents.append(chunk)
            ids.append(f"chunk_{chunk_id}")
            metadatas.append({"source": filename})
            chunk_id += 1

collection.add(
    documents=documents,
    ids=ids,
    metadatas=metadatas
)

print("RAG data stored successfully")
print("Chunks:", len(documents))