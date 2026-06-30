import { useState } from "react";
import { supabase, usernameToEmail } from "../supabaseClient";

export default function CriarConta() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const cleanUsername = username.trim().toLowerCase();

        if (!/^[a-z0-9_.]{3,20}$/.test(cleanUsername)) {
            setError(
                "Username inválido. Usa 3-20 caracteres: letras, números, '.' ou '_'."
            );
            setLoading(false);
            return;
        }

        const { error } = await supabase.auth.signUp({
            email: usernameToEmail(cleanUsername),
            password,
            options: {
                data: { username: cleanUsername },
            },
        });

        setLoading(false);

        if (error) {
            // Supabase devolve erro de email duplicado quando o username já existe
            if (error.message.toLowerCase().includes("already registered")) {
                setError("Esse username já está em uso.");
            } else {
                setError(error.message);
            }
            return;
        }

        // A conta fica criada mas não aprovada (ver trigger no Supabase).
        // Não há login automático até um admin aprovar.
        await supabase.auth.signOut();
        setDone(true);
    }

    if (done) {
        return (
            <div className="max-w-md mx-auto px-6 py-16 text-center">
                <h1 className="text-3xl font-extrabold mb-4">Conta criada</h1>
                <p className="text-base opacity-80">
                    A tua conta foi criada e está à espera de aprovação por um
                    administrador. Volta a tentar entrar mais tarde.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto px-6 py-16">
            <h1 className="text-3xl font-extrabold mb-6">Criar conta</h1>

            {error && (
                <p className="mb-4 text-sm text-red-500 font-medium">{error}</p>
            )}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    className="px-4 py-2 rounded-lg border"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Palavra-passe"
                    className="px-4 py-2 rounded-lg border"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-60"
                    style={{ background: "#ff6a1f" }}
                >
                    {loading ? "A criar..." : "Criar conta"}
                </button>
            </form>
        </div>
    );
}