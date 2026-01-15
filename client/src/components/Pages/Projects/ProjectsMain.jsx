// Import de funções
import React, { useState, useContext, useEffect } from "react";

// Import de icones
import { FaSearch } from "react-icons/fa";

// Import de componentes especificos a esta página
import ProjectEquipmentsTable from "./ProjectEquipmentsTable";
import ProjectTimeline from "./ProjectTimeline";
import NewEquipmentModal from "../../Ui/newEquipmentModal";

import { selectedProjectContext } from "@content/SeletedProject.jsx";
import {
  readEquipmentRecipe,
  createEquipmentRecipe,
} from "@services/EquipmentRecipesService.js";

const viewLoader = (currentProject, searchTerm, times, view) => {
  if (!currentProject) return <h1>Escolha um projeto</h1>;

  switch (view) {
    case "equipments":
      return (
        <ProjectEquipmentsTable searchTerm={searchTerm} times={times ?? {}} />
      );
    case "timeline":
      return <ProjectTimeline searchTerm={searchTerm} times={times ?? {}} />;
    default:
      break;
  }
};

const btnView = (view, setView, label, text) => {
  if (view != label) {
    return (
      <button className="bnt" onClick={() => setView(label)}>
        Ir para {text}
      </button>
    );
  }
};

export default function ProjectsMain({ times }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVible] = useState(false);
  const [recipes, setRecipes] = useState([]);

  const [view, setView] = useState("equipments");

  const { currentProject } = useContext(selectedProjectContext);

  useEffect(() => {
    const loadData = async () => {
      const recipe_data = await readEquipmentRecipe();
      setRecipes(recipe_data);
    };
    loadData();
  }, []);

  const handleCreateEquipment = async (recipe, quantity) => {
    try {
      await createEquipmentRecipe(recipe);
      console.log({ recipe, quantity });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <React.Fragment>
      <main className="card m-0 p-4 gap-4 overflow-y-auto">
        {/* Barra de Pesquisa */}
        <div className="flex flex-row justify-between w-full">
          <form
            className="flex flex-row justify-between space-x-4 p-2 rounded-xl bg-white-gray h-fit w-fit"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <button>
              <FaSearch />
            </button>
            <input
              type="text"
              placeholder="Pesquisar equipamento"
              className="bg-transparent"
              value={searchTerm}
              onChange={(e) => {
                e.preventDefault();
                setSearchTerm(e.target.value);
              }}
            />
          </form>

          {/* Botões de ações */}
          <div className="flex flex-row justify-center gap-4 h-fit">
            <button
              className="bnt-add"
              onClick={() => setModalVible(!modalVisible)}
            >
              + Novo Equipamento
            </button>
            {btnView(view, setView, "equipments", "Equipamentos")}
            {btnView(view, setView, "timeline", "Cronograma")}
            {btnView(view, setView, "accessories", "Acessórios")}
          </div>
        </div>

        {viewLoader(currentProject, searchTerm, times, view)}
      </main>
      <NewEquipmentModal
        isVisible={modalVisible}
        onClose={() => setModalVible(false)}
        onConfirm={handleCreateEquipment}
        recipesList={recipes}
      />
    </React.Fragment>
  );
}
