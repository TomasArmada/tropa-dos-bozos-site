import { useState } from "react";
import { NavLink } from "react-router-dom";
import { UserPlus, RefreshCcw } from "lucide-react";
import { supabase, usernameToEmail } from "../supabaseClient";

function gerarDesafio() {
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 8) + 1;
    return { a, b, resposta: a + b };
}

export default function CriarConta({ dark = true }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [desafio, setDesafio] = useState(gerarDesafio);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    function novoDesafio() {
        setDesafio(gerarDesafio());
        setCaptchaInput("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        if (parseInt(captchaInput, 10) !== desafio.resposta) {
            setError("Resposta da verificação incorreta. Tenta outra vez.");
            novoDesafio();
            return;
        }

        setLoading(true);

        const cleanUsername = username.trim().toLowerCase();

        if (!/^[a-z0-9_.]{3,20}$/.test(cleanUsername)) {
            setError("Username inválido. Usa 3-20 caracteres: letras, números, '.' ou '_'.");
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email: usernameToEmail(cleanUsername),
            password,
            options: { data: { username: cleanUsername } },
        });

        setLoading(false);

        if (error) {
            if (error.message.toLowerCase().includes("already registered")) {
                setError("Esse username já está em uso.");
            } else {
                setError(error.message);
            }
            novoDesafio();
            return;
        }

        await supabase.auth.signOut();
        setDone(true);
    }

    if (done) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-semibold mb-4" style={{ color: "var(--text)" }}>Conta criada</h1>
                    <p className="text-base" style={{ color: "var(--text-soft)" }}>
                        A tua conta foi criada e está à espera de aprovação por um administrador.
                        Volta a tentar entrar mais tarde.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
            <div
                className="w-full max-w-md p-8 rounded-lg"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
            >
                <div
                    className="w-10 h-10 flex items-center justify-center rounded-md mb-6"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                    <UserPlus size={18} />
                </div>

                <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--text)" }}>Junta-te à tropa</h1>
                <p className="text-sm mb-8" style={{ color: "var(--text-soft)" }}>
                    A tua conta fica à espera de aprovação de um admin antes de conseguires entrar.
                </p>

                {error && <p className="mb-4 text-sm font-medium" style={{ color: "var(--danger)" }}>{error}</p>}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        className="px-4 py-2.5 rounded-md border text-sm"
                        style={{ borderColor: "var(--border-strong)", background: "var(--bg)", color: "var(--text)" }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Palavra-passe"
                        className="px-4 py-2.5 rounded-md border text-sm"
                        style={{ borderColor: "var(--border-strong)", background: "var(--bg)", color: "var(--text)" }}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                    />

                    <div
                        className="flex items-center gap-3 px-4 py-2.5 rounded-md"
                        style={{ border: "1px solid var(--border-strong)" }}
                    >
                        <span className="text-sm font-medium whitespace-nowrap" style={{ color: "var(--text)" }}>
                            Quanto é {desafio.a} + {desafio.b}?
                        </span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1 rounded border text-sm"
                            style={{ borderColor: "var(--border-strong)", background: "var(--bg)", color: "var(--text)" }}
                            required
                        />
                        <button
                            type="button"
                            onClick={novoDesafio}
                            aria-label="Nova pergunta"
                            style={{ color: "var(--text-soft)" }}
                        >
                            <RefreshCcw size={14} />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2.5 rounded-md font-medium text-sm disabled:opacity-60 mt-2"
                        style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                    >
                        {loading ? "A criar..." : "Criar conta"}
                    </button>
                </form>

                <p className="text-sm mt-6 text-center" style={{ color: "var(--text-soft)" }}>
                    Já tens conta?{" "}
                    <NavLink to="/entrar" style={{ color: "var(--accent)" }} className="font-medium">
                        Entra
                    </NavLink>
                </p>
            </div>
        </div>
    );
}
