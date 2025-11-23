require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Sheet = require('./models/Sheet');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// 2. Setup Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  // We force the AI to respond in JSON format
  generationConfig: { responseMimeType: "application/json" }
});

// --- ROUTES ---

app.get('/api/sheet', async (req, res) => {
  try {
    let sheet = await Sheet.findOne();
    if (!sheet) {
      const defaultData = Array(10).fill().map(() => Array(10).fill(''));
      sheet = await Sheet.create({ data: defaultData });
    }
    res.json(sheet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sheet', async (req, res) => {
  try {
    const { data } = req.body;
    await Sheet.findOneAndUpdate({}, { data }, { upsert: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GEMINI CHAT LOGIC ---
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  const userMessage = messages[messages.length - 1].content;

  try {
    // We construct a specific prompt to ensure Gemini gives us the JSON we need
    const prompt = `
      You are an Excel AI helper.
      The user will ask to edit a spreadsheet.
      Column A is index 0. Row 1 is index 0.
      
      You must respond with a JSON object.
      
      If the user wants to update a cell, return this JSON:
      { "operation": "UPDATE_CELL", "row": 0, "col": 0, "value": "some value" }
      
      If the user wants a formula, return this JSON (start formula with =):
      { "operation": "SET_FORMULA", "row": 0, "col": 0, "value": "=SUM(A:A)" }
      
      If it is just a question, return:
      { "operation": "NONE", "reply": "your text answer" }

      User Request: "${userMessage}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("Gemini Raw Response:", responseText);

    // Parse the JSON string from Gemini
    const aiAction = JSON.parse(responseText);

    if (aiAction.operation === "NONE") {
        return res.json({ reply: aiAction.reply, action: null });
    } else {
        return res.json({ 
            reply: "Updating sheet...", 
            action: aiAction 
        });
    }

  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "AI Processing Failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));