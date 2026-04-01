import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import {useQueryClient} from "@tanstack/react-query"

import { createAccessory } from "@services/AccessoriesServices.js"; 

export default function AddAccessoryTypeModal({ isVisible, setVisible }) {
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [value, setValue] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState("");

  const queryClient = useQueryClient();

  const clearStates = () => {
    setName("");
    setSerialNumber("");
    setValue(0);
    setPurchaseDate("");
    setVisible(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (!name) {
        alert("O nome é obrigatório.");
        return;
      }
  
      await createAccessory(name, serialNumber, value, purchaseDate);
      
      queryClient.invalidateQueries(["accessories"]);
      clearStates();
    } catch (error) {
      console.error("Erro ao criar acessório:", error);
      alert("Erro ao criar acessório.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-200 p-6 rounded-lg shadow-lg w-96 flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Novo Acessório</h2>
          <button onClick={clearStates} type="button"><IoMdClose /></button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-gray-700">Nome *</label>
            <input
              type="text"
              className="p-2 rounded border border-gray-300"
              placeholder="Ex: Furadeira Bosch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-gray-700">Número de Série</label>
            <input
              type="text"
              className="p-2 rounded border border-gray-300"
              placeholder="Ex: SN-123456"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-gray-700">Data de Compra</label>
            <input
              type="date"
              className="p-2 rounded border border-gray-300"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-gray-700">Valor (R$)</label>
            <input
              type="number"
              className="p-2 rounded border border-gray-300"
              placeholder="0.00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={clearStates} className="p-2 bg-slate-50 rounded hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="bnt-add">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}