import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Lock, Pencil, Check, X } from "lucide-react";

export default function Membros({ dark = true, session = null }) {
    const isLoggedIn = !!session;
    const [membros, setMembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ nickname: "", photo_url: "", descricao: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) return;
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    async function load() {
        setLoading(true);
        const { data, error } = await supabase
            .from("profiles")
            .select("id, username, nickname, photo_url, descricao")
            .eq("approved", true)
            .order("username", { ascending: true });
        setLoading(false);
        if (error) {
            setError("Não foi possível carregar os membros.");
            return;
        }
        setMembros(data || []);
    }

    function startEdit(m) {
        setEditId(m.id);
        setForm({
            nickname: m.nickname || "",
            photo_url: m.photo_url || "",
            descricao: m.descricao || "",
        });
    }

    async function saveEdit(id) {
        setSaving(true);
        const { error } = await supabase.from("profiles").update(form).eq("id", id);
        setSaving(false);
        if (error) {
            setError("Não foi possível guardar as alterações.");
            return;
        }
        setEditId(null);
        load();
    }

    if (!isLoggedIn) {
        return (
            <div className="max-w-lg mx-auto px-6 py-24 text-center">
                <div
                    className="w-14 h-14 mx-auto flex items-center justify-center rounded-full mb-6"
                    style={{ background: "rgba(255,106,31,0.12)", color: "#ff6a1f" }}
                >
                    <Lock size={22} />
                </div>
                <h1 className="text-2xl font-extrabold mb-3">Membros reservados à tropa</h1>
                <p className="opacity-70 mb-8">Só quem tem sessão iniciada consegue ver quem faz parte disto.</p>
                <a
                    href="/entrar"
                    className="inline-block px-5 py-3 rounded-lg text-sm font-semibold text-white"
                    style={{ background: "#ff6a1f" }}
                >
                    Entrar
                </a>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto px-6 py-16">
                <p>A carregar...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-extrabold mb-2">Membros</h1>
            <p className="opacity-70 mb-10">Conhece quem faz parte da TROPA DOS BOZOS.</p>

            {error && <p className="text-sm text-red-500 mb-6">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {membros.map((m) => {
                    const isMe = m.id === session.user.id;
                    const isEditing = editId === m.id;
                    return (
                        <div
                            key={m.id}
                            className="p-5 rounded-xl flex flex-col"
                            style={{ border: `1px solid ${dark ? "#2a2420" : "#ece5db"}`, background: dark ? "#1c1712" : "#ffffff" }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-14 h-14 rounded-full bg-cover bg-center flex-shrink-0"
                                    style={{
                                        backgroundImage: `url(${isEditing ? form.photo_url : m.photo_url || ""})`,
                                        background: (isEditing ? form.photo_url : m.photo_url) ? undefined : "rgba(255,106,31,0.15)",
                                    }}
                                />
                                <div className="flex-1">
                                    {isEditing ? (
                                        <input
                                            value={form.nickname}
                                            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                                            placeholder="Nickname"
                                            className="px-2 py-1 rounded border text-sm font-bold w-full"
                                        />
                                    ) : (
                                        <p className="font-bold">{m.nickname || m.username}</p>
                                    )}
                                    <p className="text-xs opacity-60">{m.username}</p>
                                </div>
                            </div>

                            {isEditing ? (
                                <>
                                    <input
                                        value={form.photo_url}
                                        onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                                        placeholder="URL da foto"
                                        className="px-2 py-1.5 rounded border text-xs mb-2"
                                    />
                                    <textarea
                                        value={form.descricao}
                                        onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                        placeholder="Uma descrição curta sobre ti..."
                                        rows={3}
                                        className="px-2 py-1.5 rounded border text-xs mb-3"
                                    />
                                    <div className="flex gap-2 mt-auto">
                                        <button
                                            onClick={() => saveEdit(m.id)}
                                            disabled={saving}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                                            style={{ background: "#ff6a1f" }}
                                        >
                                            <Check size={13} /> Guardar
                                        </button>
                                        <button onClick={() => setEditId(null)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border">
                                            <X size={13} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm opacity-70 mb-4 flex-1">{m.descricao || "Ainda sem descrição."}</p>
                                    {isMe && (
                                        <button
                                            onClick={() => startEdit(m)}
                                            className="self-start flex items-center gap-1 text-xs font-semibold opacity-70 hover:opacity-100"
                                        >
                                            <Pencil size={12} /> Editar o meu perfil
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}