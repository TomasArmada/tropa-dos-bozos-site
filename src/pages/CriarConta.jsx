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
                    <h1 className="text-3xl font-extrabold mb-4">Conta criada</h1>
                    <p className="text-base opacity-80">
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
                className="w-full max-w-md p-8 rounded-2xl"
                style={{
                    border: `1px solid ${dark ? "#2a2420" : "#ece5db"}`,
                    background: dark ? "#1c1712" : "#ffffff",
                }}
            >
                <div
                    className="w-12 h-12 flex items-center justify-center rounded-xl mb-6"
                    style={{ background: "rgba(255,106,31,0.12)", color: "#ff6a1f" }}
                >
                    <UserPlus size={20} />
                </div>

                <h1 className="text-2xl font-extrabold mb-1">Junta-te à tropa</h1>
                <p className="text-sm opacity-60 mb-8">
                    A tua conta fica à espera de aprovação de um admin antes de conseguires entrar.
                </p>

                {error && <p className="mb-4 text-sm text-red-500 font-medium">{error}</p>}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        className="px-4 py-2.5 rounded-lg border text-sm"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Palavra-passe"
                        className="px-4 py-2.5 rounded-lg border text-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                    />

                    <div
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg"
                        style={{ border: `1px solid ${dark ? "#3a332c" : "#e2dacd"}` }}
                    >
                        <span className="text-sm font-semibold whitespace-nowrap">
                            Quanto é {desafio.a} + {desafio.b}?
                        </span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            className="flex-1 min-w-0 px-2 py-1 rounded border text-sm"
                            required
                        />
                        <button
                            type="button"
                            onClick={novoDesafio}
                            aria-label="Nova pergunta"
                            className="opacity-60 hover:opacity-100"
                        >
                            <RefreshCcw size={14} />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-60 mt-2"
                        style={{ background: "#ff6a1f" }}
                    >
                        {loading ? "A criar..." : "Criar conta"}
                    </button>
                </form>

                <p className="text-sm opacity-60 mt-6 text-center">
                    Já tens conta?{" "}
                    <NavLink to="/entrar" style={{ color: "#ff6a1f" }} className="font-semibold">
                        Entra
                    </NavLink>
                </p>
            </div>
        </div>
    );
}