import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  X,
  GitCompareArrows,
  TrendingUp,
  Trash2,
} from "lucide-react";

import {
  vwMaterialsConsumption,
  vwMaterialsWaste,
} from "@services/HomeServices.js";

const CHART_INFO = {
  materials: {
    title: "Consumo de Materiais",
    description:
      "Quantidade total de materiais consumidos por mês.",
    dataKey: "consumo",
    label: "Consumo",
  },

  waste: {
    title: "Desperdício de Materiais",
    description:
      "Quantidade de material descartado por mês.",
    dataKey: "desperdicio",
    label: "Desperdício",
  },
};

export default function ChartCompareModal({
  firstChart,
  secondChart,
  onClose,
  onChangeSecond,
}) {
  const [consumptionData, setConsumptionData] =
    useState([]);

  const [wasteData, setWasteData] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        const [
          consumption,
          waste,
        ] = await Promise.all([
          vwMaterialsConsumption(),
          vwMaterialsWaste(),
        ]);

        if (!mounted) return;

        setConsumptionData(
          Array.isArray(consumption)
            ? consumption
            : []
        );

        setWasteData(
          Array.isArray(waste)
            ? waste
            : []
        );
      } catch (error) {
        console.error(
          "Erro ao carregar dados da comparação:",
          error
        );

        if (!mounted) return;

        setConsumptionData([]);
        setWasteData([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const comparisonData = useMemo(() => {
    const months = new Set();

    consumptionData.forEach((item) => {
      if (
        item?.mes !== undefined &&
        item?.mes !== null
      ) {
        months.add(String(item.mes));
      }
    });

    wasteData.forEach((item) => {
      if (
        item?.mes !== undefined &&
        item?.mes !== null
      ) {
        months.add(String(item.mes));
      }
    });

    return Array.from(months).map((month) => {
      const consumption =
        consumptionData.find(
          (item) =>
            String(item?.mes) === month
        );

      const waste =
        wasteData.find(
          (item) =>
            String(item?.mes) === month
        );

      return {
        mes: month,

        consumo: Number(
          consumption?.quantidade_total ?? 0
        ),

        desperdicio: Number(
          waste?.quantidade_refugo ?? 0
        ),
      };
    });
  }, [
    consumptionData,
    wasteData,
  ]);

  const firstInfo = CHART_INFO[firstChart];
  const secondInfo = CHART_INFO[secondChart];

  const firstTotal = comparisonData.reduce(
    (total, item) =>
      total +
      Number(
        item[firstInfo.dataKey] || 0
      ),
    0
  );

  const secondTotal = comparisonData.reduce(
    (total, item) =>
      total +
      Number(
        item[secondInfo.dataKey] || 0
      ),
    0
  );

  const wastePercentage =
    firstChart === "materials" &&
    secondChart === "waste" &&
    firstTotal > 0
      ? (secondTotal / firstTotal) * 100
      : secondChart === "materials" &&
        firstChart === "waste" &&
        secondTotal > 0
      ? (firstTotal / secondTotal) * 100
      : null;

  return (
    <div
      className="fixed inset-0 z-[9500] bg-[rgba(9,30,66,0.66)] backdrop-blur-[7px] flex items-center justify-center p-4 md:p-8"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[1250px] h-[88vh] max-h-[900px] bg-white rounded-lg shadow-[0_24px_80px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <header className="flex items-center gap-3 px-5 py-4 border-b border-[#DFE1E6] shrink-0">
          <div className="w-9 h-9 rounded-md bg-[#E9F2FF] text-[#0052CC] flex items-center justify-center">
            <GitCompareArrows size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="m-0 text-[17px] font-bold text-[#172B4D]">
              Comparação de indicadores
            </h2>

            <p className="m-0 mt-0.5 text-[11px] text-[#5E6C84]">
              Análise visual dos gráficos selecionados.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#DFE1E6] text-[#5E6C84] hover:bg-[#F4F5F7] hover:text-[#172B4D] transition-colors"
          >
            <X size={16} />
          </button>
        </header>

        {/* INDICADORES */}
        <div className="px-5 py-3 border-b border-[#F4F5F7] bg-[#FAFBFC]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded border border-[#B3D4FF] bg-[#E9F2FF] text-[#0052CC] text-[11px] font-bold">
              {firstInfo.title}
            </div>

            <span className="text-[#97A0AF] font-bold">
              ×
            </span>

            <select
              value={secondChart}
              onChange={(event) =>
                onChangeSecond(
                  event.target.value
                )
              }
              className="h-8 px-3 rounded border border-[#DFE1E6] bg-white text-[11px] font-semibold text-[#172B4D] outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#B3D4FF]"
            >
              <option value="waste">
                Desperdício de Materiais
              </option>

              <option value="materials">
                Consumo de Materiais
              </option>
            </select>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 min-h-0 overflow-auto p-5">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-9 h-9 border-2 border-[#DFE1E6] border-t-[#0052CC] rounded-full animate-spin mx-auto mb-3" />

                <p className="m-0 text-[12px] font-semibold text-[#5E6C84]">
                  Carregando comparação...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* RESUMO */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                <SummaryCard
                  title={firstInfo.title}
                  value={firstTotal}
                  icon={
                    <TrendingUp size={15} />
                  }
                />

                <SummaryCard
                  title={secondInfo.title}
                  value={secondTotal}
                  icon={
                    secondChart === "waste" ? (
                      <Trash2 size={15} />
                    ) : (
                      <TrendingUp size={15} />
                    )
                  }
                />

                {wastePercentage !== null ? (
                  <SummaryCard
                    title="Desperdício sobre consumo"
                    value={wastePercentage}
                    suffix="%"
                    icon={
                      <GitCompareArrows
                        size={15}
                      />
                    }
                  />
                ) : (
                  <SummaryCard
                    title="Períodos comparados"
                    value={
                      comparisonData.length
                    }
                    suffix=" meses"
                    icon={
                      <GitCompareArrows
                        size={15}
                      />
                    }
                  />
                )}
              </div>

              {/* GRÁFICO GRANDE */}
              <div className="border border-[#DFE1E6] rounded-md bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-[#F4F5F7]">
                  <h3 className="m-0 text-[12px] font-bold uppercase tracking-[0.06em] text-[#172B4D]">
                    {firstInfo.title} ×{" "}
                    {secondInfo.title}
                  </h3>

                  <p className="m-0 mt-1 text-[10px] text-[#97A0AF]">
                    Comparação mensal dos indicadores.
                  </p>
                </div>

                <div className="h-[500px] p-5">
                  {comparisonData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[12px] text-[#6B778C]">
                      Não existem dados suficientes
                      para realizar a comparação.
                    </div>
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={comparisonData}
                        margin={{
                          top: 15,
                          right: 25,
                          left: 5,
                          bottom: 15,
                        }}
                      >
                        <CartesianGrid
                          stroke="#EBECF0"
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="mes"
                          tick={{
                            fontSize: 11,
                            fill: "#6B778C",
                          }}
                          axisLine={{
                            stroke: "#DFE1E6",
                          }}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{
                            fontSize: 11,
                            fill: "#6B778C",
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          cursor={{
                            fill: "#F4F5F7",
                          }}
                          formatter={(
                            value,
                            name
                          ) => [
                            `${Number(
                              value
                            ).toFixed(2)} Kg`,
                            name,
                          ]}
                          contentStyle={{
                            border:
                              "1px solid #DFE1E6",
                            borderRadius:
                              "6px",
                            boxShadow:
                              "0 4px 12px rgba(9, 30, 66, 0.15)",
                            fontSize: "12px",
                          }}
                        />

                        <Legend
                          verticalAlign="top"
                          align="right"
                          height={40}
                          wrapperStyle={{
                            fontSize: "11px",
                            color: "#5E6C84",
                          }}
                        />

                        <Bar
                          dataKey={
                            firstInfo.dataKey
                          }
                          name={
                            firstInfo.label
                          }
                          fill="#0052CC"
                          radius={[
                            4,
                            4,
                            0,
                            0,
                          ]}
                          barSize={32}
                        />

                        <Bar
                          dataKey={
                            secondInfo.dataKey
                          }
                          name={
                            secondInfo.label
                          }
                          fill="#DE350B"
                          radius={[
                            4,
                            4,
                            0,
                            0,
                          ]}
                          barSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  suffix = " Kg",
  icon,
}) {
  return (
    <div className="relative overflow-hidden rounded border border-[#DFE1E6] bg-white p-4 shadow-[0_1px_3px_rgba(9,30,66,0.06)]">
      <div className="absolute left-0 top-0 h-full w-[3px] bg-[#0052CC]" />

      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded bg-[#F4F5F7] text-[#0052CC] flex items-center justify-center">
          {icon}
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6B778C]">
          {title}
        </span>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-[24px] font-bold leading-none text-[#172B4D]">
          {Number(value).toFixed(2)}
        </span>

        <span className="text-[11px] font-semibold text-[#6B778C]">
          {suffix}
        </span>
      </div>
    </div>
  );
}   