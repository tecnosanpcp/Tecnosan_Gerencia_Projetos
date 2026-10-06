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
  closeOnSelect = true,
  onConfirmSelection,
  confirmLabel = "Confirmar",
  searchable = false,
  searchPlaceholder = "Pesquisar...",
  confirmOnEnter = false,
}) {
  const [isOpen, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [menuPlacement, setMenuPlacement] = useState("bottom");

  // =========================
  // MEMO
  // =========================

  const longestLabel = useMemo(() => {
    const placeholder = "Selecione uma opção";
    const longest = options.reduce(
      (a, b) => (a.label.length > b.label.length ? a : b),
      { label: "" },
    ).label;

    return longest.length > placeholder.length ? longest : placeholder;
  }, [options]);

  const widthClass = variant === "full" ? "w-full" : "min-w-[12rem] w-fit";
  const filteredOptions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return options;
    }

    return options.filter((option) =>
      String(option.label ?? "")
        .toLowerCase()
        .includes(term),
    );
  }, [options, searchTerm]);
  const getLabelById = (id) => {
    const found = options.find((o) => o.id === id);
    return found ? found.label : id;
  };

  // =========================
  // HANDLERS
  // =========================

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });

      setMenuPlacement("bottom");
      setSearchTerm("");
    }

    if (isOpen) {
      setSearchTerm("");
    }

    setOpen((prev) => !prev);
  };

  const handleSelect = (id) => {
    let newValue = [];

    if (selectedOption.includes(id)) {
      newValue = selectedOption.filter((x) => x !== id);
    } else {
      if (maxSelections === 1) {
        newValue = [id];
      } else if (maxSelections > 1 && selectedOption.length >= maxSelections) {
        newValue = selectedOption;
      } else {
        newValue = [...selectedOption, id];
      }
    }

    setSelectedOption(newValue);

    if (
      closeOnSelect &&
      (maxSelections === 1 ||
        (maxSelections > 1 && newValue.length >= maxSelections))
    ) {
      setOpen(false);
    }
  };
  const handleConfirm = () => {
    if (!confirmOnEnter || selectedOption.length === 0) {
      return;
    }

    onConfirmSelection?.(selectedOption);

    setOpen(false);
  };

  // =========================
  // EFFECT (CLICK OUTSIDE)
  // =========================

  useEffect(() => {
    const handleEvents = (e) => {
      if (!isOpen) return;

      if (e.type === "scroll" && menuRef.current?.contains(e.target)) return;

      if (
        !containerRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener("scroll", handleEvents, true);
    window.addEventListener("resize", handleEvents);
    window.addEventListener("mousedown", handleEvents); // corrigido

    return () => {
      window.removeEventListener("scroll", handleEvents, true);
      window.removeEventListener("resize", handleEvents);
      window.removeEventListener("mousedown", handleEvents);
    };
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !confirmOnEnter) {
      return;
    }

    const handleKeyDown = (e) => {
      if (e.key !== "Enter") {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      handleConfirm();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, confirmOnEnter, selectedOption]);
  // =========================
  // RENDER
  // =========================
  useEffect(() => {
    if (!isOpen || !menuRef.current || !containerRef.current) {
      return;
    }

    const updateMenuPosition = () => {
      const triggerRect = containerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();

      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      const shouldOpenAbove =
        spaceBelow < menuRect.height + 8 && spaceAbove >= menuRect.height + 8;

      if (shouldOpenAbove) {
        setMenuPlacement("top");

        setCoords({
          top: triggerRect.top + window.scrollY - menuRect.height - 4,
          left: triggerRect.left + window.scrollX,
          width: triggerRect.width,
        });
      } else {
        setMenuPlacement("bottom");

        setCoords({
          top: triggerRect.bottom + window.scrollY + 4,
          left: triggerRect.left + window.scrollX,
          width: triggerRect.width,
        });
      }
    };

    updateMenuPosition();

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen, filteredOptions.length, selectedOption.length, searchTerm]);
  return (
    <div ref={containerRef} className={`relative grid ${widthClass}`}>
      {/* largura fantasma */}
      <div className="invisible col-start-1 row-start-1 flex items-center justify-between p-2 overflow-hidden pointer-events-none">
        <span className="truncate">{longestLabel}</span>
        <span className="w-5 shrink-0 ml-2" />
      </div>

      {/* botão */}
      <button
        type="button"
        className="col-start-1 row-start-1 flex items-center justify-between  border border-[#DFE1E6] bg-white px-1 py-1 text-left text-xs text-[#172B4D] transition-colors hover:bg-[#F4F5F7] focus:border-[#4C9AFF] focus:outline-none focus:ring-2 focus:ring-[#DEEBFF]"
        onClick={toggleOpen}
      >
        <span className="truncate px-1 text-s text-[#172B4D]">
          {selectedOption.length === 0
            ? "Selecionar"
            : selectedOption.length === 1
              ? getLabelById(selectedOption[0])
              : `${selectedOption.length} materiais selecionados`}
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
            className="absolute -translate-y-full -mt-1 max-h-[40vh] overflow-auto bg-white p-1 shadow-xl rounded-md z-[9999] text-gray-700 whitespace-nowrap border border-gray-100"
          >
            {searchable && (
              <div className="sticky top-0 z-10 mb-1 border-b border-[#DFE1E6] bg-white p-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && confirmOnEnter) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleConfirm();
                    }
                  }}
                  placeholder={searchPlaceholder}
                  autoFocus
                  className="
                  h-8
                  w-full
                  rounded-md
                  border
                  border-[#DFE1E6]
                  bg-white
                  px-2.5
                  text-xs
                  text-[#172B4D]
                  outline-none
                  placeholder:text-[#97A0AF]
                  focus:border-[#4C9AFF]
                  focus:ring-2
                  focus:ring-[#DEEBFF]
                "
                />
              </div>
            )}
            {selectedOption.length > 0 && (
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

            {filteredOptions.map((o) => {
              {
                searchable && filteredOptions.length === 0 && (
                  <div className="px-2 py-3 text-center text-xs text-[#6B778C]">
                    Nenhum resultado encontrado.
                  </div>
                );
              }
              const checked = selectedOption.includes(o.id);

              return (
                <button
                  key={o.id}
                  type="button"
                  className="w-full flex items-center gap-2 text-left hover:bg-slate-200 p-1 rounded-md transition-colors"
                  onClick={() => handleSelect(o.id)}
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
            {confirmOnEnter && (
              <div className="sticky bottom-0 border-t border-[#DFE1E6] bg-white px-2 py-2 text-center text-[10px] text-[#6B778C]">
                {selectedOption.length > 0
                  ? `Pressione Enter para adicionar ${selectedOption.length} ${
                      selectedOption.length === 1 ? "item" : "itens"
                    }`
                  : "Selecione os itens e pressione Enter"}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default SelectMenu;
