
require("dotenv").config();

const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(express.json());

app.post("/api/artist", async (req, res) => {
    const artistName = req.body.artistName;

    if (!artistName || !artistName.trim()) {
        return res.status(400).json({
            message: "Please enter an artist name."
        });
    }

    try {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            throw new Error("Groq API key is missing.");
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",
                    messages: [
                        {
                            role: "system",
                            content: `You are BONGO MUSIC AI, an assistant specializing in Tanzanian music.

Provide:
1. Short artist biography and history.
2. Popular songs.
3. Music genre.
4. Albums.

Answer in both Kiswahili and English.
Be accurate. Never invent songs, albums, dates or facts.
If information is uncertain, clearly say so.`
                        },
                        {
                            role: "user",
                            content: `Tell me about Tanzanian artist: ${artistName}`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }

        res.json({
            artist: artistName,
            message: data.choices[0].message.content
        });

    } catch (error) {
        console.error("Groq Error:", error.message);

        res.status(500).json({
            artist: artistName,
            message: "Sorry, BONGO MUSIC AI could not get information right now. Please try again."
        });
    }
});

app.listen(PORT, () => {
    console.log(`BONGO MUSIC AI is running on http://localhost:${PORT}`);
});
