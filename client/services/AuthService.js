import api from "./api.js";

export async function LoginService(email, pass) {
  try {
    const response = await api.post("/auth/login", {
      email,
      pass,
    });
    const TOKEN = response.data.token;
    localStorage.setItem("token", TOKEN);

    return TOKEN;
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    throw error;
  }
}

export async function VerifyAuth() {
  try {
    const TOKEN = localStorage.getItem("token");
    const response = await api.get("/auth/verify", {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return null;
    }

    return response.data;
  } catch (error) {
    console.error("Erro ao verificar o token", error);
  }
}
