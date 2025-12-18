import NavBar from "./NavBar";

const DashboardLayout = ({ 
  title, 
  actions, // Botão de "Ir para..." ou outros
  sidebar, // Componente da Sidebar
  header,  // Componente de Header específico (ex: ProjectsHeader)
  children // Conteúdo principal (Tabelas, Listas)
}) => {
  return (
    <div className="flex flex-col max-w-screen min-h-screen overflow-x-hidden gap-6">
      <NavBar select_index={1} />

      {/* Header Principal (Onde fica o Título "Projetos" ou "Orçamento") */}
      {/* RESTAURADO: mx-8 para alinhar horizontalmente com o conteúdo abaixo */}
      <div className="flex flex-row justify-between items-center bg-white px-6 py-3 mx-8 mt-4 rounded shadow-sm">
        <h1 className="text-base font-medium">{title}</h1>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Layout Dividido (Sidebar + Conteúdo) */}
      {/* RESTAURADO: ml-8 (crucial para o alinhamento esquerdo) e gap-4 */}
      <div className="flex flex-1 ml-8 gap-4 mb-8">
        
        {/* Sidebar */}
        {/* RESTAURADO: w-1/12 e min-w-[150px] exatos do seu código original */}
        <div className="w-1/12 min-w-[150px]">
          {sidebar}
        </div>

        {/* Conteúdo da Direita */}
        {/* Adicionei 'mr-8' para criar respiro na direita igual à esquerda */}
        <div className="flex flex-col flex-1 gap-4 mr-8">
          
          {/* Header Específico da Página (ex: Cards de Métricas) */}
          {header && (
            <div className="w-full">
              {header}
            </div>
          )}

          {/* Miolo Principal (ex: Tabela ou Lista) */}
          <div className="flex-1 w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;