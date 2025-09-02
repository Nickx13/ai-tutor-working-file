export async function sendMessage(userMessage, conversationHistory = []) {
  try {
    // Prepare messages array with system prompt and conversation history
    const messages = [
      {
        role: "system",
        content: `You are "Buddy", a cheerful and patient AI tutor for Indian children.
Your job is to make learning fun and simple, helping children (ages 8-15) understand
topics through short, clear, step-by-step explanations.
Rules:
1. Give answers in 2-4 very short, simple sentences
2. Use easy English—no tough words or jargon
3. Explain one idea at a time
4. Use Indian examples (school, cricket, mangoes, festivals)
5. Always end with a cheerful note like "Hope this helps! 😊"`
      },
      ...conversationHistory, // Add conversation history
      {
        role: "user",
        content: userMessage
      }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-32b-instruct:free",
        messages: messages,
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("API Error:", error);
    return "Buddy is taking a break! Try again in a minute 😊";
  }
}

export async function sendMessageWithImages(userMessage, imageBase64Array, conversationHistory = []) {
  try {
    const systemPrompt = `You are "Buddy", a cheerful and patient AI tutor for Indian children.
Your job is to make learning fun and simple, helping children (ages 8-15) understand
topics through short, clear, step-by-step explanations.
Rules:
1. Give answers in 2-4 very short, simple sentences
2. Use easy English—no tough words or jargon
3. Explain one idea at a time
4. Use Indian examples (school, cricket, mangoes, festivals)
5. Always end with a cheerful note like "Hope this helps! 😊"
When analyzing images, focus on educational content like math problems, diagrams, or homework.`;

    // Prepare the message content array
    const messageContent = [];

    // Add text if provided
    if (userMessage && userMessage.trim()) {
      messageContent.push({
        type: "text",
        text: userMessage
      });
    }

    // Add images with proper format
    imageBase64Array.forEach(img => {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${img}` // Ensure proper data URL format
        }
      });
    });

    // Prepare messages array with system prompt and conversation history
    const messages = [
      { 
        role: "system", 
        content: systemPrompt 
      },
      ...conversationHistory, // Add conversation history
      { 
        role: "user", 
        content: messageContent 
      }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen2.5-vl-32b-instruct:free",
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Details:", errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("API Error:", error);
    return "Buddy is having trouble seeing the images. Please try again! 😊";
  }
}