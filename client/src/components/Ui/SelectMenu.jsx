import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaCheck } from "react-icons/fa6";
import { IoChevronDownSharp } from "react-icons/io5";

function SelectMenu({
  variant = "small",
  maxSelections = 0,
  options = [],
  selectedOption = [],
  setSelectedOption,
}) {
  const [isOpen, setOpen] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const longestLabel = useMemo(() => {
    const placeholder = "Selecione uma opção";
    const longest = options.reduce(
      (a, b) => (a.label.length > b.label.length ? a : b),
      { label: "" },
    ).label;
    return longest.length > placeholder.length ? longest : placeholder;
  }, [options]);

  const widthClass = variant === "full" ? "w-full" : "min-w-[12rem] w-fit";

  const getLabelById = (id) => {
    const found = options.find((o) => o.id === id);
    return found ? found.label : id;
  };

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const HandleEvents = (e) => {
      if (!isOpen) return;
      if (e.type == "scroll" && menuRef.current?.contains(e.target)) return;
      if (e.type == "mousedonw") {
        if (
          !containerRef.current?.contains(e.target) &&
          !menuRef.current?.contains(e.target)
        ) {
          setOpen(false);
        }
        return;
      }
      setOpen(false);
    };

    window.addEventListener("scroll", HandleEvents, true);
    window.addEventListener("resize", HandleEvents);
    window.addEventListener("mousedown", HandleEvents);

    return () => {
      window.removeEventListener("scroll", HandleEvents, true);
      window.removeEventListener("resize", HandleEvents);
      window.removeEventListener("mousedown", HandleEvents);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative grid ${widthClass}`}>
      {/* Elemento Fantasma (Define a largura) */}
      <div className="invisible col-start-1 row-start-1 flex items-center justify-between p-2 overflow-hidden pointer-events-none">
        <span className="truncate">{longestLabel}</span>
        <span className="w-5 shrink-0 ml-2" />
      </div>

      {/* Botão */}
      <button
        type="button"
        className="col-start-1 row-start-1 flex items-center justify-between bg-gray-50 p-2 rounded-md w-full text-left border border-transparent focus:border-gray-300"
        onClick={toggleOpen}
      >
        <span className="truncate">
          {selectedOption.length === 0
            ? "Selecione uma opção"
            : selectedOption.length === 1
              ? getLabelById(selectedOption[0])
              : `${selectedOption.length} opções selecionadas`}
        </span>
        <IoChevronDownSharp className="text-gray-500 shrink-0 ml-2" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
            className="absolute mt-1 max-h-[40vh] overflow-auto bg-white p-1 shadow-xl rounded-md z-[9999] text-gray-700 whitespace-nowrap border border-gray-100"
          >
            {selectedOption.length > 1 && (
              <button
                className="w-full text-left hover:bg-slate-200 p-1 rounded-md text-xs border-b mb-1 text-red-500"
                onClick={() => {
                  setSelectedOption([]);
                  setOpen(false);
                }}
              >
                Limpar Seleção
              </button>
            )}

            {options.map((o) => {
              const checked = selectedOption.includes(o.id);
              return (
                <button
                  key={o.id}
                  className="w-full flex items-center gap-2 text-left hover:bg-slate-200 p-1 rounded-md transition-colors"
                  onClick={() => {
                    setSelectedOption((prev) => {
                      if (prev.includes(o.id))
                        return prev.filter((x) => x !== o.id);

                      if (maxSelections === 1) return [o.id];
                      if (maxSelections > 1 && prev.length >= maxSelections)
                        return prev;

                      return [...prev, o.id];
                    });
                    if (
                      selectedOption.length >= maxSelections &&
                      maxSelections >= 1
                    ) {
                      setOpen(false);
                    }
                  }}
                  type="button"
                >
                  {checked ? (
                    <FaCheck className="text-green-600 text-xs" />
                  ) : (
                    <span className="w-3" />
                  )}
                  <span className="truncate">{o.label}</span>
                </button>
              );
            })}
          </div>,
          document.body, // Renderiza diretamente no Body
        )}
    </div>
  );
}

export default SelectMenu;
