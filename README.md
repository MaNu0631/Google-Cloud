# AI-Powered Automatic Electrical Diagram Generator

This project enables you to enter natural-language prompts (e.g., “Generator to busbar to breaker to transformer to load”) and automatically generate validated, structured electrical diagrams in XML format using an agentic AI pipeline built on Gemini and Vite + NGINX, deployed on Google Cloud Run.

## Architecture Overview  
The system is built with a serverless, microservices architecture:  
1. **Frontend (Cloud Run)**: A Vite/React SPA served via NGINX that captures user prompts.  
2. **Backend (Cloud Run)**: A Node.js service that orchestrates the workflow—receives the prompt, calls Gemini to generate a component graph, applies validation rules, transforms the graph into the final electrical diagram XML, and returns the result.  
3. **MCP Toolbox Service**: A middleware microservice providing unified access to component metadata, templates and validation rules (abstracting Firestore, Cloud Storage, SQL or vector DBs).  
4. **Data Layer**: Firestore stores component metadata and rules; Cloud Storage holds template files; optional SQL/vector DBs support semantic search and advanced data retrieval.  
5. **Gemini AI Integration**: Gemini acts as the reasoning engine—interprets the user prompt, applies engineering logic, converts the component graph to XML, and ensures design validity.  
6. **User Output**: The user receives a validated, ready-to-use electrical diagram (XML) and can view a rendered visual preview in the UI.

<img width="727" height="599" alt="image" src="https://github.com/user-attachments/assets/aa3870f6-887b-4356-ab38-f6a558c69031" />

## Prerequisites  
- Node.js v18+ installed  
- Vite + React for frontend  
- Docker installed locally  
- Google Cloud SDK (`gcloud`) configured with your project  
- A Google Cloud project (e.g., `autocircuitgenerator`)  
- Enable Cloud Run, Cloud Build, Firestore, Storage, and whichever DB service you choose  
- Gemini API key and credentials stored securely (e.g., Google Secret Manager)

## Setup & Deployment

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/MaNu0631/Google-Cloud.git
cd Google-Cloud
```

---

## 2️⃣ Configure Environment Variables

Create a `.env` file or configure Cloud Run service variables:

```env
GEMINI_API_KEY=<your-gemini-api-key>
MCP_TOOLBOX_URL=<URL of your MCP Toolbox service>
FIRESTORE_PROJECT=<your-project-id>
```

---

### 3️⃣ Build and Deploy the **Frontend**

```bash
cd frontend
npm install
npm run build

docker build -t gcr.io/<PROJECT_ID>/frontend .

gcloud run deploy frontend-service   --image gcr.io/<PROJECT_ID>/frontend   --region us-central1   --platform managed   --allow-unauthenticated
```

---

### 4️⃣ Build and Deploy the **Backend**

```bash
cd ../backend
npm install

docker build -t gcr.io/<PROJECT_ID>/backend .

gcloud run deploy backend-service   --image gcr.io/<PROJECT_ID>/backend   --region us-central1   --platform managed   --allow-unauthenticated
```

---

### 5️⃣ Build and Deploy the **MCP Toolbox Service**

```bash
cd ../mcp-toolbox
npm install

docker build -t gcr.io/<PROJECT_ID>/mcp-toolbox .

gcloud run deploy mcp-toolbox-service   --image gcr.io/<PROJECT_ID>/mcp-toolbox   --region us-central1   --platform managed   --allow-unauthenticated
```

---

### 6️⃣ Configure IAM & Permissions

Ensure backend can call Gemini API and communicate with MCP Toolbox.  
Assign required permissions:

| Service | Required Roles |
|--------|----------------|
| Backend Service Account | Access to GEMINI API + invoke MCP Toolbox |
| MCP Toolbox Service Account | `roles/datastore.user`, `roles/storage.objectViewer`, DB access abilities |

Use commands such as:

```bash
gcloud projects add-iam-policy-binding <PROJECT_ID>   --member=serviceAccount:<SERVICE_ACCOUNT>   --role=roles/datastore.user
```

Add others as required.

---

### 7️⃣ Test the End-to-End Flow

1. Open the **Frontend URL** from Cloud Run.
2. Enter a prompt, for example:

```
Generator to busbar to breaker to transformer to load.
```
3. Submit and wait for result.
4. You should receive:
   - A **rendered diagram**
   - A **downloadable XML design file**
<img width="720" height="352" alt="image" src="https://github.com/user-attachments/assets/9c0a2b55-ad80-49e6-abb7-668386194b7e" />


---

## 📌 What’s Next / Possible Extensions

| Feature Idea | Description |
|--------------|-------------|
| 🔄 Bidirectional Editing | Users edit the diagram and send updates back through Gemini for regeneration. |
| 💰 Component Costing | Integrate vendor pricing APIs to include cost/BOM estimates in output. |
| 🕒 Versioning & History | Store design iterations in Firestore and support rollback. |
| 🔍 Searchable Component Library | Use vector DB & embeddings to search components via natural language. |
