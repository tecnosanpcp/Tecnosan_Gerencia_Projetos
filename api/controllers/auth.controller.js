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
  const { email, pass } = req.body;
  try {
    const response = await pool.query("SELECT * FROM Users");

    if (response.rowCount == 0) {
      throw new Error("Nenhum Usuário encontrado");
    }

    const user = response.rows.find(
      (user) =>
        email.trim() == user.email && compareSync(pass.trim(), user.password)
    );
    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });
    res.status(200).json({token});
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: error.message });
  }
}

export async function VerifyAuth(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token não fornecido" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json(decoded);
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: error.message });
  }
}
