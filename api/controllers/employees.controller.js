import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import { randomInt } from "node:crypto";

// Listar todos
export const getEmployees = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.user_name, e.job_title, e.salary, e.performance 
       FROM users u 
       JOIN employees e ON u.user_id = e.user_id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar funcionários:", error);
    res.status(500).json({ error: "Erro ao listar funcionários" });
  }
};

// Pesquisar por um funcionário por id
export const getEmployeeById = async (req, res) => {
  try {
    const { user_id } = req.query;
    const response = await pool.query(
      `SELECT 
         u.user_id, u.email, u.user_name, u.pass, u.access_type, 
         e.salary, e.performance, e.job_title, e.department_id
       FROM users u 
       JOIN employees e ON u.user_id = e.user_id
       WHERE u.user_id = $1`,
      [user_id]
    );
    res.json(response.rows[0]); // retorna só um funcionário
  } catch (error) {
    console.error("Erro ao procurar um funcionário especifico", error);
    res
      .status(500)
      .json({ error: "Erro ao procurar um funcionário especifico" });
  }
};

// Criar funcionário
export const createEmployee = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      email,
      user_name,
      password,
      access_type,
      salary,
      job_title,
      department_id,
    } = req.body;

    if (!email || !password) {
      throw new Error("Email e senha são obrigatórios");
    }

    const salt = randomInt(10, 16);
    const passwordHash = await bcrypt.hash(password.trim(), salt);

    await client.query("BEGIN");

    const userResult = await client.query(
      `INSERT INTO users (email, user_name, password, access_type)
       VALUES ($1, $2, $3, $4) RETURNING user_id`,
      [email.trim(), user_name.trim(), passwordHash, access_type || 3]
    );

    const userId = userResult.rows[0].user_id;

    await client.query(
      `INSERT INTO employees (user_id, salary, job_title, department_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, salary, job_title, department_id]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Funcionário cadastrado com sucesso" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao cadastrar funcionário:", error);

    if (error.code === "23505") {
      return res.status(409).json({ error: "Email ou usuário já cadastrado." });
    }

    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const editEmployee = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      user_id,
      email,
      user_name,
      pass,
      access_type,
      salary,
      performance,
      job_title,
      department_id,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "O ID do usuário é obrigatório." });
    }

    let passwordHash = null;
    if (pass && pass.trim() !== "") {
      const salt = await randomInt(10, 16);
      passwordHash = await bcrypt.hash(pass.trim(), salt);
    }

    await client.query("BEGIN");
    await client.query(
      `UPDATE users 
       SET 
         email = COALESCE($1, email), 
         user_name = COALESCE($2, user_name), 
         password = COALESCE($3, password), 
         access_type = COALESCE($4, access_type)
       WHERE user_id = $5`,
      [
        email || null,
        user_name || null,
        passwordHash,
        access_type || null,
        user_id,
      ]
    );

    await client.query(
      `UPDATE employees 
       SET 
         salary = COALESCE($1, salary), 
         performance = COALESCE($2, performance), 
         job_title = COALESCE($3, job_title), 
         department_id = COALESCE($4, department_id)
       WHERE user_id = $5`,
      [
        salary || null,
        performance || null,
        job_title || null,
        department_id || null,
        user_id,
      ]
    );

    await client.query("COMMIT");
    res.json({ message: "Dados atualizados com sucesso" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao atualizar dados:", error);

    if (error.code === "23505") {
      return res
        .status(409)
        .json({ error: "Este email já está em uso por outro usuário." });
    }

    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { user_id } = req.body;
    const response = await pool.query("DELETE FROM users WHERE user_id = $1", [
      user_id,
    ]);
    console.log("Funcionário deletado com sucesso:", user_id);
    res.json(response.rows());
  } catch (error) {
    console.log("Erro ao deletar funcionário:", error);
    res.status(500).json({ error: "Erro ao deletar funcionário" });
  }
};
