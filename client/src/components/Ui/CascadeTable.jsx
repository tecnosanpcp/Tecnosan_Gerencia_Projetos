import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";

import RemoveSquareImg from "../../imgs/remove-square.png";
import AddSquareImg from "../../imgs/add-square.png";

function normalize(str) {
  return String(str ?? "")
    .trim()
    .toLowerCase();
}

function CascadeTable({ title, headers, values, filter }) {
  const [openGroups, setOpenGroups] = useState({});
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);

  // 🔹 Cria lista de filtros de materiais (únicos, ordenados, + "Todos")
  const filters = useMemo(() => {
    const uniqueFromData = Array.from(
      new Set(values.map((v) => normalize(v.material_name)))
    ).filter(Boolean);

    const normalizedPropFilter = Array.isArray(filter)
      ? Array.from(new Set(filter.map((f) => normalize(f)).filter(Boolean)))
      : [];

    const base = normalizedPropFilter.length
      ? normalizedPropFilter
      : uniqueFromData;

    const readable = base.map((s) => s.charAt(0).toUpperCase() + s.slice(1));

    return ["Todos", ...readable];
  }, [values, filter]);

  const selectedFilter = filters[selectedFilterIndex] ?? filters[0];

  // 🔹 Agrupa os dados em níveis (projeto > equipamento > componente)
  const groupedData = useMemo(() => {
    const grouped = {};
    values.forEach((item) => {
      const project = item.project_name ?? "Sem Projeto";
      const equipment = item.equipment_name ?? "Sem Equipamento";
      const component = item.component_name ?? "Sem Componente";
      const material = item.material_name ?? "";
      const total_material_consumed = Number(item.total_material_consumed) || 0;

      if (!grouped[project]) grouped[project] = {};
      if (!grouped[project][equipment]) grouped[project][equipment] = {};
      if (!grouped[project][equipment][component])
        grouped[project][equipment][component] = [];

      grouped[project][equipment][component].push({
        material,
        total_material_consumed,
      });
    });
    return grouped;
  }, [values]);

  const toggleGroup = (key) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // 🔹 Calcula total de um grupo com base no filtro atual
  const calcularTotal = (items) => {
    const sel = normalize(selectedFilter);
    return items.reduce((acc, { material, total_material_consumed }) => {
      const matNorm = normalize(material);
      if (sel === "todos" || matNorm === sel)
        return acc + total_material_consumed;
      return acc;
    }, 0);
  };

  // 🔹 Remove grupos que não têm uso do material selecionado
  const filteredProjects = useMemo(() => {
    const sel = normalize(selectedFilter);
    const filtered = {};

    for (const [project, equipments] of Object.entries(groupedData)) {
      const validEquipments = {};

      for (const [equipment, components] of Object.entries(equipments)) {
        const validComponents = {};

        for (const [component, materials] of Object.entries(components)) {
          const filteredMaterials =
            sel === "todos"
              ? materials
              : materials.filter((m) => normalize(m.material) === sel);

          if (filteredMaterials.length > 0) {
            validComponents[component] = filteredMaterials;
          }
        }

        if (Object.keys(validComponents).length > 0) {
          validEquipments[equipment] = validComponents;
        }
      }

      if (Object.keys(validEquipments).length > 0) {
        filtered[project] = validEquipments;
      }
    }

    return filtered;
  }, [groupedData, selectedFilter]);

  const displayedHeaders = [
    headers?.[0] || "Item",
    headers?.[1] || "Quantidade",
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-2 text-base">
      {/* 🔹 Cabeçalho */}
      <div className="relative bg-sky-200 font-bold py-1 px-2 flex items-center text-base">
        <h2 className="flex-1 text-center">{title}</h2>
        {filters.length > 1 && (
          <div className="absolute right-2">
            <select
              className="border-none rounded p-1  bg-transparent"
              value={selectedFilterIndex}
              onChange={(e) =>
                setSelectedFilterIndex(Number(e.target.value) || 0)
              }
            >
              {filters.map((f, i) => (
                <option key={i} value={i}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 🔹 Tabela */}
      <table className="min-w-full border-collapse text-base">
        <thead>
          <tr className="bg-sky-200 uppercase font-semibold ">
            {displayedHeaders.map((header, index) => (
              <th
                key={index}
                className="p-2 border-b border-sky-300 text-center"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(filteredProjects).length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center py-4 text-gray-500">
                Nenhum item com o filtro selecionado.
              </td>
            </tr>
          ) : (
            Object.entries(filteredProjects).map(([project, equipments]) => {
              const projectItems = Object.values(equipments).flatMap(
                (components) => Object.values(components).flat()
              );
              const projectTotal = calcularTotal(projectItems);

              return (
                <React.Fragment key={project}>
                  {/* Projeto */}
                  <tr className="bg-sky-100 hover:bg-sky-200 ">
                    <td colSpan={2}>
                      <button
                        onClick={() => toggleGroup(project)}
                        className="flex items-center justify-between w-full p-2 font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <img
                            src={
                              openGroups[project]
                                ? RemoveSquareImg
                                : AddSquareImg
                            }
                            className="h-4 w-4"
                            alt="toggle"
                          />
                          {project}
                        </span>
                        <span>
                          Total ({selectedFilter}): {projectTotal}
                        </span>
                      </button>
                    </td>
                  </tr>

                  {/* Equipamentos */}
                  {openGroups[project] &&
                    Object.entries(equipments).map(
                      ([equipment, components]) => {
                        const equipKey = `${project}-${equipment}`;
                        const equipItems = Object.values(components).flat();
                        const equipTotal = calcularTotal(equipItems);

                        return (
                          <React.Fragment key={equipKey}>
                            <tr className="bg-sky-50 hover:bg-sky-100 ">
                              <td colSpan={2}>
                                <button
                                  onClick={() => toggleGroup(equipKey)}
                                  className="flex items-center justify-between w-full p-2 font-medium pl-6"
                                >
                                  <span className="flex items-center gap-2">
                                    <img
                                      src={
                                        openGroups[equipKey]
                                          ? RemoveSquareImg
                                          : AddSquareImg
                                      }
                                      className="h-4 w-4"
                                      alt="toggle"
                                    />
                                    {equipment}
                                  </span>
                                  <span>{equipTotal}</span>
                                </button>
                              </td>
                            </tr>

                            {/* Componentes */}
                            {openGroups[equipKey] &&
                              Object.entries(components).map(
                                ([component, materials]) => {
                                  const compKey = `${equipKey}-${component}`;
                                  const compTotal = calcularTotal(materials);

                                  return (
                                    <React.Fragment key={compKey}>
                                      <tr className="bg-white hover:bg-sky-50 ">
                                        <td
                                          colSpan={2}
                                          className="p-2 pl-12 font-semibold"
                                        >
                                          <button
                                            onClick={() => toggleGroup(compKey)}
                                            className="flex items-center justify-between w-full"
                                          >
                                            <span className="flex items-center gap-2">
                                              <img
                                                src={
                                                  openGroups[compKey]
                                                    ? RemoveSquareImg
                                                    : AddSquareImg
                                                }
                                                className="h-4 w-4"
                                                alt="toggle"
                                              />
                                              {component}
                                            </span>
                                            <span>{compTotal}</span>
                                          </button>
                                        </td>
                                      </tr>

                                      {/* Materiais */}
                                      {openGroups[compKey] &&
                                        materials.map((m, i) => (
                                          <tr
                                            key={i}
                                            className="bg-white hover:bg-sky-50 "
                                          >
                                            <td className="p-2 pl-16 border-b border-sky-100">
                                              {m.material}
                                            </td>
                                            <td className="p-2 border-b border-sky-100 text-center">
                                              {m.total_material_consumed}
                                            </td>
                                          </tr>
                                        ))}
                                    </React.Fragment>
                                  );
                                }
                              )}
                          </React.Fragment>
                        );
                      }
                    )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

CascadeTable.propTypes = {
  title: PropTypes.string.isRequired,
  headers: PropTypes.arrayOf(PropTypes.string),
  filter: PropTypes.arrayOf(PropTypes.string),
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CascadeTable;
