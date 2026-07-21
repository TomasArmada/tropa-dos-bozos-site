import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { ChevronLeft, ChevronRight, Lock, Plus, Trash2 } from "lucide-react";

const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function toKey(d) {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

export default function Calendario({ dark = true, session = null, username = "" }) {
    const isLoggedIn = !!session;
    const [cursor, setCursor] = useState(() => {
        const d = new Date();
        d.setDate(1);
        return d;
    });
    const [marcacoes, setMarcacoes] = useState([]);
    const [selected, setSelected] = useState(null);
    const [nota, setNota] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isLoggedIn) return;
        loadMes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, cursor]);

    async function loadMes() {
        const inicio = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        const fim = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
        const { data, error } = await supabase
            .from("calendario_marcacoes")
            .select("id, user_id, username, data, nota")
            .gte("data", toKey(inicio))
            .lte("data", toKey(fim))
            .order("data", { ascending: true });

        if (error) {
            setError("Não foi possível carregar o calendário.");
            return;
        }
        setError(null);
        setMarcacoes(data || []);
    }

    const dias = useMemo(() => {
        const ano = cursor.getFullYear();
        const mes = cursor.getMonth();
        const primeiro = new Date(ano, mes, 1);
        const offset = (primeiro.getDay() + 6) % 7; // segunda = 0
        const totalDias = new Date(ano, mes + 1, 0).getDate();
        const celulas = [];
        for (let i = 0; i < offset; i++) celulas.push(null);
        for (let d = 1; d <= totalDias; d++) celulas.push(new Date(ano, mes, d));
        return celulas;
    }, [cursor]);

    function marcacoesDoDia(dateStr) {
        return marcacoes.filter((m) => m.data === dateStr);
    }

    async function adicionarMarcacao() {
        if (!selected || !nota.trim()) return;
        const { error } = await supabase.from("calendario_marcacoes").insert({
            user_id: session.user.id,
            username: username || session.user.email,
            data: selected,
            nota: nota.trim(),
        });
        if (error) {
            setError("Não foi possível marcar. Tenta novamente.");
            return;
        }
        setNota("");
        loadMes();
    }

    async function removerMarcacao(id) {
        const { error } = await supabase.from("calendario_marcacoes").delete().eq("id", id);
        if (!error) loadMes();
    }

    if (!isLoggedIn) {
        return (
            <div className="max-w-lg mx-auto px-6 py-24 text-center">
                <div
                    className="w-12 h-12 mx-auto flex items-center justify-center rounded-full mb-6"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                    <Lock size={19} />
                </div>
                <h1 className="text-xl font-semibold mb-3" style={{ color: "var(--text)" }}>Calendário reservado à tropa</h1>
                <p className="mb-8" style={{ color: "var(--text-soft)" }}>
                    Só quem tem sessão iniciada pode ver e marcar disponibilidades no calendário.
                </p>
                <a
                    href="/entrar"
                    className="inline-block px-5 py-2.5 rounded-md text-sm font-medium"
                    style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                >
                    Entrar
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--text)" }}>Calendário</h1>
            <p className="mb-8" style={{ color: "var(--text-soft)" }}>Marca os dias em que estás disponível para o resto da tropa ver.</p>

            {error && <p className="text-sm mb-4" style={{ color: "var(--danger)" }}>{error}</p>}

            <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} style={{ color: "var(--text-soft)" }}>
                    <ChevronLeft size={18} />
                </button>
                <h2 className="text-sm font-mono-label uppercase" style={{ color: "var(--text)" }}>
                    {MESES[cursor.getMonth()]} {cursor.getFullYear()}
                </h2>
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} style={{ color: "var(--text-soft)" }}>
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {DIAS_SEMANA.map((d) => (
                    <div key={d} className="text-center text-xs font-mono-label uppercase" style={{ color: "var(--text-faint)" }}>
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {dias.map((d, i) => {
                    if (!d) return <div key={`vazio-${i}`} />;
                    const key = toKey(d);
                    const marcs = marcacoesDoDia(key);
                    const isSelected = selected === key;
                    return (
                        <button
                            key={key}
                            onClick={() => setSelected(key)}
                            className="aspect-square rounded-md p-1.5 flex flex-col items-start text-left"
                            style={{
                                border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                                background: "var(--surface)",
                            }}
                        >
                            <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{d.getDate()}</span>
                            {marcs.length > 0 && (
                                <span
                                    className="mt-auto text-[10px] font-mono-label px-1.5 py-0.5 rounded"
                                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                                >
                                    {marcs.length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {selected && (
                <div
                    className="mt-8 p-5 rounded-lg"
                    style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                >
                    <h3 className="font-mono-label text-sm mb-4" style={{ color: "var(--text)" }}>{selected}</h3>

                    <ul className="flex flex-col gap-2 mb-5">
                        {marcacoesDoDia(selected).length === 0 && (
                            <p className="text-sm" style={{ color: "var(--text-faint)" }}>Ainda ninguém marcou disponibilidade.</p>
                        )}
                        {marcacoesDoDia(selected).map((m) => (
                            <li
                                key={m.id}
                                className="flex items-center justify-between text-sm px-3 py-2 rounded-md"
                                style={{ background: "var(--bg)" }}
                            >
                                <span style={{ color: "var(--text)" }}>
                                    <strong>{m.username}</strong> — {m.nota}
                                </span>
                                {m.user_id === session.user.id && (
                                    <button onClick={() => removerMarcacao(m.id)} style={{ color: "var(--text-faint)" }}>
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="flex gap-2">
                        <input
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            placeholder="Ex: Livre depois das 18h"
                            className="flex-1 px-4 py-2 rounded-md border text-sm"
                            style={{ borderColor: "var(--border-strong)", background: "var(--bg)", color: "var(--text)" }}
                        />
                        <button
                            onClick={adicionarMarcacao}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium"
                            style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                        >
                            <Plus size={14} /> Marcar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
