const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const gTTS = require('gtts');

const app = express();
const upload = multer({ dest: 'uploads/' });

// YOUR API KEY IS NOW HARDCODED HERE
const genAI = new GoogleGenerativeAI("AIzaSyCh7RbtQA4YOHXCX5W-yNZ0xGCyts-AGbA");

app.use(express.json());

app.post('/process-audio', upload.single('audio'), async (req, res) => {
    try {
        console.log("Receiving audio...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const audioBuffer = fs.readFileSync(req.file.path);
        const part = {
            inlineData: {
                data: audioBuffer.toString("base64"),
                mimeType: "audio/wav" 
            }
        };

        const prompt = "You are NexaBOT. Reply to the user briefly and naturally.";
        const result = await model.generateContent([prompt, part]);
        const responseText = result.response.text();

        const gtts = new gTTS(responseText, 'en');
        const speechPath = path.join(__dirname, 'response.mp3');

        gtts.save(speechPath, function (err) {
            if (err) res.status(500).send("TTS Error");
            res.sendFile(speechPath);
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
});

app.get('/', (req, res) => res.send("NexaBOT Server is Online!"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
