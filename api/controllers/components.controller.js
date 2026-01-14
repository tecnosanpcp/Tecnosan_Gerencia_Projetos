import { pool } from "../config/db.js";

export const getComponentStatus = async (req, res) => {
  try {
    const { project_id, equipment_id, start_date, end_date } = req.params;

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (!start_date || !end_date || end < start) {
      throw new Error("Selecione um espaço de tempo váido");
    }

    const projIdParam =
      project_id && project_id !== "undefined" ? project_id : null;
    const equipIdParam =
      equipment_id && equipment_id !== "undefined" ? equipment_id : null;

    const response = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN C.STATUS = 'Completed' THEN 1 ELSE 0 END), 0)::int AS TOTAL_COMPLETED,
        COALESCE(SUM(CASE WHEN C.STATUS != 'Completed' THEN 1 ELSE 0 END), 0)::int AS TOTAL_PENDING
      FROM COMPONENTS C
      LEFT JOIN EQUIPMENTS E ON C.EQUIPMENT_ID = E.EQUIPMENT_ID
      LEFT JOIN PROJECTS P ON E.PROJECT_ID = P.PROJECT_ID
      WHERE 
        ($1::int IS NULL OR P.PROJECT_ID = $1::int) AND
        ($2::int IS NULL OR E.EQUIPMENT_ID = $2::int) AND
        C.START_DATE >= $3 AND 
	      (C.COMPLETION_DATE <= $4 OR C.DEADLINE <= $4)`,
      [projIdParam, equipIdParam, start_date, end_date]
    );

    if (response.rowCount == 0) {
      return res.status(404).json({ menssage: "Nenhum componente encontrado" });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.menssage });
  }
};

export const getComponentStatusByProj = async (req, res) => {
  try {
    const { project_id, equipment_id, start_date, end_date } = req.query;

    const start = new Date(start_date);
    const end = new Date(end_date);

    if (
      !start_date ||
      !end_date ||
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return res.status(400).json({ error: "Datas inválidas" });
    }

    const projIdParam = project_id ? project_id : null;
    const equipIdParam = equipment_id ? equipment_id : null;

    const response = await pool.query(
      `SELECT 
        E.EQUIPMENT_NAME as equipment_name,
        C.STATUS as status,
        COUNT(C.COMPONENT_ID)::int as numero_pecas
      FROM COMPONENTS C
      LEFT JOIN EQUIPMENTS E ON C.EQUIPMENT_ID = E.EQUIPMENT_ID -- Mudei para LEFT JOIN para garantir segurança
      WHERE 
        ($1::int IS NULL OR E.PROJECT_ID = $1::int) AND
        ($2::int IS NULL OR E.EQUIPMENT_ID = $2::int) AND
        C.START_DATE >= $3 AND 
        (C.COMPLETION_DATE <= $4 OR C.DEADLINE <= $4)
      GROUP BY 
          E.EQUIPMENT_NAME, 
          C.STATUS;`,
      [projIdParam, equipIdParam, start_date, end_date]
    );

    if (response.rowCount === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getStatus = async (req, res) => {
  try {
    const response = await pool.query(`
    SELECT 
      component_id,
      status
    FROM COMPONENTS;`);

    if (response.rowCount == 0) {
      res.status(404).json({ message: "Nenhum componente cadastrado" });
      throw new Error("Nehum componente cadastrado");
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.menssage });
  }
};

export const getLeadTimeComparison = async (req, res) => {
  try {
    const { project_id, equipment_id, start_date, end_date } = req.query;

    const projIdParam = project_id ? project_id : null;
    const equipIdParam = equipment_id ? equipment_id : null;

    const response = await pool.query(
      `SELECT 
        C.COMPONENT_ID,
        C.COMPONENT_NAME,
        E.EQUIPMENT_NAME,
        COALESCE(CR.MAN_HOURS, 0) AS META_HOURS,
        COALESCE(C.TOTAL_TIME_SPENT, 0) AS REAL_HOURS
      FROM COMPONENTS C
      LEFT JOIN COMPONENT_RECIPES CR ON CR.COMPONENT_RECIPE_ID = C.COMPONENT_RECIPE_ID
      LEFT JOIN EQUIPMENTS E ON E.EQUIPMENT_ID = C.EQUIPMENT_ID
      LEFT JOIN PROJECTS P ON P.PROJECT_ID = E.PROJECT_ID
      WHERE 
        ($1::int IS NULL OR P.PROJECT_ID = $1::int) AND
        ($2::int IS NULL OR E.EQUIPMENT_ID = $2::int) AND
        C.START_DATE >= $3 AND 
        (C.COMPLETION_DATE <= $4 OR C.DEADLINE <= $4)
      ORDER BY 
        (COALESCE(C.TOTAL_TIME_SPENT, 0) - COALESCE(CR.MAN_HOURS, 0)) DESC -- Ordena pelos maiores desvios
      `,
      [projIdParam, equipIdParam, start_date, end_date]
    );

    if (response.rowCount === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getComponents = async (req, res) => {
  try {
    const response = await pool.query("SELECT * FROM components;");

    if (response.rowCount == 0) {
      return res.status(404).json({ menssage: "Nenhum componente encontrado" });
    }

    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: error.menssage });
  }
};

export const createComponents = async (req, res) => {
  try {
    const {
      component_name,
      completion_date,
      start_date,
      deadline,
      status,
      equipment_id,
      department_id,
      component_recipe_id,
    } = req.body;

    if (
      !component_name ||
      !start_date ||
      !deadline ||
      !status ||
      !equipment_id ||
      !department_id ||
      !component_recipe_id
    ) {
      console.error("dados insuficientes", {
        component_name,
        completion_date,
        start_date,
        deadline,
        status,
        equipment_id,
        department_id,
        component_recipe_id,
      });
      return res.status(500).json({ error: "dados insuficientes" });
    }

    const response = await pool.query(
      `INSERT INTO components
        (component_name, completion_date, start_date, deadline, status, equipment_id, department_id, component_recipe_id) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING component_id;`,
      [
        component_name,
        completion_date,
        start_date,
        deadline,
        status,
        equipment_id,
        department_id,
        component_recipe_id,
      ]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: error.menssage });
  }
};

export const updateComponents = async (req, res) => {
  try {
    const { component_id } = req.params;
    const {
      completion_date,
      start_date,
      deadline,
      status,
      department_id,
      total_time_spent,
    } = req.body;

    const response = await pool.query(
      `UPDATE components
       SET 
         completion_date = $1,
         start_date = $2,
         deadline = $3,
         status = $4,
         department_id = $5,
         total_time_spent = $6 
       WHERE component_id = $7 RETURNING *;`,
      [
        completion_date,
        start_date,
        deadline,
        status,
        department_id,
        total_time_spent || 0,
        component_id,
      ]
    );

    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error(error); // Bom para debugar no terminal do servidor
    res.status(500).json({ error: error.message });
  }
};

export const deleteComponent = async (req, res) => {
  try {
    const { component_id } = req.params;

    if (!component_id) {
      return res.status(500).json({ error: "dados insuficientes" });
    }

    const response = await pool.query(
      `DELETE FROM components
      WHERE component_id = $1;`,
      [equipment_id]
    );

    if (response.rowCount == 0) {
      return res.status(404).json({ error: "Componente não foi encontrado" });
    }
    res.status(200).json(response.rows);
  } catch (error) {
    res.status(500).json({ error: error.menssage });
  }
};

export const updateDate = async (req, res) => {
  try {
    const { component_id } = req.params;
    const { start_date, deadline } = req.body;

    if (!component_id || (!start_date && !deadline)) {
      res.status(400).json({ message: "Faltando dados" });
      throw new Error("Faltando dados");
    }

    await pool.query(
      `
      UPDATE COMPONENTS SET 
	      START_DATE = COALESCE($1, START_DATE),
	      DEADLINE = COALESCE($2, DEADLINE)
      WHERE COMPONENT_ID = $3`,
      [start_date, deadline, component_id]
    );

    res.status(200).json({ message: "Data atualizada com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.menssage });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { component_id } = req.params;
    const { status } = req.body;

    if (!component_id || !status) {
      res.status(400).json({ message: "Faltando dados" });
      throw new Error("Faltando dados");
    }

    const response = await pool.query(
      `
      UPDATE COMPONENTS 
        SET STATUS = $1
      WHERE COMPONENT_ID = $2`,
      [status, component_id]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.menssage });
  }
};
