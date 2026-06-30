import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, usernameToEmail } from "../supabaseClient";

export default function Entrar() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const cleanUsername = username.trim().toLowerCase();

        const { data, error } = await supabase.auth.signInWithPassword({
            email: usernameToEmail(cleanUsername),
            password,
        });

        if (error) {
            setLoading(false);
            setError("Username ou palavra-passe incorretos.");
            return;
        }

        // Verifica se a conta já foi aprovada por um admin
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("approved")
            .eq("id", data.user.id)
            .single();

        setLoading(false);

        if (profileError || !profile) {
            setError("Não foi possível verificar a conta. Tenta novamente.");
            await supabase.auth.signOut();
            return;
        }

        if (!profile.approved) {
            setError("A tua conta ainda não foi aprovada por um administrador.");
            await supabase.auth.signOut();
            return;
        }

        navigate("/");
    }

    return (
        <div className="max-w-md mx-auto px-6 py-16">
            <h1 className="text-3xl font-extrabold mb-6">Entrar</h1>

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
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-60"
                    style={{ background: "#ff6a1f" }}
                >
                    {loading ? "A entrar..." : "Entrar"}
                </button>
            </form>
        </div>
    );
}