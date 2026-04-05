import express from "express";
import axios from "axios";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---- AI CALL ----
async function callAI(prompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}

// ---- AGENTS ----
async function researchAgent(content) {
  return await callAI(`Clean and structure this content:\n${content}`);
}

async function summarizerAgent(content) {
  return await callAI(`Summarize into 5 bullets + short paragraph:\n${content}`);
}

async function insightAgent(content) {
  return await callAI(`Extract key insights + stats:\n${content}`);
}

async function infographicAgent(content) {
  return await callAI(`Create infographic outline:\n${content}`);
}

async function videoAgent(content) {
  return await callAI(`Create short video script:\n${content}`);
}

// ---- ORCHESTRATOR ----
async function runAgents(content) {
  const research = await researchAgent(content);

  const summary = await summarizerAgent(research);
  const insights = await insightAgent(research);
  const infographic = await infographicAgent(research);
  const video = await videoAgent(research);

  return { summary, insights, infographic, video };
}

// ---- URL EXTRACT ----
async function extractFromURL(url) {
  const res = await axios.get(`https://r.jina.ai/${url}`);
  return res.data;
}

// ---- API ----
app.post("/analyze", async (req, res) => {
  try {
    let { input } = req.body;

    if (input.startsWith("http")) {
      input = await extractFromURL(input);
    }

    const result = await runAgents(input);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => console.log("Server running"));