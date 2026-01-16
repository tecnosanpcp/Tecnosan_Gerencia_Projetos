import { useState } from "react";
import { LoginService } from "@services/AuthService";
import { useNavigate } from "react-router-dom";

import Logo from "../../../imgs/tecnosan-logo-circular.png"

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await LoginService(email, password);
    if (response) {
      sessionStorage.setItem("loginPermission", response);
      navigate("/home");
      window.location.reload();
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-200 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center bg-white shadow-xl rounded-lg p-6 w-256 h-265">
        <img
          src={Logo}
          alt="Logo"
          className="mb-4 mx-30"
          width={150}
        />
        <h1 className="text-2xl font-bold mb-4">
          Sistema de Controle de Produção
        </h1>
        <form className="flex flex-col min-w-80" onSubmit={handleLogin}>
          <label className="mb-2">Email:</label>
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-md p-2 mb-4 shadow-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="mb-2">Senha:</label>
          <input
            type="password"
            placeholder="Senha"
            className="border border-gray-300 rounded-md p-2 mb-4 shadow-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <a href="#" className="text-blue-500 hover:underline mb-4">
            Esqueceu a senha?
          </a>
          <button
            type="submit"
            className="bg-gradient-to-r from-sky-500 to-indigo-800 text-white rounded-md p-2 shadow-sm"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
