import Groq from "groq-sdk";

let groqClient;
const getGroqClient = () => {
  if (groqClient) return groqClient;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || String(apiKey).trim().length === 0) {
    throw new Error(
      "Missing GROQ_API_KEY. Set it in your environment before calling generateExplanation()."
    );
  }
  groqClient = new Groq({ apiKey });
  return groqClient;
};

export const generateExplanation = async (sensor, failureHistory) => {
  const buildHistoryText = (history) => {
    if (history == null) return "No previous failures recorded.";

    // `getFailureHistory()` currently returns a formatted string.
    if (typeof history === "string") {
      const trimmed = history.trim();
      return trimmed.length > 0 ? trimmed : "No previous failures recorded.";
    }

    // Support array forms in case callers pass raw failure objects.
    if (Array.isArray(history)) {
      if (history.length === 0) return "No previous failures recorded.";

      return history
        .map((f) => {
          const date = f?.date ?? f?.createdAt ?? "unknown";
          const issue = f?.subject ?? f?.issue ?? "unknown";
          const downtime = f?.duration ?? f?.downtime ?? "unknown";
          return `Date: ${date}, Issue: ${issue}, Downtime: ${downtime} hours`;
        })
        .join("\n");
    }

    // Sometimes history might be an object wrapper (e.g. { failures: [...] }).
    if (typeof history === "object" && Array.isArray(history.failures)) {
      return buildHistoryText(history.failures);
    }

    return "No previous failures recorded.";
  };

  const historyText = buildHistoryText(failureHistory);

  const prompt = `
You are a senior industrial maintenance engineer.

Live sensor readings:
Temperature: ${sensor.temperature}
Vibration: ${sensor.vibration}
Power usage: ${sensor.power}
Runtime hours: ${sensor.runtime}

Historical maintenance records:
${historyText}

Based on the sensor data and historical failures:
1. Identify the most likely component at risk.
2. Explain technically why failure is likely.
3. Suggest what maintenance should be done.

Respond in 2–4 clear, professional lines.
`;

  const response = await getGroqClient().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.25
  });

  return response.choices[0].message.content;
};
