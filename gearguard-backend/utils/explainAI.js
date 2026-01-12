import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const generateExplanation = async (sensor, history) => {
  const prompt = `
You are an industrial maintenance expert.

Sensor readings:
Temperature: ${sensor.temperature}
Vibration: ${sensor.vibration}
Power: ${sensor.power}
Runtime: ${sensor.runtime}

Past failures:
${JSON.stringify(history)}

Explain why this machine is likely to fail in 2–3 clear technical lines.
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });

  return res.choices[0].message.content;
};
