// ============================================================
// db.js — Acesso à base de dados (Supabase)
// ============================================================
// Substitui os valores abaixo pelas tuas credenciais do Supabase:
// Settings → API → Project URL e anon public key
// ============================================================

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supabaseUrl = 'https://ejvxigmbesbcbyzlceau.supabase.co'
const supabaseKey = "sb_publishable_F5NGXD4ndySxhijGox3rFg_OlcCmLu3"
const supabase = createClient(supabaseUrl, supabaseKey)
// ------------------------------------------------------------
// Elementos do DOM
// ------------------------------------------------------------
const dbStatus   = document.getElementById("db-status");
const entriesList = document.getElementById("entries-list");

// ------------------------------------------------------------
// Verifica ligação e carrega entradas
// ------------------------------------------------------------
async function init() {
  try {
    // Testa a ligação buscando entradas da tabela "odios"
    const { data, error } = await supabase
      .from("odios")          // <- nome da tua tabela no Supabase
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    // Ligação OK
    dbStatus.textContent = "Ligado ✓";
    dbStatus.className   = "connected";

    // Renderiza as entradas
    renderEntries(data);

  } catch (err) {
    dbStatus.textContent = "Erro de ligação ✗";
    dbStatus.className   = "error";
    entriesList.innerHTML = `<div class="entry-card" style="color:#f87171;">
      Não foi possível ligar à base de dados.<br>
      <small style="color:#64748b;">Verifica o SUPABASE_URL e SUPABASE_KEY em db.js</small>
    </div>`;
    console.error("Supabase error:", err.message);
  }
}

// ------------------------------------------------------------
// Renderiza lista de entradas
// ------------------------------------------------------------
function renderEntries(entries) {
  if (!entries || entries.length === 0) {
    entriesList.innerHTML = `<div class="entry-card" style="color:#64748b;">
      Ainda não há entradas na base de dados.
    </div>`;
    return;
  }

  entriesList.innerHTML = entries
    .map(entry => `
      <div class="entry-card">
        <strong>${escapeHtml(entry.nome)}</strong>
        ${entry.motivo ? `— ${escapeHtml(entry.motivo)}` : ""}
        <div class="entry-date">${formatDate(entry.created_at)}</div>
      </div>
    `)
    .join("");
}

// ------------------------------------------------------------
// Adiciona nova entrada (chama esta função onde precisares)
// ------------------------------------------------------------
export async function addOdio(nome, motivo = "") {
  const { data, error } = await supabase
    .from("odios")
    .insert([{ nome, motivo }])
    .select();

  if (error) {
    console.error("Erro ao adicionar:", error.message);
    return null;
  }

  // Atualiza a lista na página
  await init();
  return data;
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Arranca
// ------------------------------------------------------------
init();