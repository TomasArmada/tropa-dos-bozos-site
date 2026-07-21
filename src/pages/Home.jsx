import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
    CalendarDays,
    Users,
    Info,
    ArrowDown,
    MapPin,
    Megaphone,
    Plus,
    X,
    Image as ImageIcon,
} from "lucide-react";
import { supabase } from "../supabaseClient";

const FRASES = [
    { linha1: "Nyan cat virou transgenero?", linha2: "T0mada, 2026" },
    { linha1: "Mano diz me qm n quer ser fdd pelo Martin Burger King, fogo deve ter 2 paes naquele cu mano", linha2: "Corsa, 2026" },
    { linha1: "i need boobies in my life", linha2: "LSC, 2026" },
];

function destacar(texto) {
    const partes = texto.split(/(TROPA(?: DOS BOZOS)?)/g);
    return partes.map((parte, i) =>
        parte.startsWith("TROPA") ? (
            <span key={i} style={{ color: "var(--accent)" }}>
                {parte}
            </span>
        ) : (
            <span key={i}>{parte}</span>
        )
    );
}

const NAV_BOXES = [
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

// TODO: substitui estas caixas pelo que quiseres mostrar aqui (links, avisos, regras, o que for)
const EXTRA_BOXES = [
    {
        title: "Regras da casa",
        desc: "Um espaço para deixares as regras ou avisos importantes para a tropa.",
    },
    {
        title: "Links úteis",
        desc: "Grupo de WhatsApp, Discord, Drive partilhado — o que for preciso.",
    },
    {
        title: "Próximo evento",
        desc: "Destaca aqui o que aí vem: um jantar, uma saída, o que for.",
    },
];

const EMPTY_FORM = { titulo: "", conteudo: "", imagem_url: "" };

// isAdmin controla se o formulário de "nova notícia" aparece.
// Passa esta prop a partir de onde renderizas <Home /> (ex: com base no utilizador autenticado).
export default function Home({ dark = true, isLoggedIn = false, isAdmin = false }) {
    const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);

    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        loadPosts();
    }, []);

    async function loadPosts() {
        setPostsLoading(true);
        // NOTA: precisas de uma tabela "posts" no Supabase com colunas
        // "titulo" (texto), "conteudo" (texto), "imagem_url" (texto, opcional) e "created_at" (timestamp, automático).
        const { data, error } = await supabase
            .from("posts")
            .select("id, titulo, conteudo, imagem_url, created_at")
            .order("created_at", { ascending: false })
            .limit(6);

        setPostsLoading(false);
        if (error) {
            setPostsError("Não foi possível carregar as notícias.");
            return;
        }
        setPostsError(null);
        setPosts(data || []);
    }

    function formatarData(iso) {
        return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
    }

    function handleFormChange(field) {
        return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    }

    async function handleCreatePost(e) {
        e.preventDefault();
        if (!form.titulo.trim() || !form.conteudo.trim()) {
            setSubmitError("Preenche pelo menos o título e o conteúdo.");
            return;
        }

        setSubmitting(true);
        setSubmitError(null);

        const { error } = await supabase.from("posts").insert({
            titulo: form.titulo.trim(),
            conteudo: form.conteudo.trim(),
            imagem_url: form.imagem_url.trim() || null,
        });

        setSubmitting(false);

        if (error) {
            alert(JSON.stringify(error, null, 2));
            return;
        }

        setForm(EMPTY_FORM);
        setShowForm(false);
        loadPosts();
    }

    function scrollToConteudo() {
        document.getElementById("conteudo-principal")?.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <div>
            {/* Hero — ocupa o ecrã inteiro, é a única coisa visível ao entrar */}
            <section
                className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 relative pt-8"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <div className="w-full max-w-4xl flex flex-col md:flex-row items-center gap-10 md:gap-14">
                    <img
                        src="src/assets/bozos-logo-2.jpg"
                        alt="TROPA DOS BOZOS"
                        className="w-40 h-40 md:w-56 md:h-56 object-cover flex-shrink-0 rounded-3xl"
                        style={{
                            border: "6px solid white",
                            transform: "rotate(-5deg)",
                            boxShadow: "8px 8px 0 rgba(0,0,0,.35)",
                            imageRendering: "pixelated",
                        }}
                    />

                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <span
                            className="text-xs font-mono-label uppercase px-3 py-1 rounded-full mb-8"
                            style={{
                                color: "var(--accent)",
                                background: "var(--accent-soft)",
                                border: "1px solid var(--accent-soft-strong)",
                            }}
                        >
                            Website oficial da TROPA DOS BOZOS
                        </span>

                        <h1 className="text-4xl md:text-5xl font-semibold leading-tight" style={{ color: "var(--text)" }}>
                            {destacar(frase.linha1)}
                            <br />
                            <span style={{ color: "var(--text-soft)", fontWeight: 400 }}>{destacar(frase.linha2)}</span>
                        </h1>
                    </div>
                </div>

                <button
                    onClick={scrollToConteudo}
                    className="absolute left-1/2 -translate-x-1/2 bottom-4 md:bottom-8 flex flex-col items-center gap-2 text-xs font-mono-label uppercase"
                    style={{ color: "var(--text-faint)" }}
                    aria-label="Ver mais"
                >
                    ver mais
                    <ArrowDown size={16} className="animate-bounce" />
                </button>
            </section>

            <div id="conteudo-principal">
                {/* Navegação principal — zona própria com as boxes de acesso rápido */}
                <section className="max-w-5xl mx-auto px-6 py-20" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="mb-14">
                        <span className="text-xs font-mono-label uppercase" style={{ color: "var(--text-faint)" }}>
                            O que dá para fazer aqui
                        </span>
                        <h2 className="text-2xl md:text-3xl font-semibold mt-3" style={{ color: "var(--text)" }}>
                            Tudo o que a <span style={{ color: "var(--accent)" }}>tropa</span> precisa
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {NAV_BOXES.map(({ icon: Icon, title, desc, to }) => (
                            <NavLink
                                key={title}
                                to={to}
                                className="p-6 rounded-lg"
                                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                            >
                                <div
                                    className="w-9 h-9 flex items-center justify-center rounded-md mb-5"
                                    style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                                >
                                    <Icon size={17} />
                                </div>
                                <h3 className="font-semibold mb-1.5" style={{ color: "var(--text)" }}>{title}</h3>
                                <p className="text-sm" style={{ color: "var(--text-soft)" }}>{desc}</p>
                            </NavLink>
                        ))}
                    </div>
                </section>

                {/* Zona livre — caixas para o que quiseres destacar */}
                <section className="max-w-5xl mx-auto px-6 py-20" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="mb-14">
                        <span className="text-xs font-mono-label uppercase" style={{ color: "var(--text-faint)" }}>
                            Extras
                        </span>
                        <h2 className="text-2xl md:text-3xl font-semibold mt-3" style={{ color: "var(--text)" }}>
                            O resto do que é preciso saber
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {EXTRA_BOXES.map(({ title, desc }) => (
                            <div
                                key={title}
                                className="p-6 rounded-lg"
                                style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                            >
                                <h3 className="font-semibold mb-1.5" style={{ color: "var(--text)" }}>{title}</h3>
                                <p className="text-sm" style={{ color: "var(--text-soft)" }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Posts / notícias */}
                <section className="max-w-3xl mx-auto px-6 py-20">
                    <div className="mb-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-9 h-9 flex items-center justify-center rounded-md"
                                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                            >
                                <Megaphone size={17} />
                            </div>
                            <div>
                                <span className="text-xs font-mono-label uppercase" style={{ color: "var(--text-faint)" }}>
                                    Notícias
                                </span>
                                <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>O que se passa por aqui</h2>
                            </div>
                        </div>

                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setSubmitError(null);
                                    setShowForm((v) => !v);
                                }}
                                className="flex items-center gap-1.5 text-xs font-mono-label uppercase px-3 py-2 rounded-md flex-shrink-0"
                                style={{
                                    color: "var(--accent)",
                                    background: "var(--accent-soft)",
                                    border: "1px solid var(--accent-soft-strong)",
                                }}
                            >
                                {showForm ? <X size={14} /> : <Plus size={14} />}
                                {showForm ? "Cancelar" : "Nova notícia"}
                            </button>
                        )}
                    </div>

                    {isAdmin && showForm && (
                        <form
                            onSubmit={handleCreatePost}
                            className="p-5 rounded-lg mb-8 flex flex-col gap-3"
                            style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                        >
                            <div>
                                <label className="text-xs font-mono-label uppercase block mb-1.5" style={{ color: "var(--text-faint)" }}>
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={form.titulo}
                                    onChange={handleFormChange("titulo")}
                                    placeholder="Título da notícia"
                                    className="w-full px-3 py-2 rounded-md text-sm"
                                    style={{
                                        background: "var(--bg)",
                                        border: "1px solid var(--border)",
                                        color: "var(--text)",
                                    }}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-mono-label uppercase block mb-1.5" style={{ color: "var(--text-faint)" }}>
                                    Conteúdo
                                </label>
                                <textarea
                                    value={form.conteudo}
                                    onChange={handleFormChange("conteudo")}
                                    placeholder="Escreve aqui a notícia..."
                                    rows={4}
                                    className="w-full px-3 py-2 rounded-md text-sm resize-none"
                                    style={{
                                        background: "var(--bg)",
                                        border: "1px solid var(--border)",
                                        color: "var(--text)",
                                    }}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-mono-label uppercase mb-1.5 flex items-center gap-1.5" style={{ color: "var(--text-faint)" }}>
                                    <ImageIcon size={12} />
                                    Imagem (URL, opcional)
                                </label>
                                <input
                                    type="text"
                                    value={form.imagem_url}
                                    onChange={handleFormChange("imagem_url")}
                                    placeholder="https://..."
                                    className="w-full px-3 py-2 rounded-md text-sm"
                                    style={{
                                        background: "var(--bg)",
                                        border: "1px solid var(--border)",
                                        color: "var(--text)",
                                    }}
                                />
                            </div>

                            {submitError && (
                                <p className="text-sm" style={{ color: "var(--danger)" }}>{submitError}</p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="self-start text-xs font-mono-label uppercase px-4 py-2 rounded-md mt-1 disabled:opacity-50"
                                style={{ background: "var(--accent)", color: "var(--bg)" }}
                            >
                                {submitting ? "A publicar..." : "Publicar"}
                            </button>
                        </form>
                    )}

                    {postsLoading && (
                        <p className="text-sm" style={{ color: "var(--text-soft)" }}>A carregar...</p>
                    )}

                    {!postsLoading && postsError && (
                        <p className="text-sm" style={{ color: "var(--danger)" }}>{postsError}</p>
                    )}

                    {!postsLoading && !postsError && posts.length === 0 && (
                        <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                            Ainda não há nenhuma notícia publicada.
                        </p>
                    )}

                    {!postsLoading && !postsError && posts.length > 0 && (
                        <div className="flex flex-col gap-4">
                            {posts.map((post) => (
                                <NavLink
                                    key={post.id}
                                    to={`/noticias/${post.id}`}
                                    className="flex gap-4 p-4 rounded-lg items-start"
                                    style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
                                >
                                    {post.imagem_url && (
                                        <div
                                            className="w-24 h-24 rounded-md bg-cover bg-center flex-shrink-0"
                                            style={{ backgroundImage: `url(${post.imagem_url})` }}
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <h3 className="font-semibold" style={{ color: "var(--text)" }}>{post.titulo}</h3>
                                            <span className="text-xs font-mono-label whitespace-nowrap" style={{ color: "var(--text-faint)" }}>
                                                {formatarData(post.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-sm line-clamp-2" style={{ color: "var(--text-soft)" }}>{post.conteudo}</p>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    )}
                </section>

                {/* Mapa */}
                <section className="max-w-5xl mx-auto px-6 py-20" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="mb-10 flex items-center gap-3">
                        <div
                            className="w-9 h-9 flex items-center justify-center rounded-md"
                            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                        >
                            <MapPin size={17} />
                        </div>
                        <div>
                            <span className="text-xs font-mono-label uppercase" style={{ color: "var(--text-faint)" }}>
                                Localização
                            </span>
                            <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>Onde nos encontramos</h2>
                        </div>
                    </div>

                    <div
                        className="rounded-lg overflow-hidden"
                        style={{ border: "1px solid var(--border)" }}
                    >
                        <iframe
                            title="Mapa"
                            width="100%"
                            height="360"
                            style={{ border: 0, display: "block" }}
                            loading="lazy"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d586561.7636657406!2d-8.332320900000036!3d41.23667569999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2464faf074d469%3A0xda88b40e2efc763e!2sPorto!5e1!3m2!1spt-PT!2spt!4v1784635490933!5m2!1spt-PT!2spt"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}