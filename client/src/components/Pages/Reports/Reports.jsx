import NavBar from "../../Ui/NavBar";
import CascadeTable from "../../Ui/CascadeTable";
import CascadeTableTwoLevel from "../../Ui/CascadeTableTwoLevel";
import InfoCard from "../../Ui/InfoCard";
import SelectMenu from "../../Ui/SelectMenu";
import ProjectEvolutionGraph from "./ProjectEvolutionGraph";
import TotalConsumptionGraph from "./TotalConsumptionGraph";
import { useState, useEffect } from "react";

import { listProjects } from "@services/ProjectService.js";
import { getEquipment } from "@services/EquipmentService";
import { VerifyAuth } from "@services/AuthService.js";
import { countStatusComponents } from "@services/ComponentsServices.js";
import {
  vwProjectConsumedMaterials,
  vwProjectDepartmentDelays,
} from "@services/ViewsService.js";

export default function Reports() {
  const [dataProjects, setDataProjects] = useState([]);

  const flechtProjectMaterials = async (user_id) => {
    try {
      const data = await vwProjectConsumedMaterials(user_id);
      Array.isArray(data) && data
        ? setDataProjects(data)
        : alert("Erro ao carregar dados da view");
    } catch (error) {
      console.error("Erro no fecht", error);
    }
  };

  // lista os projetos que o usuário está cadastrado
  const [projects, setProjects] = useState([]);
  const [selectedProj, setSelectedProj] = useState([1]);
  const fetchProjects = async (user_id) => {
    try {
      const data = await listProjects(user_id);
      setProjects(data);
    } catch (error) {
      console.error("Error ao listar projetos", error);
    }
  };

  // lista de equipamentos relacionados aos projetos do usuário
  const [equipments, setEquipments] = useState([]);
  const [selectedEquip, setSelectedEquip] = useState([]);
  const fetchEquipamentDetails = async (user_id) => {
    try {
      const data = await getEquipment(user_id);
      setEquipments(data);
    } catch (error) {
      console.error("Error ao listar equipamento", error);
    }
  };

  // Data atual
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  const threeMonthsAhead = new Date();
  threeMonthsAhead.setMonth(today.getMonth() + 3);

  const [startDate, setStartDate] = useState(
    threeMonthsAgo.toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    threeMonthsAhead.toISOString().slice(0, 10)
  );

  // Contar status dos componentes
  const [countStatus, setCountStatus] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  const fetchStatusCount = async (
    project_id,
    equipment_id,
    start_date,
    end_date
  ) => {
    try {
      const formatDate = (date) => `${date} 00:00:00`;

      const response = await countStatusComponents(
        project_id,
        equipment_id,
        formatDate(start_date),
        formatDate(end_date)
      );

      setCountStatus(response[0].total_completed + response[0].total_pending);
      setTotalCompleted(response[0].total_completed);
      setTotalPending(response[0].total_pending);
    } catch (error) {
      console.error(
        "Erro ao contar os status dos components no frontend",
        error
      );
    }
  };

  // Processos em atraso
  const [processDelaysList, setProcessDelaysList] = useState([]);
  const processDelays = async () => {
    const data = await vwProjectDepartmentDelays();
    setProcessDelaysList(data);
  };

  useEffect(() => {
    async function loadData() {
      const user = await VerifyAuth();
      await fetchProjects(user.user_id);
      await fetchEquipamentDetails(user.user_id);
      await fetchStatusCount(
        selectedProj[0],
        selectedEquip[0],
        startDate,
        endDate
      );
      await flechtProjectMaterials(user.user_id);
      await processDelays();
    }
    loadData();
  }, [endDate, startDate, selectedProj, selectedEquip]);

  return (
    <>
      <div className="h-screen w-screen space-y-4 pb-16">
        <NavBar select_index={3} />

        {/* Título da Página */}
        <div className="flex flex-row bg-white py-1 px-2 items-center justify-between shadow-lg mx-4 rounded">
          <h2 className="font-bold text-lg">Dashboard</h2>
          <div className="flex flex-row space-x-2 ">
            <div>
              <p className="text-xs">Projetos</p>
              {/* <SelectProjects/> */}
              <SelectMenu
                className=" h-6"
                maxSelections={1}
                options={projects.map((proj) => {
                  return { id: proj.project_id, label: proj.project_name };
                })}
                selectedOption={selectedProj}
                setSelectedOption={setSelectedProj}
              />
            </div>
            <div>
              <p className="text-xs">Equipamento</p>
              <SelectMenu
                className=" h-6"
                options={equipments.map((equip) => {
                  return {
                    id: equip.equipment_id,
                    label: equip.equipment_name,
                  };
                })}
                selectedOption={selectedEquip}
                setSelectedOption={setSelectedEquip}
              />
            </div>
            <div className="flex flex-col">
              <p className="self-center text-xs">Período</p>
              <div className="flex flex-row space-x-2">
                <input
                  type="date"
                  name="date-in"
                  id="date-in"
                  className="bg-gray-50 p-1 rounded-md w-full text-xs"
                  value={startDate}
                  onChange={(o) => setStartDate(o.target.value)}
                />
                <input
                  type="date"
                  name="date-out"
                  id="date-out"
                  className="bg-gray-50 p-1 rounded-md w-full text-xs"
                  value={endDate}
                  onChange={(o) => setEndDate(o.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mx-4">
          {/* Info Cards */}
          <div className="col-span-7 bg-white py-1 px-2 rounded shadow-lg flex flex-row self">
            <div className="flex flex-col space-y-8 w-1/6 py-1">
              <InfoCard
                title="Entregues"
                value={totalCompleted}
                icon={<img src="src/imgs/entrega.png" className="w-6 h-6" />}
              />
              <InfoCard
                title="Peças Pendentes"
                value={totalPending}
                icon={<img src="src/imgs/caixa.png" className="w-6 h-6" />}
              />
              <InfoCard
                title="Desperdício"
                value={0}
                icon={
                  <img src="src/imgs/desperdicio.png" className="w-6 h-6" />
                }
              />
            </div>
            <div className="flex flex-col w-5/6 py-1 ml-8">
              <ProjectEvolutionGraph data={countStatus} />
            </div>
          </div>

          {/* CascadeTable */}
          <div className="col-span-5 h-96 bg-white py-1 px-2 rounded shadow-lg overflow-auto">
            <CascadeTable
              title="Detalhamento por Projeto"
              headers={["Equipamentos", "Valores"]}
              filter={dataProjects.map((p) => p.material_name)}
              values={dataProjects}
            />
          </div>

          {/* Outros cards */}
          <div className="bg-white py-1 px-2 rounded shadow-lg col-span-4  h-96">
            <TotalConsumptionGraph data={dataProjects} />
          </div>
          <div className="bg-white py-1 px-2 rounded shadow-lg col-span-4  h-96">
            <h1>Lead Time Meta X Real</h1>
          </div>
          <div className="bg-white py-1 px-2 rounded shadow-lg col-span-4  h-96 overflow-y-auto">
            {/* tabela 2 processos em atraso por setor */}
            <CascadeTableTwoLevel
              title="Processos em Atraso por Departamento"
              data={processDelaysList}
            />
          </div>
        </div>
      </div>
    </>
  );
}
