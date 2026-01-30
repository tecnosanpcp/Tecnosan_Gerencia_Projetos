import { pool } from "../config/db.js";

export const getComponentRecipe = async (req, res) => {
  try {
    const response = await pool.query("select * from component_recipes");
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar receita dos componentes" });
  }
};

export const createComponentRecipe = async (req, res) => {
  try {
    const { recipe_name, qtd_employees, qtd_hours } = req.body;
    if (!recipe_name || qtd_employees <= 0 || qtd_hours <= 0) {
      return res.status(400).json({ message: "Falta dados" });
    }
    const response = await pool.query(
      `INSERT INTO component_recipes
      (recipe_name,qtd_employees, qtd_hours, man_hours) 
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [recipe_name, qtd_employees, qtd_hours, qtd_employees * qtd_hours],
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
};

export const deleteComponentRecipe = async (req, res) => {
  try {
    const { id: component_recipe_id } = req.params;

    const response = await pool.query(
      "DELETE FROM component_recipes WHERE component_recipe_id = $1 RETURNING *",
      [component_recipe_id],
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error ao deletar receita do componente " + error });
  }
};

export const updateComponentRecipe = async (req, res) => {
  try {
    const { id: component_recipe_id } = req.params;
    const { recipe_name, qtd_employees, qtd_hours } = req.body;

    if (!recipe_name || qtd_employees <= 0 || qtd_hours <= 0) {
      return res.status(400).json({ message: "Falta dados" });
    }

    const response = await pool.query(
      `
      UPDATE component_recipes
      SET 
        recipe_name = $1,
        qtd_employees = $2,
        qtd_hours = $3,
        man_hours = $4
      WHERE component_recipe_id = $5
      RETURNING *;
      `,
      [
        recipe_name,
        qtd_employees,
        qtd_hours,
        qtd_employees * qtd_hours,
        component_recipe_id,
      ],
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
