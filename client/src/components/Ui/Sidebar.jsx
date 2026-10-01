import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const items = [
  {
    label: "Página Inicial",
    path: "/home",
    icon: <HomeIcon />,
  },
  {
    label: "Produção",
    path: "/production",
    icon: <ProductionIcon />,
  },
  {
    label: "Relatórios",
    path: "/reports",
    icon: <ReportsIcon />,
  },
  {
    label: "Colaboradores",
    path: "/employees",
    icon: <EmployeesIcon />,
  },
  {
    label: "Receitas",
    path: "/recipes",
    icon: <RecipesIcon />,
  },
];

export default function Sidebar({
  collapsed,
  onCollapsedChange,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [projectsOpen, setProjectsOpen] = useState(
    location.pathname.startsWith("/projects") ||
      location.pathname.startsWith("/budgets"),
  );

  const logout = () => {
    sessionStorage.removeItem("loginPermission");
    localStorage.removeItem("token");
    localStorage.removeItem("loginPermission");

    navigate("/");
  };

  const toggleSidebar = () => {
    onCollapsedChange(!collapsed);
  };

  const isProjectsActive =
    location.pathname === "/projects" ||
    location.pathname.startsWith("/projects/") ||
    location.pathname === "/budgets" ||
    location.pathname.startsWith("/budgets/");

  const isProjectPage =
    location.pathname === "/projects" ||
    location.pathname.startsWith("/projects/");

  const isBudgetPage =
    location.pathname === "/budgets" ||
    location.pathname.startsWith("/budgets/");

  const handleProjectsClick = () => {
    if (collapsed) {
      navigate("/projects");
      return;
    }

    setProjectsOpen((current) => !current);
  };

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        bottom-0
        z-40
        flex
        flex-col
        bg-[#0052CC]
        text-white
        shadow-[2px_0_8px_rgba(0,0,0,0.18)]
        transition-[width]
        duration-200
        ease-out
        overflow-hidden
      "
      style={{
        width: collapsed ? 56 : 220,
      }}
    >
      {/* =========================
          LOGO
      ========================== */}
      <div
        className="
          h-14
          shrink-0
          flex
          items-center
          gap-2.5
          px-4
          border-b
          border-white/10
          overflow-hidden
        "
      >
        <div
          className="
            w-7
            h-7
            shrink-0
            rounded-md
            bg-white
            flex
            items-center
            justify-center
          "
        >
          <BrandIcon />
        </div>

        {!collapsed && (
          <span
            className="
              text-[13px]
              leading-[1.15]
              font-bold
              whitespace-nowrap
              tracking-[-0.01em]
            "
          >
            Controle de
            <br />
            <span className="font-normal opacity-85">
              Produção
            </span>
          </span>
        )}
      </div>

      {/* =========================
          NAVEGAÇÃO
      ========================== */}
      <nav
        className="
          flex-1
          min-h-0
          overflow-y-auto
          overflow-x-hidden
          px-2
          py-3
        "
      >
        {/* =========================
            PÁGINA INICIAL
        ========================== */}
        <SidebarItem
          label="Página Inicial"
          icon={<HomeIcon />}
          active={
            location.pathname === "/home" ||
            location.pathname.startsWith("/home/")
          }
          collapsed={collapsed}
          onClick={() => navigate("/home")}
        />

        {/* =========================
            PROJETOS
        ========================== */}
        <div className="mb-0.5">
          <button
            type="button"
            title={collapsed ? "Projetos" : undefined}
            onClick={handleProjectsClick}
            className={`
              relative
              w-full
              h-10
              flex
              items-center
              gap-2.5
              rounded-md
              border-0
              font-sans
              text-[13px]
              whitespace-nowrap
              overflow-hidden
              transition-colors

              ${
                collapsed
                  ? "justify-center px-0"
                  : "justify-start px-3"
              }

              ${
                isProjectsActive
                  ? "bg-white/20 text-white font-semibold"
                  : "bg-transparent text-white/75 hover:bg-white/10 hover:text-white"
              }
            `}
          >
            {isProjectsActive && (
              <span
                className="
                  absolute
                  left-0
                  top-1/2
                  -translate-y-1/2
                  w-[3px]
                  h-5
                  rounded-r
                  bg-white
                "
              />
            )}

            <span className="shrink-0 flex">
              <ProjectsIcon />
            </span>

            {!collapsed && (
              <>
                <span className="flex-1 truncate text-left">
                  Projetos
                </span>

                <span
                  className={`
                    shrink-0
                    transition-transform
                    duration-200
                    ${
                      projectsOpen
                        ? "rotate-180"
                        : "rotate-0"
                    }
                  `}
                >
                  <ChevronIcon />
                </span>
              </>
            )}
          </button>

          {/* =========================
              SUBMENU
          ========================== */}
          {!collapsed && projectsOpen && (
            <div className="mt-0.5 mb-1 ml-3 border-l border-white/20 pl-2">
              <button
                type="button"
                onClick={() => navigate("/projects")}
                className={`
                  relative
                  w-full
                  h-9
                  flex
                  items-center
                  rounded-md
                  border-0
                  px-3
                  text-left
                  text-[12px]
                  transition-colors

                  ${
                    isProjectPage
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                {isProjectPage && (
                  <span
                    className="
                      absolute
                      left-0
                      top-1/2
                      -translate-y-1/2
                      w-[2px]
                      h-4
                      rounded-r
                      bg-white
                    "
                  />
                )}

                <span className="truncate">
                  Projetos
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/budgets")}
                className={`
                  relative
                  w-full
                  h-9
                  flex
                  items-center
                  rounded-md
                  border-0
                  px-3
                  text-left
                  text-[12px]
                  transition-colors

                  ${
                    isBudgetPage
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                {isBudgetPage && (
                  <span
                    className="
                      absolute
                      left-0
                      top-1/2
                      -translate-y-1/2
                      w-[2px]
                      h-4
                      rounded-r
                      bg-white
                    "
                  />
                )}

                <span className="truncate">
                  Orçamentos
                </span>
              </button>
            </div>
          )}
        </div>

        {/* =========================
            DEMAIS ITENS
        ========================== */}
        {items.slice(1).map((item) => {
          const active =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <SidebarItem
              key={item.path}
              label={item.label}
              icon={item.icon}
              active={active}
              collapsed={collapsed}
              onClick={() => navigate(item.path)}
            />
          );
        })}
      </nav>

      {/* =========================
          USUÁRIO + AÇÕES
      ========================== */}
      <div
        className="
          shrink-0
          border-t
          border-white/10
          px-2
          py-3
          space-y-1.5
        "
      >
        {/* Usuário */}
        <div
          className={`
            h-12
            flex
            items-center
            gap-2.5
            rounded-md
            overflow-hidden

            ${
              collapsed
                ? "justify-center px-0"
                : "px-2.5"
            }
          `}
        >
          <div
            className="
              w-[30px]
              h-[30px]
              shrink-0
              rounded-full
              bg-[#FF991F]
              border-2
              border-white/40
              flex
              items-center
              justify-center
              text-[11px]
              font-bold
            "
          >
            AD
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="m-0 text-xs font-semibold truncate">
                Admin
              </p>

              <p className="m-0 text-[11px] text-white/60 truncate">
                Administrador
              </p>
            </div>
          )}
        </div>

        {/* Sair */}
        <button
          type="button"
          onClick={logout}
          title={collapsed ? "Sair" : undefined}
          className={`
            w-full
            h-9
            flex
            items-center
            gap-2.5
            rounded-md
            border-0
            bg-transparent
            text-white/65
            hover:bg-white/10
            hover:text-white
            text-[13px]
            transition-colors

            ${
              collapsed
                ? "justify-center px-0"
                : "justify-start px-2.5"
            }
          `}
        >
          <LogoutIcon />

          {!collapsed && (
            <span>Sair</span>
          )}
        </button>

        {/* Recolher */}
        <button
          type="button"
          onClick={toggleSidebar}
          title={
            collapsed
              ? "Expandir menu"
              : "Recolher menu"
          }
          className={`
            w-full
            h-9
            flex
            items-center
            gap-2.5
            rounded-md
            border-0
            bg-transparent
            text-white/65
            hover:bg-white/10
            hover:text-white
            text-[12px]
            transition-colors

            ${
              collapsed
                ? "justify-center px-0"
                : "justify-start px-2.5"
            }
          `}
        >
          <CollapseIcon
            collapsed={collapsed}
          />

          {!collapsed && (
            <span>Recolher menu</span>
          )}
        </button>
      </div>
    </aside>
  );
}

/* =========================
   ITEM DA SIDEBAR
========================= */

function SidebarItem({
  label,
  icon,
  active,
  collapsed,
  onClick,
}) {
  return (
    <button
      type="button"
      title={collapsed ? label : undefined}
      onClick={onClick}
      className={`
        relative
        w-full
        h-10
        flex
        items-center
        gap-2.5
        rounded-md
        border-0
        font-sans
        text-[13px]
        whitespace-nowrap
        overflow-hidden
        transition-colors
        mb-0.5

        ${
          collapsed
            ? "justify-center px-0"
            : "justify-start px-3"
        }

        ${
          active
            ? "bg-white/20 text-white font-semibold"
            : "bg-transparent text-white/75 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      {active && (
        <span
          className="
            absolute
            left-0
            top-1/2
            -translate-y-1/2
            w-[3px]
            h-5
            rounded-r
            bg-white
          "
        />
      )}

      <span className="shrink-0 flex">
        {icon}
      </span>

      {!collapsed && (
        <span className="truncate">
          {label}
        </span>
      )}
    </button>
  );
}

/* =========================
   ÍCONES
========================= */

function Svg({ children }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function HomeIcon() {
  return (
    <Svg>
      <path
        d="M2 7.5L9 2l7 5.5V16h-4.5v-4.5h-5V16H2V7.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProjectsIcon() {
  return (
    <Svg>
      <rect
        x="2"
        y="2"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <rect
        x="10"
        y="2"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <rect
        x="2"
        y="10"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <rect
        x="10"
        y="10"
        width="6"
        height="6"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Svg>
  );
}

function ProductionIcon() {
  return (
    <Svg>
      <circle
        cx="9"
        cy="9"
        r="7"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M9 5v4l3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ReportsIcon() {
  return (
    <Svg>
      <rect
        x="3"
        y="2"
        width="12"
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M6 7h6M6 10h4M6 13h3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function EmployeesIcon() {
  return (
    <Svg>
      <circle
        cx="7"
        cy="6"
        r="3"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M1 16c0-2.76 2.24-5 5-5h2c2.76 0 5 2.24 5 5M13 6c0-1.1.9-2 2-2M14 11c1.66 0 3 1.34 3 3v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function RecipesIcon() {
  return (
    <Svg>
      <path
        d="M3 3h12v2c0 4.42-2.69 8-6 8S3 9.42 3 5V3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M6 16h6M9 13v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function LogoutIcon() {
  return (
    <Svg>
      <path
        d="M7 3H3.5C2.95 3 2.5 3.45 2.5 4v10c0 .55.45 1 1 1H7M12 6l3.5 3-3.5 3M15.5 9H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CollapseIcon({ collapsed }) {
  return (
    <Svg>
      <path
        d={
          collapsed
            ? "M7 3l6 6-6 6M13 9H3"
            : "M11 3L5 9l6 6M5 9h10"
        }
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 5.25L7 8.25L10 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrandIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="6"
        height="6"
        rx="1"
        fill="#0052CC"
      />

      <rect
        x="9"
        y="1"
        width="6"
        height="6"
        rx="1"
        fill="#0052CC"
      />

      <rect
        x="1"
        y="9"
        width="6"
        height="6"
        rx="1"
        fill="#0052CC"
      />

      <rect
        x="9"
        y="9"
        width="6"
        height="6"
        rx="1"
        fill="#0052CC"
      />
    </svg>
  );
}