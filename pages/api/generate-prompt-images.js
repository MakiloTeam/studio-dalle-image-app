import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

function stripHtml(input) {
  return input.replace(/<\/?[^>]+(>|$)/g, '');
}

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const n = parseInt(req.query.n);

  if (isNaN(n) || n < 1 || n > 10) {
    res.status(400).json({ error: "Invalid value for n." });
    return;
  }

  const body = JSON.parse(req.body);
  const prompt = stripHtml(body.prompt);
  if (!prompt) {
    res.status(400).json({ error: "Invalid value for prompt." });
    return;
  }

  try {
    const response = await openai.createImage({
      prompt,
      n,
      size: "1024x1024",
    });

    res.status(200).json(response.data);
    return;
  } catch (error) {
    if (error.response) {
      console.error(error.response.status);
      console.error(error.response.data);
      res.status(error.response.status).json({ error: error.response.data.error.message });
    } else if (error.message) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
    return;
  }
}

export default handler;
