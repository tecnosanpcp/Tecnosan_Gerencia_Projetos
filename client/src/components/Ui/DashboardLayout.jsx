import React from "react";

export default function DashboardLayout({
  title,
  actions,
  breadcrumb,
  sidebar,
  header,
  children,
}) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F4F5F7] text-[#172B4D]">
      <div className="flex min-h-screen w-full">
        {/* Sidebar secundária de projetos */}
        {sidebar && (
          <aside
            className="
              hidden md:flex
              w-[190px]
              lg:w-[205px]
              xl:w-[220px]
              shrink-0
              border-r border-[#DFE1E6]
              bg-white
              overflow-hidden
            "
          >
            <div className="flex h-full w-full flex-col">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Conteúdo */}
        <main className="min-w-0 flex-1 overflow-x-hidden">
          {/* Cabeçalho */}
          {(title || actions || breadcrumb) && (
            <section
              className="
                border-b border-[#DFE1E6]
                bg-white
                px-4 py-3
                sm:px-5
                lg:px-6
                xl:px-7
              "
            >
              {breadcrumb && (
                <div className="mb-2 text-xs font-medium text-[#6B778C]">
                  {breadcrumb}
                </div>
              )}

              <div
                className="
                  flex flex-col gap-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                {title && (
                  <h1
                    className="
                      min-w-0
                      truncate
                      text-lg font-semibold
                      sm:text-xl
                      xl:text-2xl
                    "
                  >
                    {title}
                  </h1>
                )}

                {actions && (
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {actions}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Header específico da página */}
          {header && (
            <section className="px-4 pt-4 sm:px-5 lg:px-6 xl:px-7">
              {header}
            </section>
          )}

          {/* Conteúdo principal */}
          <section
            className="
              min-w-0
              px-4 py-4
              sm:px-5 sm:py-5
              lg:px-6
              xl:px-7
              2xl:px-8
            "
          >
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}