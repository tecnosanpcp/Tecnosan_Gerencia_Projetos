import { IoMdClose } from "react-icons/io";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SelectMenu from "../../Ui/SelectMenu";

function TaskModal({
  isOpen,
  setOpen,
  employees = [],
  taskData = null,
  responsible = [],
}) {
  const [taskName, setTaskName] = useState("");

  // Datas e Prazos
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [finishDate, setFinishDate] = useState("");

  // Tempo total (Pode ser calculado ou inserido manualmente)
  const [totalTimeSpent, setTotalTimeSpent] = useState("");

  // Pessoas e Materiais
  const [selectEmp, setSelectEmp] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    if (isOpen && taskData) {
      setTaskName(taskData.component_name || "");
      setStartDate(taskData.start_date || "");
      setFinishDate(taskData.completion_date || "");
      setSelectEmp(responsible.map((res) => res.user_id) || []);

      // Exemplo de estrutura de materiais para popular a tabela
      setMaterials([
        { id: 1, name: "Filamento PLA", recipeQty: "200g", usedQty: "210g" },
        { id: 2, name: "Parafuso M3", recipeQty: "4 un", usedQty: "4 un" },
      ]);
    }
  }, [isOpen, responsible, taskData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Lógica de envio/atualização aqui
      console.log("Enviando dados:", {
        taskName,
        finishDate,
        materials,
        totalTimeSpent,
      });

      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      alert("Erro ao salvar.");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <form
        className="bg-gray-200 p-6 rounded-lg shadow-lg w-1/2 flex flex-col space-y-6" // space-y ajustado para visualização
        onSubmit={handleSubmit}
      >
        {/* --- Header --- */}
        <div className="flex flex-row items-center justify-between">
          <p className="text-lg font-semibold">Detalhes da Tarefa</p>
          <button onClick={() => setOpen(false)} type="button">
            <IoMdClose className="text-gray-600 hover:text-gray-700 hover:bg-gray-300 rounded" />
          </button>
        </div>

        {/* --- Nome da Tarefa --- */}
        <div className="flex flex-col w-full">
          <label className="text-gray-700 font-medium">
            Nome da Tarefa / Peça
          </label>
          <input
            type="text"
            className="p-2 rounded bg-white"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Nome da atividade"
          />
        </div>

        {/* --- Linha de Datas (Início e Prazo) --- */}
        <div className="flex flex-row items-center justify-between space-x-4">
          <div className="flex flex-col w-full">
            <label className="text-gray-700">Data Inicial</label>
            <input
              type="datetime-local" // Sugestão: usar datetime-local para data e hora juntas
              className="p-2 rounded bg-gray-50"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled // Talvez desabilitar se for apenas visualização
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-gray-700">Prazo (Deadline)</label>
            <input
              type="datetime-local"
              className="p-2 rounded bg-gray-50"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        {/* --- Linha de Finalização e Tempo Gasto --- */}
        <div className="flex flex-row items-center justify-between space-x-8">
          <div className="flex flex-col w-full">
            <label className="text-gray-700 font-bold">
              Data de Finalização
            </label>
            <input
              type="datetime-local"
              className="p-2 rounded border-2"
              value={finishDate}
              onChange={(e) => setFinishDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col w-full">
            <label className="text-gray-700 font-bold">Tempo Total Gasto</label>
            <input
              type="text"
              className="p-2 rounded"
              placeholder="Ex: 2h 30m"
              value={totalTimeSpent}
              onChange={(e) => setTotalTimeSpent(e.target.value)}
            />
          </div>
        </div>

        {/* --- Quem trabalhou (Visualização ou Edição) --- */}
        <div className="flex flex-col w-full">
          <label className="text-gray-700 mb-1">Responsáveis </label>
          <SelectMenu
            variant="full"
            options={employees.map((emp) => ({
              id: emp.user_id,
              label: emp.user_name,
            }))}
            selectedOption={selectEmp}
            setSelectedOption={setSelectEmp}
          />
        </div>

        {/* --- Materiais: Receita vs Real --- */}
        <div className="flex flex-col w-full">
          <label className="text-gray-700 mb-1 font-medium">
            Consumo de Materiais
          </label>
          <div className="bg-white rounded overflow-hidden shadow-sm">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 font-bold">
                <tr>
                  <th className="px-4 py-2">Material</th>
                  <th className="px-4 py-2">Qtd. Receita</th>
                  <th className="px-4 py-2">Qtd. Usada</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="px-4 py-2">{mat.name}</td>
                    <td className="px-4 py-2 text-gray-500">{mat.recipeQty}</td>
                    <td className="px-4 py-2">
                      {/* Input para editar o que foi realmente gasto */}
                      <input
                        type="text"
                        value={mat.usedQty}
                        className="w-20 p-1 border rounded bg-yellow-50 focus:bg-white"
                        onChange={(e) => {
                          // Lógica para atualizar o array de materials
                          const newMaterials = [...materials];
                          newMaterials[index].usedQty = e.target.value;
                          setMaterials(newMaterials);
                        }}
                      />
                    </td>
                  </tr>
                ))}
                {/* Exemplo vazio se não tiver dados */}
                {materials.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-4 py-2 text-center text-gray-500"
                    >
                      Nenhum material vinculado à receita.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Footer Buttons --- */}
        <div className="flex flex-row justify-end items-center space-x-4 pt-4 border-t border-gray-300">
          <button className="bnt" onClick={() => setOpen(false)} type="button">
            Fechar
          </button>
          <button className="bnt-add" type="submit">
            Salvar Apontamento
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

export default TaskModal;
