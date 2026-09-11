import { useNavigate, useLocation } from "react-router-dom";

const items = [
  {
    label: "Página Inicial",
    path: "/home",
    icon: <HomeIcon />,
  },
  {
    label: "Projetos",
    path: "/projects",
    icon: <ProjectsIcon />,
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

  const logout = () => {
    sessionStorage.removeItem("loginPermission");
    localStorage.removeItem("token");
    localStorage.removeItem("loginPermission");

    navigate("/");
  };

  const toggleSidebar = () => {
    onCollapsedChange(!collapsed);
  };

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        bottom-0
        z-[7000]
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
      {/* LOGO */}
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

      {/* NAVEGAÇÃO */}
      <nav
        className="
          flex-1
          min-h-0
          overflow-y-auto
          overflow-x-hidden
          px-2
          py-3
          space-y-0.5
        "
      >
        {items.map((item) => {
          const active =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <button
              key={item.path}
              type="button"
              title={collapsed ? item.label : undefined}
              onClick={() => navigate(item.path)}
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
                {item.icon}
              </span>

              {!collapsed && (
                <span className="truncate">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* USUÁRIO + AÇÕES */}
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

        {/* SAIR */}
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

        {/* RECOLHER */}
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