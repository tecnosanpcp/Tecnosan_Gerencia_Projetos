import { pool } from "../config/db.js";

// Listar todos os departamentos
export const listDepartmentsOrderName = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM departments ORDER BY department_name"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar departamentos:", error);
    res.status(500).json({ error: "Erro ao listar departamentos" });
  }
};

// Cadastrar novo departamento
export const createDeparment = async (req, res) => {
  try {
    const { department_name } = req.body;
    if (!department_name) {
      return res.status(400).json({ error: "Erro ao criar departamento" });
    }
    const result = await pool.query(
      "INSERT INTO DEPARTMENTS(department_name) VALUES ($1)",
      [department_name]
    );
    return result.data;
  } catch (error) {
    console.error("Erro ao criar departamento:", error);
    res.status(500).json({ error: "Erro ao criar departamento" });
  }
};

export const editDepartment = async (req, res) => {
  try {
    const { department_id, department_name } = req.body;
    if (!department_name || !department_id) {
      return res.status(400).json({ error: "Erro ao editar departamento" });
    }
    const result = await pool.query(
      " UPDATE DEPARTMENTS SET department_name = $1 WHERE department_id = $2;",
      [department_name, department_id]
    );
    return res
      .status(200)
      .json({ message: "Departamento atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao editar departamento:", error);
    res.status(500).json({ error: "Erro ao editar departamento" });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { department_id } = req.query;
    if (!department_id) {
      return res.status(400).json({ error: "Erro ao editar departamento" });
    }
    const result = await pool.query(
      "DELETE FROM DEPARTMENTS WHERE department_id = $1",
      [department_id]
    );
    console.log("Operação realizada");
    return res
      .status(200)
      .json({ message: "Departamento exluido com sucesso!" });
  } catch (error) {
    console.error("Erro ao excluir departamento:", error);
    res.status(500).json({ error: "Erro ao excluir departamento" });
  }
};
