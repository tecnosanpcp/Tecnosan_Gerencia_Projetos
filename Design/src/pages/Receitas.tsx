import { useState } from "react";

interface Item {
  id: number;
  name: string;
  code: string;
  unit: string;
  qty: number;
}

type SectionKey = "material" | "acessorio" | "componente" | "equipamento";

interface Section {
  key: SectionKey;
  label: string;
  addLabel: string;
  placeholder: string;
  items: Item[];
}

const initialSections: Section[] = [
  {
    key: "material",
    label: "Material",
    addLabel: "Adicionar Material",
    placeholder: "Buscar Material...",
    items: [
      { id: 1, name: "Resina Ortoftálica", code: "MAT-001", unit: "KG", qty: 48.5 },
      { id: 2, name: "Fibra de Vidro Roving", code: "MAT-002", unit: "KG", qty: 24.0 },
      { id: 3, name: "Manta de Vidro 450g", code: "MAT-003", unit: "m²", qty: 12.0 },
      { id: 4, name: "Catalisador MEKP", code: "MAT-004", unit: "L", qty: 1.45 },
    ],
  },
  {
    key: "acessorio",
    label: "Acessório",
    addLabel: "Adicionar Acessório",
    placeholder: "Buscar Acessório...",
    items: [
      { id: 1, name: "Parafuso M8x30 Inox", code: "ACS-001", unit: "PC", qty: 40 },
      { id: 2, name: "Rebite 4.8x10 Alumínio", code: "ACS-002", unit: "PC", qty: 120 },
      { id: 3, name: "Vedação Espuma 10mm", code: "ACS-003", unit: "m", qty: 5 },
    ],
  },
  {
    key: "componente",
    label: "Componente",
    addLabel: "Adicionar Componente",
    placeholder: "Buscar Componente...",
    items: [
      { id: 1, name: "Flange DN50 PN10", code: "CMP-001", unit: "PC", qty: 4 },
      { id: 2, name: "Válvula Esfera 1\"", code: "CMP-002", unit: "PC", qty: 2 },
    ],
  },
  {
    key: "equipamento",
    label: "Equipamento",
    addLabel: "Adicionar Equipamento",
    placeholder: "Buscar Equipamento...",
    items: [
      { id: 1, name: "Laminadora CNC L-200", code: "EQP-001", unit: "H", qty: 24 },
      { id: 2, name: "Esmerilhadeira Angular", code: "EQP-002", unit: "H", qty: 6 },
      { id: 3, name: "Serra Fita SF-350", code: "EQP-003", unit: "H", qty: 3 },
    ],
  },
];

export default function Receitas() {
  const [sections, setSections] = useState(initialSections);
  const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
    material: true, acessorio: false, componente: false, equipamento: false,
  });
  const [searches, setSearches] = useState<Record<SectionKey, string>>({
    material: "", acessorio: "", componente: "", equipamento: "",
  });

  const toggle = (key: SectionKey) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const removeItem = (sectionKey: SectionKey, id: number) => {
    setSections(prev => prev.map(s => s.key === sectionKey ? { ...s, items: s.items.filter(i => i.id !== id) } : s));
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sections.map(section => {
          const isOpen = expanded[section.key];
          const search = searches[section.key];
          const filtered = section.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()));

          return (
            <div key={section.key} style={{
              background: "#fff", borderRadius: 4, border: "1px solid #DFE1E6",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)", overflow: "hidden",
            }}>
              {/* Header row */}
              <div style={{
                display: "flex", alignItems: "center", padding: "14px 20px", gap: 16,
                cursor: "pointer", userSelect: "none",
                borderBottom: isOpen ? "1px solid #DFE1E6" : "none",
              }} onClick={() => toggle(section.key)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ flexShrink: 0, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.18s", color: "#5E6C84" }}>
                  <path d="M4 2L10 7L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#172B4D", flex: 1 }}>{section.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#5E6C84", background: "#F4F5F7", borderRadius: 10, padding: "2px 8px" }}>
                  {section.items.length} {section.items.length === 1 ? "item" : "itens"}
                </span>
                {/* Search */}
                <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}>
                    <circle cx="6" cy="6" r="4.5" stroke="#97A0AF" strokeWidth="1.3"/>
                    <path d="M10 10L12.5 12.5" stroke="#97A0AF" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <input
                    value={search}
                    onChange={e => setSearches(prev => ({ ...prev, [section.key]: e.target.value }))}
                    placeholder={section.placeholder}
                    style={{ border: "1px solid #DFE1E6", borderRadius: 4, padding: "6px 10px 6px 26px", fontSize: 12, fontFamily: "inherit", outline: "none", color: "#172B4D", width: 180 }}
                  />
                </div>
                {/* Add button */}
                <div onClick={e => e.stopPropagation()}>
                  <button style={{
                    background: "#00875A", border: "none", borderRadius: 4,
                    color: "#fff", fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                    padding: "7px 14px", cursor: "pointer", whiteSpace: "nowrap",
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                    {section.addLabel}
                  </button>
                </div>
                {/* Dropdown chevron */}
                <button onClick={e => e.stopPropagation()} style={{ background: "transparent", border: "1px solid #DFE1E6", borderRadius: 4, color: "#5E6C84", padding: "6px 8px", cursor: "pointer" }}>
                  <svg width="10" height="10" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </button>
              </div>

              {/* Table */}
              {isOpen && (
                filtered.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#F8F9FA" }}>
                        {["Código", "Nome / Descrição", "Unidade", "Quantidade", ""].map(h => (
                          <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontWeight: 600, color: "#5E6C84", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #DFE1E6" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, i) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #F4F5F7", background: i % 2 === 0 ? "#fff" : "#FAFBFC" }}>
                          <td style={{ padding: "11px 20px", color: "#5E6C84", fontWeight: 600, fontSize: 12, fontFamily: "monospace" }}>{item.code}</td>
                          <td style={{ padding: "11px 20px", color: "#172B4D", fontWeight: 500 }}>{item.name}</td>
                          <td style={{ padding: "11px 20px", color: "#5E6C84" }}>{item.unit}</td>
                          <td style={{ padding: "11px 20px", color: "#172B4D", fontWeight: 600 }}>{item.qty}</td>
                          <td style={{ padding: "11px 20px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button style={{ background: "none", border: "none", cursor: "pointer", color: "#5E6C84", padding: "3px 6px", borderRadius: 3 }}>
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                              </button>
                              <button onClick={() => removeItem(section.key, item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DE350B", padding: "3px 6px", borderRadius: 3 }}>
                                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 4H12M5 4V2.5H9V4M5.5 6.5V10.5M8.5 6.5V10.5M3 4L3.5 11.5H10.5L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "#97A0AF", fontSize: 13 }}>
                    Nenhum item encontrado.
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
