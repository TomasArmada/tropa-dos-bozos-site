import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = 'https://ejvxigmbesbcbyzlceau.supabase.co'
const supabaseKey = "sb_publishable_F5NGXD4ndySxhijGox3rFg_OlcCmLu3"
const supabase = createClient(supabaseUrl, supabaseKey)

const dbStatus = document.getElementById("db-status");

async function init() {
  try {
    const { data, error } = await supabase
      .from("odios")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    dbStatus.textContent = "Ligado ✓";
    dbStatus.className   = "connected";

  } catch (err) {
    dbStatus.textContent = "Erro de ligação ✗";
    dbStatus.className   = "error";
    console.error("Supabase error:", err.message);
  }
}

export async function addOdio(nome, motivo = "") {
  const { data, error } = await supabase
    .from("odios")
    .insert([{ nome, motivo }])
    .select();

  if (error) {
    console.error("Erro ao adicionar:", error.message);
    return null;
  }

  return data;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

init();