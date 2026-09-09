import { useState } from "react";

interface Employee {
  id: number;
  name: string;
  role: string;
  dept: string;
  initials: string;
}

interface Department {
  id: number;
  name: string;
}

const initialEmployees: Employee[] = [
  { id: 1, name: "João Silva", role: "Operador de Máquina", dept: "Produção", initials: "JS" },
  { id: 2, name: "Gerente Produção", role: "Gerente da Produção", dept: "Produção", initials: "GP" },
  { id: 3, name: "Maria Oliveira", role: "Técnico de Manutenção", dept: "Manutenção", initials: "MO" },
  { id: 4, name: "Carlos Souza", role: "Engenheiro de Processos", dept: "Engenharia", initials: "CS" },
  { id: 5, name: "Ana Lima", role: "Auxiliar de Logística", dept: "Logística", initials: "AL" },
  { id: 6, name: "Pedro Ramos", role: "Analista Financeiro", dept: "Financeiro", initials: "PR" },
];

const initialDepts: Department[] = [
  { id: 1, name: "Administração" },
  { id: 2, name: "Engenharia" },
  { id: 3, name: "Financeiro" },
  { id: 4, name: "Logística" },
  { id: 5, name: "Manutenção" },
  { id: 6, name: "Produção" },
];

const avatarColors = ["#0052CC", "#00875A", "#DE350B", "#FF991F", "#6554C0", "#00B8D9"];

export default function Colaboradores() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [depts, setDepts] = useState(initialDepts);
  const [empSearch, setEmpSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredEmps = employees.filter(e =>
    e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
    e.role.toLowerCase().includes(empSearch.toLowerCase())
  );
  const filteredDepts = depts.filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase()));

  const removeDept = (id: number) => setDepts(prev => prev.filter(d => d.id !== id));
  const removeEmp = (id: number) => setEmployees(prev => prev.filter(e => e.id !== id));

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px 24px", display: "flex", gap: 20 }}>
      {/* Left: employees */}
      <div style={{ flex: 1 }}>
        {/* Search + add */}
        <div style={{
          background: "#fff", border: "1px solid #DFE1E6", borderRadius: 4,
          padding: "10px 14px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}>
              <circle cx="6" cy="6" r="4.5" stroke="#97A0AF" strokeWidth="1.3"/>
              <path d="M10 10L12.5 12.5" stroke="#97A0AF" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input value={empSearch} onChange={e => setEmpSearch(e.target.value)} placeholder="Pesquisar colaborador..."
              style={{ width: "100%", border: "1px solid #DFE1E6", borderRadius: 4, padding: "7px 10px 7px 30px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#172B4D" }} />
          </div>
          <button style={{ background: "#0052CC", border: "none", borderRadius: 4, color: "#fff", fontFamily: "inherit", fontSize: 12, fontWeight: 600, padding: "8px 14px", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.3"/><path d="M6 3V9M3 6H9" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Adicionar
          </button>
        </div>

        {/* Employee grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {filteredEmps.map((emp, i) => (
            <div key={emp.id} style={{
              background: "#fff", border: "1px solid #DFE1E6", borderRadius: 4,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}>
              <div
                style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: avatarColors[i % avatarColors.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>
                  {emp.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#172B4D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#5E6C84", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: 3, verticalAlign: "middle" }}><rect x="1" y="2" width="8" height="6" rx="1" stroke="#97A0AF" strokeWidth="1.2"/><path d="M1 4H9" stroke="#97A0AF" strokeWidth="1.2"/></svg>
                    {emp.role}
                  </p>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transform: expandedId === emp.id ? "rotate(180deg)" : "none", transition: "transform 0.18s" }}>
                  <path d="M2 4L6 8L10 4" stroke="#97A0AF" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              {expandedId === emp.id && (
                <div style={{ borderTop: "1px solid #F4F5F7", padding: "12px 16px", background: "#FAFBFC" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 11, background: "#E9F2FF", color: "#0052CC", borderRadius: 3, padding: "2px 8px", fontWeight: 600 }}>{emp.dept}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                    <button style={{ background: "transparent", border: "1px solid #DFE1E6", borderRadius: 3, color: "#5E6C84", fontFamily: "inherit", fontSize: 11, padding: "4px 10px", cursor: "pointer" }}>Editar</button>
                    <button onClick={() => removeEmp(emp.id)} style={{ background: "transparent", border: "1px solid #FFEBE6", borderRadius: 3, color: "#DE350B", fontFamily: "inherit", fontSize: 11, padding: "4px 10px", cursor: "pointer" }}>Remover</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: departments */}
      <div style={{ width: 260, flexShrink: 0 }}>
        <div style={{
          background: "#fff", border: "1px solid #DFE1E6", borderRadius: 4,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
          {/* Dept search + add */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #F4F5F7", display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="6" cy="6" r="4.5" stroke="#97A0AF" strokeWidth="1.3"/>
                <path d="M10 10L12.5 12.5" stroke="#97A0AF" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input value={deptSearch} onChange={e => setDeptSearch(e.target.value)} placeholder="Pesquisar..."
                style={{ width: "100%", border: "1px solid #DFE1E6", borderRadius: 4, padding: "6px 8px 6px 26px", fontSize: 12, fontFamily: "inherit", outline: "none", color: "#172B4D" }} />
            </div>
            <button style={{ background: "#0052CC", border: "none", borderRadius: 4, color: "#fff", fontFamily: "inherit", fontSize: 11, fontWeight: 600, padding: "6px 10px", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.3"/><path d="M6 3V9M3 6H9" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>
              Adicionar
            </button>
          </div>
          {/* Dept list */}
          {filteredDepts.map((dept, i) => (
            <div key={dept.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: i < filteredDepts.length - 1 ? "1px solid #F4F5F7" : "none",
            }}>
              <span style={{ fontSize: 13, color: "#172B4D", fontWeight: 500 }}>{dept.name}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: "#5E6C84", padding: 2 }} title="Editar">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                </button>
                <button onClick={() => removeDept(dept.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DE350B", padding: 2 }} title="Remover">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4H12M5 4V2.5H9V4M5.5 6.5V10.5M8.5 6.5V10.5M3 4L3.5 11.5H10.5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
