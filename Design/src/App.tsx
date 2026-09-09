import { useState } from "react";
import Projetos from "./pages/Projetos";
import Producao from "./pages/Producao";
import Relatorios from "./pages/Relatorios";
import Colaboradores from "./pages/Colaboradores";
import Receitas from "./pages/Receitas";
import Dashboard from "./pages/Dashboard";


const navItems = [
  {
    label: "Página Inicial",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 7.5L9 2L16 7.5V16H11.5V11.5H6.5V16H2V7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "Projetos",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Produção",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 5V9L12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Relatórios",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="2" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 7H12M6 10H10M6 13H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Colaboradores",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 16C1 13.2386 3.23858 11 6 11H8C10.7614 11 13 13.2386 13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 6C13 4.89543 13.8954 4 15 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 11C15.6569 11 17 12.3431 17 14V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Receitas",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 3H15V5C15 9.4183 12.3137 13 9 13C5.68629 13 3 9.4183 3 5V3Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 16H12M9 13V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];


export default function App() {
  const [activeNav, setActiveNav] = useState("Página Inicial");
  const [collapsed, setCollapsed] = useState(false);

  const sidebarW = collapsed ? 56 : 220;

  return (
    <div style={{ display: "flex", height: "100%", background: "#F4F5F7", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarW,
        minWidth: sidebarW,
        background: "#0052CC",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.22s cubic-bezier(.4,0,.2,1), min-width 0.22s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        zIndex: 200,
        boxShadow: "2px 0 8px rgba(0,0,0,0.18)",
      }}>
        {/* Logo area */}
        <div style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: collapsed ? "0 16px" : "0 16px",
          gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          <div style={{
            width: 28, height: 28, background: "#fff", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="#0052CC"/>
              <rect x="9" y="1" width="6" height="6" rx="1" fill="#0052CC"/>
              <rect x="1" y="9" width="6" height="6" rx="1" fill="#0052CC"/>
              <rect x="9" y="9" width="6" height="6" rx="1" fill="#0052CC" opacity="0.35"/>
            </svg>
          </div>
          {!collapsed && (
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis" }}>
              Controle de<br/>
              <span style={{ fontWeight: 400, opacity: 0.85 }}>Produção</span>
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", overflowX: "hidden" }}>
          {navItems.map(item => {
            const active = activeNav === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: collapsed ? "10px 0" : "10px 12px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: active ? "rgba(255,255,255,0.18)" : "transparent",
                  border: "none",
                  borderRadius: 6,
                  color: active ? "#fff" : "rgba(255,255,255,0.75)",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  width: "100%",
                  transition: "background 0.14s, color 0.14s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  position: "relative",
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                {/* Active pill */}
                {active && (
                  <span style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: 20, background: "#fff", borderRadius: "0 3px 3px 0",
                  }} />
                )}
                <span style={{ flexShrink: 0, display: "flex" }}>{item.icon}</span>
                {!collapsed && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom section: user + collapse */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
          {/* User row */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: collapsed ? "8px 0" : "8px 10px",
            justifyContent: collapsed ? "center" : "flex-start",
            borderRadius: 6,
            overflow: "hidden",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: "#FF991F",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: 11, flexShrink: 0,
              border: "2px solid rgba(255,255,255,0.4)",
            }}>
              AD
            </div>
            {!collapsed && (
              <div style={{ overflow: "hidden" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Admin</p>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>Administrador</p>
              </div>
            )}
          </div>

          {/* Sair */}
          <button
            title={collapsed ? "Sair" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: collapsed ? "9px 0" : "9px 10px",
              justifyContent: collapsed ? "center" : "flex-start",
              background: "transparent",
              border: "none",
              borderRadius: 6,
              color: "rgba(255,255,255,0.65)",
              fontFamily: "inherit",
              fontSize: 13,
              cursor: "pointer",
              width: "100%",
              transition: "background 0.14s, color 0.14s",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.65)";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
              <path d="M7 3H3.5C2.94772 3 2.5 3.44772 2.5 4V14C2.5 14.5523 2.94772 15 3.5 15H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 6L15.5 9L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15.5 9H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {!collapsed && "Sair"}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: collapsed ? "9px 0" : "9px 10px",
              justifyContent: collapsed ? "center" : "flex-start",
              background: "transparent",
              border: "none",
              borderRadius: 6,
              color: "rgba(255,255,255,0.5)",
              fontFamily: "inherit",
              fontSize: 12,
              cursor: "pointer",
              width: "100%",
              transition: "background 0.14s, color 0.14s",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ flexShrink: 0, transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.22s" }}
            >
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!collapsed && "Recolher"}
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <header style={{
          height: 56,
          background: "#fff",
          borderBottom: "1px solid #DFE1E6",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 16,
          flexShrink: 0,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "#97A0AF", fontWeight: 500 }}>
              Dashboard &rsaquo; <span style={{ color: "#0052CC" }}>{activeNav}</span>
            </p>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#172B4D", letterSpacing: "-0.02em" }}>
              {activeNav === "Página Inicial" ? "Produção — Setembro 2026" : activeNav}
            </h1>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button style={{
              background: "#0052CC",
              border: "none",
              borderRadius: 4,
              color: "#fff",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 14px",
              cursor: "pointer",
            }}>
              + Novo Registro
            </button>
            <button style={{
              background: "transparent",
              border: "1px solid #DFE1E6",
              borderRadius: 4,
              color: "#5E6C84",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 500,
              padding: "6px 14px",
              cursor: "pointer",
            }}>
              Exportar
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {activeNav === "Página Inicial" && <Dashboard />}
          {activeNav === "Projetos" && <Projetos />}
          {activeNav === "Produção" && <Producao />}
          {activeNav === "Relatórios" && <Relatorios />}
          {activeNav === "Colaboradores" && <Colaboradores />}
          {activeNav === "Receitas" && <Receitas />}
        </div>

      </div>
    </div>
  );
}
