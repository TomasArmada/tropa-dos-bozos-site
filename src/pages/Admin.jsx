import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Admin() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actingOn, setActingOn] = useState(null);

    async function loadProfiles() {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("id, username, approved, is_admin, created_at")
            .order("created_at", { ascending: false });

        setLoading(false);

        if (error) {
            // Erro mais provável: o utilizador atual não é admin (RLS bloqueia)
            setError(
                "Não foi possível carregar as contas. Confirma que tens permissões de administrador."
            );
            return;
        }

        setProfiles(data);
    }

    useEffect(() => {
        loadProfiles();
    }, []);

    async function approve(id) {
        setActingOn(id);
        const { error } = await supabase
            .from("profiles")
            .update({ approved: true })
            .eq("id", id);
        setActingOn(null);

        if (error) {
            setError("Erro ao aprovar a conta.");
            return;
        }
        loadProfiles();
    }

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16">
                <p>A carregar...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16">
                <p className="text-red-500 font-medium">{error}</p>
            </div>
        );
    }

    const pendentes = profiles.filter((p) => !p.approved);
    const aprovados = profiles.filter((p) => p.approved);

    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-extrabold mb-8">Administração de contas</h1>

            <h2 className="text-xl font-bold mb-4">
                Pendentes ({pendentes.length})
            </h2>
            {pendentes.length === 0 && (
                <p className="opacity-70 mb-8">Sem contas pendentes.</p>
            )}
            <ul className="flex flex-col gap-3 mb-10">
                {pendentes.map((p) => (
                    <li
                        key={p.id}
                        className="flex items-center justify-between px-4 py-3 rounded-lg border"
                    >
                        <span className="font-medium">{p.username}</span>
                        <button
                            onClick={() => approve(p.id)}
                            disabled={actingOn === p.id}
                            className="px-4 py-1.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
                            style={{ background: "#ff6a1f" }}
                        >
                            {actingOn === p.id ? "A aprovar..." : "Aprovar"}
                        </button>
                    </li>
                ))}
            </ul>

            <h2 className="text-xl font-bold mb-4">
                Aprovados ({aprovados.length})
            </h2>
            <ul className="flex flex-col gap-2">
                {aprovados.map((p) => (
                    <li key={p.id} className="px-4 py-2 rounded-lg border opacity-70">
                        {p.username} {p.is_admin && "· admin"}
                    </li>
                ))}
            </ul>
        </div>
    );
}