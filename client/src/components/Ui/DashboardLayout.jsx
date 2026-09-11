const DashboardLayout = ({
  title,
  actions,
  header,
  children,
}) => {
  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] overflow-x-hidden">
      {/* Cabeçalho da página */}
      {(title || actions) && (
        <div className="px-6 pt-5">
          <div className="bg-white border border-[#DFE1E6] rounded-md px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              {title && (
                <h1 className="m-0 text-[18px] font-bold text-[#172B4D]">
                  {title}
                </h1>
              )}
            </div>

            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo */}
      <div className="px-6 py-5">
        {header && (
          <div className="mb-4">
            {header}
          </div>
        )}

        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

