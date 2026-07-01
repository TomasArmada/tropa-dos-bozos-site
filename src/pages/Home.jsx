import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { CalendarDays, Users, Info, ArrowRight } from "lucide-react";

const FRASES = [
    { linha1: "Nyan cat virou transgenero?", linha2: "T0mada, 2026" },
    { linha1: "prova que pedofilia > violencia domestica", linha2: "karlpt, 2026" },
    { linha1: "Mano diz me qm n quer ser fdd pelo Martin Burger King, fogo deve ter 2 paes naquele cu mano", linha2: "Corsa, 2026" },
    { linha1: "i need boobies in my life", linha2: "LSC, 2026" },
];

function destacar(texto) {
    const partes = texto.split(/(TROPA(?: DOS BOZOS)?)/g);
    return partes.map((parte, i) =>
        parte.startsWith("TROPA") ? (
            <span key={i} style={{ color: "#ff6a1f" }}>
                {parte}
            </span>
        ) : (
            <span key={i}>{parte}</span>
        )
    );
}

const FEATURES = [
    {
        icon: CalendarDays,
        title: "Calendário partilhado",
        desc: "Marca as tuas disponibilidades e vê quando é que o resto da tropa está livre.",
        to: "/calendario",
    },
    {
        icon: Users,
        title: "Membros",
        desc: "Conhece quem faz parte disto — nomes, caras e uma descrição de cada um.",
        to: "/membros",
    },
    {
        icon: Info,
        title: "Sobre o projeto",
        desc: "Percebe porque é que isto existe e qual é a ideia por trás da TROPA DOS BOZOS.",
        to: "/sobre",
    },
];

export default function Home({ dark = true, isLoggedIn = false }) {
    const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);

    return (
        <div>
            {/* Hero */}
            <section
                className="w-full flex flex-col items-center text-center px-6 py-24"
                style={{
                    background: dark
                        ? "radial-gradient(circle at 50% 0%, #2a1810 0%, #16120f 60%)"
                        : "radial-gradient(circle at 50% 0%, #ffe4cc 0%, #fdfaf6 60%)",
                    transition: "background 1.2s ease",
                }}
            >
                <span
                    className="text-xs font-semibold px-3 py-1 rounded-full mb-6"
                    style={{
                        color: "#ff6a1f",
                        background: dark ? "rgba(255,106,31,0.12)" : "rgba(255,106,31,0.1)",
                        border: "1px solid rgba(255,106,31,0.3)",
                    }}
                >
                    ✨ O sítio oficial da TROPA DOS BOZOS
                </span>

                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl">
                    {destacar(frase.linha1)}
                    <br />
                    {destacar(frase.linha2)}
                </h1>

                <p className="mt-6 max-w-xl text-base opacity-70">
                    Marca disponibilidades no calendário, conhece a equipa e fica a par de tudo o que se passa por aqui.
                </p>

                <div className="mt-8 flex flex-wrap gap-4 justify-center">
                    <NavLink
                        to="/calendario"
                        className="flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-lg text-white transition-opacity hover:opacity-90"
                        style={{ background: "#ff6a1f" }}
                    >
                        Ver calendário <ArrowRight size={16} />
                    </NavLink>
                    <NavLink
                        to="/membros"
                        className="flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-lg transition-colors"
                        style={{
                            color: dark ? "#f5efe6" : "#1a140f",
                            border: `1px solid ${dark ? "#3a332c" : "#e2dacd"}`,
                        }}
                    >
                        Conhecer a equipa
                    </NavLink>
                </div>

                {!isLoggedIn && (
                    <p className="mt-6 text-xs opacity-50">
                        Algumas áreas (calendário e membros) só ficam visíveis depois de entrares na tua conta.
                    </p>
                )}
            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <span
                        className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{
                            color: dark ? "#f5efe6" : "#1a140f",
                            border: `1px solid ${dark ? "#3a332c" : "#e2dacd"}`,
                        }}
                    >
                        O que dá para fazer aqui
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold mt-5">
                        Tudo o que a <span style={{ color: "#ff6a1f" }}>tropa</span> precisa
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {FEATURES.map(({ icon: Icon, title, desc, to }) => (
                        <NavLink
                            key={title}
                            to={to}
                            className="p-6 rounded-xl transition-transform hover:-translate-y-1"
                            style={{
                                border: `1px solid ${dark ? "#2a2420" : "#ece5db"}`,
                                background: dark ? "#1c1712" : "#ffffff",
                            }}
                        >
                            <div
                                className="w-10 h-10 flex items-center justify-center rounded-lg mb-4"
                                style={{ background: "rgba(255,106,31,0.12)", color: "#ff6a1f" }}
                            >
                                <Icon size={20} />
                            </div>
                            <h3 className="font-bold mb-2">{title}</h3>
                            <p className="text-sm opacity-70">{desc}</p>
                        </NavLink>
                    ))}
                </div>
            </section>
        </div>
    );
}