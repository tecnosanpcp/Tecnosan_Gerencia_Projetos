import { pool } from "../config/db.js";

export const listMaterials = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM materials");
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar materiais" });
  }
};
export const createMaterial = async (req, res) => {
  try {
    const { material_name, material_desc, value, uni } = req.body;
    const response = await pool.query(
      "INSERT INTO materials(material_name, material_desc, value, uni) VALUES ($1, $2, $3, $4) RETURNING *",
      [material_name, material_desc, value, uni]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar novo material" + error });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const { material_name, material_desc, value, uni } = req.body;
    const { id: material_id } = req.params;

    const response = await pool.query(
      `UPDATE materials
          SET 
            material_name = $1, 
            material_desc = $2, 
            value = $3, 
            uni = $4 
          WHERE
            material_id = $5
          RETURNING *`,
      [material_name, material_desc, value, uni, material_id]
    );
   res.status(200).json(response.rows)
  } catch (error) {
    res.status(500).json({ error: "Erro ao editar material" + error });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { id: material_id } = req.params;

    if (material_id <= 7) {
      return res
        .status(401)
        .json({ message: "Não é possível deletar esse material" });
    }

    const response = await pool.query(
      "DELETE FROM materials WHERE material_id = $1 RETURNING *",
      [material_id]
    );
    res.status(200).json(response.rows)
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir material " + error });
  }
};
