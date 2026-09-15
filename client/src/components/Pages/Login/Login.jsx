import { useState } from "react";
import { LoginService } from "@services/AuthService";
import { useNavigate } from "react-router-dom";
import Logo from "../../../imgs/tecnosan-sem-fundo.png";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await LoginService(email, password);
      if (response) {
        localStorage.setItem("token", response);
        localStorage.setItem("loginPermission", "true");
        sessionStorage.setItem("loginPermission", "true");
        navigate("/home");
        window.location.reload();
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      alert(
        error?.response?.data?.error ||
          "Não foi possível realizar o login. Verifique as credenciais e o servidor.",
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#F4F5F7] px-4 py-8">
      {" "}
      <div className="flex w-full max-w-[400px] flex-col items-center">
        {" "}
        {/* Logo Tecnosan acima do card */}{" "}
        <img
          src={Logo}
          alt="Tecnosan"
          className="mb-8 h-auto w-[190px] object-contain"
        />{" "}
        {/* Card de Login */}{" "}
        <div className="w-full rounded-[3px] border border-[#DFE1E6] bg-white p-8 shadow-[0_3px_8px_rgba(9,30,66,0.12)]">
          {" "}
          <div className="mb-7">
            {" "}
            <h1 className="text-[24px] font-semibold text-[#172B4D]">
              {" "}
              Bem-vindo{" "}
            </h1>{" "}
            <p className="mt-2 text-[14px] leading-5 text-[#5E6C84]">
              {" "}
              Faça login para acessar o sistema PCP.{" "}
            </p>{" "}
          </div>{" "}
          <form onSubmit={handleLogin}>
            {" "}
            {/* E-mail */}{" "}
            <div className="mb-5">
              {" "}
              <label
                htmlFor="email"
                className="mb-2 block text-[13px] font-semibold text-[#172B4D]"
              >
                {" "}
                E-mail ou usuário{" "}
              </label>{" "}
              <input
                id="email"
                type="email"
                placeholder="Digite seu e-mail ou usuário"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-[3px] border border-[#B7C0CE] bg-white px-3 text-[14px] text-[#172B4D] outline-none transition placeholder:text-[#7A869A] hover:border-[#7A869A] focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20"
                required
              />{" "}
            </div>{" "}
            {/* Senha */}{" "}
            <div className="mb-4">
              {" "}
              <label
                htmlFor="password"
                className="mb-2 block text-[13px] font-semibold text-[#172B4D]"
              >
                {" "}
                Senha{" "}
              </label>{" "}
              <div className="relative">
                {" "}
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-[3px] border border-[#B7C0CE] bg-white px-3 pr-11 text-[14px] text-[#172B4D] outline-none transition placeholder:text-[#7A869A] hover:border-[#7A869A] focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20"
                  required
                />{" "}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#0052CC] hover:underline"
                >
                  {" "}
                  {showPassword ? "Ocultar" : "Mostrar"}{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            {/* Opções */}{" "}
            <div className="mb-6 flex items-center justify-between">
              {" "}
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#42526E]">
                {" "}
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#B7C0CE] text-[#0052CC] accent-[#0052CC]"
                />{" "}
                <span>Continuar conectado</span>{" "}
              </label>{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-[13px] font-medium text-[#0052CC] hover:underline"
              >
                {" "}
                Esqueceu sua senha?{" "}
              </a>{" "}
            </div>{" "}
            {/* Botão */}{" "}
            <button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-[3px] bg-[#0052CC] px-4 text-[14px] font-semibold text-white transition hover:bg-[#0747A6] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {" "}
              {isLoading ? "Entrando..." : "Entrar"}{" "}
            </button>{" "}
          </form>{" "}
        </div>{" "}
        {/* Rodapé */}{" "}
        <p className="mt-6 text-center text-[12px] text-[#6B778C]">
          {" "}
          Sistema de Controle de Produção{" "}
        </p>{" "}
      </div>{" "}
    </main>
  );
}
export default Login;
