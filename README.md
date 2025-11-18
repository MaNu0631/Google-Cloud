How to Build an Agentic AI Circuit Generator with Gemini and Cloud Run 🤖
💡 Introduction
Problem Statement
Application Engineers spend significant time manually drafting detailed Electrical Diagrams and generating the underlying XML code for electrical circuits. This repetitive process is slow, error-prone, and distracts from core design work.
Audience
This blog is for intermediate to advanced developers and AI/ML engineers who are familiar with Google Cloud, basic Node.js development, and large language models (LLMs).
Final Outcome
By the end of this task, you will understand the architecture and core logic necessary to build an Agentic AI service that accepts a natural language prompt (e.g., "Connect a breaker to a busbar") and instantly produces a validated, detailed Electrical Diagram and its machine-readable XML output.
🏗️ Design
The core philosophy of this design is to use Gemini AI as a reasoning engine, not just a simple text translator, allowing it to act as a pseudo-Application Engineer.
Design Choice Rationale
We chose a serverless microservices architecture using Google Cloud Run for scalability and cost efficiency. The architecture decouples the AI logic from component data storage, making the system resilient and easy to update:
Cloud Run (Backend): Handles all traffic and coordinates the design process.
Gemini AI: Provides the agentic intelligence. It converts the complex natural language prompt into a structured data format (a Component Graph), validates electrical rules against it, and generates the final Electrical Diagram XML and the data required for the visual representation.
MCP Toolbox Service (Middleware): Abstracts data access. This is crucial because the AI should not be given direct database credentials; instead, it uses the Toolbox to request component metadata, rules, and diagram component templates via a controlled API.
Vector DB: Enables semantic search. If the user says "a heavy-duty switch," the Vector DB, based on component descriptions, finds the most appropriate catalog number, which is a powerful capability for a natural language-driven tool.

⚙️ Prerequisites
To follow the implementation steps for this architecture, you will need:
Software/Tools:
Node.js (v18+): For the Cloud Run Backend and MCP Toolbox Service.
Vite/React: For the frontend UI (to render the visual diagram).
Google Cloud SDK (gcloud): [Link to Google Cloud SDK download] for deploying services.
Docker: For containerizing the services.

Prior Concepts:
Basic knowledge of Docker and Kubernetes/Cloud Run deployment.
Familiarity with the Gemini API and prompting techniques.
Understanding of RESTful API design (Node.js/Express).

🔨 Step-by-Step Instructions (Conceptual Flow)
The following steps trace the path of a simple user request through the system:
1. Configure the AI Agent (Prompt Engineering)
The most critical step is crafting the system instruction for Gemini to ensure it acts as a reliable Electrical Engineer.
Goal: Instruct Gemini to output a structured JSON object containing component IDs and connection points only if the proposed design is electrically valid.
System Prompt Snippet: "You are the AutoCircuit Design Agent. Your task is to convert a user's natural language request into a valid electrical component graph. Before outputting the final JSON, you MUST check all connections against standard electrical rules (e.g., breakers must precede loads). If valid, output the final graph as a JSON object strictly following the 'Electrical_Diagram_Schema'…"

2. Implement the Backend Orchestrator (Cloud Run)
The Node.js backend handles the sequence of API calls.
Receive Prompt: The Cloud Run backend receives the user's JSON prompt from the UI.
Data Lookup (MCP Toolbox): The backend first calls the MCP Toolbox service to fetch standard voltage levels and connection rule IDs needed for the prompt.
Call Gemini: The backend sends the user prompt along with the fetched rules to the Gemini API.
JavaScript

// Example call in Node.js backend
const designJson = await gemini.generateContent({
  prompt: userPrompt,
  systemInstruction: systemPrompt,
  config: { responseMimeType: 'application/json' }
});
// Example call in Node.js backend const designJson = await gemini.generateContent({   prompt: userPrompt,   systemInstruction: systemPrompt,   config: { responseMimeType: 'application/json' } });
XML Generation: The returned structured JSON is then transformed into the final Electrical Diagram XML using stored templates from Cloud Storage.

3. Deploying the Services
Use Docker and the gcloud run deploy command to push the services to the cloud.
Create Service: gcloud run deploy autogenerator-backend --source . --region=us-central1
Set Permissions: Ensure the Cloud Run service account has permission to call the Gemini API and access the other services (MCP Toolbox, Firestore).

✅ Result / Demo
At the successful completion of the process, the user is presented with three interconnected artifacts:
Fully Generated Electrical Diagram XML: The machine-readable file ready for CAD/simulation software.

Visual Electrical Diagram Data: The structured data used to render the visual, validated diagram in the Live Preview.

Validation Log: A log detailing the electrical rules checked by the Gemini Agent, confirming the circuit is valid or explaining why it failed.

Visualization Choices
The Visual Electrical Diagram presented in the Live Preview is the most critical visualization. It uses clear labeling (component IDs) and standard electrical symbols to adhere to visualization design principles, ensuring the design is immediately readable and trustworthy to the engineer.
⏭️ What's Next?
Ideas for Expansion
Bidirectional Editing: Allow the user to edit the generated diagram directly in the UI, and have a second Gemini Agent interpret the visual change and regenerate the underlying XML.
Costing Integration: Integrate with another service to instantly fetch the component pricing from a third-party vendor based on the generated Bill of Materials (BOM).
