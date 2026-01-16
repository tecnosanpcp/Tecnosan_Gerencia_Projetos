import PropTypes from "prop-types";
import { ImExit } from "react-icons/im";
import { useNavigate } from "react-router-dom";

// Importação das imagens (Ícones Ativos/Azuis e Inativos/Cinzas)
import blueHomeIcon from "@imgs/blue-home-icon.png";
import homeIcon from "@imgs/home-icon.png";

import blueGotaIcon from "@imgs/blue-gota-icon.png";
import gotaIcon from "@imgs/gota-icon.png";

import blueCalendarIcon from "@imgs/blue-calendar-icon.png";
import calendarIcon from "@imgs/calendar-icon.png";

import blueReportIcon from "@imgs/blue-report-icon.png";
import reportIcon from "@imgs/report-icon.png";

import blueEmployeesIcon from "@imgs/blue-employees-icon.png";
import employeesIcon from "@imgs/employees-icon.png";

import blueRecipeIcon from "@imgs/blue-recipe-icon.png";
import recipeIcon from "@imgs/recipe-icon.png";

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
          className="flex flex-row items-center justify-center p-2 space-x-2 text-red-600 border-2 border-red-600 hover:bg-red-100 rounded"
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
          
          {/* Botão Home */}
          <button
            onClick={() => navigate("/home")}
            className={
              select_index === 0 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            <img
              src={select_index === 0 ? blueHomeIcon : homeIcon}
              alt="icone de casa"
              width={15} 
            />
            <p> Página Inicial</p>
          </button>

          {/* Botão Projetos */}
          <button
            onClick={() => navigate("/projects")}
            className={
              select_index === 1 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            <img
              src={select_index === 1 ? blueGotaIcon : gotaIcon}
              alt="icone de gota"
              width={15}
            />
            <p>Projetos</p>
          </button>

          {/* Botão Produção */}
          <button
            onClick={() => navigate("/production")}
            className={
              select_index === 2 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            <img
              src={select_index === 2 ? blueCalendarIcon : calendarIcon}
              alt="icone de calendario"
              width={15}
            />
            <p>Produção</p>
          </button>

          {/* Botão Relatórios */}
          <button
            onClick={() => navigate("/reports")}
            className={
              select_index === 3 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            <img
              src={select_index === 3 ? blueReportIcon : reportIcon}
              alt="icone de relatorio"
              width={15}
            />
            <p>Relatórios</p>
          </button>

          {/* Botão Colaboradores */}
          <button
            onClick={() => navigate("/employees")}
            className={
              select_index === 4 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            <img
              src={select_index === 4 ? blueEmployeesIcon : employeesIcon}
              alt="icone de colaboradores"
              width={15}
            />
            <p>Colaboradores</p>
          </button>

          {/* Botão Receitas */}
          <button
            onClick={() => navigate("/recipes")}
            className={
              select_index === 5 ? DefaultStyle + selectStyle : DefaultStyle
            }
          >
            <img
              src={select_index === 5 ? blueRecipeIcon : recipeIcon}
              alt="icone de receita"
              width={15}
            />
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