import React from "react";
import Chart from "react-apexcharts";

export default function ProjectEvolutionGraph({
  categories = [],
  series = [],
}) {
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeSeries = Array.isArray(series) ? series : [];
  const abbreviateProjectName = (name, maxLength = 16) => {
    if (!name) return "Sem projeto";

    const text = String(name).trim();

    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength).trim()}...`;
  };

  const displayCategories = safeCategories.map((category) =>
    abbreviateProjectName(category),
  );

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
      categories: displayCategories,
      labels: {
        style: {
          colors: "#5E6C84",
          fontSize: "10px",
          fontFamily: "Inter, system-ui, sans-serif",
        },
        rotate: 0,
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
              rotate: -30,
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
    <div className="h-full min-h-0 w-full  p-4 ">
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
