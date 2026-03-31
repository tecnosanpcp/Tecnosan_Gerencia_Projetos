import { StrictMode, useState } from "react";
import { selectedProjectContext } from "./components/Content/SeletedProject.jsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./Router.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function Root() {
  const [currentProject, setCurrentProject] = useState(null);
  return (
    <StrictMode>
      <selectedProjectContext.Provider
        value={{ currentProject, setCurrentProject }}
      >
        <QueryClientProvider client={queryClient}>
          <RouterProvider
            router={router}
            future={{
              v7_startTransition: true,
            }}
          />
        </QueryClientProvider>
      </selectedProjectContext.Provider>
    </StrictMode>
  );
}

export default Root;
