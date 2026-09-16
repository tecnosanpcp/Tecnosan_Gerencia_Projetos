import React from "react";
import Chart from "react-apexcharts";

export default function ProjectEvolutionGraph({
  categories = [],
  series = [],
}) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeSeries = Array.isArray(series) ? series : [];

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
        columnWidth: "42%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },

    colors: ["#0052CC", "#DFE1E6"],

    dataLabels: {
      enabled: false,
    },

    stroke: {
      show: false,
    },

    xaxis: {
      categories: safeCategories,
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
      fontSize: "11px",
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
        horizontal: 8,
      },
    },

    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
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
              columnWidth: "55%",
            },
          },
          xaxis: {
            labels: {
              rotate: -45,
              fontSize: "9px",
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
            Evolução dos Projetos
          </h3>

          <p className="mt-0.5 text-[11px] text-[#5E6C84]">
            Componentes entregues e pendentes
          </p>
        </div>
      </div>

      <div className="h-[calc(100%-48px)] min-h-[220px] w-full">
        {safeCategories.length > 0 && safeSeries.length > 0 ? (
          <Chart
            options={options}
            series={safeSeries}
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