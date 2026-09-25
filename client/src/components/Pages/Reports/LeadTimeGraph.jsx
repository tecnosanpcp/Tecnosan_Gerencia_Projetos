import React, { useMemo } from "react";
import Chart from "react-apexcharts";

export default function LeadTimeGraph({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  const categories = useMemo(() => {
    return safeData.map(
      (item) =>
        item.component_name ||
        item.component ||
        item.nome_componente ||
        "Componente",
    );
  }, [safeData]);

  const metaHours = useMemo(() => {
    return safeData.map(
      (item) =>
        Number(
          item.meta_hours ??
            item.target_hours ??
            item.planned_hours ??
            item.horas_meta ??
            0,
        ) || 0,
    );
  }, [safeData]);

  const realHours = useMemo(() => {
    return safeData.map(
      (item) =>
        Number(
          item.real_hours ??
            item.actual_hours ??
            item.total_hours ??
            item.horas_reais ??
            0,
        ) || 0,
    );
  }, [safeData]);

  const realColors = useMemo(() => {
    return realHours.map((real, index) => {
      const meta = metaHours[index] || 0;

      if (meta > 0 && real > meta) {
        return "#DE350B";
      }

      return "#00875A";
    });
  }, [realHours, metaHours]);

  const options = {
    chart: {
      type: "line",
      toolbar: {
        show: false,
      },
      fontFamily: "Inter, system-ui, sans-serif",
      background: "transparent",
      animations: {
        enabled: true,
        speed: 150,
        animateGradually: {
          enabled: false,
        },
        dynamicAnimation: {
          enabled: false,
        },
      },
    },

    colors: ["#00875A", "#0052CC"],

    stroke: {
      width: [0, 2],
      curve: "smooth",
      dashArray: [0, 6],
    },

    markers: {
      size: [0, 4],
      strokeWidth: 2,
      strokeColors: "#FFFFFF",
      hover: {
        size: 5,
      },
    },

    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 4,
        colors: {
          ranges: realHours.map((value, index) => ({
            from: value,
            to: value,
            color: realColors[index],
          })),
        },
      },
    },

    dataLabels: {
      enabled: false,
    },

    xaxis: {
      categories,
      min: 0,
      max: Math.min(7, categories.length - 1),
      labels: {
        style: {
          colors: "#5E6C84",
          fontSize: "9px",
          fontFamily: "Inter, system-ui, sans-serif",
        },
        rotate: 0,
        trim: true,
        hideOverlappingLabels: true,
        maxHeight: 36,
      },

      axisBorder: {
        color: "#DFE1E6",
      },

      axisTicks: {
        color: "#DFE1E6",
      },
    },

    yaxis: {
      min: 0,

      labels: {
        style: {
          colors: "#5E6C84",
          fontSize: "10px",
          fontFamily: "Inter, system-ui, sans-serif",
        },

        formatter: (value) => `${Number(value).toLocaleString("pt-BR")} h`,
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
        horizontal: 8,
      },
    },

    tooltip: {
      theme: "light",

      shared: true,
      intersect: false,

      y: {
        formatter: (value) => `${Number(value).toLocaleString("pt-BR")} h`,
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
          xaxis: {
            labels: {
              rotate: -45,
              fontSize: "8px",
            },
          },

          legend: {
            position: "bottom",
            horizontalAlign: "left",
          },

          plotOptions: {
            bar: {
              columnWidth: "55%",
            },
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Horas reais",
      type: "column",
      data: realHours,
    },
    {
      name: "Meta",
      type: "line",
      data: metaHours,
    },
  ];

  return (
    <div className="h-full min-h-0 w-full">
      <div className="h-[calc(100%-48px)] min-h-[220px] w-full">
        {categories.length > 0 ? (
          <Chart
            options={{
              ...options,
              plotOptions: {
                ...options.plotOptions,
                bar: {
                  ...options.plotOptions.bar,
                  colors: {
                    ranges: realHours.map((value, index) => ({
                      from: value,
                      to: value,
                      color: realColors[index],
                    })),
                  },
                },
              },
            }}
            series={series}
            type="line"
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
