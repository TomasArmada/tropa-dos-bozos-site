import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { LogIn } from "lucide-react";
import { supabase, usernameToEmail } from "../supabaseClient";

export default function Entrar({ dark = true }) {
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
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
            <div
                className="w-full max-w-md p-8 rounded-lg"
                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
            >
                <div
                    className="w-10 h-10 flex items-center justify-center rounded-md mb-6"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                    <LogIn size={18} />
                </div>

                <h1 className="text-xl font-semibold mb-1" style={{ color: "var(--text)" }}>Bem-vindo de volta</h1>
                <p className="text-sm mb-8" style={{ color: "var(--text-soft)" }}>Entra para aceder ao calendário e aos membros.</p>

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
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2.5 rounded-md font-medium text-sm disabled:opacity-60 mt-2"
                        style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                    >
                        {loading ? "A entrar..." : "Entrar"}
                    </button>
                </form>

                <p className="text-sm mt-6 text-center" style={{ color: "var(--text-soft)" }}>
                    Ainda não tens conta?{" "}
                    <NavLink to="/criar-conta" style={{ color: "var(--accent)" }} className="font-medium">
                        Cria uma
                    </NavLink>
                </p>
            </div>
        </div>
    );
}
