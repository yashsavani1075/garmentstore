from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

from langchain_groq import ChatGroq
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0
)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vector_db = Chroma(
    persist_directory="chroma_db",
    embedding_function=embeddings
)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

@app.post("/ai/rag")
def rag(req: ChatRequest):
    results = vector_db.similarity_search_with_score(req.message, k=8)

    filtered_docs = []
    for doc, score in results:
        print("RAG SCORE:", score)
        print(doc.page_content[:150])

        if score < 1.2:
            filtered_docs.append(doc)

    if not filtered_docs:
        return {
            "reply": "Sorry, I don't have information about that."
        }

    context = format_docs(filtered_docs)

    prompt = ChatPromptTemplate.from_template("""
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
{question}

Answer:
""")

    response = (prompt | llm).invoke({
        "context": context,
        "question": req.message
    })

    return {
        "reply": response.content
    }