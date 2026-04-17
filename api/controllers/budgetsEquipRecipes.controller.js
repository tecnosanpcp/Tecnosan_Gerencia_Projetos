import { pool } from "../config/db.js";

export const createBudgetsEquipRecipes = async (req, res) => {
  try {
    const { budget_id, equipment_id, quantity_plan } = req.body;
    const response = await pool.query(
      "INSERT INTO budgets_equipments_recipes(budget_id, equipment_recipe_id, quantity_plan) VALUES ($1,$2,$3)",
      [budget_id, equipment_id, quantity_plan]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const readBudgetsEquipRecipes = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT * FROM budgets_equipments_recipes"
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({
      error: "Error ao ler ligação receita do componente a orçamento" + error,
    });
  }
};

export const updateBudgetsEquipRecipes = async (req, res) => {
  try {
    const { budget_id, equipment_id } = req.params;
    const { quantity_plan } = req.body;
    const response = await pool.query(
      `UPDATE budgets_equipments_recipes
        SET 
            quantity_plan = $3
        WHERE 
            budget_id = $1
        AND
            equipment_id = $2;`,
      [budget_id, equipment_id, quantity_plan]
    );
      res.status(200).json(response.rows);
    
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error ao atualizar receita do componente a orçamento" });
  }
};
export const deleteBudgetsEquipRecipes = async (req, res) => {
  try {
    const { budget_id, equipment_id } = req.params;

    const response = await pool.query(
      `DELETE FROM budgets_equipments_recipes 
        WHERE budget_id = $1 AND equipment_recipe_id = $2 
        RETURNING *;`, // MUDADO: de equipment_id para equipment_recipe_id
      [budget_id, equipment_id]
    );

    if (response.rowCount === 0) {
      return res.status(404).json({ message: "Relação não encontrada no banco." });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error("ERRO NO SQL:", error.message);
    res.status(500).json({ error: "Erro interno ao deletar" });
  }
};