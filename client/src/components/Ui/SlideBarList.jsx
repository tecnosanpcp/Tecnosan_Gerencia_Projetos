// /components/Ui/SidebarList.jsx
import PropTypes from "prop-types";
import { FaFilter } from "react-icons/fa";
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
  defaultFilter = null,
}) {
  const [isExtend, setIsExtend] = useState(false);
  const [filter, setFilter] = useState(defaultFilter);

  const matchesFilter = (item) => {
    if (!filter) return true;
    const s = (item?.status ?? "").toString().toLowerCase();
    return s === filter.toString().toLowerCase();
  };

  const filteredItems = useMemo(() => {
    if (filter) {
      return items.filter(matchesFilter);
    }
    return items;
  }, [items, filter]);

  return (
    <div className="flex flex-col bg-white-blue shadow-sm rounded w-40 h-full items-center space-y-2 p-1">
      {/* Botão de adicionar */}
      <button
        className="bg-green-300 hover:bg-green-400 py-px px-1 rounded-sm font-semibold"
        onClick={onAdd}
      >
        <p>{addLabel}</p>
      </button>

      {/* Filtro */}
      {filterOptions && (
        <>
          <button
            className="flex bg-gray-100 hover:bg-gray-200 w-fit py-px px-10 space-x-2 rounded-sm items-center"
            onClick={() => setIsExtend((v) => !v)}
          >
            <FaFilter size={10} />
            <p className="font-semibold text-gray-800 ">Filtro</p>
          </button>

          {isExtend && (
            <div className="flex flex-col space-y-1">
              {filterOptions.map((opt) => {
                const name = `${idPrefix}-status`;
                const id = `${idPrefix}-status-${opt.value}`;
                return (
                  <label
                    key={opt.value}
                    htmlFor={id}
                    className="flex items-center gap-1 cursor-pointer p-1 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
                  >
                    <input
                      type="radio"
                      id={id}
                      name={name}
                      value={opt.value}
                      checked={filter === opt.value}
                      onChange={() => setFilter(opt.value)}
                    />
                    <span className="text-gray-700 font-medium ">
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Botão todos */}
      <button
        className={
          selectedItem === null
            ? "text-blue-500 "
            : "text-gray-400 hover:text-blue-400 "
        }
        onClick={() => onSelectItem(null)}
      >
        {titleAll}
      </button>

      {/* Lista */}
      {filteredItems.map((item, idx) =>
        selectedItem?.id === item.id ? (
          <p key={item.id ?? idx} className="text-blue-500 ">
            {item.name}
          </p>
        ) : (
          <button
            key={item.id ?? idx}
            className=" text-gray-400 hover:text-blue-400"
            onClick={() => onSelectItem(item)}
          >
            {item.name}
          </button>
        )
      )}
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
  defaultFilter: PropTypes.string,
};

export default SidebarList;
