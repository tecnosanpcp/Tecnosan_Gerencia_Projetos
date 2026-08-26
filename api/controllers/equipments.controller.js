import { pool } from "../config/db.js";

export const getEquipment = async (req, res) => {
  try {
    const { project_id } = req.params;
    const response = await pool.query(
      `SELECT * FROM equipments WHERE project_id = $1`,
      [project_id]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listEquipments = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM equipments");
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEquipment = async (req, res) => {
  try {
    const {
      equipment_name,
      start_date,
      deadline,
      project_id,
      equipment_recipe_id,
      // opcional: liga o equipamento a uma instância de orçamento
      // (budgets_equipments), usada pelas triggers de cálculo automático
      budget_equipment_id,
    } = req.body;

    // bug corrigido: estava "equipment_recipe_id" sem "!", então a validação
    // reprovava exatamente quando o dado ESTAVA presente
    if (
      !equipment_name ||
      !start_date ||
      !deadline ||
      !project_id ||
      !equipment_recipe_id
    ) {
      return res.status(400).json({ message: "Faltando dados" });
    }

    // bug corrigido: o INSERT ignorava req.body e gravava valores fixos de
    // teste ('TESTE', '14-01-2026', '14-04-2026', 10, 1)
    const response = await pool.query(
      `INSERT INTO equipments
        (equipment_name, start_date, deadline, project_id, equipment_recipe_id, budget_equipment_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        equipment_name,
        start_date,
        deadline,
        project_id,
        equipment_recipe_id,
        budget_equipment_id ?? null,
      ],
    );

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
