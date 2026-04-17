import { useEffect, useState, useMemo } from "react";
import { vwBudgetsMaterialsSummary } from "@services/ViewsService.js";

export default function BudgetHeader({ currentBudget }) {
  const [budgetsSummary, setBudgetsSummary] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const budget_summary_data = await vwBudgetsMaterialsSummary();
      setBudgetsSummary(
        Array.isArray(budget_summary_data) ? budget_summary_data : [],
      );
    };
    loadData();
  }, []);

  // Lógica de Cálculo (Selecionado vs. Todos)
  const summary = useMemo(() => {
    // CASO 1: Orçamento Específico Selecionado
    if (currentBudget?.id) {
      const found = budgetsSummary.find(
        (bud) => bud?.budget_id == currentBudget.id,
      );

      return {
        total_value: Number(found?.total_value || 0),
        resina: Number(found?.resina || 0),
        roving: Number(found?.roving || 0),
        tecido_kg: Number(found?.tecido_kg || 0),
        tecido_cmd: Number(found?.tecido_cmd || 0),
        catalizador: Number(found?.catalizador || 0),
        manta: Number(found?.manta || 0),
        resina_iso: Number(found?.resina_iso || 0),
        horas_homem: Number(found?.horas_homem || 0),
      };
    }

    // CASO 2: Nenhum Selecionado (Soma de Todos)
    const total = budgetsSummary.reduce(
      (acc, curr) => ({
        total_value: acc.total_value + (Number(curr.total_value) || 0),
        resina: acc.resina + (Number(curr.resina) || 0),
        roving: acc.roving + (Number(curr.roving) || 0),
        tecido_kg: acc.tecido_kg + (Number(curr.tecido_kg) || 0),
        tecido_cmd: acc.tecido_cmd + (Number(curr.tecido_cmd) || 0),
        catalizador: acc.catalizador + (Number(curr.catalizador) || 0),
        manta: acc.manta + (Number(curr.manta) || 0),
        resina_iso: acc.resina_iso + (Number(curr.resina_iso) || 0),
        horas_homem: acc.horas_homem + (Number(curr.horas_homem) || 0),
      }),
      {
        total_value: 0,
        resina: 0,
        roving: 0,
        tecido_kg: 0,
        tecido_cmd: 0,
        catalizador: 0,
        manta: 0,
        resina_iso: 0,
        horas_homem: 0,
      },
    );

    return total;
  }, [currentBudget, budgetsSummary]);

  return (
    <header className="card p-4">
      <div className="flex gap-8 w-full">
        <h1 className="text-xl font-bold">
          {currentBudget?.name || "Gastos Totais (Geral)"}
        </h1>
        <p className="text-xl font-bold text-blue-500">
          {summary.total_value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>

      <div className="flex gap-4 mt-2 flex-wrap text-sm">
        <p>Resina: {summary.resina.toFixed(2)}</p>
        <p>Roving: {summary.roving.toFixed(2)}</p>
        <p>Tecido KG: {summary.tecido_kg.toFixed(2)}</p>
        <p>Tecido CMD: {summary.tecido_cmd.toFixed(2)}</p>
        <p>Catalizador: {summary.catalizador.toFixed(2)}</p>
        <p>Manta: {summary.manta.toFixed(2)}</p>
        <p>Resina ISO: {summary.resina_iso.toFixed(2)}</p>
        <p>Total Horas-Homem: {summary.horas_homem.toFixed(1)} HH</p>
      </div>
    </header>
  );
}
