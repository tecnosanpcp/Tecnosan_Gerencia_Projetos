import { pool } from "../config/db.js";

// Instância de um equipamento dentro de um orçamento específico.
// equipment_name pode divergir do nome da receita (customizável por orçamento).

export const createBudgetEquipment = async (req, res) => {
  try {
    const { budget_id, equipment_recipe_id, equipment_name } = req.body;

    if (!budget_id || !equipment_recipe_id) {
      return res.status(400).json({ message: "Algum dado está faltando" });
    }

    let name = equipment_name;
    if (!name) {
      const recipe = await pool.query(
        "SELECT recipe_name FROM equipment_recipes WHERE equipment_recipe_id = $1",
        [equipment_recipe_id],
      );
      if (recipe.rows.length === 0) {
        return res.status(404).json({ message: "Receita de equipamento não encontrada" });
      }
      name = recipe.rows[0].recipe_name;
    }

    const response = await pool.query(
      `INSERT INTO budgets_equipments (budget_id, equipment_recipe_id, equipment_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [budget_id, equipment_recipe_id, name],
    );

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erro ao criar equipamento do orçamento" + error });
  }
};

export const listBudgetEquipments = async (req, res) => {
  try {
    const { budget_id } = req.params;

    const response = budget_id
      ? await pool.query(
          "SELECT * FROM budgets_equipments WHERE budget_id = $1 ORDER BY budget_equipment_id",
          [budget_id],
        )
      : await pool.query(
          "SELECT * FROM budgets_equipments ORDER BY budget_equipment_id",
        );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erro ao listar equipamentos do orçamento" + error });
  }
};

export const readBudgetEquipmentById = async (req, res) => {
  try {
    const { budget_equipment_id } = req.params;

    const response = await pool.query(
      "SELECT * FROM budgets_equipments WHERE budget_equipment_id = $1",
      [budget_equipment_id],
    );

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Equipamento do orçamento não encontrado" });
    }

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erro ao buscar equipamento do orçamento" + error });
  }
};

export const updateBudgetEquipment = async (req, res) => {
  try {
    const { budget_equipment_id } = req.params;
    const { equipment_name } = req.body;

    if (!equipment_name) {
      return res.status(400).json({ message: "Faltando dados" });
    }

    const response = await pool.query(
      `UPDATE budgets_equipments
       SET equipment_name = $1
       WHERE budget_equipment_id = $2
       RETURNING *`,
      [equipment_name, budget_equipment_id],
    );

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Equipamento do orçamento não encontrado" });
    }

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erro ao atualizar equipamento do orçamento" + error });
  }
};

export const deleteBudgetEquipment = async (req, res) => {
  try {
    const { budget_equipment_id } = req.params;

    // ON DELETE CASCADE em budgets_components_schedule cuida do cronograma
    // vinculado; equipments.budget_equipment_id (se houver FK sem cascade)
    // deve ser tratado antes, dependendo de como a FK foi criada.
    const response = await pool.query(
      `DELETE FROM budgets_equipments
       WHERE budget_equipment_id = $1
       RETURNING *`,
      [budget_equipment_id],
    );

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Equipamento do orçamento não encontrado" });
    }

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Erro ao deletar equipamento do orçamento" + error });
  }
};
