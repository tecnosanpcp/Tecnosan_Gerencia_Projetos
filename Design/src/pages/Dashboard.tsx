import { useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";

// ── Data ─────────────────────────────────────────────────────────────────────

const materialData = [
  { month: "Jan", value: 272 }, { month: "Fev", value: 185 }, { month: "Mar", value: 310 },
  { month: "Abr", value: 245 }, { month: "Mai", value: 198 }, { month: "Jun", value: 330 },
  { month: "Jul", value: 289 }, { month: "Ago", value: 215 }, { month: "Set", value: 248 },
];
const wasteData = [
  { month: "Jan", value: 57 }, { month: "Fev", value: 32 }, { month: "Mar", value: 48 },
  { month: "Abr", value: 61 }, { month: "Mai", value: 29 }, { month: "Jun", value: 44 },
  { month: "Jul", value: 38 }, { month: "Ago", value: 52 }, { month: "Set", value: 41 },
];
const projectData = [
  { name: "Construção Barco 20 pés", progress: 72 },
  { name: "Produção Tanque 2000L", progress: 58 },
  { name: "EDMIL – ETA Barro Preto", progress: 34 },
  { name: "Estrutura Metálica Galpão", progress: 85 },
  { name: "Caldeiraria Industrial SP", progress: 47 },
];
const overtimeData = [
  { id: "João S.", overtime: 4, absences: 0 }, { id: "Maria L.", overtime: 2, absences: 1 },
  { id: "Carlos M.", overtime: 6, absences: 0 }, { id: "Ana P.", overtime: 1, absences: 2 },
  { id: "Pedro R.", overtime: 3, absences: 1 }, { id: "Lucas F.", overtime: 0, absences: 3 },
];
const efficiencyData = [
  { mes: "Jan", turnoA: 82, turnoB: 74, turnoC: 68 }, { mes: "Fev", turnoA: 79, turnoB: 77, turnoC: 71 },
  { mes: "Mar", turnoA: 85, turnoB: 80, turnoC: 75 }, { mes: "Abr", turnoA: 88, turnoB: 83, turnoC: 78 },
  { mes: "Mai", turnoA: 84, turnoB: 79, turnoC: 73 }, { mes: "Jun", turnoA: 91, turnoB: 86, turnoC: 80 },
  { mes: "Jul", turnoA: 87, turnoB: 81, turnoC: 76 }, { mes: "Ago", turnoA: 90, turnoB: 85, turnoC: 79 },
  { mes: "Set", turnoA: 93, turnoB: 88, turnoC: 82 },
];
const leadTimeData = [
  { eq: "Laminadora", real: 12, previsto: 10 }, { eq: "Cortadora", real: 8, previsto: 9 },
  { eq: "Prensa", real: 15, previsto: 12 }, { eq: "Serra Fita", real: 6, previsto: 7 },
  { eq: "Esmeril", real: 9, previsto: 8 }, { eq: "Soldadora", real: 11, previsto: 10 },
];
const prodByProjectData = [
  { name: "Barco 20 pés", kg: 310 }, { name: "Tanque 2000L", kg: 245 },
  { name: "ETA Barro Preto", kg: 180 }, { name: "Galpão Metal.", kg: 420 },
  { name: "Caldeiraria SP", kg: 155 },
];
const qualityData = [
  { mes: "Jan", taxa: 91 }, { mes: "Fev", taxa: 93 }, { mes: "Mar", taxa: 89 },
  { mes: "Abr", taxa: 95 }, { mes: "Mai", taxa: 92 }, { mes: "Jun", taxa: 97 },
  { mes: "Jul", taxa: 94 }, { mes: "Ago", taxa: 96 }, { mes: "Set", taxa: 98 },
];
const pieData = [
  { name: "Resina", value: 48.5, color: "#0052CC" }, { name: "Fibra", value: 24.0, color: "#00875A" },
  { name: "Manta", value: 12.0, color: "#FF991F" }, { name: "Catalisador", value: 1.45, color: "#DE350B" },
  { name: "Outros", value: 8.0, color: "#6554C0" },
];

// ── Tooltip ───────────────────────────────────────────────────────────────────

const T = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #DFE1E6", borderRadius: 4, padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", fontSize: 12 }}>
      <p style={{ margin: "0 0 4px", color: "#5E6C84", fontWeight: 600 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ margin: "2px 0", color: p.color || "#172B4D", fontWeight: 600 }}>
          {p.name}: <span style={{ color: "#172B4D" }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Chart render functions ────────────────────────────────────────────────────

function ChartMaterial({ height }: { height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={materialData} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#F4F5F7" strokeDasharray="4 2" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} unit=" KG" width={56} />
        <Tooltip content={<T />} cursor={{ fill: "rgba(0,82,204,0.05)" }} />
        <Bar dataKey="value" fill="#0052CC" radius={[3, 3, 0, 0]} name="Consumo" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartWaste({ height }: { height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={wasteData} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#F4F5F7" strokeDasharray="4 2" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} unit=" KG" width={56} />
        <Tooltip content={<T />} cursor={{ fill: "rgba(222,53,11,0.05)" }} />
        <Bar dataKey="value" fill="#DE350B" radius={[3, 3, 0, 0]} name="Refugo" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartEfficiency({ height }: { height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={efficiencyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6554C0" stopOpacity={0.15} /><stop offset="95%" stopColor="#6554C0" stopOpacity={0} /></linearGradient>
          <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0052CC" stopOpacity={0.1} /><stop offset="95%" stopColor="#0052CC" stopOpacity={0} /></linearGradient>
          <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00875A" stopOpacity={0.1} /><stop offset="95%" stopColor="#00875A" stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid stroke="#F4F5F7" strokeDasharray="4 2" />
        <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} unit="%" domain={[60, 100]} width={38} />
        <Tooltip content={<T />} />
        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => <span style={{ color: "#5E6C84", fontSize: 11 }}>{v}</span>} />
        <Area type="monotone" dataKey="turnoA" name="Turno A" stroke="#6554C0" strokeWidth={2} fill="url(#gA)" dot={false} />
        <Area type="monotone" dataKey="turnoB" name="Turno B" stroke="#0052CC" strokeWidth={2} fill="url(#gB)" dot={false} />
        <Area type="monotone" dataKey="turnoC" name="Turno C" stroke="#00875A" strokeWidth={2} fill="url(#gC)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChartProjects({ height }: { height: number }) {
  const itemH = Math.max(height / projectData.length - 10, 38);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4, height }}>
      {projectData.map((p) => (
        <div key={p.name} style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#172B4D" }}>{p.name}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: p.progress >= 70 ? "#00875A" : p.progress >= 45 ? "#0052CC" : "#FF991F" }}>{p.progress}%</span>
          </div>
          <div style={{ height: 8, background: "#F4F5F7", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${p.progress}%`, background: p.progress >= 70 ? "#00875A" : p.progress >= 45 ? "#0052CC" : "#FF991F", borderRadius: 4, transition: "width 0.6s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartOvertime({ height }: { height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={overtimeData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#F4F5F7" strokeDasharray="4 2" />
        <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} />
        <Tooltip content={<T />} />
        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => <span style={{ color: "#5E6C84", fontSize: 11 }}>{v}</span>} />
        <Line type="monotone" dataKey="overtime" name="Horas Extras" stroke="#FF991F" strokeWidth={2} dot={{ fill: "#FF991F", r: 4, strokeWidth: 0 }} />
        <Line type="monotone" dataKey="absences" name="Qtd. Faltas" stroke="#DE350B" strokeWidth={2} strokeDasharray="5 3" dot={{ fill: "#DE350B", r: 4, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChartLeadTime({ height }: { height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={leadTimeData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#F4F5F7" strokeDasharray="4 2" />
        <XAxis dataKey="eq" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} unit=" d" width={34} />
        <Tooltip content={<T />} />
        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => <span style={{ color: "#5E6C84", fontSize: 11 }}>{v}</span>} />
        <Line type="monotone" dataKey="real" name="Real" stroke="#DE350B" strokeWidth={2} dot={{ fill: "#DE350B", r: 4, strokeWidth: 0 }} />
        <Line type="monotone" dataKey="previsto" name="Previsto" stroke="#0052CC" strokeWidth={2} strokeDasharray="5 3" dot={{ fill: "#0052CC", r: 4, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChartProdProject({ height }: { height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={prodByProjectData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke="#F4F5F7" strokeDasharray="4 2" />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} unit=" KG" />
        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#172B4D", fontFamily: "Inter" }} width={110} />
        <Tooltip content={<T />} cursor={{ fill: "rgba(255,139,0,0.05)" }} />
        <Bar dataKey="kg" fill="#FF8B00" radius={[0, 3, 3, 0]} name="KG" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartQuality({ height }: { height: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={qualityData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="gQ" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00875A" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#00875A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#F4F5F7" strokeDasharray="4 2" />
        <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} unit="%" domain={[85, 100]} width={38} />
        <Tooltip content={<T />} />
        <Area type="monotone" dataKey="taxa" name="Taxa de Qualidade" stroke="#00875A" strokeWidth={2.5} fill="url(#gQ)" dot={{ fill: "#00875A", r: 4, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChartPie({ height }: { height: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, height }}>
      <div style={{ flex: "0 0 55%" }}>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={height * 0.22} outerRadius={height * 0.38} paddingAngle={3} dataKey="value">
              {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip formatter={(v: any) => [`${v} KG`, ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {pieData.map((d) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#172B4D", flex: 1 }}>{d.name}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#5E6C84" }}>{d.value} KG</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chart catalogue ───────────────────────────────────────────────────────────

type ChartId = "material" | "waste" | "efficiency" | "projects" | "overtime" | "leadtime" | "prodproject" | "quality" | "pie";

interface ChartDef {
  id: ChartId;
  title: string;
  subtitle: string;
  accent: string;
  category: string;
  render: (height: number) => React.ReactNode;
}

const CHARTS: ChartDef[] = [
  { id: "material",    title: "Consumo de Materiais",      subtitle: "Ano atual — KG",             accent: "#0052CC", category: "Produção",       render: (h) => <ChartMaterial height={h} /> },
  { id: "waste",       title: "Desperdício (Refugo)",       subtitle: "Ano atual — KG",             accent: "#DE350B", category: "Qualidade",      render: (h) => <ChartWaste height={h} /> },
  { id: "efficiency",  title: "Eficiência por Turno",       subtitle: "Comparativo — %",            accent: "#6554C0", category: "Operacional",    render: (h) => <ChartEfficiency height={h} /> },
  { id: "projects",    title: "Progresso dos Projetos",     subtitle: "% concluído",                accent: "#00875A", category: "Projetos",       render: (h) => <ChartProjects height={h} /> },
  { id: "overtime",    title: "Horas Extras vs Faltas",     subtitle: "Por colaborador",            accent: "#FF991F", category: "RH",             render: (h) => <ChartOvertime height={h} /> },
  { id: "leadtime",    title: "Lead Time Real vs Previsto", subtitle: "Dias por equipamento",       accent: "#00B8D9", category: "Operacional",    render: (h) => <ChartLeadTime height={h} /> },
  { id: "prodproject", title: "Produção por Projeto",       subtitle: "KG processados",             accent: "#FF8B00", category: "Produção",       render: (h) => <ChartProdProject height={h} /> },
  { id: "quality",     title: "Índice de Qualidade",        subtitle: "% aprovação mensal",         accent: "#00875A", category: "Qualidade",      render: (h) => <ChartQuality height={h} /> },
  { id: "pie",         title: "Composição de Materiais",    subtitle: "Distribuição por tipo (KG)", accent: "#6554C0", category: "Produção",       render: (h) => <ChartPie height={h} /> },
];

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconExpand = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M8.5 1.5H12.5V5.5M5.5 12.5H1.5V8.5M12.5 1.5L8 6M6 8L1.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconCollapse = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5.5 8.5H1.5V12.5M8.5 5.5H12.5V1.5M1.5 12.5L6 8M8 6L12.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// ── ChartCard ─────────────────────────────────────────────────────────────────

interface CardProps {
  def: ChartDef;
  onExpand: (id: ChartId) => void;
  collapsed: boolean;
  onToggleCollapse: (id: ChartId) => void;
}

function ChartCard({ def, onExpand, collapsed, onToggleCollapse }: CardProps) {
  return (
    <div style={{
      background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6",
      boxShadow: "0 1px 3px rgba(0,0,0,0.07)", overflow: "hidden",
      display: "flex", flexDirection: "column",
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 3px 10px rgba(0,0,0,0.12)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.07)"}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", padding: "11px 14px",
        borderBottom: collapsed ? "none" : "1px solid #F4F5F7", gap: 10, flexShrink: 0,
      }}>
        <div style={{ width: 3, height: 16, background: def.accent, borderRadius: 2, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "#5E6C84", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{def.title}</p>
          {!collapsed && <p style={{ margin: "1px 0 0", fontSize: 10, color: "#97A0AF" }}>{def.subtitle}</p>}
        </div>
        {/* Action buttons */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <ActionBtn title={collapsed ? "Expandir card" : "Recolher card"} onClick={() => onToggleCollapse(def.id)}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ActionBtn>
          <ActionBtn title="Abrir em tela cheia" onClick={() => onExpand(def.id)} accent={def.accent}>
            <IconExpand />
          </ActionBtn>
        </div>
      </div>
      {/* Chart */}
      {!collapsed && (
        <div style={{ flex: 1, padding: "12px 14px 10px", minHeight: 0 }}>
          {def.render(200)}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ title, onClick, children, accent }: { title: string; onClick: () => void; children: React.ReactNode; accent?: string }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? (accent ? accent + "18" : "#F4F5F7") : "transparent",
        border: "1px solid " + (hover ? (accent || "#DFE1E6") : "#DFE1E6"),
        borderRadius: 4, color: hover ? (accent || "#172B4D") : "#97A0AF",
        padding: "4px 6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.14s",
      }}
    >
      {children}
    </button>
  );
}

// ── Expand Modal ──────────────────────────────────────────────────────────────

function ExpandModal({ def, onClose }: { def: ChartDef; onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(9,30,66,0.6)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 8, width: "100%", maxWidth: 1100, maxHeight: "90vh", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", overflow: "hidden" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ display: "flex", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #DFE1E6", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 4, height: 20, background: def.accent, borderRadius: 2 }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#172B4D" }}>{def.title}</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#5E6C84" }}>{def.subtitle}</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, background: def.accent + "18", color: def.accent, padding: "3px 10px", borderRadius: 10 }}>{def.category}</span>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #DFE1E6", borderRadius: 4, color: "#5E6C84", padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <IconClose />
          </button>
        </div>
        {/* Modal chart */}
        <div style={{ flex: 1, padding: "24px 32px", minHeight: 0, overflowY: "auto" }}>
          {def.render(480)}
        </div>
      </div>
    </div>
  );
}

// ── Personalizar Panel (slide-in) ─────────────────────────────────────────────

const CATEGORIES = ["Todos", "Produção", "Qualidade", "Operacional", "Projetos", "RH"];

function PersonalizarPanel({
  visible, visibleCharts, onToggle, onClose, onSelectAll, onClearAll
}: {
  visible: boolean;
  visibleCharts: Set<ChartId>;
  onToggle: (id: ChartId) => void;
  onClose: () => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  const [catFilter, setCatFilter] = useState("Todos");

  const filtered = catFilter === "Todos" ? CHARTS : CHARTS.filter(c => c.category === catFilter);

  return (
    <>
      {/* Backdrop */}
      {visible && <div style={{ position: "fixed", inset: 0, zIndex: 8000 }} onClick={onClose} />}
      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 8001,
        width: 340, background: "#fff", boxShadow: "-4px 0 24px rgba(0,0,0,0.18)",
        transform: visible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        {/* Panel header */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #DFE1E6", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#172B4D" }}>Personalizar Dashboard</h3>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#97A0AF", padding: 4, display: "flex" }}>
              <IconClose />
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#5E6C84" }}>Selecione os gráficos que deseja exibir</p>

          {/* Category filter */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCatFilter(cat)} style={{
                background: catFilter === cat ? "#0052CC" : "#F4F5F7",
                border: "none", borderRadius: 12, color: catFilter === cat ? "#fff" : "#5E6C84",
                fontSize: 11, fontWeight: 600, padding: "4px 10px", cursor: "pointer",
                transition: "all 0.14s",
              }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Actions row */}
        <div style={{ padding: "10px 20px", borderBottom: "1px solid #F4F5F7", display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={onSelectAll} style={{ flex: 1, background: "#E9F2FF", border: "none", borderRadius: 4, color: "#0052CC", fontSize: 11, fontWeight: 700, padding: "6px 0", cursor: "pointer" }}>
            Selecionar todos
          </button>
          <button onClick={onClearAll} style={{ flex: 1, background: "#F4F5F7", border: "none", borderRadius: 4, color: "#5E6C84", fontSize: 11, fontWeight: 700, padding: "6px 0", cursor: "pointer" }}>
            Limpar seleção
          </button>
        </div>

        {/* Chart list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(chart => {
              const active = visibleCharts.has(chart.id);
              return (
                <div
                  key={chart.id}
                  onClick={() => onToggle(chart.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                    borderRadius: 6, border: "1px solid " + (active ? chart.accent + "40" : "#DFE1E6"),
                    background: active ? chart.accent + "08" : "#fff",
                    cursor: "pointer", transition: "all 0.14s",
                  }}
                >
                  {/* Color swatch */}
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: chart.accent + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: chart.accent }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#172B4D" }}>{chart.title}</p>
                    <p style={{ margin: "1px 0 0", fontSize: 10, color: "#97A0AF" }}>{chart.subtitle}</p>
                  </div>
                  {/* Category tag */}
                  <span style={{ fontSize: 9, fontWeight: 700, color: chart.accent, background: chart.accent + "18", padding: "2px 6px", borderRadius: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>{chart.category}</span>
                  {/* Toggle */}
                  <div style={{
                    width: 36, height: 20, borderRadius: 10, background: active ? chart.accent : "#DFE1E6",
                    position: "relative", flexShrink: 0, transition: "background 0.2s",
                  }}>
                    <div style={{
                      position: "absolute", top: 3, left: active ? 19 : 3,
                      width: 14, height: 14, borderRadius: "50%", background: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #DFE1E6", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 11, color: "#97A0AF", textAlign: "center" }}>
            {visibleCharts.size} de {CHARTS.length} gráficos ativos
          </p>
        </div>
      </div>
    </>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

const DEFAULT_VISIBLE = new Set<ChartId>(CHARTS.map(c => c.id));

export default function Dashboard() {
  const [visibleCharts, setVisibleCharts] = useState<Set<ChartId>>(DEFAULT_VISIBLE);
  const [collapsedCards, setCollapsedCards] = useState<Set<ChartId>>(new Set());
  const [expandedChart, setExpandedChart] = useState<ChartId | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const toggleVisible = useCallback((id: ChartId) => {
    setVisibleCharts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleCollapsed = useCallback((id: ChartId) => {
    setCollapsedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const selectAll = () => setVisibleCharts(new Set(CHARTS.map(c => c.id)));
  const clearAll = () => setVisibleCharts(new Set());

  const activeCharts = CHARTS.filter(c => visibleCharts.has(c.id));
  const expandedDef = CHARTS.find(c => c.id === expandedChart);

  const kpis = [
    { label: "Planejado",        value: "41",    unit: "KG", color: "#0052CC", bg: "#EAF0FF", trend: "+5% vs mês ant." },
    { label: "Processado",       value: "272.0", unit: "KG", color: "#00875A", bg: "#E3F9F1", trend: "+12% vs mês ant." },
    { label: "Refugo",           value: "57",    unit: "KG", color: "#DE350B", bg: "#FFEBE6", trend: "−3% vs mês ant." },
    { label: "Eficiência",       value: "93",    unit: "%",  color: "#6554C0", bg: "#EAE6FF", trend: "+4% vs mês ant." },
    { label: "Projetos Ativos",  value: "4",     unit: "",   color: "#FF8B00", bg: "#FFF0B3", trend: "2 concluídos" },
    { label: "Colaboradores",    value: "18",    unit: "",   color: "#00B8D9", bg: "#E6FCFF", trend: "3 em férias" },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px 22px", position: "relative" }}>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 16 }}>
        {kpis.map(card => (
          <div key={card.label} style={{ background: "#fff", borderRadius: 4, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 0 0 1px #DFE1E6", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 40, borderRadius: 4, background: card.bg, borderLeft: `3px solid ${card.color}`, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "#5E6C84", textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: 1 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#172B4D", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{card.value}</span>
                {card.unit && <span style={{ fontSize: 11, fontWeight: 600, color: "#5E6C84" }}>{card.unit}</span>}
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 10, color: card.color, fontWeight: 600 }}>{card.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 12, color: "#5E6C84", fontWeight: 500 }}>
          <span style={{ fontWeight: 700, color: "#172B4D" }}>{activeCharts.length}</span> gráfico{activeCharts.length !== 1 ? "s" : ""} exibido{activeCharts.length !== 1 ? "s" : ""}
        </p>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setCollapsedCards(new Set())}
          style={{ background: "transparent", border: "1px solid #DFE1E6", borderRadius: 4, color: "#5E6C84", fontFamily: "inherit", fontSize: 11, fontWeight: 600, padding: "6px 12px", cursor: "pointer" }}
        >
          Expandir todos
        </button>
        <button
          onClick={() => setCollapsedCards(new Set(CHARTS.map(c => c.id)))}
          style={{ background: "transparent", border: "1px solid #DFE1E6", borderRadius: 4, color: "#5E6C84", fontFamily: "inherit", fontSize: 11, fontWeight: 600, padding: "6px 12px", cursor: "pointer" }}
        >
          Recolher todos
        </button>
        {/* Personalizar button */}
        <button
          onClick={() => setPanelOpen(p => !p)}
          style={{
            background: panelOpen ? "#0052CC" : "#fff", border: "1px solid " + (panelOpen ? "#0052CC" : "#DFE1E6"),
            borderRadius: 4, color: panelOpen ? "#fff" : "#172B4D",
            fontFamily: "inherit", fontSize: 12, fontWeight: 700, padding: "7px 16px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 7,
            boxShadow: panelOpen ? "0 2px 8px rgba(0,82,204,0.3)" : "none",
            transition: "all 0.18s",
          }}
        >
          <IconSettings />
          Personalizar Dashboard
        </button>
      </div>

      {/* ── Empty state ── */}
      {activeCharts.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#97A0AF" }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 12 }}>
            <rect x="4" y="4" width="40" height="40" rx="6" stroke="#DFE1E6" strokeWidth="2" />
            <path d="M16 28V32M24 22V32M32 16V32" stroke="#DFE1E6" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#5E6C84" }}>Nenhum gráfico selecionado</p>
          <button onClick={() => setPanelOpen(true)} style={{ background: "#0052CC", border: "none", borderRadius: 4, color: "#fff", fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 20px", cursor: "pointer" }}>
            Adicionar gráficos
          </button>
        </div>
      )}

      {/* ── Chart grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, alignItems: "start" }}>
        {activeCharts.map(def => (
          <ChartCard
            key={def.id}
            def={def}
            onExpand={setExpandedChart}
            collapsed={collapsedCards.has(def.id)}
            onToggleCollapse={toggleCollapsed}
          />
        ))}
      </div>

      {/* ── Personalizar panel ── */}
      <PersonalizarPanel
        visible={panelOpen}
        visibleCharts={visibleCharts}
        onToggle={toggleVisible}
        onClose={() => setPanelOpen(false)}
        onSelectAll={selectAll}
        onClearAll={clearAll}
      />

      {/* ── Expand modal ── */}
      {expandedDef && (
        <ExpandModal def={expandedDef} onClose={() => setExpandedChart(null)} />
      )}
    </div>
  );
}
