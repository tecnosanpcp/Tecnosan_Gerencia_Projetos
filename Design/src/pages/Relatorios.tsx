import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";

const evolucaoData = [
  { mes: "Jan", entregues: 3, pendentes: 1 },
  { mes: "Fev", entregues: 5, pendentes: 2 },
  { mes: "Mar", entregues: 4, pendentes: 3 },
  { mes: "Abr", entregues: 7, pendentes: 1 },
  { mes: "Mai", entregues: 6, pendentes: 2 },
  { mes: "Jun", entregues: 8, pendentes: 0 },
  { mes: "Jul", entregues: 5, pendentes: 3 },
  { mes: "Ago", entregues: 9, pendentes: 1 },
  { mes: "Set", entregues: 4, pendentes: 2 },
];

const consumoData = [
  { mes: "Jan", resina: 48, fibra: 24, manta: 12 },
  { mes: "Fev", resina: 35, fibra: 18, manta: 8 },
  { mes: "Mar", resina: 62, fibra: 31, manta: 15 },
  { mes: "Abr", resina: 44, fibra: 22, manta: 11 },
  { mes: "Mai", resina: 55, fibra: 27, manta: 13 },
  { mes: "Jun", resina: 70, fibra: 35, manta: 17 },
  { mes: "Jul", resina: 50, fibra: 25, manta: 12 },
  { mes: "Ago", resina: 38, fibra: 19, manta: 9 },
];

const leadTimeData = [
  { eq: "Laminadora", real: 12, previsto: 10 },
  { eq: "Cortadora", real: 8, previsto: 9 },
  { eq: "Prensa", real: 15, previsto: 12 },
  { eq: "Serra Fita", real: 6, previsto: 7 },
  { eq: "Esmeril", real: 9, previsto: 8 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#fff", border: "1px solid #DFE1E6", borderRadius: 4, padding: "8px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <p style={{ margin: 0, fontSize: 11, color: "#5E6C84", fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ margin: "2px 0", fontSize: 12, color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Relatorios() {
  const [projeto, setProjeto] = useState("");
  const [equipamento, setEquipamento] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState("2026-06-01");
  const [periodoFim, setPeriodoFim] = useState("2026-12-01");

  const totalEntregues = evolucaoData.reduce((s, d) => s + d.entregues, 0);
  const totalPendentes = evolucaoData.reduce((s, d) => s + d.pendentes, 0);

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px 24px" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6",
        borderLeft: "4px solid #00875A",
        padding: "14px 20px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 20,
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#172B4D" }}>Dashboard</h2>
        </div>
        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {[["PROJETO", projeto, setProjeto, ["Construção Barco 20 pés", "Produção Tanque 2000L", "EDMIL – ETA Barro Preto"]],
            ["EQUIPAMENTO", equipamento, setEquipamento, ["Laminadora CNC L-200", "Cortadora Plasma PC-500", "Prensa Hidráulica PH-10T"]]].map(([label, val, setter, opts]: any) => (
            <div key={label}>
              <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: "#5E6C84", letterSpacing: "0.06em" }}>{label}</p>
              <select value={val} onChange={e => setter(e.target.value)}
                style={{ border: "1px solid #DFE1E6", borderRadius: 4, padding: "5px 26px 5px 8px", fontSize: 12, color: "#172B4D", fontFamily: "inherit", background: "#fff", outline: "none", minWidth: 160 }}>
                <option value="">Selecione uma opção</option>
                {opts.map((o: string) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: "#5E6C84", letterSpacing: "0.06em" }}>PERÍODO</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="date" value={periodoInicio} onChange={e => setPeriodoInicio(e.target.value)}
                style={{ border: "1px solid #DFE1E6", borderRadius: 4, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", color: "#172B4D", outline: "none" }} />
              <span style={{ color: "#97A0AF", fontSize: 12 }}>→</span>
              <input type="date" value={periodoFim} onChange={e => setPeriodoFim(e.target.value)}
                style={{ border: "1px solid #DFE1E6", borderRadius: 4, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", color: "#172B4D", outline: "none" }} />
            </div>
          </div>
          <button style={{ background: "transparent", border: "1px solid #DE350B", borderRadius: 4, color: "#DE350B", fontFamily: "inherit", fontSize: 12, fontWeight: 600, padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap" }}>
            ↓ PDF
          </button>
        </div>
      </div>

      {/* Top section: resumo + evolução */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, marginBottom: 16 }}>
        {/* Resumo */}
        <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6", padding: "20px 16px" }}>
          <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 700, color: "#5E6C84", textTransform: "uppercase", letterSpacing: "0.07em" }}>Resumo</p>
          {[{ label: "Entregues", value: totalEntregues, color: "#00875A", abbr: "Entr" },
            { label: "Pendentes", value: totalPendentes, color: "#FF991F", abbr: "Pend" }].map(item => (
            <div key={item.label} style={{
              background: item.color, borderRadius: 4, padding: "12px 14px", marginBottom: 10,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{item.abbr}</p>
              </div>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Evolução por Equipamento */}
        <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6", padding: "20px 20px 14px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: "#5E6C84", textTransform: "uppercase", letterSpacing: "0.07em" }}>Evolução por Equipamento</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={evolucaoData} barCategoryGap="35%">
              <CartesianGrid vertical={false} stroke="#F4F5F7" strokeDasharray="4 2" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={v => <span style={{ color: "#5E6C84", fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="entregues" name="Entregues" fill="#00875A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pendentes" name="Pendentes" fill="#FF991F" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom: consumo + lead time */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6", padding: "20px 20px 14px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: "#5E6C84", textTransform: "uppercase", letterSpacing: "0.07em" }}>Consumo de Materiais</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={consumoData} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="#F4F5F7" strokeDasharray="4 2" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} unit=" kg" width={44} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={v => <span style={{ color: "#5E6C84", fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="resina" name="Resina" fill="#0052CC" radius={[2, 2, 0, 0]} />
              <Bar dataKey="fibra" name="Fibra" fill="#0065FF" radius={[2, 2, 0, 0]} />
              <Bar dataKey="manta" name="Manta" fill="#4C9AFF" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6", padding: "20px 20px 14px" }}>
          <p style={{ margin: "0 0 14px", fontSize: 10, fontWeight: 700, color: "#5E6C84", textTransform: "uppercase", letterSpacing: "0.07em" }}>Lead Time Real vs Previsto</p>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={leadTimeData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#F4F5F7" strokeDasharray="4 2" />
              <XAxis dataKey="eq" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#97A0AF", fontFamily: "Inter" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#97A0AF", fontFamily: "Inter" }} unit=" d" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={v => <span style={{ color: "#5E6C84", fontSize: 11 }}>{v}</span>} />
              <Line type="monotone" dataKey="real" name="Real" stroke="#DE350B" strokeWidth={2} dot={{ r: 4, fill: "#DE350B", strokeWidth: 0 }} />
              <Line type="monotone" dataKey="previsto" name="Previsto" stroke="#0052CC" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 4, fill: "#0052CC", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
