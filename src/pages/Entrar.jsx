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
                    <LogIn size={20} />
                </div>

                <h1 className="text-2xl font-extrabold mb-1">Bem-vindo de volta</h1>
                <p className="text-sm opacity-60 mb-8">Entra para aceder ao calendário e aos membros.</p>

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
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2.5 rounded-lg text-white font-semibold text-sm disabled:opacity-60 mt-2"
                        style={{ background: "#ff6a1f" }}
                    >
                        {loading ? "A entrar..." : "Entrar"}
                    </button>
                </form>

                <p className="text-sm opacity-60 mt-6 text-center">
                    Ainda não tens conta?{" "}
                    <NavLink to="/criar-conta" style={{ color: "#ff6a1f" }} className="font-semibold">
                        Cria uma
                    </NavLink>
                </p>
            </div>
        </div>
    );
}