# **RAG Assistant**

**RAG Assistant** is a fully offline, lightweight Retrieval-Augmented Generation (RAG) system designed to run efficiently on personal computers — even without internet access. It allows users to upload a PDF, extract and chunk its text, generate fast local embeddings, store them in a vector index (HNSW), and chat with the document using a local Llama model through Ollama.

---

## **How It Works**

1. **Upload a PDF**
   The backend extracts text using `pdf-parse`, cleans it, and splits it into meaningful chunks for retrieval.

2. **Generate Embeddings (Offline)**
   Uses **llama3.2:1b (embedding mode)** via Ollama to encode each chunk into a vector.

3. **Store Vectors in HNSW Index**
   A fast, lightweight similarity search index (`hnswlib-node`) stores and retrieves relevant chunks based on a user query.

4. **Ask Questions**
   Your query is embedded and matched against document chunks to form a context, which is then sent to **llama3.1** (or any locally installed chat model).

5. **Streaming Chat UI**
   The frontend shows live token-by-token responses and maintains a simple persistent chat history.

---

## **Why This Project Exists**

Cloud-based RAG systems are powerful but expensive and slow on poor networks. This project offers:

* **Full offline capability** — no internet needed.
* **Minimal hardware requirements** — works on laptops and low-end machines.
* **Fast embedding and retrieval** — suitable for local searches.
* **Transparent and modular architecture** — easy to modify, expand, or swap models.

---

## **Model Recommendations for Performance**

| Task         | Recommended Model                | Notes                                                            |
| ------------ | -------------------------------- | ---------------------------------------------------------------- |
| Embeddings   | `llama3.2:1b`                    | Fast, accurate, low memory footprint, ideal for offline devices. |
| Chat / Q&A   | `llama3.1:8b`                    | Stronger answers, larger model; slower on CPU.                   |
| Low-end CPU  | `llama3.1:1b-instruct`           | Lightweight chat model for devices with <8GB RAM.                |
| High-end GPU | `llama3.1:13b` or `llama3.1:30b` | Faster inference on GPU, better for large documents.             |

**Tip:** If you have a GPU, larger models like `llama3.1:13b` or `llama3.1:30b` drastically improve response quality and speed. On CPU-only machines, smaller models (1b or 2b) are much faster and avoid memory issues.

---

## **Why Offline Is Helpful**

* **Privacy & Security** — your documents never leave your machine.
* **Reliability** — works without internet or on slow connections.
* **Cost Efficiency** — no cloud API usage fees.
* **Speed** — local embeddings and search are often faster than cloud roundtrips.

---

## **Hardware Notes**

* CPU-only (8GB RAM): small embedding + chat models work fine.
* CPU-only (16GB+ RAM): medium-sized chat models feasible.
* GPU (NVIDIA): allows using large Llama models (13b+), reducing latency and increasing accuracy.

## **Developer Note**

* Currently, the system supports only one PDF upload at a time. This design choice ensures low memory usage and smooth operation on low-end machines.

---

## **Getting Started**

Follow these steps to run RAG Assistant locally:

### 1. **Clone the Repository**

```bash
git clone https://github.com/Sujit-Hiwale/rag-assistant.git
cd rag-assistant
```

### 2. **Install Dependencies**

This will install dependencies for the root, frontend, and backend:

```bash
npm install
```

### 3. **Run Both Frontend and Backend**

Start the system locally with a single command:

```bash
npm run dev
```

* Backend runs on `http://localhost:5000`
* Frontend runs on `http://localhost:5173`

### 4. **Build for Production (Optional)**

```bash
npm run build
```

* Builds the frontend using Vite.
* Backend is TypeScript and runs directly, no separate build required.

### 5. **Upload PDF and Start Chatting**

* Open the frontend URL in your browser.
* Upload a PDF.
* Interact with the document using the chat interface.
