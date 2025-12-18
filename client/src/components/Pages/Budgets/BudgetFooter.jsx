export default function BudgetFooter() {
  return (
    <footer className="flex justify-center">
      <div className="w-1/4 h-fit bg-white flex flex-row rounded shadow p-2 justify-around">
        <button className="flex items-center gap-2 bnt">
          <img src="src/imgs/archive.png" className="h-5 w-5" />
          <span className="font-medium text-base">Arquivar Projeto</span>
        </button>

        <button className="flex items-center gap-2 bnt-add">
          <img src="src/imgs/tick-double.png" className="h-5 w-5" />
          <span className="font-medium text-base">Aprovar Orçamento</span>
        </button>
      </div>
    </footer>
  );
}
