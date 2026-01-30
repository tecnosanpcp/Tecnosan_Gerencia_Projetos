import { pool } from "../config/db.js";

export const createCompRecipeMat = async (req, res) => {
  try {
    const { component_recipe_id, material_id, quantity_plan } = req.body;
    if (!component_recipe_id || !material_id || !quantity_plan) {
      return res.status(505).json({ error: "Informações inválidas" });
    }

    const response = await pool.query(
      `INSERT INTO 
            component_recipes_materials(component_recipe_id, material_id, quantity_plan)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [component_recipe_id, material_id, quantity_plan]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error ao criar receita do componente" + error });
  }
};

export const readCompRecipeMat = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT * FROM component_recipes_materials;"
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao listar receitas dos componentes" + error });
  }
};

export const readCompRecipeMatByComp = async (req, res) => {
  try {
    const { component_recipe_id } = req.params;
    if (!component_recipe_id) {
      res.status(400).json({ error: "Envie todos os dados!" });
    }

    const response = await pool.query(
      "SELECT * FROM component_recipes_materials WHERE component_recipe_id = $1;",
      [component_recipe_id]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao listar receitas dos componentes" + error });
  }
};

export const updateCompRecipeMat = async (req, res) => {
  try {
    const { component_recipe_id, material_id } = req.params;
    const { quantity_plan } = req.body;
    const response = await pool.query(
      `UPDATE component_recipes_materials
        SET 
            quantity_plan = $3 
        WHERE component_recipe_id = $1 AND material_id = $2
        RETURNING *`,
      [component_recipe_id, material_id, quantity_plan]
    );
    res.status(200).json(response.rows)
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error ao atualizar receita do componente" + error });
  }
};

export const deleteCompRecipeMat = async (req, res) => {
  try {
    const { component_recipe_id, material_id } = req.params;
    const response = await pool.query(
      `
        DELETE FROM component_recipes_materials 
        WHERE component_recipe_id = $1
        AND material_id = $2
        RETURNING *`,
      [component_recipe_id, material_id]
    );
    res.status(200).json(response.rows)
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error ao atualizar receita do componente" + error });
  }
};
