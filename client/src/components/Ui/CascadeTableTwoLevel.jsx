import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";

import RemoveSquareImg from "../../../imgs/remove-square.png";
import AddSquareImg from "../../../imgs/add-square.png";

function CascadeTableTwoLevel({ title, data }) {
  const [openGroups, setOpenGroups] = useState({});

  // 🔹 Agrupa os componentes por departamento
  const groupedData = useMemo(() => {
    const grouped = {};
    data.forEach((item) => {
      const dept = item.department_name ?? "Sem Departamento";
      const comp = item.component_name ?? "Sem Componente";
      const daysLate = Number(item.days_late) || 0;

      if (!grouped[dept]) grouped[dept] = [];
      grouped[dept].push({ component_name: comp, days_late: daysLate });
    });
    return grouped;
  }, [data]);

  // 🔹 Abre ou fecha um grupo
  const toggleGroup = (key) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // 🔹 Calcula total de processos e média de atraso
  const getTotals = (items) => {
    const avgDays =
      items.length > 0
        ? Math.round(items.reduce((acc, i) => acc + i.days_late, 0))
        : 0;
    return avgDays;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 text-base">
      {/* 🔹 Cabeçalho */}
      <div className="relative bg-sky-200 font-bold py-1 px-2 flex items-center text-base">
        <h2 className="flex-1 text-center">{title || "Processos em Atraso"}</h2>
      </div>

      {/* 🔹 Tabela */}
      <table className="min-w-full border-collapse text-base">
        <thead>
          <tr className="bg-sky-200 uppercase font-semibold ">
            <th className="p-2 border-b border-sky-300 text-center">
              Departamento / Componente
            </th>
            <th className="p-2 border-b border-sky-300 text-center">
              Dias de Atraso
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedData).length === 0 ? (
            <tr>
              <td colSpan={2} className="text-center py-4 text-gray-500">
                Nenhum processo em atraso.
              </td>
            </tr>
          ) : (
            Object.entries(groupedData).map(([department, components]) => {
              const avgDays = getTotals(components);
              return (
                <React.Fragment key={department}>
                  {/* 🔹 Departamento */}
                  <tr className="bg-sky-100 hover:bg-sky-200 ">
                    <td colSpan={2}>
                      <button
                        onClick={() => toggleGroup(department)}
                        className="flex items-center justify-between w-full p-2 font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <img
                            src={
                              openGroups[department]
                                ? RemoveSquareImg
                                : AddSquareImg
                            }
                            className="h-4 w-4"
                            alt="toggle"
                          />
                          {department}
                        </span>
                        <span>{avgDays} dias</span>
                      </button>
                    </td>
                  </tr>

                  {/* 🔹 Componentes */}
                  {openGroups[department] &&
                    components.map((item, i) => (
                      <tr
                        key={i}
                        className="bg-white hover:bg-sky-50  border-b border-sky-100"
                      >
                        <td className="p-2 pl-8">{item.component_name}</td>
                        <td className="p-2 text-center">{item.days_late}</td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

CascadeTableTwoLevel.propTypes = {
  title: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      department_name: PropTypes.string,
      component_name: PropTypes.string,
      days_late: PropTypes.number,
    })
  ).isRequired,
};

export default CascadeTableTwoLevel;
