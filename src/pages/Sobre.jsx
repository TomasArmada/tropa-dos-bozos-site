export default function Sobre({ dark = true }) {
    return (
        <div>
            <section
                className="w-full text-center px-6 py-24"
                style={{
                    background: dark
                        ? "radial-gradient(circle at 50% 0%, #2a1810 0%, #16120f 60%)"
                        : "radial-gradient(circle at 50% 0%, #ffe4cc 0%, #fdfaf6 60%)",
                    transition: "background 1.2s ease",
                }}
            >
                <span
                    className="text-xs font-semibold px-3 py-1 rounded-full mb-6 inline-block"
                    style={{ color: "#ff6a1f", border: "1px solid rgba(255,106,31,0.3)", background: "rgba(255,106,31,0.1)" }}
                >
                    Sobre nós
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                    O que é a <span style={{ color: "#ff6a1f" }}>TROPA DOS BOZOS</span>?
                </h1>
                <p className="max-w-2xl mx-auto text-base opacity-70">
                    {/* TODO: escreve aqui a história do grupo — como e porque surgiu,
                    o que junta as pessoas e para que serve este site. */}
                    Este site nasceu para juntar num só sítio tudo o que a tropa precisa: saber
                    quem está disponível, conhecer todos os membros e manter-nos organizados.
                </p>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        className="p-6 rounded-xl"
                        style={{ border: `1px solid ${dark ? "#2a2420" : "#ece5db"}`, background: dark ? "#1c1712" : "#ffffff" }}
                    >
                        <h3 className="font-bold mb-2">A ideia</h3>
                        <p className="text-sm opacity-70">
                            {/* TODO: explica o objetivo deste site */}
                            Organizar a malta num único lugar — saber disponibilidades e manter tudo
                            atualizado sem depender de mil conversas espalhadas.
                        </p>
                    </div>
                    <div
                        className="p-6 rounded-xl"
                        style={{ border: `1px solid ${dark ? "#2a2420" : "#ece5db"}`, background: dark ? "#1c1712" : "#ffffff" }}
                    >
                        <h3 className="font-bold mb-2">Como funciona</h3>
                        <p className="text-sm opacity-70">
                            {/* TODO: explica como usar o calendário, os membros, etc. */}
                            Cria a tua conta, espera pela aprovação de um admin e depois usa o
                            calendário para marcares disponibilidade e a página de membros para
                            conheceres o resto da tropa.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}