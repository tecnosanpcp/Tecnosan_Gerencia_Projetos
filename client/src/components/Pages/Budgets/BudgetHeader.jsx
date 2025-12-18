export default function ProjectsHeader({ currentBudget, times }) {

  return (
    <header className="card p-4">
      <div className="flex gap-8 w-full">
        <h1 className="text-xl font-bold">
          {currentBudget?.name || "Gastos Totais"}
        </h1>
        <p className="text-xl font-bold text-blue-500"> nada</p>
      </div>

      <div className="flex gap-8 mt-2">
        {/* Materiais Summay */}
        

        <p>
          Total de Horas:{" "}
          {times?.projects?.[currentBudget?.id]?.total_hours ?? 0} Horas
        </p>
        <p>
          Total de Homens:{" "}
          {times?.projects?.[currentBudget?.id]?.qtd_employees ?? 0} F
        </p>
        <p>
          Total Horas-Homem:{" "}
          {(times?.projects?.[currentBudget?.id]?.qtd_employees ?? 0) *
            (times?.projects?.[currentBudget?.id]?.total_hours ?? 0)}{" "}
          HH
        </p>
      </div>
    </header>
  );
}
