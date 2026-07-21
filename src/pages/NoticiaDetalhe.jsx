import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "../supabaseClient";

export default function NoticiaDetalhe() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function load() {
        setLoading(true);
        const { data, error } = await supabase
            .from("posts")
            .select("id, titulo, conteudo, imagem_url, created_at")
            .eq("id", id)
            .single();
        setLoading(false);
        if (error || !data) {
            setError("Não foi possível encontrar esta notícia.");
            return;
        }
        setError(null);
        setPost(data);
    }

    function formatarData(iso) {
        return new Date(iso).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-16">
            <NavLink
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium mb-8"
                style={{ color: "var(--text-soft)" }}
            >
                <ArrowLeft size={15} /> Voltar
            </NavLink>

            {loading && <p className="text-sm" style={{ color: "var(--text-soft)" }}>A carregar...</p>}

            {!loading && error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

            {!loading && !error && post && (
                <article>
                    {post.imagem_url && (
                        <div
                            className="w-full rounded-lg bg-cover bg-center mb-8"
                            style={{ height: "280px", backgroundImage: `url(${post.imagem_url})` }}
                        />
                    )}

                    <span className="text-xs font-mono-label uppercase" style={{ color: "var(--text-faint)" }}>
                        {formatarData(post.created_at)}
                    </span>

                    <h1 className="text-3xl font-semibold mt-2 mb-6" style={{ color: "var(--text)" }}>
                        {post.titulo}
                    </h1>

                    <p className="text-base whitespace-pre-line leading-relaxed" style={{ color: "var(--text-soft)" }}>
                        {post.conteudo}
                    </p>
                </article>
            )}
        </div>
    );
}