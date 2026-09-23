// server.js
// Backend simples em Node/Express que usa o yt-dlp para:
//   1) listar os formatos disponíveis de um link
//   2) fazer o download no formato escolhido e enviá-lo ao browser
//
// Pré-requisitos:
//   - Node.js instalado
//   - yt-dlp instalado e acessível no PATH (https://github.com/yt-dlp/yt-dlp#installation)
//   - ffmpeg instalado (necessário para o yt-dlp juntar/converter alguns formatos)
//
// Instalar dependências:
//   npm install express cors
//
// Correr:
//   node server.js

const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Caminho para o binário do yt-dlp. Por defeito assume que está no PATH,
// mas em produção (VPS/Docker) é mais seguro apontar explicitamente para
// o caminho absoluto via variável de ambiente, para não depender do PATH
// do processo que corre o Node (que pode ser diferente do teu PATH local).
//
// Descobre o caminho correndo no servidor: `which yt-dlp` (Linux/Mac)
// e define no .env: YT_DLP_PATH=/usr/local/bin/yt-dlp
const YT_DLP_PATH = process.env.YT_DLP_PATH || "yt-dlp";

// Caminho para o ffmpeg (opcional). Se o yt-dlp não conseguir encontrar o
// ffmpeg sozinho, define FFMPEG_PATH com a pasta onde está o ffmpeg.exe
// (ex: FFMPEG_PATH=C:\ffmpeg\bin) e passamo-lo explicitamente com
// --ffmpeg-location, evitando o mesmo tipo de problema de PATH que
// tivemos com o yt-dlp.
const FFMPEG_PATH = process.env.FFMPEG_PATH || null;

// No Windows, o spawn() do Node por vezes não resolve executáveis
// instalados via winget/pip (App Execution Aliases, shims, etc.) da
// mesma forma que o PowerShell/cmd resolvem. Usar shell:true faz o
// spawn correr o comando através da shell do sistema, tal como quando
// escreves "yt-dlp --version" manualmente no terminal.
const useShell = process.platform === "win32";

// --- Utilitário: corre o yt-dlp e devolve stdout/stderr numa Promise ---
function runYtDlp(args) {
    return new Promise((resolve, reject) => {
        const proc = spawn(YT_DLP_PATH, args, { shell: useShell });
        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (chunk) => (stdout += chunk.toString()));
        proc.stderr.on("data", (chunk) => (stderr += chunk.toString()));

        proc.on("error", (err) => {
            // Isto acontece tipicamente quando o yt-dlp não está no PATH do
            // servidor (ex: hosting serverless, ou PATH mal configurado).
            if (err.code === "ENOENT") {
                reject(
                    new Error(
                        `yt-dlp não foi encontrado (procurado em "${YT_DLP_PATH}"). ` +
                        `Confirma que está instalado no servidor e no PATH, ou define ` +
                        `a variável de ambiente YT_DLP_PATH com o caminho absoluto.`
                    )
                );
            } else {
                reject(err);
            }
        });
        proc.on("close", (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(stderr || `yt-dlp terminou com código ${code}`));
            }
        });
    });
}

// --- Rota 1: listar formatos disponíveis para um link ---
// GET /api/formats?url=https://...
app.get("/api/formats", async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: "Falta o parâmetro 'url'." });
    }

    try {
        // -J devolve metadados completos em JSON (inclui a lista "formats")
        const { stdout } = await runYtDlp(["-J", "--no-playlist", url]);
        const info = JSON.parse(stdout);

        const formats = (info.formats || [])
            // só interessa MP4 (vídeo, com ou sem áudio embutido) — WebM fica de fora
            .filter((f) => f.ext === "mp4" && f.vcodec !== "none")
            .filter((f) => f.filesize || f.filesize_approx)
            .map((f) => ({
                format_id: f.format_id,
                ext: f.ext,
                resolution: f.resolution || (f.height ? `${f.height}p` : ""),
                height: f.height || 0,
                note: f.format_note || "",
                filesize: f.filesize || f.filesize_approx || null,
                vcodec: f.vcodec,
                acodec: f.acodec,
            }))
            // mantém só a melhor opção por resolução (maior tamanho/qualidade)
            .reduce((best, f) => {
                const key = f.resolution;
                const current = best.get(key);
                if (!current || (f.filesize || 0) > (current.filesize || 0)) {
                    best.set(key, f);
                }
                return best;
            }, new Map());

        const formatList = Array.from(formats.values()).sort((a, b) => a.height - b.height);

        // Adiciona uma opção fixa de "só áudio", convertido para MP3 no momento
        // do download (o YouTube nunca fornece MP3 nativo, só WebM/M4A).
        formatList.push({
            format_id: "bestaudio_mp3",
            ext: "mp3",
            resolution: "áudio",
            height: 0,
            note: "",
            filesize: null,
            vcodec: "none",
            acodec: "mp3",
        });

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration,
            formats: formatList,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Rota 2: descarregar no formato escolhido e devolver o ficheiro ---
// GET /api/download?url=https://...&format_id=137&needs_audio=true
app.get("/api/download", async (req, res) => {
    const { url, format_id, needs_audio } = req.query;
    if (!url || !format_id) {
        return res.status(400).json({ error: "Faltam parâmetros 'url' e/ou 'format_id'." });
    }

    // Muitos formatos de alta resolução (1080p+) no YouTube vêm SEM áudio,
    // porque o vídeo e o áudio são entregues em streams separados. Se o
    // formato escolhido não tiver áudio, juntamos automaticamente o melhor
    // áudio disponível (o yt-dlp usa o ffmpeg para os fundir num só ficheiro).
    const formatArg = needs_audio === "true" ? `${format_id}+bestaudio/best` : format_id;

    // pasta temporária única para este download
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ytdlp-"));
    const outputTemplate = path.join(tmpDir, "%(title)s.%(ext)s");

    const args = [
        "-f", formatArg,
        "--no-playlist",
        "--merge-output-format", "mp4",
        "-o", outputTemplate,
    ];

    if (FFMPEG_PATH) {
        args.push("--ffmpeg-location", FFMPEG_PATH);
    }

    args.push(url);

    try {
        await runYtDlp(args);

        const files = fs.readdirSync(tmpDir);
        if (files.length === 0) {
            throw new Error("O yt-dlp não gerou nenhum ficheiro.");
        }

        const finalFile = path.join(tmpDir, files[0]);

        res.download(finalFile, files[0], (err) => {
            // limpa a pasta temporária depois de enviar (ou em caso de erro)
            fs.rm(tmpDir, { recursive: true, force: true }, () => {});
            if (err) console.error("Erro ao enviar ficheiro:", err);
        });
    } catch (err) {
        fs.rm(tmpDir, { recursive: true, force: true }, () => {});
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor yt-dlp a correr em http://localhost:${PORT}`);
});