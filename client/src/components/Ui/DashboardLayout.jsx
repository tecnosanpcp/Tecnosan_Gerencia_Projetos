import React, { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function DashboardLayout({
  title,
  actions,
  breadcrumb,
  sidebar,
  header,
  children,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? "48px" : "220px";
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F4F5F7] text-[#172B4D]">
      <div className="flex min-h-screen w-full">
        {/* Sidebar secundária de projetos */}
        {sidebar && (
          <aside
              className="
                relative
                hidden
                min-h-full
                self-stretch
                shrink-0
                border-r
                border-[#DFE1E6]
                bg-white
                md:flex
                overflow-visible
                transition-[width]
                duration-200
                ease-out
              "
            
            style={{ width: sidebarWidth }}
          >
            {!sidebarCollapsed && (
              <div className="flex h-full w-full flex-col overflow-hidden">
                {sidebar}
              </div>
            )}

            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              aria-label={
                sidebarCollapsed
                  ? "Expandir barra lateral"
                  : "Recolher barra lateral"
              }
              title={
                sidebarCollapsed
                  ? "Expandir barra lateral"
                  : "Recolher barra lateral"
              }
              className="
    absolute
    right-0
    top-1/2
    z-20
    flex
    h-7
    w-6
    -translate-y-1/2
    translate-x-1/2
    items-center
    justify-center
    rounded-[3px]
    border
    border-[#DFE1E6]
    bg-white
    text-[#6B778C]
    shadow-[0_1px_2px_rgba(9,30,66,0.12)]
    transition-colors
    duration-150
    hover:bg-[#F4F5F7]
    hover:text-[#172B4D]
  "
            >
              {sidebarCollapsed ? (
                <FiChevronRight size={14} strokeWidth={2} />
              ) : (
                <FiChevronLeft size={14} strokeWidth={2} />
              )}
            </button>
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
