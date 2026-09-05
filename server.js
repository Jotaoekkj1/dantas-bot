require("dotenv").config();

const express = require("express");
const multer = require("multer");
const {
    Client,
    GatewayIntentBits,
    AttachmentBuilder
} = require("discord.js");

const app = express();

const path = require("path");

app.use(express.static(path.join(__dirname, "site")));
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Apenas imagens são permitidas."));
        }

        cb(null, true);
    }
});

const bot = new Client({
    intents: [GatewayIntentBits.Guilds]
});

bot.once("ready", () => {
    console.log(`Bot conectado como ${bot.user.tag}`)
});

app.post("/enviar-foto", upload.single("foto"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                erro: "Nenhuma foto enviada."
            });
        }

        if (req.body.consentimento !== "sim") {
            return res.status(400).json({
                erro: "É necessário confirmar o consentimento."
            });
        }

        const canal = await bot.channels.fetch(
            process.env.CHANNEL_ID
        );

        const arquivo = new AttachmentBuilder(
            req.file.buffer,
            {
                name: "foto-camera.jpg"
            }
        );

        await canal.send({
            content: "📷 Foto enviada pelo site com consentimento.",
            files: [arquivo]
        });

        res.json({
            sucesso: true
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao enviar a foto."
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Servidor iniciado.");
});

bot.login(process.env.DISCORD_TOKEN);