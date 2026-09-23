import { useState } from "react";
import { Download, Search, Loader2 } from "lucide-react";

// Em dev local: http://localhost:3001
// Em produção: define VITE_API_URL no .env (ex: https://ytdlp-backend.xxx.workers.dev)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function YtDlpDownloader() {
    const [url, setUrl] = useState("");
    const [videoInfo, setVideoInfo] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState("");
    const [status, setStatus] = useState("idle"); // idle | loading-formats | ready | downloading | error
    const [errorMsg, setErrorMsg] = useState("");

    async function handleFetchFormats(e) {
        e.preventDefault();
        if (!url.trim()) return;

        setStatus("loading-formats");
        setErrorMsg("");
        setVideoInfo(null);
        setSelectedFormat("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/formats?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao obter formatos.");

            setVideoInfo(data);
            if (data.formats.length > 0) setSelectedFormat(data.formats[0].format_id);
            setStatus("ready");
        } catch (err) {
            setErrorMsg(err.message);
            setStatus("error");
        }
    }

    async function handleDownload() {
        if (!selectedFormat) return;
        setStatus("downloading");
        setErrorMsg("");

        try {
            const downloadUrl = `${API_BASE_URL}/api/download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(selectedFormat)}`;
            const res = await fetch(downloadUrl);
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "Erro ao descarregar.");
            }

            const blob = await res.blob();
            const disposition = res.headers.get("Content-Disposition") || "";
            const match = disposition.match(/filename="?(.+?)"?$/);
            const filename = match ? match[1] : "video";

            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);

            setStatus("ready");
        } catch (err) {
            setErrorMsg(err.message);
            setStatus("error");
        }
    }

    function formatSize(bytes) {
        if (!bytes) return "";
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return (
        <div className="w-full max-w-xl mx-auto font-sans">
            <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--text)" }}>
                Descarregar vídeo
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-soft)" }}>
                Cola o link, escolhe o formato e descarrega.
            </p>

            <form onSubmit={handleFetchFormats} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    inputMode="url"
                    placeholder="Cola aqui o link do vídeo..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 text-sm px-3.5 py-2.5 rounded-md outline-none"
                    style={{
                        background: "var(--surface)",
                        color: "var(--text)",
                        border: "1px solid var(--border-strong)",
                    }}
                />
                <button
                    type="submit"
                    disabled={status === "loading-formats" || !url.trim()}
                    className="flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-md disabled:opacity-50"
                    style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                >
                    {status === "loading-formats" ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : (
                        <Search size={15} />
                    )}
                    Procurar
                </button>
            </form>

            {status === "error" && (
                <p className="text-sm mt-3" style={{ color: "#e05d5d" }}>
                    {errorMsg}
                </p>
            )}

            {videoInfo && (
                <div
                    className="mt-5 p-4 rounded-lg flex flex-col gap-4"
                    style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                >
                    <div className="flex items-center gap-3">
                        {videoInfo.thumbnail && (
                            <img
                                src={videoInfo.thumbnail}
                                alt={videoInfo.title}
                                className="w-20 sm:w-24 rounded-md shrink-0 object-cover"
                            />
                        )}
                        <p className="text-sm font-medium line-clamp-2" style={{ color: "var(--text)" }}>
                            {videoInfo.title}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs uppercase font-mono-label" style={{ color: "var(--text-soft)" }}>
                            Formato
                        </label>
                        <select
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value)}
                            className="text-sm px-3 py-2 rounded-md outline-none"
                            style={{
                                background: "var(--surface)",
                                color: "var(--text)",
                                border: "1px solid var(--border-strong)",
                            }}
                        >
                            {videoInfo.formats.map((f) => (
                                <option key={f.format_id} value={f.format_id}>
                                    {f.ext.toUpperCase()} · {f.resolution}
                                    {f.note ? ` · ${f.note}` : ""}
                                    {f.filesize ? ` · ${formatSize(f.filesize)}` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleDownload}
                        disabled={status === "downloading" || !selectedFormat}
                        className="flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-md disabled:opacity-50"
                        style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                    >
                        {status === "downloading" ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <Download size={15} />
                        )}
                        {status === "downloading" ? "A descarregar..." : "Descarregar"}
                    </button>
                </div>
            )}
        </div>
    );
}
