import { useState } from "react";

const DAYS = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];
const DATES = ["31/08/2026", "01/09/2026", "02/09/2026", "03/09/2026", "04/09/2026", "05/09/2026", "06/09/2026"];

type TaskColor = "blue" | "green" | "orange" | "red";

interface Task {
  id: string;
  title: string;
  project: string;
  employee: string;
  color: TaskColor;
}

const initialTasks: Record<number, Task[]> = {
  1: [{ id: "t1", title: "Laminação casco barco", project: "Construção Barco 20 pés", employee: "João Silva", color: "blue" }],
  2: [
    { id: "t2", title: "Corte de chapas plasma", project: "Estrutura Metálica Galpão", employee: "Carlos Souza", color: "green" },
    { id: "t3", title: "Montagem molde tanque", project: "Produção Tanque 2000L", employee: "Ana Lima", color: "orange" },
  ],
  3: [{ id: "t4", title: "Inspeção de qualidade ETA", project: "EDMIL – ETA Barro Preto", employee: "Maria Oliveira", color: "red" }],
  4: [],
  5: [{ id: "t5", title: "Acabamento e polimento", project: "Construção Barco 20 pés", employee: "João Silva", color: "blue" }],
  6: [],
  0: [],
};

const colorMap: Record<TaskColor, { bg: string; border: string; text: string }> = {
  blue: { bg: "#E9F2FF", border: "#0052CC", text: "#0052CC" },
  green: { bg: "#E3F9F1", border: "#00875A", text: "#00875A" },
  orange: { bg: "#FFF0B3", border: "#FF991F", text: "#FF8B00" },
  red: { bg: "#FFEBE6", border: "#DE350B", text: "#BF2600" },
};

