import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message, history, scale } = req.body;

    if (!message || !history || !scale) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const scaleName = scale.charAt(0).toUpperCase() + scale.slice(1);

    const messages = [
      {
        role: "system",
        content: `User is currently viewing the "${scaleName}" scale.`
      },
      ...history.filter((m) => m.role !== "system"),
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 250,
    });

    res.status(200).json({
      content: completion.choices[0].message.content
    });
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ error: "AI processing failed" });
  }
}
