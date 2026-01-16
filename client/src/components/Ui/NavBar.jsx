import PropTypes from "prop-types";
import { ImExit } from "react-icons/im";
import { useNavigate } from "react-router-dom";

import BlueHomeImg from "../../../imgs/blue-home-icon.png";
import HomeImg from "../../../imgs/home-icon.png";
import BlueGotaImg from "../../../imgs/blue-gota-icon.png";
import GotaImg from "../../../imgs/gota-icon.png";
import BlueCalendarImg from "../../../imgs/blue-calendar-icon.png";
import CalendarImg from "../../../imgs/calendar-icon.png";
import BlueReportImg from "../../../imgs/blue-report-icon.png";
import ReportImg from "../../../imgs/report-icon.png";
import BlueEmployeesImg from "../../../imgs/blue-employees-icon.png";
import EmployeesImg from "../../../imgs/employees-icon.png";
import BlueRecipesImg from "../../../imgs/blue-recipe-icon.png";
import RecipesImg from "../../../imgs/recipe-icon.png";

function NavBar({ select_index }) {
  const navigate = useNavigate();
  const selectStyle = "text-blue-500 ";
  const DefaultStyle =
    "flex flex-row items-center justify-center space-x-2 p-1 hover:bg-gray-100 rounded ";

  return (
    <header className="bg-white py-2 px-3 flex flex-col items-center justify-between shadow-lg">
      <div className="flex flex-row items-center justify-between w-full px-4">
        <h1 className="text-gray-800 text-lg font-bold">
          Sistema de Controle de Produção
        </h1>
        <button
          className="flex flex-row items-center justify-center p-2 space-x-2  text-red-600 border-2 border-red-600 hover:bg-red-100 rounded"
          onClick={() => {
            navigate("/");
            sessionStorage.removeItem("loginPermission");
            localStorage.removeItem("token");
          }}
        >
          <ImExit size={15} />
          <p>Sair</p>
        </button>
      </div>
      <nav className="flex flex-row items-center justify-between w-screen">
        <div className="flex flex-wrap gap-4 p-2">
          <button
            onClick={() => navigate("/home")}
            className={
              select_index === 0 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            {select_index === 0 ? (
              <img
                src={BlueHomeImg}
                alt="icone de casa"
                size={15}
              />
            ) : (
              <img
                src={HomeImg}
                alt="icone de casa"
                size={15}
              />
            )}
            <p> Página Inicial</p>
          </button>
          <button
            onClick={() => navigate("/projects")}
            className={
              select_index === 1 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            {select_index === 1 ? (
              <img
                src={BlueGotaImg}
                alt="icone de gota"
                size={15}
              />
            ) : (
              <img
                src={GotaImg}
                alt="icone de gota"
                size={15}
              />
            )}
            <p>Projetos</p>
          </button>
          <button
            onClick={() => navigate("/production")}
            className={
              select_index === 2 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            {select_index === 2 ? (
              <img
                src={BlueCalendarImg}
                alt="icone de projeto"
                size={15}
              />
            ) : (
              <img
                src={CalendarImg}
                alt="icone de casa"
                size={15}
              />
            )}
            <p>Produção</p>
          </button>

          <button
            onClick={() => navigate("/reports")}
            className={
              select_index === 3 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            {select_index === 3 ? (
              <img
                src={BlueReportImg}
                alt="icone de prancheta"
                size={15}
              />
            ) : (
              <img
                src={ReportImg}
                alt="icone de prancheta"
                sizes={15}
              />
            )}

            <p>Relatórios</p>
          </button>

          <button
            onClick={() => navigate("/employees")}
            className={
              select_index === 4 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            {select_index === 4 ? (
              <img
                src={BlueEmployeesImg}
                alt="icone de grupo de pessoas"
                size={15}
              />
            ) : (
              <img
                src={EmployeesImg}
                alt="icone de grupo de pessoas"
                size={15}
              />
            )}
            <p>Colaboradores</p>
          </button>

          <button
            onClick={() => navigate("/recipes")}
            className={
              select_index === 5 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            {select_index === 5 ? (
              <img
                src={BlueRecipesImg}
                alt="icone de receita"
                size={15}
              />
            ) : (
              <img
                src={RecipesImg}
                alt="icone de receita"
                size={15}
              />
            )}
            <p>Receitas</p>
          </button>
        </div>
      </nav>
    </header>
  );
}

NavBar.propTypes = {
  select_index: PropTypes.number.isRequired,
};

export default NavBar;
