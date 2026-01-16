import ArchiveImg from "../../imgs/archive.png";
import DoubleTick from "../../imgs/tick-double.png";

export default function ProjectsFooter() {
  return (
    <footer className="flex justify-center">
      <div className="w-1/4 h-fit bg-white flex flex-row rounded shadow p-2 justify-around">
        <button className="flex items-center gap-2 bnt">
          <img src={ArchiveImg} className="h-5 w-5" />
          <span className="font-medium text-base">Arquivar Projeto</span>
        </button>

        <button className="flex items-center gap-2 bnt-add">
          <img src={DoubleTick} className="h-5 w-5" />
          <span className="font-medium text-base">Concluir Projeto</span>
        </button>
      </div>
    </footer>
  );
}