export default function Producao() {
  const [tasks, setTasks] = useState(initialTasks);
  const [showModal, setShowModal] = useState(false);
  const [modalDay, setModalDay] = useState<number | null>(null);
  const [newTask, setNewTask] = useState({ title: "", project: "Construção Barco 20 pés", employee: "João Silva", color: "blue" as TaskColor });

  const handleAdd = (dayIdx: number) => {
    setModalDay(dayIdx);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!newTask.title.trim() || modalDay === null) return;
    const id = "t" + Date.now();
    setTasks(prev => ({
      ...prev,
      [modalDay]: [...(prev[modalDay] || []), { id, ...newTask }],
    }));
    setShowModal(false);
    setNewTask({ title: "", project: "Construção Barco 20 pés", employee: "João Silva", color: "blue" });
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px 24px" }}>
      {/* Header card */}
      <div style={{
        background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6",
        padding: "14px 20px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 6, background: "#0052CC", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="2" stroke="#fff" strokeWidth="1.5"/><path d="M5 1V15M1 5H15M1 10H15M11 1V15" stroke="#fff" strokeWidth="1.5"/></svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#172B4D" }}>Quadro de Produção</h2>
          <p style={{ margin: 0, fontSize: 11, color: "#5E6C84" }}>Semana 01/09 até 06/09</p>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => handleAdd(1)} style={{ background: "#00875A", border: "none", borderRadius: 4, color: "#fff", fontFamily: "inherit", fontSize: 12, fontWeight: 600, padding: "7px 14px", cursor: "pointer" }}>
          + Adicionar Componente
        </button>
        {[{ label: "↓ PDF", color: "#DE350B" }, { label: "↓ Excel", color: "#00875A" }].map(btn => (
          <button key={btn.label} style={{
            background: "transparent", border: `1px solid ${btn.color}`, borderRadius: 4,
            color: btn.color, fontFamily: "inherit", fontSize: 12, fontWeight: 600,
            padding: "6px 12px", cursor: "pointer",
          }}>{btn.label}</button>
        ))}
        <button style={{ background: "transparent", border: "1px solid #DFE1E6", borderRadius: 4, color: "#5E6C84", fontFamily: "inherit", fontSize: 18, padding: "4px 10px", cursor: "pointer" }}>←</button>
        <button style={{ background: "transparent", border: "1px solid #DFE1E6", borderRadius: 4, color: "#5E6C84", fontFamily: "inherit", fontSize: 18, padding: "4px 10px", cursor: "pointer" }}>→</button>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6",
        padding: "12px 20px", marginBottom: 16, display: "flex", gap: 24, alignItems: "center",
      }}>
        {[["Departamento", "Selecione uma opção"], ["Projetos", "Selecione uma opção"], ["Funcionário", "Selecione uma opção"]].map(([label, placeholder]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#5E6C84" }}>{label}:</span>
            <select style={{
              border: "1px solid #DFE1E6", borderRadius: 4, padding: "5px 28px 5px 10px",
              fontSize: 12, color: "#172B4D", fontFamily: "inherit", background: "#fff",
              cursor: "pointer", outline: "none", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%235E6C84' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
            }}>
              <option>{placeholder}</option>
            </select>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6",
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)", overflow: "hidden",
      }}>
        {DAYS.map((day, i) => (
          <div key={day} style={{ borderRight: i < 6 ? "1px solid #DFE1E6" : "none" }}>
            {/* Day header */}
            <div style={{
              padding: "10px 12px", borderBottom: "1px solid #DFE1E6",
              background: "#F4F5F7", textAlign: "center",
            }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: i === 0 || i === 6 ? "#97A0AF" : "#172B4D" }}>{day}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "#97A0AF" }}>{DATES[i]}</p>
            </div>
            {/* Tasks */}
            <div style={{ minHeight: 180, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
              {(tasks[i] || []).map(task => {
                const c = colorMap[task.color];
                return (
                  <div key={task.id} style={{
                    background: c.bg, borderLeft: `3px solid ${c.border}`,
                    borderRadius: "0 4px 4px 0", padding: "8px 10px",
                  }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#172B4D", lineHeight: 1.3 }}>{task.title}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 10, color: "#5E6C84" }}>{task.project}</p>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: c.border, color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {task.employee.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 10, color: "#5E6C84" }}>{task.employee}</span>
                    </div>
                  </div>
                );
              })}
              {/* Add button */}
              <button
                onClick={() => handleAdd(i)}
                style={{
                  background: "transparent", border: "1px dashed #DFE1E6", borderRadius: 4,
                  color: "#97A0AF", fontSize: 18, cursor: "pointer", padding: "6px 0",
                  display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2,
                  transition: "border-color 0.14s, color 0.14s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0052CC"; (e.currentTarget as HTMLButtonElement).style.color = "#0052CC"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#DFE1E6"; (e.currentTarget as HTMLButtonElement).style.color = "#97A0AF"; }}
              >
                +
                <span style={{ fontSize: 10, fontFamily: "inherit" }}>Adicionar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(9,30,66,0.54)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: "28px 32px", width: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#172B4D" }}>
              Nova Atividade — {DAYS[modalDay!]}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[["Título da atividade", "title", "text", "Ex: Laminação casco..."] as const].map(([label, field, type, ph]) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5E6C84", marginBottom: 5 }}>{label}</label>
                  <input
                    type={type}
                    value={newTask[field]}
                    onChange={e => setNewTask(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={ph}
                    style={{ width: "100%", border: "1px solid #DFE1E6", borderRadius: 4, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#172B4D" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5E6C84", marginBottom: 5 }}>Projeto</label>
                <select value={newTask.project} onChange={e => setNewTask(p => ({ ...p, project: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #DFE1E6", borderRadius: 4, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", color: "#172B4D", outline: "none" }}>
                  {["Construção Barco 20 pés", "Produção Tanque 2000L", "EDMIL – ETA Barro Preto", "Estrutura Metálica Galpão"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5E6C84", marginBottom: 5 }}>Funcionário</label>
                <select value={newTask.employee} onChange={e => setNewTask(p => ({ ...p, employee: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #DFE1E6", borderRadius: 4, padding: "8px 10px", fontSize: 13, fontFamily: "inherit", color: "#172B4D", outline: "none" }}>
                  {["João Silva", "Carlos Souza", "Maria Oliveira", "Ana Lima", "Pedro Ramos"].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5E6C84", marginBottom: 8 }}>Cor</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["blue", "green", "orange", "red"] as TaskColor[]).map(c => (
                    <button key={c} onClick={() => setNewTask(p => ({ ...p, color: c }))}
                      style={{ width: 28, height: 28, borderRadius: "50%", border: newTask.color === c ? "3px solid #172B4D" : "2px solid transparent", cursor: "pointer", background: colorMap[c].border }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "1px solid #DFE1E6", borderRadius: 4, color: "#5E6C84", fontFamily: "inherit", fontSize: 13, padding: "8px 16px", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleSave} style={{ background: "#0052CC", border: "none", borderRadius: 4, color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 16px", cursor: "pointer" }}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
