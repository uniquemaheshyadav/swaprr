import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";

// NOTE: In a real production application, this initialization should happen on a backend server
// to prevent exposing the API key to the client. We enable `dangerouslyAllowBrowser` for this prototype.
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
});

/**
 * Modular helper to route requests to OpenAI with strict anti-hallucination constraints.
 * Temperature is locked to 0.2 for consistency.
 */
export const callSwapprAI = async (prompt: string, systemContext: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Fallback to gpt-3.5-turbo if 4o is unavailable on key
      messages: [
        { role: "system", content: systemContext },
        { role: "user", content: prompt }
      ],
      temperature: 0.2, // Strict control to prevent "dreaming"
      max_tokens: 250,
    });

    return response.choices[0]?.message?.content || "I am unsure.";
  } catch (error) {
    console.error("SwapprAI Error:", error);
    return "Service temporarily unavailable.";
  }
};

/**
 * Task 1: Item Auto-Tagging & Cleanup
 * Cleans raw user input into a professional listing.
 */
export const cleanItemDescription = async (rawDescription: string, category: string): Promise<string> => {
  const systemContext = `
    You are a professional editor for 'Swappr', a student marketplace. 
    Your task is to "clean up" the raw user input into a professional listing description.
    
    ANTI-HALLUCINATION RULES:
    1. Grounding Requirement: Only generate text based on the provided input.
    2. If a detail is missing, do NOT invent it. (e.g., do not say 'no scratches' if the user didn't say so).
    3. If the input is too vague, just fix the grammar.
    4. Keep it concise (under 30 words).
    5. Context: The item is in the '${category}' category.
  `;

  return callSwapprAI(`Clean this description: "${rawDescription}"`, systemContext);
};

/**
 * Task 2: Chat Safety & Sentiment Analysis
 * Scans for off-platform trading or harassment.
 */
export const analyzeChatSafety = async (lastMessages: string[]): Promise<{ safe: boolean; reason: string }> => {
  const systemContext = `
    You are a Safety Moderator for Swappr.
    Analyze the chat history for:
    1. Off-platform trading (e.g., asking to move to WhatsApp/Telegram immediately to bypass safety).
    2. Harassment or bullying.
    
    ANTI-HALLUCINATION RULES:
    1. Strictly follow Swappr_Safety_Guidelines. Do not improvise new rules.
    2. If you are less than 95% certain, state 'I am unsure'.
    3. Chain-of-Thought: Think step-by-step. Does the text explicitly violate a rule?
    
    Output Format: Return JSON ONLY. { "safe": boolean, "reason": "short explanation" }
  `;

  const prompt = `Chat History:\n${lastMessages.join("\n")}`;

  try {
    const responseText = await callSwapprAI(prompt, systemContext);
    // Attempt to parse JSON
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    return { safe: true, reason: "Analysis failed" };
  }
};

/**
 * Task 3: Image Generation
 * Generates a product image if the original is missing or broken.
 */
export const generateItemImage = async (title: string, category: string): Promise<string> => {
  try {
    let prompt = `A professional, clean, studio-lighting product photo of a ${title}. Category: ${category}. Minimalist background, high quality, realistic.`;

    if (category === 'Avatar' || category === 'User') {
      prompt = `A creative, artistic digital avatar for a user named ${title}. Vibrant colors, modern, profile picture style, high quality, 3d render.`;
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url || "";
  } catch (error) {
    console.error("DALL-E Error:", error);
    // Return a fallback placeholder if generation fails
    return `https://placehold.co/600x600?text=${encodeURIComponent(category === 'Avatar' ? title[0] : 'No Image')}`;
  }
};

/**
 * Task 4: Price Estimator
 * Provides a fair price range for a used item.
 */
export const estimateItemPrice = async (itemName: string): Promise<string> => {
  const systemContext = `
      You are a valuation expert for a student marketplace in India.
      Provide a fair price range for a used "${itemName}".
      
      Rules:
      1. Output format: "Estimated: ₹Min - ₹Max"
      2. Currency: Indian Rupees (₹)
      3. Keep it concise (maximum 10 words).
      4. If the item is unknown, guess based on similar items or return "Could not estimate".
    `;

  return callSwapprAI(`Price for used: ${itemName}`, systemContext);
};