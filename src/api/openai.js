// src/api/openai.js

export async function fetchLocalAIResponse(message, history, scale, persona) {
  try {
    const response = await fetch('/api/chat', { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, scale, persona }),
    });

    // Cek jika response tidak OK (misal 404 atau 500)
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error fetching AI:", error);
    throw error;
  }
}