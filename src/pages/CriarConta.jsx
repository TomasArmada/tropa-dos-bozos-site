export default function CriarConta() {
  return (
        <div className="max-w-md mx-auto px-6 py-16">
          <h1 className="text-3xl font-extrabold mb-6">Criar conta</h1>
          <form className="flex flex-col gap-4">
            <input
                type="text"
                placeholder="Nome"
                className="px-4 py-2 rounded-lg border"
            />
            <input
                type="email"
                placeholder="Email"
                className="px-4 py-2 rounded-lg border"
            />
            <input
                type="password"
                placeholder="Palavra-passe"
                className="px-4 py-2 rounded-lg border"
            />
            <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white font-semibold"
                style={{ background: "#ff6a1f" }}
            >
              Criar conta
            </button>
          </form>
        </div>

  );
}
