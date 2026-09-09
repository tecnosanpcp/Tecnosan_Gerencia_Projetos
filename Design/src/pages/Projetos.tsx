import { useState } from "react";

const projects = [
  { id: 1, name: "Construção Barco 20 pés", status: "Em andamento" },
  { id: 2, name: "Produção Tanque 2000L", status: "Em andamento" },
  { id: 3, name: "EDMIL – ETA Barro Preto", status: "Pendente" },
  { id: 4, name: "Estrutura Metálica Galpão", status: "Concluído" },
];

const equipamentos = [
  { id: "TGDP-1", name: "Laminadora CNC L-200", status: "A fazer", priority: "Alta", assignee: "JS" },
  { id: "TGDP-2", name: "Cortadora Plasma PC-500", status: "Fazendo", priority: "Média", assignee: "ML" },
  { id: "TGDP-3", name: "Prensa Hidráulica PH-10T", status: "A fazer", priority: "Baixa", assignee: "" },
  { id: "TGDP-4", name: "Serra Fita SF-350", status: "Concluído", priority: "Média", assignee: "CM" },
  { id: "TGDP-5", name: "Esmerilhadeira Angular EA-7", status: "A fazer", priority: "Alta", assignee: "AP" },
];

const cronograma = [
  { fase: "Planejamento", inicio: "01/08/2026", fim: "15/08/2026", resp: "João Silva", progresso: 100 },
  { fase: "Fabricação de molde", inicio: "16/08/2026", fim: "05/09/2026", resp: "Carlos Souza", progresso: 72 },
  { fase: "Laminação", inicio: "06/09/2026", fim: "25/09/2026", resp: "Ana Lima", progresso: 30 },
  { fase: "Acabamento", inicio: "26/09/2026", fim: "10/10/2026", resp: "Maria Oliveira", progresso: 0 },
  { fase: "Entrega", inicio: "11/10/2026", fim: "15/10/2026", resp: "João Silva", progresso: 0 },
];

const statusColor: Record<string, string> = {
  "A fazer": "#DFE1E6",
  "Fazendo": "#0052CC",
  "Concluído": "#00875A",
};

const priorityColor: Record<string, string> = {
  Alta: "#DE350B",
  Média: "#FF991F",
  Baixa: "#00875A",
};

