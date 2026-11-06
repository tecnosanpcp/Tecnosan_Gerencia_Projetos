import { createBrowserRouter } from "react-router-dom";

import Home from "@pages/Home/Home.jsx";
import Production from "@pages/Production/Production.jsx";
import Projects from "@pages/Projects/Projects.jsx";
import Employees from "@pages/Employees/Employees.jsx";
import Reports from "@pages/Reports/Reports.jsx";
import Login from "@pages/Login/Login.jsx";
import Budgets from "@pages/Budgets/Budgets.jsx";
import Recipes from "@pages/Recipes/Recipes.jsx";

import AuthGuard from "./components/AuthGuard.jsx";
import AppLayout from "./components/Ui/AppLayout.jsx";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Login />,
    },

    {
      element: <AppLayout />,
      children: [
        {
          path: "/home",
          element: <Home />,
        },

        {
          path: "/production",
          element: (
            <AuthGuard restrictLevel3={false}>
              <Production />
            </AuthGuard>
          ),
        },

        {
          path: "/employees",
          element: (
            <AuthGuard restrictLevel3={true}>
              <Employees />
            </AuthGuard>
          ),
        },

        {
          path: "/reports",
          element: (
            <AuthGuard restrictLevel3={true}>
              <Reports />
            </AuthGuard>
          ),
        },

        {
          path: "/projects",
          element: (
            <AuthGuard restrictLevel3={true}>
              <Projects />
            </AuthGuard>
          ),
        },

        {
          path: "/budgets",
          element: (
            <AuthGuard restrictLevel3={true}>
              <Budgets />
            </AuthGuard>
          ),
        },

        {
          path: "/recipes",
          element: (
            <AuthGuard restrictLevel3={true}>
              <Recipes />
            </AuthGuard>
          ),
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

export { router };

