function AlertModal({
  title,
  body,
  neg_opt,
  pos_opt,
  func,
  isVisible,
  setVisible,
  style = "pop-up",
}) {
  const bnt_style = style === "waring" ? "bnt-red" : "bnt-blue";

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setVisible(false);
      return;
    }

    if (event.key !== "Enter") return;

    if (event.target?.tagName === "TEXTAREA") return;

    event.preventDefault();
    func?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen w-screen items-center justify-center bg-black/50 p-4">
      <div
        onKeyDown={handleKeyDown}
        className="
          w-full max-w-md
          rounded-lg
          border border-[#DFE1E6]
          bg-white
          p-6
          shadow-[0_8px_24px_rgba(9,30,66,0.25)]
        "
      >
        {/* Cabeçalho / conteúdo */}
        <div className="flex flex-col gap-2">
          <h1 className="text-[18px] font-semibold text-[#172B4D]">{title}</h1>

          <p className="text-sm leading-6 text-[#5E6C84]">{body}</p>
        </div>

        {/* Ações */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-md border border-[#DFE1E6] bg-white px-4 py-2 text-sm font-medium text-[#172B4D] transition hover:bg-[#F4F5F7]"
          >
            {neg_opt}
          </button>

          <button
            type="button"
            onClick={func}
            className={`
              rounded-md px-4 py-2 text-sm font-medium text-white
              transition
              ${
                style === "waring"
                  ? "bg-[#DE350B] hover:bg-[#BF2600]"
                  : "bg-[#0052CC] hover:bg-[#0747A6]"
              }
            `}
          >
            {pos_opt}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
