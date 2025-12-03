export async function fetchLocalAIResponse(message, history, scale, persona) {
  try {
    const response = await fetch(
      import.meta.env.PROD
        ? "https://your-vercel-app-name.vercel.app/api/chat"
        : "http://localhost:3000/api/chat",            // Vercel dev server
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, scale, persona }),
      }
    );

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Failed to connect to AI");
  }
}
