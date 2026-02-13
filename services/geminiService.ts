import { GoogleGenAI, Type } from "@google/genai";

// @ts-ignore
const apiKey = window?.process?.env?.API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Gemini API Key is missing!");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// 1. Image Editing
export const editProfileImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  try {
    const model = 'gemini-2.5-flash-image';
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: `Edit this image: ${prompt}. Return ONLY the edited image.` },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};

// 2. Maps Grounding
export const askMapsAdvisor = async (userLat: number, userLng: number, query: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model: model,
      contents: `User Location: ${userLat}, ${userLng}. Question: ${query}`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude: userLat, longitude: userLng } } }
      },
    });
    let text = response.text || "I couldn't find that info.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      const links = groundingChunks
        .filter(c => c.web?.uri || c.maps?.placeAnswerSources?.[0]?.reviewSnippets?.[0]?.sourceUri)
        .map(c => `\n Source: ${c.web?.title || 'Map Result'} - ${c.web?.uri || 'Google Maps'}`)
        .join('');
      text += links;
    }
    return text;
  } catch (error) {
    console.error("Gemini Maps Error:", error);
    return "Sorry, I can't access maps right now.";
  }
};

// 3. Price Check
export const checkMarketPrice = async (itemName: string): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: model,
      contents: `What is the current average used market price in India for: ${itemName}? Keep it short (1 sentence).`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return response.text || "Price check failed.";
  } catch (error) {
    return "Couldn't verify price.";
  }
};

// 4. Price Estimator
export const estimateItemPrice = async (itemName: string): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: model,
      contents: `Provide a fair price range for a used "${itemName}" for a college student market in India. Format: "Estimated: ₹Min - ₹Max". Keep it concise.`,
    });
    return response.text || "Could not estimate price.";
  } catch (error) {
    return "Estimation failed. Try again.";
  }
};

// 5. Generate Visual Keyword for Image Generation (Strict Instruction)
export const generateImageKeyword = async (itemTitle: string): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: model,
      contents: `Item Title: "${itemTitle}"`,
      config: {
        systemInstruction: "Act as a professional stock photo curator. Your goal is to generate a visual search query for Unsplash. Return ONLY ONE specific, descriptive noun phrase that describes the PHYSICAL object. Rule 1: NO abstract terms (e.g., do not say 'learning', say 'open textbook on desk'). Rule 2: If the item is a service (e.g., 'Python Tutoring'), describe a physical representation (e.g., 'laptop screen with code'). Rule 3: Do not include words like 'concept' or 'illustration'.",
      },
    });
    return response.text?.trim() || "college campus item";
  } catch (error) {
    console.error("Gemini Keyword Error:", error);
    return "college campus item";
  }
};