import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request, response) {
  try {
    const { message } = await request.json();
    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      stream:true,
      messages: [
        {
          role: "user",
          content: message,
        },
    ],
    });
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
        async start(controller){
            for await (const chunk of stream){
                const content = chunk.choices[0]?.delta?.content || "";
                if(content){
                    controller.enqueue(
                        encoder.encode(`data:${JSON.stringify({content})}\n\n`)
                    )
                }
            }
            controller.close();
        },
    });

    return new Response(readable,{
      headers:{
        "Content-Type":"text/event-stream",
        "Cache-Control":"no-cache",
        Connection:"keep-alive"
      }
    });
  } catch (err) {
    return Response.json({ Error: "Failed to process Request", status: 500 });
  }
}
