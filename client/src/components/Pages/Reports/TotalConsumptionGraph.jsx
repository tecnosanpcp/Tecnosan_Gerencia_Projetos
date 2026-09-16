import React, { useMemo, useState } from "react";
import Chart from "react-apexcharts";

export default function TotalConsumptionGraph({ data = [] }) {
  const [metric, setMetric] = useState("kg");

  const safeData = Array.isArray(data) ? data : [];

  const normalizedData = useMemo(() => {
    return safeData.map((item) => {
      const project =
        item.project_name ||
        item.projeto ||
        item.project ||
        "Sem projeto";

      const material =
        item.material_name ||
        item.material ||
        item.nome_material ||
        "Material";

      const kg =
        Number(
          item.total_kg ??
            item.consumed_kg ??
            item.consumption_kg ??
            item.kg ??
            item.quantity_kg ??
            0
        ) || 0;

      const value =
        Number(
          item.total_value ??
            item.total_price ??
            item.value ??
            item.valor ??
            item.cost ??
            0
        ) || 0;

      return {
        project,
        material,
        kg,
        value,
      };
    });
  }, [safeData]);

  const projects = useMemo(() => {
    return [...new Set(normalizedData.map((item) => item.project))];
  }, [normalizedData]);

  const materials = useMemo(() => {
    return [...new Set(normalizedData.map((item) => item.material))];
  }, [normalizedData]);

  const series = useMemo(() => {
    return materials.map((material) => ({
      name: material,

      data: projects.map((project) => {
        const items = normalizedData.filter(
          (item) =>
            item.project === project &&
            item.material === material
        );

        return items.reduce(
          (total, item) =>
            total +
            (metric === "kg" ? item.kg : item.value),
          0
        );
      }),
    }));
  }, [materials, projects, normalizedData, metric]);

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: {
        show: false,
      },
      fontFamily: "Inter, system-ui, sans-serif",
      background: "transparent",
      animations: {
        enabled: true,
        speed: 300,
      },
    },

    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "48%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },

    colors: [
      "#0052CC",
      "#6554C0",
      "#00875A",
      "#FF991F",
      "#DE350B",
      "#00A3BF",
      "#403294",
      "#36B37E",
    ],

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories: projects,
      labels: {
        style: {
          colors: "#5E6C84",
          fontSize: "10px",
          fontFamily: "Inter, system-ui, sans-serif",
        },
        rotate: -35,
        trim: true,
      },
      axisBorder: {
        color: "#DFE1E6",
      },
      axisTicks: {
        color: "#DFE1E6",
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: "#5E6C84",
          fontSize: "10px",
          fontFamily: "Inter, system-ui, sans-serif",
        },

        formatter: (value) => {
          if (metric === "kg") {
            return `${Number(value).toLocaleString("pt-BR")} kg`;
          }

          return `R$ ${Number(value).toLocaleString("pt-BR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`;
        },
      },
    },

    grid: {
      borderColor: "#EBECF0",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "10px",
      fontFamily: "Inter, system-ui, sans-serif",
      labels: {
        colors: "#5E6C84",
      },
      markers: {
        width: 8,
        height: 8,
        radius: 4,
      },
      itemMargin: {
        horizontal: 6,
      },
    },

    tooltip: {
      theme: "light",

      shared: true,
      intersect: false,

      y: {
        formatter: (value) => {
          if (metric === "kg") {
            return `${Number(value).toLocaleString("pt-BR")} kg`;
          }

          return `R$ ${Number(value).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        },
      },

      style: {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "11px",
      },
    },

    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "58%",
            },
          },

          legend: {
            position: "bottom",
            horizontalAlign: "left",
          },
        },
      },
    ],
  };

  return (
    <div className="h-full min-h-0 w-full rounded-xl border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_2px_rgba(9,30,66,0.08)]">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-semibold text-[#172B4D]">
            Consumo Total
          </h3>

          <p className="mt-0.5 text-[11px] text-[#5E6C84]">
            Consumo de materiais por projeto
          </p>
        </div>

        <div className="flex shrink-0 rounded-lg border border-[#DFE1E6] bg-[#F4F5F7] p-0.5">
          <button
            type="button"
            onClick={() => setMetric("kg")}
            className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
              metric === "kg"
                ? "bg-white text-[#0052CC] shadow-sm"
                : "text-[#5E6C84] hover:text-[#172B4D]"
            }`}
          >
            KG
          </button>

          <button
            type="button"
            onClick={() => setMetric("value")}
            className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
              metric === "value"
                ? "bg-white text-[#0052CC] shadow-sm"
                : "text-[#5E6C84] hover:text-[#172B4D]"
            }`}
          >
            R$
          </button>
        </div>
      </div>

      <div className="h-[calc(100%-48px)] min-h-[220px] w-full">
        {projects.length > 0 && series.length > 0 ? (
          <Chart
            options={options}
            series={series}
            type="bar"
            height="100%"
            width="100%"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[12px] text-[#97A0AF]">
            Não há dados para exibir.
          </div>
        )}
      </div>
    </div>
  );
}