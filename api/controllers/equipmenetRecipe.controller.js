import { pool } from "../config/db.js";

export const getEquipmentRecipe = async (req, res) => {
  try {
    const response = await pool.query("select * from equipment_recipes");
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar receita dos Equipmentos" });
  }
};

export const createEquipmentRecipe = async (req, res) => {
  try {
    const { recipe_name } = req.body;
    const response = await pool.query(
      "INSERT INTO equipment_recipes(recipe_name) VALUES ($1) RETURNING *",
      [recipe_name],
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao cadastrar nova receita de Equipamento " + error,
    });
  }
};

export const deleteEquipmentRecipe = async (req, res) => {
  try {
    const { equipment_recipe_id } = req.params;
    const response = await pool.query(
      "DELETE FROM equipment_recipes WHERE equipment_recipe_id = $1 RETURNING *",
      [equipment_recipe_id],
    );

    res.status(200).json(response.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error ao deletar receita do Equipamento " + error });
  }
};

export const updateEquipmentRecipe = async (req, res) => {
  try {
    const { equipment_recipe_id } = req.params;
    const { recipe_name } = req.body;

    const response = await pool.query(
      `
      UPDATE equipment_recipes
      SET 
        recipe_name = $1
      WHERE equipment_recipe_id = $2
      RETURNING *;
      `,
      [recipe_name, equipment_recipe_id],
    );

    res.status(200).json(response.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao atualizar a receita do Equipamento " + error });
  }
};
