import { pool } from "../config/db.js";
import { randomInt } from "node:crypto";
import { hash, compareSync } from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function Register(req, res) {
  try {
    const { username, email, pass, access_type } = req.body;

    if (!email || !pass) {
      throw new Error("Esqueceu de inserir Email ou Senha");
    }

    // Fazendo Hash da senha
    const randowSalt = randomInt(10, 16);
    const hashingPass = await hash(pass.trim(), randowSalt);

    // Criando a conta com esse Hash
    const response = await pool.query(
      `INSERT INTO Users(user_name, email, password, access_type) VALUES ($1, $2, $3, $4) RETURNING *`,
      [username.trim(), email.trim(), hashingPass, access_type]
    );

    const token = jwt.sign(response.rows[0], process.env.JWT_SECRET, {
      expiresIn: "12h",
    });
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: error.message });
  }
}

// função de login
export async function Login(req, res) {
  try {
    const { email, pass } = req.body;

    // 1. Busca APENAS o usuário necessário no banco (Mais rápido e seguro)
    const response = await pool.query("SELECT * FROM Users WHERE email = $1", [email.trim()]);

    // 2. Verifica se o usuário existe
    if (response.rowCount === 0) {
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    const user = response.rows[0];

    // 3. Verifica a senha
    const passwordMatch = compareSync(pass.trim(), user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "E-mail ou senha incorretos" });
    }

    // 4. Gera o token (Remova a senha do token por segurança)
    delete user.password;
    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    // 5. Retorna sucesso
    return res.status(200).json({ token });

  } catch (error) {
    console.error("Login Error: ", error);
    // Garante que o erro 500 só ocorra em falhas REAIS de servidor (ex: banco caiu)
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

export async function VerifyAuth(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Se o token expirou ou é inválido, manda 401 (Não autorizado)
        return res.status(401).json({ message: "Token inválido ou expirado" });
      }
      // Retorna os dados do usuário com status 200
      return res.status(200).json(decoded);
    });
  } catch (error) {
    console.error("Erro interno no VerifyAuth:", error);
    return res.status(500).json({ error: "Falha na verificação" });
  }
}
export async function updatePassword(req, res) {
  try {
    const { user_id } = req.params;
    const { pass } = req.body;

    if (!user_id || !pass) {
      throw new Error("Faltando dados");
    }

    // Fazendo Hash da senha
    const randowSalt = randomInt(10, 16);
    const hashingPass = await hash(pass.trim(), randowSalt);

    // Criando a conta com esse Hash
    const response = await pool.query(
      `UPDATE Users SET password = $1 WHERE user_id = $2 RETURNING *`,
      [hashingPass, user_id]
    );

    const token = jwt.sign(response.rows[0], process.env.JWT_SECRET, {
      expiresIn: "12h",
    });
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: error.message });
  }
}
