import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request, response) {
  try {
    const { message } = await request.json();
    const completions = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    return Response.json({
      response: completions.choices[0].message.content,
      status: 200,
    });
  } catch (err) {
    return Response.json({ Error: "Failed to process Request", status: 500 });
  }
}
