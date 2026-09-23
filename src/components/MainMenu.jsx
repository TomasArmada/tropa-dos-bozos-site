import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogIn, UserPlus, Moon, Sun, Menu, X } from "lucide-react";

const LINKS = [
    { label: "Home", to: "/" },
    { label: "Calendário", to: "/calendario" },
    { label: "Membros", to: "/membros" },
    { label: "Sobre", to: "/sobre" },
    { label: "Downloads", to: "/downloads" },
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

    const linkColor = (isActive) => (isActive ? "var(--text)" : "var(--text-soft)");

    return (
        <nav
            className="w-full font-sans"
            style={{
                background: "var(--surface)",
                borderBottom: "1px solid var(--border)",
            }}
        >
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-1.5 select-none">
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: "var(--accent)" }}
                    />
                    <span className="font-semibold text-[15px] tracking-tight" style={{ color: "var(--text)" }}>
                        {brand} <span style={{ color: "var(--text-soft)", fontWeight: 400 }}>{brandAccent}</span>
                    </span>
                </NavLink>

                {/* Links - desktop */}
                <div className="hidden md:flex items-center gap-7">
                    {LINKS.map((link) => (
                        <NavLink
                            key={link.label}
                            to={link.to}
                            end={link.to === "/"}
                            className="relative text-sm font-medium pb-1"
                            style={({ isActive }) => ({ color: linkColor(isActive) })}
                        >
                            {({ isActive }) => (
                                <>
                                    {link.label}
                                    {isActive && (
                                        <span
                                            className="absolute left-0 right-0 -bottom-[1px] h-[1px]"
                                            style={{ background: "var(--accent)" }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                    {isLoggedIn && isAdmin && (
                        <NavLink
                            to="/admin"
                            className="relative text-sm font-medium pb-1"
                            style={({ isActive }) => ({ color: linkColor(isActive) })}
                        >
                            {({ isActive }) => (
                                <>
                                    Admin
                                    {isActive && (
                                        <span
                                            className="absolute left-0 right-0 -bottom-[1px] h-[1px]"
                                            style={{ background: "var(--accent)" }}
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    )}
                </div>

                {/* Right side - desktop */}
                <div className="hidden md:flex items-center gap-3">
                    <button
                        onClick={() => setDark((d) => !d)}
                        aria-label="Alternar tema"
                        className="w-8 h-8 flex items-center justify-center rounded-md"
                        style={{ color: "var(--text-soft)" }}
                    >
                        {dark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    {isLoggedIn ? (
                        <div className="flex items-center gap-3">
                            <span
                                className="text-xs font-mono-label uppercase"
                                style={{ color: "var(--text-soft)" }}
                            >
                                {userName}
                            </span>
                            <button
                                onClick={onLogout}
                                className="text-sm font-medium px-3.5 py-1.5 rounded-md"
                                style={{ color: "var(--text)", border: "1px solid var(--border-strong)" }}
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        <>
                            <NavLink
                                to="/entrar"
                                className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-md"
                                style={{ color: "var(--text)", border: "1px solid var(--border-strong)" }}
                            >
                                <LogIn size={14} />
                                Entrar
                            </NavLink>
                            <NavLink
                                to="/criar-conta"
                                className="flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-md"
                                style={{ background: "var(--accent)", color: "var(--accent-text)" }}
                            >
                                <UserPlus size={14} />
                                Criar conta
                            </NavLink>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden"
                    style={{ color: "var(--text)" }}
                    onClick={() => setMobileOpen((o) => !o)}
                    aria-label="Abrir menu"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div
                    className="md:hidden px-6 pb-5 flex flex-col gap-4"
                    style={{ borderTop: "1px solid var(--border)" }}
                >
                    {LINKS.map((link) => (
                        <NavLink
                            key={link.label}
                            to={link.to}
                            end={link.to === "/"}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm font-medium pt-3"
                            style={({ isActive }) => ({ color: linkColor(isActive) })}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    {isLoggedIn && isAdmin && (
                        <NavLink
                            to="/admin"
                            onClick={() => setMobileOpen(false)}
                            className="text-sm font-medium pt-3"
                            style={({ isActive }) => ({ color: linkColor(isActive) })}
                        >
                            Admin
                        </NavLink>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        {isLoggedIn ? (
                            <button
                                onClick={onLogout}
                                className="flex-1 text-sm font-medium px-4 py-2 rounded-md"
                                style={{ color: "var(--text)", border: "1px solid var(--border-strong)" }}
                            >
                                Sair
                            </button>
                        ) : (
                            <>
                                <NavLink
                                    to="/entrar"
                                    className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-md"
                                    style={{ color: "var(--text)", border: "1px solid var(--border-strong)" }}
                                >
                                    Entrar
                                </NavLink>
                                <NavLink
                                    to="/criar-conta"
                                    className="flex-1 text-center text-sm font-medium px-4 py-2 rounded-md"
                                    style={{ background: "var(--accent)", color: "var(--accent-text)" }}
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