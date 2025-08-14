// src/pages/doubt-solver/ApiService.js

/**
 * Calls Groq's Llama-3 AI to generate a strict step-by-step math solution in JSON format.
 * @param {string} question - The student's math/science question.
 * @param {string} language - Language code ('en', 'hi', 'bn', etc.). Defaults to 'en' (English).
 * @returns {Promise<Object|null>} - Parsed solution object (with steps, final answer, etc.), or null on error.
 */
export async function getMathSolution(question, language = 'en') {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`, // <-- Replace for production!
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `
You are "Buddy", a step-by-step Math Doubt Solver for Indian school students (age 8-15).
Always reply in this JSON format (STRICT! No extra text!):

{
  "steps": [
    {
      "title": "Step title",
      "explanation": "Explain the work for this step",
      "formula": "Write equation if any"
    }
    // ... more steps ...
  ],
  "finalAnswer": "Short final answer (clear for kids)",
  "difficulty": "Easy/Medium/Hard",
  "relatedConcepts": ["list", "of", "topics"]
}

Use ${language === 'en' ? 'English' : 'the target local language'}. Do not skip any steps. Omit all other output.`
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.5,
        max_tokens: 512
      })
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    let raw = data.choices[0].message.content.trim();

    // Remove code block formatting if present (e.g., ``````)
      if (raw.startsWith("```")) {
         raw = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '');
       }

    // Safely parse the returned JSON string
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Failed to parse LLM JSON\nRaw LLM output:", raw, "\nError:", err);
      parsed = null;
    }

    return parsed;
  } catch (error) {
    console.error("API Error (Doubt Solver):", error);
    return null;
  }
}
