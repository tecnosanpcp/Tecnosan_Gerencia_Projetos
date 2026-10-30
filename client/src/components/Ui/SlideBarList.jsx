import PropTypes from "prop-types";
import { FaFilter, FaPlus, FaChevronDown } from "react-icons/fa";
import { useState, useMemo } from "react";

function SidebarList({
  items,
  selectedItem,
  onSelectItem,
  onAdd,
  addLabel,
  filterOptions,
  titleAll = "Todos",
  idPrefix = "sidebar",
  defaultFilter,
}) {
  const [isExtend, setIsExtend] = useState(false);
  const [filter, setFilter] = useState(
      Array.isArray(defaultFilter)
        ? defaultFilter
        : defaultFilter
        ? [defaultFilter]
        : []
    )
  
  const handleFilterChange = (value) => {
    setFilter((prevFilters) =>
      prevFilters.includes(value)
        ? prevFilters.filter((item) => item !== value) // Remove se já estiver marcado
        : [...prevFilters, value] // Adiciona se não estiver marcado
    );
  };

  const matchesFilter = (item) => {
    if (filter.length === 0) return true; // Se nenhum filtro for selecionado, exibe todos

    const status = (item?.status ?? "").toString().toLowerCase();

    // Verifica se o status do item condiz com algum dos filtros selecionados
    return filter.some(
      (f) => f.toString().toLowerCase() === status
    );
  };

  const filteredItems = useMemo(() => {
    if (filter.length > 0) {
      return items.filter(matchesFilter);
    }

    return items;
  }, [items, filter]);

  return (
    <div className="flex h-full w-full flex-col bg-white border-r border-[#DFE1E6]">
      {/* Novo projeto */}
      <div className="p-3 border-b border-[#DFE1E6]">
        <button
          type="button"
          onClick={onAdd}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-md
            bg-[#0052CC]
            px-3
            py-2
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#0747A6]
            active:bg-[#003884]
          "
        >
          <FaPlus size={11} />
          <span>{addLabel}</span>
        </button>
      </div>

      {/* Filtro */}
      {filterOptions && filterOptions.length > 0 && (
        <div className="border-b border-[#DFE1E6] p-3">
          <button
            type="button"
            className="
              flex
              w-full
              items-center
              justify-between
              rounded-md
              px-2
              py-2
              text-sm
              font-medium
              text-[#42526E]
              transition
              hover:bg-[#F4F5F7]
            "
            onClick={() => setIsExtend((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <FaFilter size={11} />
              Filtro {filter.length > 0 && `(${filter.length})`}
            </span>

            <FaChevronDown
              size={10}
              className={`transition-transform ${
                isExtend ? "rotate-180" : ""
              }`}
            />
          </button>

          {isExtend && (
            <div className="mt-2 flex flex-col gap-1">
              {filterOptions.map((opt) => {
                const name = `${idPrefix}-status`;
                const id = `${idPrefix}-status-${opt.value}`;
                const isChecked = filter.includes(opt.value);

                return (
                  <label
                    key={opt.value}
                    htmlFor={id}
                    className="
                      flex
                      cursor-pointer
                      items-center
                      gap-2
                      rounded-md
                      px-2
                      py-2
                      text-xs
                      text-[#42526E]
                      transition
                      hover:bg-[#F4F5F7]
                    "
                  >
                    <input
                      type="checkbox"
                      id={id}
                      name={name}
                      value={opt.value}
                      checked={isChecked}
                      onChange={() => handleFilterChange(opt.value)}
                      className="accent-[#0052CC]"
                    />

                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Todos */}
      <div className="px-3 pt-3">
        <button
          type="button"
          className={`
            w-full
            rounded-md
            px-3
            py-2
            text-left
            text-sm
            font-medium
            transition
            ${
              selectedItem === null
                ? "bg-[#DEEBFF] text-[#0052CC]"
                : "text-[#42526E] hover:bg-[#F4F5F7]"
            }
          `}
          onClick={() => onSelectItem(null)}
        >
          {titleAll}
        </button>
      </div>

      {/* Lista de projetos */}
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2">
        {filteredItems.map((item, idx) => {
          const isSelected = selectedItem?.id === item.id;

          return (
            <button
              key={item.id ?? idx}
              type="button"
              onClick={() => onSelectItem(item)}
              className={`
                w-full
                rounded-md
                px-3
                py-2
                text-left
                text-sm
                transition
                ${
                  isSelected
                    ? "bg-[#DEEBFF] font-semibold text-[#0052CC]"
                    : "text-[#42526E] hover:bg-[#F4F5F7]"
                }
              `}
            >
              <span className="block truncate">
                {item.name}
              </span>
            </button>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-[#6B778C]">
            Nenhum projeto encontrado.
          </div>
        )}
      </div>
    </div>
  );
}

SidebarList.propTypes = {
  items: PropTypes.array.isRequired,
  selectedItem: PropTypes.object,
  onSelectItem: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  addLabel: PropTypes.string.isRequired,
  filterOptions: PropTypes.array,
  titleAll: PropTypes.string,
  idPrefix: PropTypes.string,
  defaultFilter: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ])
};

export default SidebarList; 