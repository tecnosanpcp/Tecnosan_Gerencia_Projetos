import { useMemo } from "react";
import { IoMdClose } from "react-icons/io";

function KpiChartModal({
  isOpen,
  onClose,
  title,
  value,
  unit,
  history = [],
}) {
  const chartData = useMemo(() => {
    if (!Array.isArray(history)) {
      return [];
    }

    return history
      .filter(
        (item) =>
          item &&
          item.value !== undefined &&
          item.value !== null
      )
      .map((item) => ({
        label:
          item.label ||
          item.month ||
          item.date ||
          "",
        value: Number(item.value) || 0,
      }));
  }, [history]);

  const maxValue = useMemo(() => {
    if (!chartData.length) {
      return 0;
    }

    return Math.max(
      ...chartData.map((item) => item.value)
    );
  }, [chartData]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-[#091E42]/50
        p-4
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex w-full max-w-[900px]
          max-h-[85vh]
          flex-col
          overflow-hidden
          rounded-xl
          border border-[#DFE1E6]
          bg-white
          shadow-[0_20px_50px_rgba(9,30,66,0.25)]
        "
      >
        <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-[#DFE1E6] px-5">
          <div>
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.07em] text-[#5E6C84]">
              Indicador de produção
            </p>

            <h2 className="m-0 mt-0.5 text-[18px] font-bold text-[#172B4D]">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar gráfico"
            className="
              flex h-8 w-8 items-center justify-center
              rounded-[4px]
              text-[#5E6C84]
              transition-colors
              hover:bg-[#F4F5F7]
              hover:text-[#172B4D]
            "
          >
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-5">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B778C]">
                Valor atual
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[32px] font-bold leading-none text-[#172B4D]">
                  {Number(value || 0).toLocaleString(
                    "pt-BR"
                  )}
                </span>

                <span className="text-[13px] font-semibold text-[#6B778C]">
                  {unit}
                </span>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="text-right">
                <p className="m-0 text-[10px] text-[#97A0AF]">
                  Período analisado
                </p>

                <p className="m-0 mt-0.5 text-[11px] font-semibold text-[#5E6C84]">
                  {chartData.length} períodos
                </p>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[#DFE1E6] bg-[#FAFBFC] p-5">
            <div className="mb-4">
              <p className="m-0 text-[12px] font-bold text-[#172B4D]">
                Evolução
              </p>

              <p className="m-0 mt-0.5 text-[10px] text-[#6B778C]">
                Histórico real do indicador
              </p>
            </div>

            {chartData.length > 0 ? (
              <div className="relative h-[300px]">
                <div className="absolute inset-0 flex flex-col justify-between pb-7">
                  {[0, 1, 2, 3].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-[#DFE1E6]"
                    />
                  ))}
                </div>

                <div className="absolute inset-0 flex items-end gap-2 pb-7 pt-4">
                  {chartData.map((item, index) => {
                    const height =
                      maxValue > 0
                        ? Math.max(
                            (item.value / maxValue) *
                              100,
                            2
                          )
                        : 0;

                    return (
                      <div
                        key={`${item.label}-${index}`}
                        className="group relative flex h-full flex-1 flex-col justify-end"
                      >
                        <div
                          className="
                            pointer-events-none
                            absolute bottom-full left-1/2
                            z-10 mb-2
                            -translate-x-1/2
                            whitespace-nowrap
                            rounded-[4px]
                            bg-[#172B4D]
                            px-2 py-1
                            text-[10px]
                            font-semibold
                            text-white
                            opacity-0
                            transition-opacity
                            group-hover:opacity-100
                          "
                        >
                          {Number(
                            item.value
                          ).toLocaleString("pt-BR")}{" "}
                          {unit}
                        </div>

                        <div
                          className="
                            w-full
                            rounded-t-[3px]
                            bg-[#0052CC]
                            transition-all
                            duration-200
                            group-hover:bg-[#0747A6]
                          "
                          style={{
                            height: `${height}%`,
                            minHeight: "3px",
                          }}
                        />

                        <span className="absolute -bottom-5 left-0 right-0 truncate text-center text-[9px] text-[#6B778C]">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F5F7] text-[#6B778C]">
                    <KpiEmptyIcon />
                  </div>

                  <p className="m-0 text-[12px] font-semibold text-[#172B4D]">
                    Histórico ainda não disponível
                  </p>

                  <p className="m-0 mt-1 max-w-[340px] text-[10px] leading-4 text-[#6B778C]">
                    O valor atual está disponível, mas o
                    retorno do indicador ainda não possui
                    dados históricos suficientes para montar
                    a evolução.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiEmptyIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M3 12V7M8 12V4M13 12V2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <path
        d="M2 14h12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default KpiChartModal;