import { pool } from "../config/db.js";

export const addConsumptionLog = async (req, res) => {
  try {
    const { 
      component_id, 
      material_id, 
      consumed_quantity, 
      user_id, 
      consumption_type
    } = req.body;

    if (!component_id || !material_id || consumed_quantity === undefined || consumed_quantity === null ) {
       return res.status(400).json({ error: "Dados inválidos para consumo." });
    }

    if (Number(consumed_quantity) === 0) {
        return res.status(400).json({ error: "A quantidade não pode ser zero." });
    }

    const response = await pool.query(
      `INSERT INTO components_materials 
       (component_id, material_id, consumed_quantity, user_id, consumption_type, consumption_date)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *;`,
      [
        component_id, 
        material_id, 
        consumed_quantity, 
        user_id, 
        consumption_type || 'consumido'
      ]
    );

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error("Erro ao inserir consumo:", error);
    res.status(500).json({ error: error.message });
  }
};