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
                    className="w-14 h-14 mx-auto flex items-center justify-center rounded-full mb-6"
                    style={{ background: "rgba(255,106,31,0.12)", color: "#ff6a1f" }}
                >
                    <Lock size={22} />
                </div>
                <h1 className="text-2xl font-extrabold mb-3">Calendário reservado à tropa</h1>
                <p className="opacity-70 mb-8">
                    Só quem tem sessão iniciada pode ver e marcar disponibilidades no calendário.
                </p>
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

    return (
        <div className="max-w-5xl mx-auto px-6 py-16">
            <h1 className="text-3xl font-extrabold mb-2">Calendário</h1>
            <p className="opacity-70 mb-8">Marca os dias em que estás disponível para o resto da tropa ver.</p>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
                    <ChevronLeft />
                </button>
                <h2 className="text-lg font-bold">
                    {MESES[cursor.getMonth()]} {cursor.getFullYear()}
                </h2>
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
                    <ChevronRight />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {DIAS_SEMANA.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold opacity-60">
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
                            className="aspect-square rounded-lg p-1.5 flex flex-col items-start text-left transition-colors"
                            style={{
                                border: `1px solid ${isSelected ? "#ff6a1f" : dark ? "#2a2420" : "#ece5db"}`,
                                background: dark ? "#1c1712" : "#ffffff",
                            }}
                        >
                            <span className="text-xs font-semibold">{d.getDate()}</span>
                            {marcs.length > 0 && (
                                <span
                                    className="mt-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                    style={{ background: "rgba(255,106,31,0.15)", color: "#ff6a1f" }}
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
                    className="mt-8 p-5 rounded-xl"
                    style={{ border: `1px solid ${dark ? "#2a2420" : "#ece5db"}`, background: dark ? "#1c1712" : "#ffffff" }}
                >
                    <h3 className="font-bold mb-4">{selected}</h3>

                    <ul className="flex flex-col gap-2 mb-5">
                        {marcacoesDoDia(selected).length === 0 && (
                            <p className="text-sm opacity-60">Ainda ninguém marcou disponibilidade.</p>
                        )}
                        {marcacoesDoDia(selected).map((m) => (
                            <li
                                key={m.id}
                                className="flex items-center justify-between text-sm px-3 py-2 rounded-lg"
                                style={{ background: dark ? "#16120f" : "#fdfaf6" }}
                            >
                                <span>
                                    <strong>{m.username}</strong> — {m.nota}
                                </span>
                                {m.user_id === session.user.id && (
                                    <button onClick={() => removerMarcacao(m.id)} className="opacity-60 hover:opacity-100">
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
                            className="flex-1 px-4 py-2 rounded-lg border text-sm"
                        />
                        <button
                            onClick={adicionarMarcacao}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                            style={{ background: "#ff6a1f" }}
                        >
                            <Plus size={14} /> Marcar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}