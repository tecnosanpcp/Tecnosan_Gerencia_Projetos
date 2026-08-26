import { pool } from "../config/db.js";

export const createEquipRecipeCompRecipe = async (req, res) => {
  try {
    const {
      equipment_recipe_id,
      component_recipe_id,
      quantity_plan,
      offset_start_hours,
      duration_hours,
    } = req.body;

    if (!equipment_recipe_id || !component_recipe_id || !quantity_plan) {
      return res.status(400).json({ message: "Algum dado está faltando" });
    }

    const response = await pool.query(
      `INSERT INTO equipment_recipes_component_recipes
            (equipment_recipe_id, component_recipe_id, quantity_plan, offset_start_hours, duration_hours)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
      [
        equipment_recipe_id,
        component_recipe_id,
        quantity_plan,
        // offset_start_hours tem DEFAULT 0 no banco, então só manda se vier preenchido
        offset_start_hours ?? 0,
        duration_hours ?? null,
      ],
    );
    // bug corrigido: era response.row (não existe no pg), o certo é response.rows[0]
    res.status(200).json(response.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error ao criar receita do equipamento" + error });
  }
};

export const readEquipRecipeCompRecipe = async (req, res) => {
  try {
    const response = await pool.query(
      "SELECT * FROM equipment_recipes_component_recipes",
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao listar receitas dos equipamento" + error });
  }
};

export const readEquipRecipeCompRecipeById = async (req, res) => {
  try {
    const { equipment_recipe_id } = req.params;

    if (!equipment_recipe_id) {
      res.status(400).json({ error: "Dados faltantes" });
      return;
    }

    const response = await pool.query(
      "SELECT * FROM equipment_recipes_component_recipes WHERE equipment_recipe_id = $1;",
      [equipment_recipe_id],
    );

    res.status(200).json(response.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao listar receitas dos equipamento" + error });
  }
};

export const updateEquipRecipeCompRecipe = async (req, res) => {
  try {
    const { quantity_plan } = req.body;
    const { equipment_recipe_id, component_recipe_id } = req.params;
    const response = await pool.query(
      `UPDATE equipment_recipes_component_recipes
        SET 
	        quantity_plan = $3
        WHERE equipment_recipe_id = $1 AND component_recipe_id = $2
        RETURNING *`,
      [equipment_recipe_id, component_recipe_id, quantity_plan],
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error ao atualizar receita do equipamento" + error });
  }
};

// Antes chamava-se updateDates e mexia em planned_start_at/planned_end_at.
// Essas colunas ficaram obsoletas: a receita agora guarda tempo RELATIVO
// (offset_start_hours = quantas horas depois do início do equipamento esse
// componente começa; duration_hours = quanto tempo dura). A data absoluta
// real passou a viver em budgets_components_schedule, calculada por
// orçamento — ver budgetsComponentsSchedule.controller.js
export const updateRecipeSchedule = async (req, res) => {
  try {
    const { equipment_recipe_id, component_recipe_id } = req.params;
    const { offset_start_hours, duration_hours } = req.body;

    if (
      !equipment_recipe_id ||
      !component_recipe_id ||
      (offset_start_hours === undefined && duration_hours === undefined)
    ) {
      return res.status(400).json({ message: "Faltando dados" });
    }

    if (duration_hours !== undefined && duration_hours !== null && duration_hours < 0) {
      return res
        .status(400)
        .json({ message: "duration_hours não pode ser negativo" });
    }

    const response = await pool.query(
      `UPDATE equipment_recipes_component_recipes SET 
        offset_start_hours = COALESCE($1, offset_start_hours),
        duration_hours = COALESCE($2, duration_hours)
      WHERE equipment_recipe_id = $3 AND component_recipe_id = $4
      RETURNING *`,
      [
        offset_start_hours,
        duration_hours,
        equipment_recipe_id,
        component_recipe_id,
      ],
    );

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Relação não encontrada" });
    }

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error ao atualizar cronograma da receita" + error });
  }
};

export const deleteEquipRecipeCompRecipe = async (req, res) => {
  try {
    const { equipment_recipe_id, component_recipe_id } = req.params;

    const response = await pool.query(
      // bug corrigido: a tabela era "equip_recipes_comp_recipes", que não existe
      `DELETE FROM equipment_recipes_component_recipes 
       WHERE equipment_recipe_id = $1 AND component_recipe_id = $2 
       RETURNING *;`,
      [equipment_recipe_id, component_recipe_id]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar relação equipamento-componente" });
  }
};
