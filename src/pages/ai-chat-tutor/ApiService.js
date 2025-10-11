const GEMINI_API_KEY = "AIzaSyAoyZoPKUyU12asjp6tdpO1tAml1Bi58Mc";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function sendMessage(userMessage, conversationHistory = []) {
  try {
    // Prepare contents array with conversation history
    const contents = [];
    
    // Add system prompt as the first message
    contents.push({
      role: "user",
      parts: [{
        text: `You are "Buddy", a cheerful and patient AI tutor for Indian children.
Your job is to make learning fun and simple, helping children (ages 8-15) understand
topics through short, clear, step-by-step explanations.
Rules:
1. Give answers in 2-4 very short, simple sentences
2. Use easy English—no tough words or jargon
3. Explain one idea at a time
4. Use Indian examples (school, cricket, mangoes, festivals)
5. Always end with a cheerful note like "Hope this helps! 😊"`
      }]
    });
    
    // Add conversation history
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.role === "system" ? "user" : msg.role,
        parts: [{ text: msg.content }]
      });
    });
    
    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("API Error:", error);
    return "Buddy is taking a break! Try again in a minute 😊";
  }
}

export async function sendMessageWithImages(userMessage, imageBase64Array, conversationHistory = []) {
  try {
    // Prepare contents array
    const contents = [];
    
    // Add system prompt
    contents.push({
      role: "user",
      parts: [{
        text: `You are "Buddy", a cheerful and patient AI tutor for Indian children.
Your job is to make learning fun and simple, helping children (ages 8-15) understand
topics through short, clear, step-by-step explanations.
Rules:
1. Give answers in 2-4 very short, simple sentences
2. Use easy English—no tough words or jargon
3. Explain one idea at a time
4. Use Indian examples (school, cricket, mangoes, festivals)
5. Always end with a cheerful note like "Hope this helps! 😊"
When analyzing images, focus on educational content like math problems, diagrams, or homework.`
      }]
    });
    
    // Add conversation history
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.role === "system" ? "user" : msg.role,
        parts: [{ text: msg.content }]
      });
    });
    
    // Prepare parts for current message
    const parts = [];
    
    // Add text if provided
    if (userMessage && userMessage.trim()) {
      parts.push({ text: userMessage });
    }
    
    // Add images
    imageBase64Array.forEach(img => {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: img
        }
      });
    });
    
    // Add current message with images
    contents.push({
      role: "user",
      parts: parts
    });

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Details:", errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("API Error:", error);
    return "Buddy is having trouble seeing the images. Please try again! 😊";
  }
}