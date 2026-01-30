import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { VerifyAuth } from "@services/AuthService.js";

const AuthGuard = ({ children, restrictLevel3 = false }) => {
  const [permissionStatus, setPermissionStatus] = useState("loading"); // loading, allowed, redirect_production, redirect_login
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("loginPermission");
      const user = await VerifyAuth();
      console.log("Usuário autenticado:", user);

      if (!user || user.access_type === undefined) {
        console.error("User sem access_type!");
        setPermissionStatus("redirect_login");
        return;
      }

      if (!token) {
        setPermissionStatus("redirect_login");
        return;
      }

      try {
        const user = await VerifyAuth();

        // LÓGICA PRINCIPAL:
        // Se o usuário é nível 3 (user.access_type >= 3)
        // E a rota atual restringe nível 3 (restrictLevel3 === true)
        if (user.access_type >= 3 && restrictLevel3) {
          setPermissionStatus("redirect_production");
        } else {
          setPermissionStatus("allowed");
        }
      } catch (error) {
        console.error("Erro na auth:", error);
        setPermissionStatus("redirect_login");
      }
    };

    checkUser();
  }, [restrictLevel3]);

  if (permissionStatus === "loading") {
    // Você pode substituir isso pelo seu componente de Spinner/Loading
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20%" }}
      >
        Verificando permissões...
      </div>
    );
  }

  if (permissionStatus === "redirect_login") {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (permissionStatus === "redirect_production") {
    // Se for nível 3 tentando acessar Home, Projetos, etc, joga para Produção
    return <Navigate to="/production" replace />;
  }

  // Se estiver tudo ok, renderiza a página
  return children;
};

export default AuthGuard;
