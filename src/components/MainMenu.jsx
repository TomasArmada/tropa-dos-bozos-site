import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogIn, UserPlus, Moon, Sun, Menu, X } from "lucide-react";

const LINKS = [
    { label: "Home", to: "/" },
    { label: "Tarefas", to: "/tarefas" },
    { label: "Equipa", to: "/equipa" },
    { label: "Sobre", to: "/sobre" },
];

export default function MainMenu({
                                     brand = "MEU",
                                     brandAccent = "PROJETO",
                                     isLoggedIn = false,
                                     userName = "",
                                     isAdmin = false,
                                     onLogout = () => {},
                                     dark = true,
                                     setDark = () => {},
                                 }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const themeTransition = "color 1.2s ease, background 1.2s ease, border-color 1.2s ease";

    const linkColor = (isActive) =>
        isActive ? "#ff6a1f" : dark ? "#bdb3a6" : "#5c5247";

    return (
        <nav
            className="w-full font-sans"
            style={{
                background: dark ? "#16120f" : "#fdfaf6",
                borderBottom: `1px solid ${dark ? "#2a2420" : "#ece5db"}`,
                transition: "background 1.2s ease, border-color 1.2s ease",
            }}
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-0.5 select-none">
          <span className="font-extrabold text-lg tracking-tight" style={{ color: "#ff6a1f" }}>
            {brand}
          </span>
                    <span
                        className="font-extrabold text-lg tracking-tight"
                        style={{ color: dark ? "#f5efe6" : "#1a140f", transition: "color 1.2s ease" }}
                    >
            {brandAccent}
          </span>
                </NavLink>

                {/* Links - desktop */}
                <div className="hidden md:flex items-center gap-8">
                    {LINKS.map((link) => (
                        <NavLink
                            key={link.label}
                            to={link.to}
                            end={link.to === "/"}
                            className="relative text-sm font-medium pb-1 transition-colors"
                            style={({ isActive }) => ({ color: linkColor(isActive), transition: themeTransition })}
                        >
                            {({ isActive }) => (
                                <>
                                    {link.label}
                                    {isActive && (
                                        <span
                                            className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                                            style={{ background: "#ff6a1f" }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                    {isLoggedIn && isAdmin && (
                        <NavLink
                            to="/admin"
                            className="relative text-sm font-medium pb-1 transition-colors"
                            style={({ isActive }) => ({ color: linkColor(isActive), transition: themeTransition })}
                        >
                            {({ isActive }) => (
                                <>
                                    Admin
                                    {isActive && (
                                        <span
                                            className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full"
                                            style={{ background: "#ff6a1f" }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    )}
                </div>

                {/* Right side - desktop */}
                <div className="hidden md:flex items-center gap-4">
                    <button
                        onClick={() => setDark((d) => !d)}
                        aria-label="Alternar tema"
                        className="w-8 h-8 flex items-center justify-center rounded-md transition-colors"
                        style={{ color: dark ? "#bdb3a6" : "#5c5247", transition: "color 1.2s ease" }}
                    >
                        {dark ? <Sun size={17} /> : <Moon size={17} />}
                    </button>

                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
              <span
                  className="text-sm font-medium"
                  style={{ color: dark ? "#f5efe6" : "#1a140f", transition: themeTransition }}
              >
                {userName}
              </span>
                            <button
                                onClick={onLogout}
                                className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                style={{
                                    color: dark ? "#f5efe6" : "#1a140f",
                                    border: `1px solid ${dark ? "#3a332c" : "#e2dacd"}`,
                                    transition: themeTransition,
                                }}
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        <>
                            <NavLink
                                to="/entrar"
                                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                style={{
                                    color: dark ? "#f5efe6" : "#1a140f",
                                    border: `1px solid ${dark ? "#3a332c" : "#e2dacd"}`,
                                    transition: themeTransition,
                                }}
                            >
                                <LogIn size={15} />
                                Entrar
                            </NavLink>
                            <NavLink
                                to="/criar-conta"
                                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                                style={{ background: "#ff6a1f" }}
                            >
                                <UserPlus size={15} />
                                Criar conta
                            </NavLink>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden"
                    style={{ color: dark ? "#f5efe6" : "#1a140f", transition: themeTransition }}
                    onClick={() => setMobileOpen((o) => !o)}
                    aria-label="Abrir menu"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div
                    className="md:hidden px-6 pb-5 flex flex-col gap-4"
                    style={{ borderTop: `1px solid ${dark ? "#2a2420" : "#ece5db"}`, transition: themeTransition }}
                >
                    {LINKS.map((link) => (
                        <NavLink
                            key={link.label}
                            to={link.to}
                            end={link.to === "/"}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm font-medium pt-3"
                            style={({ isActive }) => ({ color: linkColor(isActive), transition: themeTransition })}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    {isLoggedIn && isAdmin && (
                        <NavLink
                            to="/admin"
                            onClick={() => setMobileOpen(false)}
                            className="text-sm font-medium pt-3"
                            style={({ isActive }) => ({ color: linkColor(isActive), transition: themeTransition })}
                        >
                            Admin
                        </NavLink>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        {isLoggedIn ? (
                            <button
                                onClick={onLogout}
                                className="flex-1 text-sm font-semibold px-4 py-2 rounded-lg"
                                style={{
                                    color: dark ? "#f5efe6" : "#1a140f",
                                    border: `1px solid ${dark ? "#3a332c" : "#e2dacd"}`,
                                    transition: themeTransition,
                                }}
                            >
                                Sair
                            </button>
                        ) : (
                            <>
                                <NavLink
                                    to="/entrar"
                                    className="flex-1 text-center text-sm font-semibold px-4 py-2 rounded-lg"
                                    style={{
                                        color: dark ? "#f5efe6" : "#1a140f",
                                        border: `1px solid ${dark ? "#3a332c" : "#e2dacd"}`,
                                        transition: themeTransition,
                                    }}
                                >
                                    Entrar
                                </NavLink>
                                <NavLink
                                    to="/criar-conta"
                                    className="flex-1 text-center text-sm font-semibold px-4 py-2 rounded-lg text-white"
                                    style={{ background: "#ff6a1f" }}
                                >
                                    Criar conta
                                </NavLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}