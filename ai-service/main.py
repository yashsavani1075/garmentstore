import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
import chromadb
from groq import Groq

load_dotenv()

app = FastAPI()

CHROMA_DIR = "chroma_db"
COLLECTION_NAME = "garment_store"

class ChatRequest(BaseModel):
    message: str

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = chroma_client.get_or_create_collection(name=COLLECTION_NAME)

def format_docs(docs):
    return "\n\n".join(docs)

@app.get("/")
def home():
    return {"message": "AI service running"}

@app.post("/ai/rag")
def rag(req: ChatRequest):
    results = collection.query(
        query_texts=[req.message],
        n_results=8
    )

    docs = results["documents"][0]
    distances = results["distances"][0]

    filtered_docs = []

    for doc, distance in zip(docs, distances):
        print("RAG DISTANCE:", distance)
        print(doc[:150])

        if distance < 1.2:
            filtered_docs.append(doc)

    if not filtered_docs:
        return {
            "reply": "Sorry, I don't have information about that."
        }

    context = format_docs(filtered_docs)

    prompt = f"""
You are GarmentStore assistant.

Answer only from the Context.
You can answer fashion-related and store-related questions if the answer exists in the Context.
Do not use outside knowledge.
Do not invent products, prices, colors, fabrics, sizes, discounts, or policies.
If the Context does not contain the answer, reply exactly:
"Sorry, I don't have information about that."

Context:
{context}

Question:
{req.message}

Answer:
"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return {
        "reply": response.choices[0].message.content
    }