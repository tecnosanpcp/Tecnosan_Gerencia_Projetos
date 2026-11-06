import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { vwEquipmentRecipesMaterialSummary } from "@services/ViewsService.js";

const fields = [
  "total_value",
  "resina",
  "roving",
  "tecido_kg",
  "tecido_cmd",
  "catalizador",
  "manta",
  "resina_iso",
  "horas_homem",
];

const emptySummary = () =>
  Object.fromEntries(fields.map((field) => [field, 0]));

export default function BudgetHeader({
  currentBudget,
  allBudgets = [],
}) {
  const budgetIds = useMemo(() => {
    if (currentBudget) {
      const id = currentBudget.id ?? currentBudget.budget_id;
      return id != null ? [id] : [];
    }

    return allBudgets
      .map((budget) => budget.id ?? budget.budget_id)
      .filter((id) => id != null);
  }, [currentBudget, allBudgets]);

  const summaryQuery = useQuery({
    queryKey: ["budgetHeaderSummary", budgetIds],

    queryFn: async () => {
      const results = await Promise.all(
        budgetIds.map((id) =>
          vwEquipmentRecipesMaterialSummary(id)
        )
      );

      return results.flat();
    },

    enabled: budgetIds.length > 0,
  });

  const summary = useMemo(() => {
    return (summaryQuery.data || []).reduce((acc, equip) => {
      for (const field of fields) {
        acc[field] += Number(equip[field]) || 0;
      }

      return acc;
    }, emptySummary());
  }, [summaryQuery.data]);

  return (
    <header
      className="
        border border-[#DFE1E6]
        bg-white
        px-4 py-5
        sm:px-5 lg:px-6 xl:px-7
      "
    >
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-bold">
          {currentBudget?.name ||
            currentBudget?.budget_name ||
            "Gastos Totais (Geral)"}
        </h1>

        <p className="text-xl font-bold text-blue-500">
          {summary.total_value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>

      {summaryQuery.isLoading ? (
        <p className="mt-2 text-sm text-gray-500">
          Carregando informações do orçamento...
        </p>
      ) : summaryQuery.isError ? (
        <p className="mt-2 text-sm text-red-600">
          Não foi possível carregar o resumo do orçamento.
        </p>
      ) : (
        <div className="flex gap-4 mt-2 flex-wrap text-sm">
          <p>Resina: {summary.resina.toFixed(2)}</p>
          <p>Roving: {summary.roving.toFixed(2)}</p>
          <p>Tecido KG: {summary.tecido_kg.toFixed(2)}</p>
          <p>Tecido CMD: {summary.tecido_cmd.toFixed(2)}</p>
          <p>Catalizador: {summary.catalizador.toFixed(2)}</p>
          <p>Manta: {summary.manta.toFixed(2)}</p>
          <p>Resina ISO: {summary.resina_iso.toFixed(2)}</p>
          <p>
            Total Horas-Homem:{" "}
            {summary.horas_homem.toFixed(1)} HH
          </p>
        </div>
      )}
    </header>
  );
}