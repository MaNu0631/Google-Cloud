import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-pro';

const cleanResponse = (text: string): string => {
    const cleaned = text.replace(/^```(xml|svg)?\n|```$/g, '').trim();
    // Also remove the XML declaration if present, as it can be added by the AI
    return cleaned.replace(/<\?xml.*\?>/g, '').trim();
};

export const generateXml = async (prompt: string, additionalComponents: string | null): Promise<string> => {
    const systemInstruction = `You are an expert in electrical engineering and data structures. Your task is to convert a natural language description of an electrical circuit into a structured XML format.

The XML must have a root element <circuit>.
Inside <circuit>, there should be two main sections: <components> and <connections>.

The <components> section should list all components. Each component must be a <component> tag with these attributes:
- id: A unique identifier (e.g., 'c1', 'c2'). This ID must be a valid XML ID format.
- type: The component type (e.g., 'PowerSource', 'Relay', 'LED', 'TemperatureSensor', 'Controller', 'Fan').
- name: A user-friendly name (e.g., 'Main Power', 'Sensor A').

A <component> can contain <attribute> child elements for properties, e.g., <attribute name="voltage" value="9V" />.

The <connections> section describes links. Each connection is a <connection> tag with:
- <from component_id="..." port="..." />
- <to component_id="..." port="..." />
Ports can be simple like 'positive', 'negative', 'input', 'output', 'control'.

${additionalComponents ? `The user has provided custom component definitions and/or selected from a library of common components to consider:\n\n${additionalComponents}` : ''}

Convert the following user prompt into well-formed XML based on this structure. Output only the XML code block.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
            },
        });
        return cleanResponse(response.text);
    } catch (error) {
        console.error("Error generating XML:", error);
        if (error instanceof Error) {
            throw new Error(`The AI failed to generate the XML. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the XML.");
    }
};

export const generateSvgPreview = async (xml: string): Promise<string> => {
    const systemInstruction = `You are an expert SVG generator. Your task is to convert circuit XML data into a clean, interactive SVG diagram suitable for a light-themed website.

**SVG Output Rules:**
1.  **Structure:** Each XML \`<component>\` must be a \`<g>\` element in the SVG.
2.  **IDs & Classes:** CRITICALLY, each component \`<g>\` MUST have an \`id\` attribute matching the XML component's ID, and also \`class="component"\`.
3.  **Interactivity CSS:** Embed a \`<style>\` block. Define CSS for \`.component:hover\` (add a subtle green drop-shadow filter and pointer cursor) and for \`.component.selected\` (add a prominent green stroke, e.g., \`stroke: #4CAF50; stroke-width: 2.5px;\`).
4.  **Connections:** Connection lines/paths MUST have \`class="connection"\` and be styled with a solid green stroke (\`stroke: #4CAF50; stroke-width: 2px;\`).
5.  **Layout:** Create a logical layout. Route connection lines AROUND components to avoid overlaps. Use curved paths for a tidy appearance.
6.  **Appearance:** Use a transparent background. Use simple icons for components. Use dark gray for text ('#333333') and medium gray for component strokes ('#616161').
7.  **Responsiveness:** The root \`<svg>\` MUST have \`width="100%"\`, \`height="100%"\`, and a proper \`viewBox\`.
8.  **Tooltips:** Each component \`<g>\` should contain a \`<title>\` element with its name and type.
9.  **Format:** Output ONLY the raw SVG code. No markdown, no explanations.`;

    const fullPrompt = `Convert the following circuit XML into an interactive SVG based on your system instructions.

XML:
\`\`\`xml
${xml}
\`\`\`
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction,
            },
        });
        return cleanResponse(response.text);
    } catch (error) {
        console.error("Error generating SVG preview:", error);
        if (error instanceof Error) {
            throw new Error(`The AI failed to generate the SVG. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the SVG preview.");
    }
};

export const getChatResponse = async (prompt: string, isThinkingMode: boolean): Promise<string> => {
    const modelName = isThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const config = isThinkingMode ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

    const systemInstruction = `You are a helpful AI assistant for the AutoCircuit Generator application. You can help users with circuit design questions.
When answering, be helpful and concise. Use markdown for formatting if it improves readability.`;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                ...config,
                systemInstruction,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting chat response:", error);
        if (error instanceof Error) {
            throw new Error(`The AI failed to respond. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while getting a chat response.");
    }
};