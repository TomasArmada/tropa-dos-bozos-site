export default function Sobre({ dark = true }) {
    return (
        <div>
            <section
                className="w-full text-center px-6 py-24"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <span
                    className="text-xs font-mono-label uppercase px-3 py-1 rounded-full mb-6 inline-block"
                    style={{ color: "var(--accent)", background: "var(--accent-soft)", border: "1px solid var(--accent-soft-strong)" }}
                >
                    Sobre nós
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold mb-6" style={{ color: "var(--text)" }}>
                    O que é a <span style={{ color: "var(--accent)" }}>TROPA DOS BOZOS</span>?
                </h1>
                <p className="max-w-2xl mx-auto text-base" style={{ color: "var(--text-soft)" }}>
                    {/* TODO: escreve aqui a história do grupo — como e porque surgiu,
                    o que junta as pessoas e para que serve este site. */}
                    Este site nasceu para juntar num só sítio tudo o que a tropa precisa: saber
                    quem está disponível, conhecer todos os membros e manter-nos organizados.
                </p>
            </section>

            <section className="max-w-4xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div
                        className="p-6 rounded-lg"
                        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                    >
                        <h3 className="font-semibold mb-2" style={{ color: "var(--text)" }}>A ideia</h3>
                        <p className="text-sm" style={{ color: "var(--text-soft)" }}>
                            {/* TODO: explica o objetivo deste site */}
                            Organizar a malta num único lugar — saber disponibilidades e manter tudo
                            atualizado sem depender de mil conversas espalhadas.
                        </p>
                    </div>
                    <div
                        className="p-6 rounded-lg"
                        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                    >
                        <h3 className="font-semibold mb-2" style={{ color: "var(--text)" }}>Como funciona</h3>
                        <p className="text-sm" style={{ color: "var(--text-soft)" }}>
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