export default function Projetos() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"equipamentos" | "cronograma" | "acessorios">("equipamentos");
  const [search, setSearch] = useState("");

  const project = projects.find(p => p.id === selectedProject);
  const isAll = selectedProject === null;

  const stats = { resina: "48.50", roving: "0.00", tecidoKg: "24.00", tecidoCam: "3.00", catalisador: "1.45", manta: "12.00", resinaISO: "0.00", horas: "9.0", homens: "3", hhTotal: "27.0" };

  const filteredEq = equipamentos.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Project mini-sidebar */}
      <div style={{ width: 200, background: "#fff", borderRight: "1px solid #DFE1E6", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "14px 12px 10px" }}>
          <button style={{
            width: "100%", background: "#00875A", border: "none", borderRadius: 4,
            color: "#fff", fontFamily: "inherit", fontSize: 12, fontWeight: 600,
            padding: "8px 12px", cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Novo Projeto
          </button>
        </div>
        <div style={{ padding: "4px 8px 8px" }}>
          <button style={{
            width: "100%", background: "transparent", border: "none", borderRadius: 4,
            color: "#5E6C84", fontFamily: "inherit", fontSize: 12, fontWeight: 500,
            padding: "6px 8px", cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3H11M1 6H11M1 9H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Filtro
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
          <button
            onClick={() => setSelectedProject(null)}
            style={{
              width: "100%", background: isAll ? "#E9F2FF" : "transparent", border: "none", borderRadius: 4,
              color: isAll ? "#0052CC" : "#172B4D", fontFamily: "inherit", fontSize: 12, fontWeight: isAll ? 600 : 400,
              padding: "7px 10px", cursor: "pointer", textAlign: "left",
            }}
          >
            Todos os Projetos
          </button>
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProject(p.id)}
              style={{
                width: "100%", background: selectedProject === p.id ? "#E9F2FF" : "transparent", border: "none", borderRadius: 4,
                color: selectedProject === p.id ? "#0052CC" : "#172B4D", fontFamily: "inherit", fontSize: 12,
                fontWeight: selectedProject === p.id ? 600 : 400,
                padding: "7px 10px", cursor: "pointer", textAlign: "left",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {/* Overview card */}
        <div style={{
          background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 16, padding: "16px 20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#172B4D" }}>
                {isAll ? "Visão Geral (Todos os Projetos)" : project?.name}
              </h2>
            </div>
            {!isAll && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 3,
                background: project?.status === "Concluído" ? "#E3F9F1" : project?.status === "Pendente" ? "#FFF0B3" : "#E9F2FF",
                color: project?.status === "Concluído" ? "#00875A" : project?.status === "Pendente" ? "#FF991F" : "#0052CC",
              }}>
                {project?.status}
              </span>
            )}
            <span style={{ fontSize: 18, fontWeight: 700, color: "#0052CC" }}>R$ 42.850,00</span>
          </div>
          {/* Stats row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
            {[
              ["Resina", stats.resina], ["Roving", stats.roving], ["Tecido (Kg)", stats.tecidoKg],
              ["Tecido (camadas)", stats.tecidoCam], ["Catalisador", stats.catalisador], ["Manta", stats.manta],
              ["Resina ISO", stats.resinaISO], ["Total de Horas", stats.horas + " Horas"],
              ["Total de Homens", stats.homens + " F"], ["Total Horas-Homem", stats.hhTotal + " HH"],
            ].map(([label, value]) => (
              <span key={label} style={{ fontSize: 12, color: "#5E6C84" }}>
                <span style={{ fontWeight: 500, color: "#172B4D" }}>{label}:</span> {value}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs + actions */}
        <div style={{
          background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #DFE1E6", gap: 12 }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, maxWidth: 260 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="6" cy="6" r="4.5" stroke="#97A0AF" strokeWidth="1.3"/>
                <path d="M10 10L12.5 12.5" stroke="#97A0AF" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar..."
                style={{
                  width: "100%", border: "1px solid #DFE1E6", borderRadius: 4,
                  padding: "7px 10px 7px 30px", fontSize: 13, color: "#172B4D",
                  fontFamily: "inherit", outline: "none", background: "#FAFBFC",
                }}
              />
            </div>
            <div style={{ flex: 1 }} />
            <button style={{ background: "#00875A", border: "none", borderRadius: 4, color: "#fff", fontFamily: "inherit", fontSize: 12, fontWeight: 600, padding: "7px 14px", cursor: "pointer" }}>
              + Novo Equipamento
            </button>
            {(["Equipamentos", "Cronograma", "Acessórios"] as const).map(tab => {
              const key = tab.toLowerCase().replace("ó", "o").replace("á", "a") as any;
              const mapKey = tab === "Equipamentos" ? "equipamentos" : tab === "Cronograma" ? "cronograma" : "acessorios";
              const active = activeTab === mapKey;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(mapKey)}
                  style={{
                    background: "transparent", border: "none",
                    borderBottom: active ? "2px solid #0052CC" : "2px solid transparent",
                    color: active ? "#0052CC" : "#5E6C84",
                    fontFamily: "inherit", fontSize: 13, fontWeight: active ? 600 : 400,
                    padding: "6px 4px", cursor: "pointer",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div style={{ padding: "0" }}>
            {activeTab === "equipamentos" && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F4F5F7" }}>
                    {["ID", "Equipamento", "Status", "Prioridade", "Responsável"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#5E6C84", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #DFE1E6" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEq.map((eq, i) => (
                    <tr key={eq.id} style={{ borderBottom: "1px solid #F4F5F7", background: i % 2 === 0 ? "#fff" : "#FAFBFC" }}>
                      <td style={{ padding: "11px 16px", color: "#5E6C84", fontWeight: 500, fontSize: 12 }}>{eq.id}</td>
                      <td style={{ padding: "11px 16px", color: "#172B4D", fontWeight: 500 }}>{eq.name}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 3,
                          background: eq.status === "Concluído" ? "#E3F9F1" : eq.status === "Fazendo" ? "#E9F2FF" : "#F4F5F7",
                          color: eq.status === "Concluído" ? "#00875A" : eq.status === "Fazendo" ? "#0052CC" : "#5E6C84",
                        }}>{eq.status}</span>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: priorityColor[eq.priority] }}>● {eq.priority}</span>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        {eq.assignee ? (
                          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0052CC", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {eq.assignee}
                          </div>
                        ) : <span style={{ color: "#DFE1E6" }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "cronograma" && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#F4F5F7" }}>
                    {["Fase", "Início", "Término", "Responsável", "Progresso"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#5E6C84", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #DFE1E6" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cronograma.map((row, i) => (
                    <tr key={row.fase} style={{ borderBottom: "1px solid #F4F5F7", background: i % 2 === 0 ? "#fff" : "#FAFBFC" }}>
                      <td style={{ padding: "11px 16px", fontWeight: 500, color: "#172B4D" }}>{row.fase}</td>
                      <td style={{ padding: "11px 16px", color: "#5E6C84" }}>{row.inicio}</td>
                      <td style={{ padding: "11px 16px", color: "#5E6C84" }}>{row.fim}</td>
                      <td style={{ padding: "11px 16px", color: "#172B4D" }}>{row.resp}</td>
                      <td style={{ padding: "11px 16px", minWidth: 160 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: "#F4F5F7", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${row.progresso}%`, background: row.progresso === 100 ? "#00875A" : "#0052CC", borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#5E6C84", minWidth: 30 }}>{row.progresso}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "acessorios" && (
              <div style={{ padding: 40, textAlign: "center", color: "#97A0AF", fontSize: 13 }}>
                Nenhum acessório cadastrado para este projeto.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
