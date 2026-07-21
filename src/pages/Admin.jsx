import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Admin() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actingOn, setActingOn] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    async function loadProfiles() {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("id, username, approved, revoked, is_admin, created_at")
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
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id ?? null);
        });
        loadProfiles();
    }, []);

    async function updateProfile(id, changes) {
        setActingOn(id);
        const { error } = await supabase
            .from("profiles")
            .update(changes)
            .eq("id", id);
        setActingOn(null);

        if (error) {
            setError("Erro ao atualizar a conta.");
            return;
        }
        setError(null);
        loadProfiles();
    }

    function approve(id) {
        updateProfile(id, { approved: true, revoked: false });
    }

    function revokeAccess(id) {
        if (!window.confirm("Revogar o acesso desta conta? O utilizador deixa de conseguir entrar.")) {
            return;
        }
        updateProfile(id, { approved: false, revoked: true });
    }

    function readmit(id) {
        if (!window.confirm("Esta conta tinha o acesso revogado. Tens a certeza que queres readmiti-la?")) {
            return;
        }
        updateProfile(id, { approved: true, revoked: false });
    }

    function makeAdmin(id) {
        updateProfile(id, { is_admin: true });
    }

    function removeAdmin(id) {
        if (id === currentUserId) {
            if (!window.confirm("Vais remover os teus próprios privilégios de admin. Continuar?")) {
                return;
            }
        }
        updateProfile(id, { is_admin: false });
    }

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-6 py-16">
                <p style={{ color: "var(--text-soft)" }}>A carregar...</p>
            </div>
        );
    }

    const pendentes = profiles.filter((p) => !p.approved && !p.revoked);
    const revogados = profiles.filter((p) => !p.approved && p.revoked);
    const aprovados = profiles.filter((p) => p.approved);

    return (
        <div className="max-w-3xl mx-auto px-6 py-16">
            <h1 className="text-2xl font-semibold mb-8" style={{ color: "var(--text)" }}>Administração de contas</h1>

            {error && (
                <p className="mb-6 text-sm font-medium" style={{ color: "var(--danger)" }}>{error}</p>
            )}

            <h2 className="text-xs font-mono-label uppercase mb-4" style={{ color: "var(--text-faint)" }}>
                Pendentes ({pendentes.length})
            </h2>
            {pendentes.length === 0 && (
                <p className="mb-8" style={{ color: "var(--text-faint)" }}>Sem contas pendentes.</p>
            )}
            <ul className="flex flex-col gap-2 mb-10">
                {pendentes.map((p) => (
                    <li
                        key={p.id}
                        className="flex items-center justify-between px-4 py-3 rounded-md"
                        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                    >
                        <span className="font-medium" style={{ color: "var(--text)" }}>{p.username}</span>
                        <button
                            onClick={() => approve(p.id)}
                            disabled={actingOn === p.id}
                            className="px-4 py-1.5 rounded-md text-sm font-medium disabled:opacity-60"
                            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                        >
                            {actingOn === p.id ? "A aprovar..." : "Aprovar"}
                        </button>
                    </li>
                ))}
            </ul>

            <h2 className="text-xs font-mono-label uppercase mb-4" style={{ color: "var(--text-faint)" }}>
                Revogados ({revogados.length})
            </h2>
            {revogados.length === 0 && (
                <p className="mb-8" style={{ color: "var(--text-faint)" }}>Sem contas revogadas.</p>
            )}
            <ul className="flex flex-col gap-2 mb-10">
                {revogados.map((p) => (
                    <li
                        key={p.id}
                        className="flex items-center justify-between px-4 py-3 rounded-md gap-3 flex-wrap"
                        style={{ border: "1px solid var(--danger)", background: "var(--danger-soft)" }}
                    >
                        <div>
                            <span className="font-medium" style={{ color: "var(--text)" }}>{p.username}</span>
                            <p className="text-xs mt-0.5" style={{ color: "var(--danger)" }}>
                                Acesso revogado — readmitir só se tiveres a certeza.
                            </p>
                        </div>
                        <button
                            onClick={() => readmit(p.id)}
                            disabled={actingOn === p.id}
                            className="px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-60"
                            style={{ border: "1px solid var(--border-strong)", color: "var(--text)" }}
                        >
                            Readmitir
                        </button>
                    </li>
                ))}
            </ul>

            <h2 className="text-xs font-mono-label uppercase mb-4" style={{ color: "var(--text-faint)" }}>
                Aprovados ({aprovados.length})
            </h2>
            <ul className="flex flex-col gap-2">
                {aprovados.map((p) => (
                    <li
                        key={p.id}
                        className="flex items-center justify-between px-4 py-3 rounded-md gap-3 flex-wrap"
                        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                    >
                        <span className="font-medium" style={{ color: "var(--text)" }}>
                            {p.username} {p.is_admin && <span style={{ color: "var(--text-faint)" }}>· admin</span>}
                        </span>
                        <div className="flex items-center gap-2">
                            {p.is_admin ? (
                                <button
                                    onClick={() => removeAdmin(p.id)}
                                    disabled={actingOn === p.id}
                                    className="px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-60"
                                    style={{ border: "1px solid var(--border-strong)", color: "var(--text)" }}
                                >
                                    Remover admin
                                </button>
                            ) : (
                                <button
                                    onClick={() => makeAdmin(p.id)}
                                    disabled={actingOn === p.id}
                                    className="px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-60"
                                    style={{ border: "1px solid var(--border-strong)", color: "var(--text)" }}
                                >
                                    Tornar admin
                                </button>
                            )}
                            <button
                                onClick={() => revokeAccess(p.id)}
                                disabled={actingOn === p.id}
                                className="px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-60"
                                style={{ background: "var(--danger)", color: "#ffffff" }}
                            >
                                Revogar acesso
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
