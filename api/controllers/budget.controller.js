import { pool } from "../config/db.js";

export const createBudget = async (req, res) => {
  const { user_id, budget_name, budget_local } = req.body;
  try {
    console.log(user_id, budget_name, budget_local);
    const client = await pool.connect();
    await client.query("BEGIN");

    const budgetResult = await client.query(
      `INSERT INTO budgets(budget_name, budget_local, status) VALUES ($1, $2, 'Em Planejamento') RETURNING budget_id`,
      [budget_name, budget_local]
    );

    const budget_id = budgetResult.rows[0].budget_id;
    await client.query(
      `INSERT INTO BUDGETS_USERS(user_id, budget_id) VALUES ($1, $2)`,
      [user_id, budget_id]
    );
    client.release();

    res
      .status(201)
      .json({ message: "Orçamento cadastrado com sucesso", budget_id });
    await client.query("COMMIT");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listBudget = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (isNaN(Number(user_id))) {
      return res.status(400).json({ error: "Invalid user_id" });
    }

    const response = await pool.query(
      `SELECT b.*
       FROM budgets b
       JOIN budgets_users bu ON b.budget_id = bu.budget_id
       WHERE bu.user_id = $1`,
      [user_id]
    );

    res.json(response.rows);
  } catch (error) {
    console.error("Erro ao listar orçamentos", error);
    res.status(500).json({ error: "Erro ao listar orçamentos" });
  }
};

export const uploadStatusBudget = async (req, res) => {
  try {
    const { budget_id } = req.params;
    const { status } = req.body;

    if (!budget_id || !status) {
      res.status(400).json({ message: "Faltando dados" });
      throw new Error({ message: "Faltando dados" });
    }

    const response = await pool.query(
      `UPDATE Budgets SET status = $1 WHERE budget_id = $2`,
      [status, budget_id]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
