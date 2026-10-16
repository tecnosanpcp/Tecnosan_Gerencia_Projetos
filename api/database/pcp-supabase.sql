SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: gerente_pcp
--

-- *not* creating schema, since initdb creates it



--
-- Name: fn_auto_create_components(); Type: FUNCTION; Schema: public; Owner: gerente_pcp
--

CREATE FUNCTION public.fn_auto_create_components() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO components (
        component_name,
        equipment_id,
        component_recipe_id,
        status,
        start_date,
        deadline
    )
    SELECT 
        cr.recipe_name,
        NEW.equipment_id,
        ercr.component_recipe_id,
        'Pending',
        ercr.planned_start_at, 
        ercr.planned_end_at
    FROM equipment_recipes_component_recipes ercr
    JOIN component_recipes cr ON ercr.component_recipe_id = cr.component_recipe_id
    WHERE ercr.equipment_recipe_id = NEW.equipment_recipe_id;

    RETURN NEW;
END;
$$;



--
-- Name: fn_auto_create_equipments(); Type: FUNCTION; Schema: public; Owner: gerente_pcp
--

CREATE FUNCTION public.fn_auto_create_equipments() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO equipments (
        equipment_name, 
        project_id, 
        equipment_recipe_id, 
        -- status,  <-- REMOVIDO
        start_date,
        deadline
    )
    SELECT 
        er.recipe_name,
        NEW.project_id,
        ber.equipment_recipe_id,
        -- 'To Do', <-- REMOVIDO
        (SELECT MIN(planned_start_at) FROM equipment_recipes_component_recipes WHERE equipment_recipe_id = ber.equipment_recipe_id),
        (SELECT MAX(planned_end_at) FROM equipment_recipes_component_recipes WHERE equipment_recipe_id = ber.equipment_recipe_id)
    FROM budgets_equipments_recipes ber
    JOIN equipment_recipes er ON ber.equipment_recipe_id = er.equipment_recipe_id
    WHERE ber.budget_id = NEW.budget_id;

    RETURN NEW;
END;
$$;



--
-- Name: fn_auto_status_accessory(); Type: FUNCTION; Schema: public; Owner: gerente_pcp
--

CREATE FUNCTION public.fn_auto_status_accessory() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 1. Se estiver EMPRESTANDO (Insert), muda status para 'In Use'
    IF (TG_OP = 'INSERT') THEN
        -- Verifica se já não está em uso (segurança extra)
        IF EXISTS (SELECT 1 FROM public.accessories WHERE accessory_id = NEW.accessory_id AND status = 'In Use') THEN
             RAISE EXCEPTION 'Este acessório já está em uso!';
        END IF;
        
        UPDATE public.accessories SET status = 'In Use' WHERE accessory_id = NEW.accessory_id;
    
    -- 2. Se estiver DEVOLVENDO (Update colocando data), muda status para 'Available'
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.returned_at IS NULL AND NEW.returned_at IS NOT NULL THEN
            UPDATE public.accessories SET status = 'Available' WHERE accessory_id = NEW.accessory_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;



--
-- Name: fn_calc_project_dates(); Type: FUNCTION; Schema: public; Owner: gerente_pcp
--

CREATE FUNCTION public.fn_calc_project_dates() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Se o usuário não mandou data, calculamos automaticamente
    IF NEW.start_date IS NULL OR NEW.deadline IS NULL THEN
        SELECT 
            MIN(ercr.planned_start_at),
            MAX(ercr.planned_end_at)
        INTO 
            NEW.start_date,
            NEW.deadline -- Assumindo que deadline é a data final
        FROM budgets_equipments_recipes ber
        JOIN equipment_recipes_component_recipes ercr 
          ON ber.equipment_recipe_id = ercr.equipment_recipe_id
        WHERE ber.budget_id = NEW.budget_id;
    END IF;
    
    RETURN NEW;
END;
$$;



SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: absent; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.absent (
    absent_id integer NOT NULL,
    date_time timestamp without time zone,
    reason character varying(200)
);



--
-- Name: absent_absent_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.absent_absent_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: absent_absent_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.absent_absent_id_seq OWNED BY public.absent.absent_id;


--
-- Name: absent_employee; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.absent_employee (
    user_id integer NOT NULL,
    absent_id integer NOT NULL
);



--
-- Name: accessories; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.accessories (
    accessory_id integer NOT NULL,
    name character varying(100) NOT NULL,
    serial_number character varying(50),
    status character varying(20) DEFAULT 'Available'::character varying,
    purchase_date date,
    value numeric(10,2),
    CONSTRAINT accessories_status_check CHECK (((status)::text = ANY (ARRAY[('Available'::character varying)::text, ('In Use'::character varying)::text, ('Maintenance'::character varying)::text, ('Lost'::character varying)::text])))
);



--
-- Name: accessories_accessory_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.accessories_accessory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: accessories_accessory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.accessories_accessory_id_seq OWNED BY public.accessories.accessory_id;


--
-- Name: accessories_budgets; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.accessories_budgets (
    movement_id integer NOT NULL,
    budget_id integer NOT NULL,
    accessory_id integer NOT NULL,
    taken_by_user_id integer NOT NULL,
    taken_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    received_by_user_id integer,
    returned_at timestamp without time zone,
    CONSTRAINT check_return_budget CHECK ((((returned_at IS NULL) AND (received_by_user_id IS NULL)) OR ((returned_at IS NOT NULL) AND (received_by_user_id IS NOT NULL))))
);



--
-- Name: accessories_budgets_movement_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.accessories_budgets_movement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: accessories_budgets_movement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.accessories_budgets_movement_id_seq OWNED BY public.accessories_budgets.movement_id;


--
-- Name: accessories_projects; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.accessories_projects (
    movement_id integer NOT NULL,
    project_id integer NOT NULL,
    accessory_id integer NOT NULL,
    taken_by_user_id integer NOT NULL,
    taken_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    received_by_user_id integer,
    returned_at timestamp without time zone,
    CONSTRAINT check_return_project CHECK ((((returned_at IS NULL) AND (received_by_user_id IS NULL)) OR ((returned_at IS NOT NULL) AND (received_by_user_id IS NOT NULL))))
);



--
-- Name: accessories_projects_movement_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.accessories_projects_movement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: accessories_projects_movement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.accessories_projects_movement_id_seq OWNED BY public.accessories_projects.movement_id;


--
-- Name: budgets; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.budgets (
    budget_id integer NOT NULL,
    budget_name character varying(50),
    budget_local character varying(50),
    status character varying(200)
);



--
-- Name: budgets_budget_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.budgets_budget_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: budgets_budget_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.budgets_budget_id_seq OWNED BY public.budgets.budget_id;


--
-- Name: budgets_equipments_recipes; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.budgets_equipments_recipes (
    budget_id integer NOT NULL,
    equipment_recipe_id integer NOT NULL,
    quantity_plan numeric
);



--
-- Name: budgets_users; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.budgets_users (
    user_id integer NOT NULL,
    budget_id integer NOT NULL
);



--
-- Name: clocked; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.clocked (
    clocked_id integer NOT NULL,
    clocked timestamp without time zone,
    event_type character varying(50)
);



--
-- Name: clocked_clocked_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.clocked_clocked_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: clocked_clocked_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.clocked_clocked_id_seq OWNED BY public.clocked.clocked_id;


--
-- Name: clocked_employee; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.clocked_employee (
    user_id integer NOT NULL,
    clocked_id integer NOT NULL
);



--
-- Name: component_recipes; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.component_recipes (
    component_recipe_id integer NOT NULL,
    recipe_name character varying(50),
    man_hours numeric(10,2),
    qtd_employees integer,
    qtd_hours numeric(10,2)
);



--
-- Name: component_recipes_component_recipe_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.component_recipes_component_recipe_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: component_recipes_component_recipe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.component_recipes_component_recipe_id_seq OWNED BY public.component_recipes.component_recipe_id;


--
-- Name: component_recipes_materials; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.component_recipes_materials (
    component_recipe_id integer NOT NULL,
    material_id integer NOT NULL,
    quantity_plan numeric
);



--
-- Name: components; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.components (
    component_id integer NOT NULL,
    component_name character varying(50),
    completion_date timestamp without time zone,
    start_date timestamp without time zone,
    deadline timestamp without time zone,
    status character varying(50),
    equipment_id integer,
    department_id integer,
    component_recipe_id integer,
    total_time_spent numeric DEFAULT 0
);



--
-- Name: components_component_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.components_component_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: components_component_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.components_component_id_seq OWNED BY public.components.component_id;


--
-- Name: components_materials; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.components_materials (
    component_id integer NOT NULL,
    material_id integer NOT NULL,
    consumed_quantity numeric,
    consumption_log_id integer NOT NULL,
    consumption_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    consumption_type character varying(20) DEFAULT 'consumido'::character varying NOT NULL,
    CONSTRAINT check_consumption_type CHECK (((consumption_type)::text = ANY (ARRAY[('consumido'::character varying)::text, ('refugo'::character varying)::text])))
);



--
-- Name: components_materials_consumption_log_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.components_materials_consumption_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: components_materials_consumption_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.components_materials_consumption_log_id_seq OWNED BY public.components_materials.consumption_log_id;


--
-- Name: components_timesheets; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.components_timesheets (
    timesheet_id integer NOT NULL,
    component_id integer NOT NULL,
    user_id integer NOT NULL,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);



--
-- Name: components_timesheets_timesheet_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.components_timesheets_timesheet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: components_timesheets_timesheet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.components_timesheets_timesheet_id_seq OWNED BY public.components_timesheets.timesheet_id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.departments (
    department_id integer NOT NULL,
    department_name character varying(50)
);



--
-- Name: departments_department_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.departments_department_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: departments_department_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.departments_department_id_seq OWNED BY public.departments.department_id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.employees (
    user_id integer NOT NULL,
    salary real,
    performance real,
    job_title character varying(50),
    department_id integer
);



--
-- Name: employees_components; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.employees_components (
    user_id integer NOT NULL,
    component_id integer NOT NULL
);



--
-- Name: equipment_recipes; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.equipment_recipes (
    equipment_recipe_id integer NOT NULL,
    recipe_name character varying(50)
);



--
-- Name: equipment_recipes_component_recipes; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.equipment_recipes_component_recipes (
    equipment_recipe_id integer CONSTRAINT equipment_recipes_component_recipe_equipment_recipe_id_not_null NOT NULL,
    component_recipe_id integer CONSTRAINT equipment_recipes_component_recipe_component_recipe_id_not_null NOT NULL,
    quantity_plan integer NOT NULL,
    id integer NOT NULL,
    planned_start_at timestamp without time zone,
    planned_end_at timestamp without time zone
);



--
-- Name: equipment_recipes_component_recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.equipment_recipes_component_recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: equipment_recipes_component_recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.equipment_recipes_component_recipes_id_seq OWNED BY public.equipment_recipes_component_recipes.id;


--
-- Name: equipment_recipes_equipment_recipe_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.equipment_recipes_equipment_recipe_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: equipment_recipes_equipment_recipe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.equipment_recipes_equipment_recipe_id_seq OWNED BY public.equipment_recipes.equipment_recipe_id;


--
-- Name: equipments; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.equipments (
    equipment_id integer NOT NULL,
    equipment_name character varying(50),
    start_date date,
    end_date date,
    deadline date,
    project_id integer,
    equipment_recipe_id integer
);



--
-- Name: equipments_equipment_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.equipments_equipment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: equipments_equipment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.equipments_equipment_id_seq OWNED BY public.equipments.equipment_id;


--
-- Name: materials; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.materials (
    material_id integer NOT NULL,
    material_name character varying(50),
    material_desc character varying(200),
    value real,
    uni character varying(50) DEFAULT 'Kg'::character varying
);



--
-- Name: materials_material_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.materials_material_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: materials_material_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.materials_material_id_seq OWNED BY public.materials.material_id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.projects (
    project_id integer NOT NULL,
    project_name character varying(50),
    project_desc character varying(200),
    project_local character varying(200),
    start_date date,
    completion_date date,
    deadline date,
    status character varying(50) DEFAULT 'Pending'::character varying,
    budget_id integer
);



--
-- Name: projects_project_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.projects_project_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: projects_project_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.projects_project_id_seq OWNED BY public.projects.project_id;


--
-- Name: projects_users; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.projects_users (
    user_id integer NOT NULL,
    project_id integer NOT NULL
);



--
-- Name: users; Type: TABLE; Schema: public; Owner: gerente_pcp
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(50),
    user_name character varying(50),
    password character varying(255),
    access_type integer
);



--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: gerente_pcp
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: gerente_pcp
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: vw_all_loans; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_all_loans AS
 SELECT 'Project'::text AS type,
    ap.movement_id,
    p.project_name AS context_name,
    a.name AS accessory,
    u.user_name AS taken_by,
    ap.taken_at,
    ap.accessory_id,
    ap.returned_at
   FROM (((public.accessories_projects ap
     JOIN public.projects p ON ((ap.project_id = p.project_id)))
     JOIN public.accessories a ON ((ap.accessory_id = a.accessory_id)))
     JOIN public.users u ON ((ap.taken_by_user_id = u.user_id)))
  WHERE (ap.returned_at IS NULL)
UNION ALL
 SELECT 'Budget'::text AS type,
    ab.movement_id,
    b.budget_name AS context_name,
    a.name AS accessory,
    u.user_name AS taken_by,
    ab.taken_at,
    ab.accessory_id,
    ab.returned_at
   FROM (((public.accessories_budgets ab
     JOIN public.budgets b ON ((ab.budget_id = b.budget_id)))
     JOIN public.accessories a ON ((ab.accessory_id = a.accessory_id)))
     JOIN public.users u ON ((ab.taken_by_user_id = u.user_id)))
  WHERE (ab.returned_at IS NULL);



--
-- Name: vw_components_recipes_materials_summary; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_components_recipes_materials_summary AS
SELECT
    NULL::integer AS component_recipe_id,
    NULL::character varying(50) AS recipe_name,
    NULL::numeric AS resina,
    NULL::numeric AS resina_iso,
    NULL::numeric AS manta,
    NULL::numeric AS roving,
    NULL::numeric AS catalizador,
    NULL::numeric AS tecido_kg,
    NULL::numeric AS tecido_cmd,
    NULL::numeric AS horas_homem,
    NULL::double precision AS total_value,
    NULL::integer AS qtd_employees,
    NULL::numeric(10,2) AS qtd_hours;



--
-- Name: vw_equipments_recipes_materials_summary; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_equipments_recipes_materials_summary AS
 SELECT er.equipment_recipe_id,
    er.recipe_name,
    COALESCE(sum((vw.resina * (er_cr.quantity_plan)::numeric)), (0)::numeric) AS resina,
    COALESCE(sum((vw.resina_iso * (er_cr.quantity_plan)::numeric)), (0)::numeric) AS resina_iso,
    COALESCE(sum((vw.manta * (er_cr.quantity_plan)::numeric)), (0)::numeric) AS manta,
    COALESCE(sum((vw.roving * (er_cr.quantity_plan)::numeric)), (0)::numeric) AS roving,
    COALESCE(sum((vw.catalizador * (er_cr.quantity_plan)::numeric)), (0)::numeric) AS catalizador,
    COALESCE(sum((vw.tecido_kg * (er_cr.quantity_plan)::numeric)), (0)::numeric) AS tecido_kg,
    COALESCE(sum((vw.tecido_cmd * (er_cr.quantity_plan)::numeric)), (0)::numeric) AS tecido_cmd,
    COALESCE(sum(vw.horas_homem), (0)::numeric) AS horas_homem,
    COALESCE(sum((vw.total_value * (er_cr.quantity_plan)::double precision)), (0)::double precision) AS total_value
   FROM ((public.equipment_recipes er
     LEFT JOIN public.equipment_recipes_component_recipes er_cr ON ((er.equipment_recipe_id = er_cr.equipment_recipe_id)))
     LEFT JOIN public.vw_components_recipes_materials_summary vw ON ((vw.component_recipe_id = er_cr.component_recipe_id)))
  GROUP BY er.equipment_recipe_id, er.recipe_name
  ORDER BY er.equipment_recipe_id, er.recipe_name;



--
-- Name: vw_budgets_materials_summary; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_budgets_materials_summary AS
 SELECT b.budget_id,
    b.budget_name,
    b.status,
    COALESCE(sum((vw.resina * ber.quantity_plan)), (0)::numeric) AS resina,
    COALESCE(sum((vw.resina_iso * ber.quantity_plan)), (0)::numeric) AS resina_iso,
    COALESCE(sum((vw.manta * ber.quantity_plan)), (0)::numeric) AS manta,
    COALESCE(sum((vw.roving * ber.quantity_plan)), (0)::numeric) AS roving,
    COALESCE(sum((vw.catalizador * ber.quantity_plan)), (0)::numeric) AS catalizador,
    COALESCE(sum((vw.tecido_kg * ber.quantity_plan)), (0)::numeric) AS tecido_kg,
    COALESCE(sum((vw.tecido_cmd * ber.quantity_plan)), (0)::numeric) AS tecido_cmd,
    COALESCE(sum(vw.horas_homem), (0)::numeric) AS horas_homem,
    COALESCE(sum((vw.total_value * (ber.quantity_plan)::double precision)), (0)::double precision) AS total_value
   FROM ((public.budgets b
     LEFT JOIN public.budgets_equipments_recipes ber ON ((ber.budget_id = b.budget_id)))
     LEFT JOIN public.vw_equipments_recipes_materials_summary vw ON ((vw.equipment_recipe_id = ber.equipment_recipe_id)))
  GROUP BY b.budget_id, b.budget_name, b.status
  ORDER BY b.budget_id, b.budget_name, b.status;



--
-- Name: vw_component_hours; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_component_hours AS
SELECT
    NULL::integer AS component_id,
    NULL::integer AS equipment_id,
    NULL::character varying(50) AS component_name,
    NULL::timestamp without time zone AS planned_start,
    NULL::timestamp without time zone AS planned_end,
    NULL::timestamp without time zone AS real_start,
    NULL::timestamp without time zone AS real_end,
    NULL::numeric AS total_hours,
    NULL::bigint AS qtd_employees;



--
-- Name: vw_component_materials_summary; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_component_materials_summary AS
 SELECT c.component_id,
    cm.material_id,
    m.material_name,
    COALESCE(sum(cm.consumed_quantity), (0)::numeric) AS total_consumed
   FROM ((public.components c
     LEFT JOIN public.components_materials cm ON ((c.component_id = cm.component_id)))
     LEFT JOIN public.materials m ON ((m.material_id = cm.material_id)))
  GROUP BY c.component_id, cm.material_id, m.material_name;



--
-- Name: vw_equipment_hours; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_equipment_hours AS
 SELECT e.equipment_id,
    e.project_id,
    (min(c.start_date))::date AS planned_start,
    (max(c.deadline))::date AS planned_end,
    min(ct.start_time) AS real_start,
        CASE
            WHEN (count(DISTINCT c.component_id) = count(DISTINCT
            CASE
                WHEN (c.completion_date IS NOT NULL) THEN c.component_id
                ELSE NULL::integer
            END)) THEN max(c.completion_date)
            ELSE NULL::timestamp without time zone
        END AS real_end,
    COALESCE(round(sum((EXTRACT(epoch FROM (ct.end_time - ct.start_time)) / (3600)::numeric)), 2), (0)::numeric) AS total_hours,
    count(DISTINCT ct.user_id) AS qtd_employees
   FROM ((public.equipments e
     JOIN public.components c ON ((e.equipment_id = c.equipment_id)))
     LEFT JOIN public.components_timesheets ct ON ((c.component_id = ct.component_id)))
  GROUP BY e.equipment_id, e.project_id;



--
-- Name: vw_equipment_materials_summary; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_equipment_materials_summary AS
 SELECT e.equipment_id,
    vw_cms.material_id,
    vw_cms.material_name,
    COALESCE(sum(vw_cms.total_consumed), (0)::numeric) AS total_quantity
   FROM ((public.equipments e
     LEFT JOIN public.components c ON ((e.equipment_id = c.equipment_id)))
     LEFT JOIN public.vw_component_materials_summary vw_cms ON ((c.component_id = vw_cms.component_id)))
  GROUP BY e.equipment_id, vw_cms.material_id, vw_cms.material_name
  ORDER BY e.equipment_id;



--
-- Name: vw_loans_full_history; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_loans_full_history AS
 SELECT 'Project'::text AS type,
    ap.movement_id,
    p.project_name AS context_name,
    a.name AS accessory,
    u_taken.user_name AS taken_by,
    ap.taken_at,
    u_rec.user_name AS received_by,
    ap.returned_at,
    ap.accessory_id
   FROM ((((public.accessories_projects ap
     JOIN public.projects p ON ((ap.project_id = p.project_id)))
     JOIN public.accessories a ON ((ap.accessory_id = a.accessory_id)))
     JOIN public.users u_taken ON ((ap.taken_by_user_id = u_taken.user_id)))
     LEFT JOIN public.users u_rec ON ((ap.received_by_user_id = u_rec.user_id)))
UNION ALL
 SELECT 'Budget'::text AS type,
    ab.movement_id,
    b.budget_name AS context_name,
    a.name AS accessory,
    u_taken.user_name AS taken_by,
    ab.taken_at,
    u_rec.user_name AS received_by,
    ab.returned_at,
    ab.accessory_id
   FROM ((((public.accessories_budgets ab
     JOIN public.budgets b ON ((ab.budget_id = b.budget_id)))
     JOIN public.accessories a ON ((ab.accessory_id = a.accessory_id)))
     JOIN public.users u_taken ON ((ab.taken_by_user_id = u_taken.user_id)))
     LEFT JOIN public.users u_rec ON ((ab.received_by_user_id = u_rec.user_id)));



--
-- Name: vw_material_details_components_recipes; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_material_details_components_recipes AS
 SELECT cm.component_recipe_id,
    cm.material_id,
    cm.quantity_plan,
    m.material_name,
    m.material_desc,
    m.value,
    m.uni
   FROM (public.component_recipes_materials cm
     JOIN public.materials m ON ((m.material_id = cm.material_id)));



--
-- Name: vw_material_details_equipment_recipes; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_material_details_equipment_recipes AS
SELECT
    NULL::integer AS equipment_recipe_id,
    NULL::character varying(50) AS recipe_name,
    NULL::numeric AS resina,
    NULL::numeric AS resina_iso,
    NULL::numeric AS manta,
    NULL::numeric AS roving,
    NULL::numeric AS catalizador,
    NULL::numeric AS tecido_kg,
    NULL::numeric AS tecido_cmd,
    NULL::numeric AS horas_homem,
    NULL::double precision AS total_value;



--
-- Name: vw_project_consumed_materials; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_project_consumed_materials AS
 SELECT pu.user_id,
    p.project_id,
    p.project_name,
    e.equipment_id,
    e.equipment_name,
    c.component_id,
    c.component_name,
    m.material_name,
    m.material_id,
    COALESCE(sum(cm.consumed_quantity), (0)::numeric) AS total_material_consumed,
    COALESCE(sum(((cm.consumed_quantity)::double precision * m.value)), (0)::double precision) AS total_value
   FROM (((((public.projects p
     JOIN public.projects_users pu ON ((p.project_id = pu.project_id)))
     LEFT JOIN public.equipments e ON ((p.project_id = e.project_id)))
     LEFT JOIN public.components c ON ((e.equipment_id = c.equipment_id)))
     LEFT JOIN public.components_materials cm ON ((c.component_id = cm.component_id)))
     LEFT JOIN public.materials m ON ((cm.material_id = m.material_id)))
  GROUP BY pu.user_id, p.project_id, p.project_name, e.equipment_id, e.equipment_name, c.component_id, c.component_name, m.material_name, m.material_id
  ORDER BY pu.user_id, p.project_id, p.project_name, e.equipment_name, c.component_name;



--
-- Name: vw_project_department_delays; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_project_department_delays AS
 SELECT d.department_id,
    d.department_name,
    c.component_id,
    c.component_name,
    sum(
        CASE
            WHEN (c.completion_date IS NULL) THEN
            CASE
                WHEN (CURRENT_TIMESTAMP > c.deadline) THEN (CURRENT_TIMESTAMP - (c.deadline)::timestamp with time zone)
                ELSE '00:00:00'::interval
            END
            ELSE
            CASE
                WHEN (c.completion_date > c.deadline) THEN (c.completion_date - c.deadline)
                ELSE '00:00:00'::interval
            END
        END) AS total_delay_time
   FROM (public.components c
     LEFT JOIN public.departments d ON ((d.department_id = c.department_id)))
  GROUP BY d.department_id, d.department_name, c.component_id, c.component_name;



--
-- Name: vw_project_hours; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_project_hours AS
 SELECT p.project_id,
    p.project_name,
    p.start_date AS planned_start,
    p.deadline AS planned_end,
    min(ct.start_time) AS real_start,
    max(ct.end_time) AS real_end,
    COALESCE(round(sum((EXTRACT(epoch FROM (ct.end_time - ct.start_time)) / (3600)::numeric)), 2), (0)::numeric) AS total_hours,
    count(DISTINCT ct.user_id) AS qtd_employees
   FROM (((public.projects p
     JOIN public.equipments e ON ((p.project_id = e.project_id)))
     JOIN public.components c ON ((e.equipment_id = c.equipment_id)))
     LEFT JOIN public.components_timesheets ct ON ((c.component_id = ct.component_id)))
  GROUP BY p.project_id, p.project_name, p.start_date, p.deadline;



--
-- Name: vw_projects_materials_summary; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_projects_materials_summary AS
 SELECT p.project_id,
    vw_ems.material_id,
    vw_ems.material_name,
    COALESCE(sum(vw_ems.total_quantity), (0)::numeric) AS total_quantity
   FROM ((public.projects p
     LEFT JOIN public.equipments e ON ((p.project_id = e.project_id)))
     LEFT JOIN public.vw_equipment_materials_summary vw_ems ON ((e.equipment_id = vw_ems.equipment_id)))
  GROUP BY p.project_id, vw_ems.material_id, vw_ems.material_name
  ORDER BY p.project_id, vw_ems.material_id;



--
-- Name: vw_status_equipments; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_status_equipments AS
 SELECT e.equipment_id,
        CASE
            WHEN (count(c.*) = count(
            CASE
                WHEN ((c.status)::text = 'Pending'::text) THEN 1
                ELSE NULL::integer
            END)) THEN 'Pending'::text
            WHEN (count(c.*) = count(
            CASE
                WHEN ((c.status)::text = 'Completed'::text) THEN 1
                ELSE NULL::integer
            END)) THEN 'Completed'::text
            WHEN (count(
            CASE
                WHEN ((c.status)::text = 'Running'::text) THEN 1
                ELSE 0
            END) > 0) THEN 'Running'::text
            WHEN (count(
            CASE
                WHEN ((c.status)::text = 'Delayed'::text) THEN 1
                ELSE 0
            END) > 0) THEN 'Delayed'::text
            WHEN (count(
            CASE
                WHEN ((c.status)::text = 'Failed'::text) THEN 1
                ELSE 0
            END) > 0) THEN 'Failed'::text
            ELSE 'NOT STATUS'::text
        END AS status
   FROM (public.equipments e
     JOIN public.components c ON ((e.equipment_id = c.equipment_id)))
  GROUP BY e.equipment_id
  ORDER BY e.equipment_id;



--
-- Name: vw_status_projects; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_status_projects AS
 SELECT p.project_id,
        CASE
            WHEN (count(se.*) = count(
            CASE
                WHEN (se.status = 'Pending'::text) THEN 1
                ELSE NULL::integer
            END)) THEN 'Pending'::text
            WHEN (count(se.*) = count(
            CASE
                WHEN (se.status = 'Completed'::text) THEN 1
                ELSE NULL::integer
            END)) THEN 'Completed'::text
            WHEN (count(
            CASE
                WHEN (se.status = 'Running'::text) THEN 1
                ELSE 0
            END) > 0) THEN 'Running'::text
            WHEN (count(
            CASE
                WHEN (se.status = 'Delayed'::text) THEN 1
                ELSE 0
            END) > 0) THEN 'Delayed'::text
            WHEN (count(
            CASE
                WHEN (se.status = 'Failed'::text) THEN 1
                ELSE 0
            END) > 0) THEN 'Failed'::text
            ELSE 'NOT STATUS'::text
        END AS status
   FROM ((public.projects p
     JOIN public.equipments e ON ((e.project_id = p.project_id)))
     JOIN public.vw_status_equipments se ON ((se.equipment_id = e.equipment_id)))
  GROUP BY p.project_id
  ORDER BY p.project_id;



--
-- Name: vw_timeline_equipments; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_timeline_equipments AS
 SELECT ercr.equipment_recipe_id,
    er.recipe_name,
    min(ercr.planned_start_at) AS equipment_start_at,
    max(ercr.planned_end_at) AS equipment_end_at,
    (max(ercr.planned_end_at) - min(ercr.planned_start_at)) AS total_occupancy_time,
    count(ercr.id) AS tasks_count
   FROM (public.equipment_recipes_component_recipes ercr
     JOIN public.equipment_recipes er ON ((er.equipment_recipe_id = ercr.equipment_recipe_id)))
  GROUP BY ercr.equipment_recipe_id, er.recipe_name;



--
-- Name: vw_timeline_projects; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_timeline_projects AS
 SELECT b.budget_id,
    b.budget_name,
    b.status,
    min(vw_equip.equipment_start_at) AS project_start_at,
    max(vw_equip.equipment_end_at) AS project_end_at,
    age(max(vw_equip.equipment_end_at), min(vw_equip.equipment_start_at)) AS project_duration_formatted
   FROM ((public.budgets b
     JOIN public.budgets_equipments_recipes ber ON ((ber.budget_id = b.budget_id)))
     JOIN public.vw_timeline_equipments vw_equip ON ((vw_equip.equipment_recipe_id = ber.equipment_recipe_id)))
  GROUP BY b.budget_id, b.budget_name, b.status
  ORDER BY (min(vw_equip.equipment_start_at));



--
-- Name: vw_timeline_tasks; Type: VIEW; Schema: public; Owner: gerente_pcp
--

CREATE VIEW public.vw_timeline_tasks AS
 SELECT ercr.id AS task_id,
    ercr.equipment_recipe_id,
    er.recipe_name AS equipment_name,
    ercr.component_recipe_id,
    cr.recipe_name AS component_name,
    ercr.quantity_plan,
    ercr.planned_start_at,
    ercr.planned_end_at,
    (ercr.planned_end_at - ercr.planned_start_at) AS duration_interval,
    (EXTRACT(epoch FROM (ercr.planned_end_at - ercr.planned_start_at)) / (3600)::numeric) AS duration_hours
   FROM ((public.equipment_recipes_component_recipes ercr
     JOIN public.equipment_recipes er ON ((er.equipment_recipe_id = ercr.equipment_recipe_id)))
     JOIN public.component_recipes cr ON ((cr.component_recipe_id = ercr.component_recipe_id)))
  ORDER BY ercr.planned_start_at;



--
-- Name: absent absent_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.absent ALTER COLUMN absent_id SET DEFAULT nextval('public.absent_absent_id_seq'::regclass);


--
-- Name: accessories accessory_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories ALTER COLUMN accessory_id SET DEFAULT nextval('public.accessories_accessory_id_seq'::regclass);


--
-- Name: accessories_budgets movement_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_budgets ALTER COLUMN movement_id SET DEFAULT nextval('public.accessories_budgets_movement_id_seq'::regclass);


--
-- Name: accessories_projects movement_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_projects ALTER COLUMN movement_id SET DEFAULT nextval('public.accessories_projects_movement_id_seq'::regclass);


--
-- Name: budgets budget_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.budgets ALTER COLUMN budget_id SET DEFAULT nextval('public.budgets_budget_id_seq'::regclass);


--
-- Name: clocked clocked_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.clocked ALTER COLUMN clocked_id SET DEFAULT nextval('public.clocked_clocked_id_seq'::regclass);


--
-- Name: component_recipes component_recipe_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.component_recipes ALTER COLUMN component_recipe_id SET DEFAULT nextval('public.component_recipes_component_recipe_id_seq'::regclass);


--
-- Name: components component_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components ALTER COLUMN component_id SET DEFAULT nextval('public.components_component_id_seq'::regclass);


--
-- Name: components_materials consumption_log_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components_materials ALTER COLUMN consumption_log_id SET DEFAULT nextval('public.components_materials_consumption_log_id_seq'::regclass);


--
-- Name: components_timesheets timesheet_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components_timesheets ALTER COLUMN timesheet_id SET DEFAULT nextval('public.components_timesheets_timesheet_id_seq'::regclass);


--
-- Name: departments department_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.departments ALTER COLUMN department_id SET DEFAULT nextval('public.departments_department_id_seq'::regclass);


--
-- Name: equipment_recipes equipment_recipe_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.equipment_recipes ALTER COLUMN equipment_recipe_id SET DEFAULT nextval('public.equipment_recipes_equipment_recipe_id_seq'::regclass);


--
-- Name: equipment_recipes_component_recipes id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.equipment_recipes_component_recipes ALTER COLUMN id SET DEFAULT nextval('public.equipment_recipes_component_recipes_id_seq'::regclass);


--
-- Name: equipments equipment_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.equipments ALTER COLUMN equipment_id SET DEFAULT nextval('public.equipments_equipment_id_seq'::regclass);


--
-- Name: materials material_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.materials ALTER COLUMN material_id SET DEFAULT nextval('public.materials_material_id_seq'::regclass);


--
-- Name: projects project_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.projects ALTER COLUMN project_id SET DEFAULT nextval('public.projects_project_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: absent; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.absent (absent_id, date_time, reason)
VALUES
    ('1', '2025-01-20 00:00:00', 'Atestado médico - gripe'),
    ('2', '2025-02-04 00:00:00', 'Licença curta - assuntos pessoais');



--
-- Data for Name: absent_employee; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.absent_employee (user_id, absent_id)
VALUES
    ('6', '1'),
    ('3', '2');



--
-- Data for Name: accessories; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.accessories (accessory_id, name, serial_number, status, purchase_date, value)
VALUES
    ('2', 'FURADEIRA', '312', 'In Use', '2026-01-17', '50.00');



--
-- Data for Name: accessories_budgets; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.accessories_budgets (movement_id, budget_id, accessory_id, taken_by_user_id, taken_at, received_by_user_id, returned_at)
VALUES
    ('1', '3', '2', '4', '2026-01-30 00:00:00', '6', '2026-01-31 00:00:00');



--
-- Data for Name: accessories_projects; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.accessories_projects (movement_id, project_id, accessory_id, taken_by_user_id, taken_at, received_by_user_id, returned_at)
VALUES
    ('1', '1', '2', '4', '2026-01-29 00:00:00', '2', '2026-01-29 00:00:00'),
    ('2', '1', '2', '2', '2026-01-29 00:00:00', '2', '2026-01-30 00:00:00');



--
-- Data for Name: budgets; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.budgets (budget_id, budget_name, budget_local, status)
VALUES
    ('1', 'Barco Pesca 28 pés', 'Aracati', 'Em Planejamento'),
    ('2', 'Tanque Industrial 2.000 L', 'Fortaleza', 'Aprovado'),
    ('3', 'teste', 'teste', 'Aprovado'),
    ('10', 'ETE Direiconal Castelão', 'Fortaleza - Ce', 'Em Planejamento'),
    ('11', 'Eta Pombal', 'Paraíba', 'Em Planejamento'),
    ('12', 'EDMIL - ETA BARRO PRETO ', 'SANTANA DO  ACARAÚ', 'Aprovado');



--
-- Data for Name: budgets_equipments_recipes; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.budgets_equipments_recipes (budget_id, equipment_recipe_id, quantity_plan)
VALUES
    ('1', '1', '1'),
    ('1', '2', '1'),
    ('2', '3', '2'),
    ('3', '1', '1'),
    ('3', '2', '10'),
    ('3', '3', '8'),
    ('10', '36', '1'),
    ('12', '38', '1');



--
-- Data for Name: budgets_users; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.budgets_users (user_id, budget_id)
VALUES
    ('1', '1'),
    ('2', '1'),
    ('1', '2'),
    ('2', '3'),
    ('2', '10'),
    ('2', '11'),
    ('2', '12');



--
-- Data for Name: clocked; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.clocked (clocked_id, clocked, event_type)
VALUES
    ('1', '2025-01-12 08:00:00', 'IN'),
    ('2', '2025-01-12 17:00:00', 'OUT'),
    ('3', '2025-01-13 08:10:00', 'IN'),
    ('4', '2025-01-13 17:05:00', 'OUT'),
    ('5', '2025-01-14 08:05:00', 'IN'),
    ('6', '2025-01-14 16:50:00', 'OUT'),
    ('7', '2025-01-25 08:00:00', 'IN'),
    ('8', '2025-01-25 16:00:00', 'OUT'),
    ('9', '2025-02-02 08:00:00', 'IN'),
    ('10', '2025-02-02 18:00:00', 'OUT'),
    ('11', '2025-02-15 08:30:00', 'IN'),
    ('12', '2025-02-15 15:30:00', 'OUT');



--
-- Data for Name: clocked_employee; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.clocked_employee (user_id, clocked_id)
VALUES
    ('3', '1'),
    ('3', '2'),
    ('3', '3'),
    ('3', '4'),
    ('3', '5'),
    ('3', '6'),
    ('5', '7'),
    ('5', '8'),
    ('3', '9'),
    ('3', '10'),
    ('4', '11'),
    ('4', '12');



--
-- Data for Name: component_recipes; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.component_recipes (component_recipe_id, recipe_name, man_hours, qtd_employees, qtd_hours)
VALUES
    ('78', 'Laminado Planificado do Corpo 2 DN x 6 AL', '15.00', '5', '3.00'),
    ('79', 'Laminado Planificado do Corpo 2 DN x 6,2 AL', '10.00', '5', '2.00'),
    ('80', 'Laminado Planificado do Corpo 2 DN x 6,5 AL', '10.00', '5', '2.00'),
    ('81', 'Laminado Planificado do Corpo 2 DN x 6,6 AL', '10.00', '5', '2.00'),
    ('14', 'Fundo em PRFV 2m', '18.00', '3', '6.00'),
    ('12', 'Fundo em PRFV 1m', '1.20', '3', '0.40'),
    ('13', 'Fundo em PRFV 1,5m', '1.50', '3', '0.50'),
    ('15', 'Fundo em PRFV 2,5m', '2.00', '2', '1.00'),
    ('16', 'Fundo em PRFV 3m', '4.00', '2', '2.00'),
    ('17', 'Fundo em PRFV 3,5m', '10.00', '4', '2.50'),
    ('18', 'Fundo em PRFV 4m', '9.00', '3', '3.00'),
    ('19', 'Fundo em PRFV 4,5m', '10.50', '3', '3.50'),
    ('20', 'Fundo em PRFV 5m', '15.00', '5', '3.00'),
    ('21', 'Fundo em PRFV 5,5m', '20.00', '4', '5.00'),
    ('22', 'Fundo em PRFV 6m', '24.00', '6', '4.00'),
    ('23', 'Laminado Planificado do Corpo 1 DN x 3 AL', '27.00', '6', '4.50'),
    ('24', 'Laminado Planificado do Corpo 1 DN x 3,2 AL', '6.00', '3', '2.00'),
    ('25', 'Laminado Planificado do Corpo 1 DN x 3,5 AL', '6.00', '3', '2.00'),
    ('26', 'Laminado Planificado do Corpo 1 DN x 3,6 AL', '18.00', '6', '3.00'),
    ('27', 'Laminado Planificado do Corpo 1 DN x 4 AL', '18.00', '6', '3.00'),
    ('28', 'Laminado Planificado do Corpo 1 DN x 4,2 AL', '18.00', '6', '3.00'),
    ('29', 'Laminado Planificado do Corpo 1 DN x 4,5 AL', '15.00', '5', '3.00'),
    ('30', 'Laminado Planificado do Corpo 1 DN x 4,6 AL', '15.00', '5', '3.00'),
    ('31', 'Laminado Planificado do Corpo 1 DN x 4,9 AL', '18.00', '6', '3.00'),
    ('32', 'Laminado Planificado do Corpo 1 DN x 5 AL', '8.00', '4', '2.00'),
    ('33', 'Laminado Planificado do Corpo 1 DN x 5,2 AL', '12.00', '4', '3.00'),
    ('34', 'Laminado Planificado do Corpo 1 DN x 5,5 AL', '12.00', '4', '3.00'),
    ('35', 'Laminado Planificado do Corpo 1 DN x 5,6 AL', '8.00', '4', '2.00'),
    ('36', 'Laminado Planificado do Corpo 1 DN x 5,7 AL', '15.00', '5', '3.00'),
    ('37', 'Laminado Planificado do Corpo 1 DN x 6 AL', '8.00', '4', '2.00'),
    ('38', 'Laminado Planificado do Corpo 1 DN x 6,2 AL', '10.00', '5', '2.00'),
    ('39', 'Laminado Planificado do Corpo 1 DN x 6,5 AL', '10.00', '5', '2.00'),
    ('40', 'Laminado Planificado do Corpo 1 DN x 6,6 AL', '10.00', '5', '2.00'),
    ('41', 'Laminado Planificado do Corpo 1 DN x 6,8 AL', '15.00', '5', '3.00'),
    ('42', 'Laminado Planificado do Corpo 1 DN x 7 AL', '10.00', '5', '2.00'),
    ('43', 'Laminado Planificado do Corpo 1,5 DN x 3 AL', '10.00', '5', '2.00'),
    ('44', 'Laminado Planificado do Corpo 1,5 DN x 3,2 AL', '12.00', '6', '2.00'),
    ('45', 'Laminado Planificado do Corpo 1,5 DN x 3,5 AL', '12.00', '6', '2.00'),
    ('46', 'Laminado Planificado do Corpo 1,5 DN x 3,6 AL', '18.00', '6', '3.00'),
    ('47', 'Laminado Planificado do Corpo 1,5 DN x 4 AL', '18.00', '6', '3.00'),
    ('48', 'Laminado Planificado do Corpo 1,5 DN x 4,2 AL', '18.00', '6', '3.00'),
    ('49', 'Laminado Planificado do Corpo 1,5 DN x 4,5 AL', '18.00', '6', '3.00'),
    ('50', 'Laminado Planificado do Corpo 1,5 DN x 4,6 AL', '21.00', '7', '3.00'),
    ('51', 'Laminado Planificado do Corpo 1,5 DN x 4,9 AL', '24.00', '6', '4.00'),
    ('53', 'Laminado Planificado do Corpo 1,5 DN x 5 AL', '18.00', '6', '3.00'),
    ('54', 'Laminado Planificado do Corpo 1,5 DN x 5,2 AL', '10.00', '5', '2.00'),
    ('55', 'Laminado Planificado do Corpo 1,5 DN x 5,5 AL', '15.00', '5', '3.00'),
    ('56', 'Laminado Planificado do Corpo 1,5 DN x 5,6 AL', '12.00', '6', '2.00'),
    ('57', 'Laminado Planificado do Corpo 1,5 DN x 5,7 AL', '15.00', '5', '3.00'),
    ('58', 'Laminado Planificado do Corpo 1,5 DN x 6 AL', '18.00', '6', '3.00'),
    ('59', 'Laminado Planificado do Corpo 1,5 DN x 6,2 AL', '24.00', '6', '4.00'),
    ('60', 'Laminado Planificado do Corpo 1,5 DN x 6,5 AL', '21.00', '6', '3.50'),
    ('61', 'Laminado Planificado do Corpo 1,5 DN x 6,6 AL', '18.00', '6', '3.00'),
    ('62', 'Laminado Planificado do Corpo 1,5 DN x 6,8 AL', '15.00', '5', '3.00'),
    ('63', 'Laminado Planificado do Corpo 1,5 DN x 7 AL', '18.00', '6', '3.00'),
    ('64', 'Laminado Planificado do Corpo 2 DN x 3 AL', '10.00', '5', '2.00'),
    ('65', 'Laminado Planificado do Corpo 2 DN x 3,2 AL', '10.00', '5', '2.00'),
    ('66', 'Laminado Planificado do Corpo 2 DN x 3,5 AL', '10.00', '5', '2.00'),
    ('67', 'Laminado Planificado do Corpo 2 DN x 3,6 AL', '10.00', '5', '2.00'),
    ('68', 'Laminado Planificado do Corpo 2 DN x 4 AL', '10.00', '5', '2.00'),
    ('69', 'Laminado Planificado do Corpo 2 DN x 4,2 AL', '10.00', '5', '2.00'),
    ('70', 'Laminado Planificado do Corpo 2 DN x 4,5 AL', '10.00', '5', '2.00'),
    ('71', 'Laminado Planificado do Corpo 2 DN x 4,6 AL', '10.00', '5', '2.00'),
    ('72', 'Laminado Planificado do Corpo 2 DN x 4,9 AL', '10.00', '5', '2.00'),
    ('73', 'Laminado Planificado do Corpo 2 DN x 5 AL', '10.00', '5', '2.00'),
    ('74', 'Laminado Planificado do Corpo 2 DN x 5,2 AL', '10.00', '5', '2.00'),
    ('75', 'Laminado Planificado do Corpo 2 DN x 5,5 AL', '10.00', '5', '2.00'),
    ('76', 'Laminado Planificado do Corpo 2 DN x 5,6 AL', '10.00', '5', '2.00'),
    ('77', 'Laminado Planificado do Corpo 2 DN x 5,7 AL', '10.00', '5', '2.00'),
    ('82', 'Laminado Planificado do Corpo 2 DN x 6,8 AL', '10.00', '5', '2.00'),
    ('83', 'Laminado Planificado do Corpo 2 DN x 7 AL', '10.00', '5', '2.00'),
    ('84', 'Laminado Planificado do Corpo 2,5 DN x 3 AL', '18.00', '6', '3.00'),
    ('85', 'Laminado Planificado do Corpo 2,5 DN x 3,2 AL', '10.00', '5', '2.00'),
    ('86', 'Laminado Planificado do Corpo 2,5 DN x 3,5 AL', '18.00', '6', '3.00'),
    ('87', 'Laminado Planificado do Corpo 2,5 DN x 3,6 AL', '12.00', '6', '2.00'),
    ('88', 'Laminado Planificado do Corpo 2,5 DN x 4 AL', '18.00', '6', '3.00'),
    ('89', 'Laminado Planificado do Corpo 2,5 DN x 4,2 AL', '18.00', '6', '3.00'),
    ('90', 'Laminado Planificado do Corpo 2,5 DN x 4,5 AL', '18.00', '6', '3.00'),
    ('91', 'Laminado Planificado do Corpo 2,5 DN x 4,6 AL', '18.00', '6', '3.00'),
    ('92', 'Laminado Planificado do Corpo 2,5 DN x 4,9 AL', '18.00', '6', '3.00'),
    ('93', 'Laminado Planificado do Corpo 2,5 DN x 5 AL', '18.00', '6', '3.00'),
    ('94', 'Laminado Planificado do Corpo 2,5 DN x 5,2 AL', '18.00', '6', '3.00'),
    ('95', 'Laminado Planificado do Corpo 2,5 DN x 5,5 AL', '18.00', '6', '3.00'),
    ('96', 'Laminado Planificado do Corpo 2,5 DN x 5,6 AL', '18.00', '6', '3.00'),
    ('97', 'Laminado Planificado do Corpo 2,5 DN x 5,7 AL', '18.00', '6', '3.00'),
    ('98', 'Laminado Planificado do Corpo 2,5 DN x 5,7 AL', '18.00', '6', '3.00'),
    ('99', 'Laminado Planificado do Corpo 2,5 DN x 6 AL', '18.00', '6', '3.00'),
    ('100', 'Laminado Planificado do Corpo 2,5 DN x 6,2 AL', '18.00', '6', '3.00'),
    ('101', 'Laminado Planificado do Corpo 2,5 DN x 6,5 AL', '18.00', '6', '3.00'),
    ('102', 'Laminado Planificado do Corpo 2,5 DN x 6,6 AL', '18.00', '6', '3.00'),
    ('103', 'Laminado Planificado do Corpo 2,5 DN x 6,8 AL', '18.00', '6', '3.00'),
    ('104', 'Laminado Planificado do Corpo 2,5 DN x 7 AL', '18.00', '6', '3.00'),
    ('105', 'Laminado Planificado do Corpo 3 DN x 3 AL', '10.00', '5', '2.00'),
    ('106', 'Laminado Planificado do Corpo 3 DN x 3,2 AL', '10.00', '5', '2.00'),
    ('107', 'Laminado Planificado do Corpo 3 DN x 3,5 AL', '18.00', '6', '3.00'),
    ('108', 'Laminado Planificado do Corpo 3 DN x 3,6 AL', '18.00', '6', '3.00'),
    ('110', 'Laminado Planificado do Corpo 3 DN x 4 AL', '15.00', '5', '3.00'),
    ('112', 'Laminado Planificado do Corpo 3 DN x 4,2 AL', '18.00', '6', '3.00'),
    ('113', 'Laminado Planificado do Corpo 3 DN x 4,5 AL', '18.00', '6', '3.00'),
    ('114', 'Laminado Planificado do Corpo 3 DN x 4,6 AL', '20.00', '5', '4.00'),
    ('115', 'Laminado Planificado do Corpo 3 DN x 4,9 AL', '15.00', '5', '3.00'),
    ('117', 'Laminado Planificado do Corpo 3 DN x 5 AL', '15.00', '5', '3.00'),
    ('118', 'Laminado Planificado do Corpo 3 DN x 5,2 AL', '18.00', '6', '3.00'),
    ('119', 'Laminado Planificado do Corpo 3 DN x 5,5 AL', '18.00', '6', '3.00'),
    ('120', 'Laminado Planificado do Corpo 3 DN x 5,6 AL', '24.00', '6', '4.00'),
    ('121', 'Laminado Planificado do Corpo 3 DN x 5,7 AL', '24.00', '6', '4.00'),
    ('122', 'Laminado Planificado do Corpo 3 DN x 6 AL', '15.00', '5', '3.00'),
    ('123', 'Laminado Planificado do Corpo 3 DN x 6,2 AL', '18.00', '6', '3.00'),
    ('124', 'Laminado Planificado do Corpo 3 DN x 6,5 AL', '18.00', '6', '3.00'),
    ('125', 'Laminado Planificado do Corpo 3 DN x 6,5 AL', '18.00', '6', '3.00'),
    ('126', 'Laminado Planificado do Corpo 3 DN x 6,6 AL', '18.00', '6', '3.00'),
    ('127', 'Laminado Planificado do Corpo 3 DN x 6,8 AL', '18.00', '6', '3.00'),
    ('128', 'Laminado Planificado do Corpo 3 DN x 7 AL', '18.00', '6', '3.00'),
    ('129', 'Laminado Planificado do Corpo 3,5 DN x 3 AL', '21.00', '7', '3.00'),
    ('130', 'Laminado Planificado do Corpo 3,5 DN x 3,2 AL', '21.00', '7', '3.00'),
    ('131', 'Laminado Planificado do Corpo 3,5 DN x 3,5 AL', '21.00', '7', '3.00'),
    ('132', 'Laminado Planificado do Corpo 3,5 DN x 3,6 AL', '21.00', '7', '3.00'),
    ('133', 'Laminado Planificado do Corpo 3,5 DN x 4 AL', '21.00', '7', '3.00'),
    ('134', 'Laminado Planificado do Corpo 3,5 DN x 4,2 AL', '21.00', '7', '3.00'),
    ('135', 'Laminado Planificado do Corpo 3,5 DN x 4,5 AL', '21.00', '7', '3.00'),
    ('136', 'Laminado Planificado do Corpo 3,5 DN x 4,6 AL', '28.00', '7', '4.00'),
    ('137', 'Laminado Planificado do Corpo 3,5 DN x 4,9 AL', '21.00', '7', '3.00'),
    ('138', 'Laminado Planificado do Corpo 3,5 DN x 5 AL', '21.00', '7', '3.00'),
    ('139', 'Laminado Planificado do Corpo 3,5 DN x 5,2 AL', '21.00', '7', '3.00'),
    ('172', 'Laminado Planificado do Corpo 4,5 DN x 3,5 AL', '24.00', '6', '4.00'),
    ('141', 'Laminado Planificado do Corpo 3,5 DN x 5,5 AL', '21.00', '7', '3.00'),
    ('142', 'Laminado Planificado do Corpo 3,5 DN x 5,6 AL', '21.00', '7', '3.00'),
    ('143', 'Laminado Planificado do Corpo 3,5 DN x 5,7 AL', '21.00', '7', '3.00'),
    ('144', 'Laminado Planificado do Corpo 3,5 DN x 6 AL', '21.00', '7', '3.00'),
    ('145', 'Laminado Planificado do Corpo 3,5 DN x 6,2 AL', '21.00', '7', '3.00'),
    ('146', 'Laminado Planificado do Corpo 3,5 DN x 6,5 AL', '21.00', '7', '3.00'),
    ('147', 'Laminado Planificado do Corpo 3,5 DN x 6,6 AL', '28.00', '7', '4.00'),
    ('148', 'Laminado Planificado do Corpo 3,5 DN x 6,8 AL', '28.00', '7', '4.00'),
    ('149', 'Laminado Planificado do Corpo 3,5 DN x 7 AL', '28.00', '7', '4.00'),
    ('150', 'Laminado Planificado do Corpo 4 DN x 3 AL', '28.00', '7', '4.00'),
    ('151', 'Laminado Planificado do Corpo 4 DN x 3,2 AL', '20.00', '5', '4.00'),
    ('152', 'Laminado Planificado do Corpo 4 DN x 3,5 AL', '28.00', '7', '4.00'),
    ('153', 'Laminado Planificado do Corpo 4 DN x 3,6 AL', '28.00', '7', '4.00'),
    ('154', 'Laminado Planificado do Corpo 4 DN x 4 AL', '28.00', '7', '4.00'),
    ('155', 'Laminado Planificado do Corpo 4 DN x 4,2 AL', '28.00', '7', '4.00'),
    ('156', 'Laminado Planificado do Corpo 4 DN x 4,5 AL', '28.00', '7', '4.00'),
    ('157', 'Laminado Planificado do Corpo 4 DN x 4,6 AL', '28.00', '7', '4.00'),
    ('158', 'Laminado Planificado do Corpo 4 DN x 4,9 AL', '28.00', '7', '4.00'),
    ('159', 'Laminado Planificado do Corpo 4 DN x 5 AL', '28.00', '7', '4.00'),
    ('160', 'Laminado Planificado do Corpo 4 DN x 5,2 AL', '28.00', '7', '4.00'),
    ('161', 'Laminado Planificado do Corpo 4 DN x 5,5 AL', '28.00', '7', '4.00'),
    ('162', 'Laminado Planificado do Corpo 4 DN x 5,6 AL', '28.00', '7', '4.00'),
    ('163', 'Laminado Planificado do Corpo 4 DN x 5,7 AL', '28.00', '7', '4.00'),
    ('164', 'Laminado Planificado do Corpo 4 DN x 6 AL', '28.00', '7', '4.00'),
    ('165', 'Laminado Planificado do Corpo 4 DN x 6,2 AL', '28.00', '7', '4.00'),
    ('166', 'Laminado Planificado do Corpo 4 DN x 6,5 AL', '28.00', '7', '4.00'),
    ('167', 'Laminado Planificado do Corpo 4 DN x 6,6 AL', '28.00', '7', '4.00'),
    ('168', 'Laminado Planificado do Corpo 4 DN x 6,8 AL', '28.00', '7', '4.00'),
    ('169', 'Laminado Planificado do Corpo 4 DN x 7 AL', '28.00', '7', '4.00'),
    ('170', 'Laminado Planificado do Corpo 4,5 DN x 3 AL', '24.00', '6', '4.00'),
    ('171', 'Laminado Planificado do Corpo 4,5 DN x 3,2 AL', '24.00', '6', '4.00'),
    ('173', 'Laminado Planificado do Corpo 4,5 DN x 3,6 AL', '24.00', '6', '4.00'),
    ('174', 'Laminado Planificado do Corpo 4,5 DN x 4 AL', '24.00', '6', '4.00'),
    ('175', 'Laminado Planificado do Corpo 4,5 DN x 4,2 AL', '24.00', '6', '4.00'),
    ('176', 'Laminado Planificado do Corpo 4,5 DN x 4,5 AL', '24.00', '6', '4.00'),
    ('177', 'Laminado Planificado do Corpo 4,5 DN x 4,6 AL', '24.00', '6', '4.00'),
    ('178', 'Laminado Planificado do Corpo 4,5 DN x 4,9 AL', '24.00', '6', '4.00'),
    ('179', 'Laminado Planificado do Corpo 4,5 DN x 5 AL', '24.00', '6', '4.00'),
    ('180', 'Laminado Planificado do Corpo 4,5 DN x 5,2 AL', '24.00', '6', '4.00'),
    ('181', 'Laminado Planificado do Corpo 4,5 DN x 5,5 AL', '24.00', '6', '4.00'),
    ('182', 'Laminado Planificado do Corpo 4,5 DN x 5,6 AL', '24.00', '6', '4.00'),
    ('183', 'Laminado Planificado do Corpo 4,5 DN x 5,7 AL', '24.00', '6', '4.00'),
    ('184', 'Laminado Planificado do Corpo 4,5 DN x 6 AL', '24.00', '6', '4.00'),
    ('185', 'Laminado Planificado do Corpo 4,5 DN x 6,2 AL', '24.00', '6', '4.00'),
    ('186', 'Laminado Planificado do Corpo 4,5 DN x 6,5 AL', '24.00', '6', '4.00'),
    ('187', 'Laminado Planificado do Corpo 4,5 DN x 6,6 AL', '24.00', '6', '4.00'),
    ('188', 'Laminado Planificado do Corpo 4,5 DN x 6,8 AL', '24.00', '6', '4.00'),
    ('189', 'Laminado Planificado do Corpo 4,5 DN x 7 AL', '24.00', '6', '4.00'),
    ('190', 'Laminado Planificado do Corpo 5 DN x 3 AL', '20.00', '5', '4.00'),
    ('191', 'Laminado Planificado do Corpo 5 DN x 3,2 AL', '20.00', '5', '4.00'),
    ('192', 'Laminado Planificado do Corpo 5 DN x 3,5 AL', '20.00', '5', '4.00'),
    ('193', 'Laminado Planificado do Corpo 5 DN x 3,6 AL', '20.00', '5', '4.00'),
    ('194', 'Laminado Planificado do Corpo 5 DN x 4 AL', '20.00', '5', '4.00'),
    ('195', 'Laminado Planificado do Corpo 5 DN x 4,2 AL', '20.00', '5', '4.00'),
    ('196', 'Laminado Planificado do Corpo 5 DN x 4,5 AL', '20.00', '5', '4.00'),
    ('197', 'Laminado Planificado do Corpo 5 DN x 4,6 AL', '20.00', '5', '4.00'),
    ('198', 'Laminado Planificado do Corpo 5 DN x 4,9 AL', '20.00', '5', '4.00'),
    ('199', 'Laminado Planificado do Corpo 5 DN x 5 AL', '20.00', '5', '4.00'),
    ('200', 'Laminado Planificado do Corpo 5 DN x 5,2 AL', '20.00', '5', '4.00'),
    ('201', 'Laminado Planificado do Corpo 5 DN x 5,5 AL', '20.00', '5', '4.00'),
    ('202', 'Laminado Planificado do Corpo 5 DN x 5,6 AL', '20.00', '5', '4.00'),
    ('203', 'Laminado Planificado do Corpo 5 DN x 5,7 AL', '20.00', '5', '4.00'),
    ('204', 'Laminado Planificado do Corpo 5 DN x 6 AL', '20.00', '5', '4.00'),
    ('205', 'Laminado Planificado do Corpo 5 DN x 6,2 AL', '20.00', '5', '4.00'),
    ('206', 'Laminado Planificado do Corpo 5 DN x 6,5 AL', '20.00', '5', '4.00'),
    ('207', 'Laminado Planificado do Corpo 5 DN x 6,6 AL', '20.00', '5', '4.00'),
    ('208', 'Laminado Planificado do Corpo 5 DN x 7 AL', '20.00', '5', '4.00'),
    ('209', 'Laminado Planificado do Corpo 5 DN x 6,8 AL', '20.00', '5', '4.00'),
    ('210', 'Laminado Planificado do Corpo 5,5 DN x 3 AL', '20.00', '5', '4.00'),
    ('211', 'Laminado Planificado do Corpo 5,5 DN x 3,2 AL', '20.00', '5', '4.00'),
    ('212', 'Laminado Planificado do Corpo 5,5 DN x 3,5 AL', '20.00', '5', '4.00'),
    ('213', 'Laminado Planificado do Corpo 5,5 DN x 3,6 AL', '20.00', '5', '4.00'),
    ('214', 'Laminado Planificado do Corpo 5,5 DN x 4 AL', '20.00', '5', '4.00'),
    ('215', 'Laminado Planificado do Corpo 5,5 DN x 4,2 AL', '20.00', '5', '4.00'),
    ('216', 'Laminado Planificado do Corpo 5,5 DN x 4,5 AL', '20.00', '5', '4.00'),
    ('217', 'Laminado Planificado do Corpo 5,5 DN x 4,6 AL', '20.00', '5', '4.00'),
    ('218', 'Laminado Planificado do Corpo 5,5 DN x 4,9 AL', '20.00', '5', '4.00'),
    ('219', 'Laminado Planificado do Corpo 5,5 DN x 5 AL', '20.00', '5', '4.00'),
    ('220', 'Laminado Planificado do Corpo 5,5 DN x 5,2 AL', '20.00', '5', '4.00'),
    ('221', 'Laminado Planificado do Corpo 5,5 DN x 5,5 AL', '20.00', '5', '4.00'),
    ('222', 'Laminado Planificado do Corpo 5,5 DN x 5,6 AL', '20.00', '5', '4.00'),
    ('223', 'Laminado Planificado do Corpo 5,5 DN x 5,7 AL', '20.00', '5', '4.00'),
    ('224', 'Laminado Planificado do Corpo 5,5 DN x 6 AL', '20.00', '5', '4.00'),
    ('225', 'Laminado Planificado do Corpo 5,5 DN x 6,2 AL', '20.00', '5', '4.00'),
    ('226', 'Laminado Planificado do Corpo 5,5 DN x 6,5 AL', '20.00', '5', '4.00'),
    ('227', 'Laminado Planificado do Corpo 5,5 DN x 6,6 AL', '20.00', '5', '4.00'),
    ('228', 'Laminado Planificado do Corpo 5,5 DN x 6,8 AL', '20.00', '5', '4.00'),
    ('229', 'Laminado Planificado do Corpo 5,5 DN x 7 AL', '20.00', '5', '4.00'),
    ('230', 'Laminado Planificado do Corpo 6 DN x 3 AL', '20.00', '5', '4.00'),
    ('231', 'Laminado Planificado do Corpo 6 DN x 3,2 AL', '20.00', '5', '4.00'),
    ('232', 'Laminado Planificado do Corpo 6 DN x 3,5 AL', '20.00', '5', '4.00'),
    ('233', 'Laminado Planificado do Corpo 6 DN x 3,6 AL', '20.00', '5', '4.00'),
    ('234', 'Laminado Planificado do Corpo 6 DN x 4 AL', '20.00', '5', '4.00'),
    ('235', 'Laminado Planificado do Corpo 6 DN x 4,2 AL', '20.00', '5', '4.00'),
    ('236', 'Laminado Planificado do Corpo 6 DN x 4,5 AL', '20.00', '5', '4.00'),
    ('237', 'Laminado Planificado do Corpo 6 DN x 4,6 AL', '20.00', '5', '4.00'),
    ('238', 'Laminado Planificado do Corpo 6 DN x 4,9 AL', '20.00', '5', '4.00'),
    ('239', 'Laminado Planificado do Corpo 6 DN x 5 AL', '20.00', '5', '4.00'),
    ('240', 'Laminado Planificado do Corpo 6 DN x 5,2 AL', '20.00', '5', '4.00'),
    ('241', 'Laminado Planificado do Corpo 6 DN x 5,5 AL', '20.00', '5', '4.00'),
    ('242', 'Laminado Planificado do Corpo 6 DN x 5,6 AL', '20.00', '5', '4.00'),
    ('243', 'Laminado Planificado do Corpo 6 DN x 5,7 AL', '20.00', '5', '4.00'),
    ('244', 'Laminado Planificado do Corpo 6 DN x 6 AL', '20.00', '5', '4.00'),
    ('245', 'Laminado Planificado do Corpo 6 DN x 6,2 AL', '20.00', '5', '4.00'),
    ('246', 'Laminado Planificado do Corpo 6 DN x 6,5 AL', '20.00', '5', '4.00'),
    ('247', 'Laminado Planificado do Corpo 6 DN x 6,6 AL', '20.00', '5', '4.00'),
    ('248', 'Laminado Planificado do Corpo 6 DN x 6,8 AL', '20.00', '5', '4.00'),
    ('249', 'Laminado Planificado do Corpo 6 DN x 7 AL', '20.00', '5', '4.00'),
    ('250', 'Emenda Fundo Interno 1 DN', '2.00', '2', '1.00'),
    ('251', 'Emenda Fundo Interno 1,5 DN', '2.00', '2', '1.00'),
    ('252', 'Emenda Fundo Interno 2 DN', '2.00', '2', '1.00'),
    ('253', 'Emenda Fundo Interno 2,5 DN', '2.00', '2', '1.00'),
    ('254', 'Emenda Fundo Interno 3 DN', '3.00', '2', '1.50'),
    ('255', 'Emenda Fundo Interno 3,5 DN', '3.00', '2', '1.50'),
    ('256', 'Emenda Fundo Interno 4 DN', '3.20', '2', '1.60'),
    ('257', 'Emenda Fundo Interno 4,5 DN', '3.60', '2', '1.80'),
    ('258', 'Emenda Fundo Interno 5 DN', '4.00', '2', '2.00'),
    ('259', 'Emenda Fundo Interno 5,5 DN', '4.00', '2', '2.00'),
    ('260', 'Emenda Fundo Interno 6 DN', '4.00', '2', '2.00');



--
-- Data for Name: component_recipes_materials; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.component_recipes_materials (component_recipe_id, material_id, quantity_plan)
VALUES
    ('12', '1', '30'),
    ('12', '2', '12'),
    ('12', '5', '0.1'),
    ('12', '15', '6'),
    ('13', '1', '40'),
    ('13', '2', '12'),
    ('13', '5', '0.1'),
    ('13', '15', '6'),
    ('14', '1', '1'),
    ('14', '2', '1'),
    ('14', '5', '1'),
    ('14', '15', '1'),
    ('15', '1', '1'),
    ('15', '2', '1'),
    ('15', '5', '1'),
    ('15', '15', '1'),
    ('16', '1', '1'),
    ('16', '2', '1'),
    ('16', '5', '1'),
    ('16', '15', '1'),
    ('17', '1', '13'),
    ('17', '5', '1'),
    ('17', '15', '1'),
    ('17', '2', '12'),
    ('18', '1', '15'),
    ('18', '2', '10'),
    ('18', '5', '1'),
    ('18', '15', '3'),
    ('19', '1', '20'),
    ('19', '2', '15'),
    ('19', '5', '1.5'),
    ('19', '15', '3'),
    ('20', '1', '18'),
    ('20', '5', '1'),
    ('20', '15', '1'),
    ('20', '2', '15'),
    ('21', '1', '20'),
    ('21', '2', '15'),
    ('21', '5', '2'),
    ('21', '15', '2'),
    ('22', '1', '25'),
    ('22', '2', '20'),
    ('22', '5', '3'),
    ('22', '15', '4'),
    ('23', '1', '1'),
    ('23', '2', '1'),
    ('23', '5', '1'),
    ('23', '15', '1'),
    ('24', '1', '1'),
    ('24', '2', '1'),
    ('24', '5', '1'),
    ('24', '15', '1'),
    ('25', '1', '1'),
    ('25', '2', '1'),
    ('25', '5', '1'),
    ('25', '15', '1'),
    ('26', '1', '1'),
    ('26', '2', '1'),
    ('26', '5', '1'),
    ('26', '15', '1'),
    ('27', '1', '1'),
    ('27', '2', '1'),
    ('27', '5', '1'),
    ('27', '15', '1'),
    ('28', '1', '1'),
    ('28', '2', '1'),
    ('28', '5', '1'),
    ('28', '15', '1'),
    ('29', '1', '1'),
    ('29', '2', '1'),
    ('29', '5', '1'),
    ('29', '15', '1'),
    ('30', '1', '1'),
    ('30', '2', '1'),
    ('30', '5', '1'),
    ('30', '15', '1'),
    ('31', '1', '1'),
    ('31', '2', '1'),
    ('31', '5', '1'),
    ('31', '15', '1'),
    ('32', '1', '1'),
    ('32', '2', '1'),
    ('32', '5', '1'),
    ('32', '15', '1'),
    ('33', '1', '1'),
    ('33', '2', '1'),
    ('33', '5', '1'),
    ('33', '15', '1'),
    ('34', '1', '1'),
    ('34', '2', '1'),
    ('34', '5', '1'),
    ('34', '15', '1'),
    ('35', '1', '1'),
    ('35', '2', '1'),
    ('35', '5', '1'),
    ('35', '15', '1'),
    ('36', '1', '1'),
    ('36', '2', '1'),
    ('36', '5', '1'),
    ('36', '15', '1'),
    ('37', '1', '1'),
    ('37', '2', '1'),
    ('37', '5', '1'),
    ('37', '15', '1'),
    ('38', '2', '1'),
    ('38', '1', '1'),
    ('38', '5', '1'),
    ('38', '15', '1'),
    ('39', '1', '1'),
    ('39', '2', '1'),
    ('39', '5', '1'),
    ('39', '15', '1'),
    ('40', '1', '1'),
    ('40', '2', '1'),
    ('40', '5', '1'),
    ('40', '15', '1'),
    ('41', '1', '1'),
    ('41', '2', '1'),
    ('41', '5', '1'),
    ('41', '15', '1'),
    ('42', '1', '1'),
    ('42', '2', '1'),
    ('42', '4', '1'),
    ('42', '5', '1'),
    ('42', '15', '1'),
    ('43', '1', '1'),
    ('43', '2', '1'),
    ('43', '3', '1'),
    ('43', '5', '1'),
    ('43', '15', '1'),
    ('44', '1', '1'),
    ('44', '2', '1'),
    ('44', '5', '1'),
    ('44', '15', '1'),
    ('45', '1', '1'),
    ('45', '2', '1'),
    ('45', '5', '1'),
    ('45', '15', '1'),
    ('46', '1', '1'),
    ('46', '2', '1'),
    ('46', '5', '1'),
    ('46', '15', '1'),
    ('47', '1', '1'),
    ('47', '2', '1'),
    ('47', '5', '1'),
    ('47', '15', '1'),
    ('48', '1', '1'),
    ('48', '3', '1'),
    ('48', '2', '1'),
    ('48', '5', '1'),
    ('48', '15', '1'),
    ('49', '1', '1'),
    ('49', '2', '1'),
    ('49', '5', '1'),
    ('49', '15', '1'),
    ('50', '1', '1'),
    ('50', '2', '1'),
    ('50', '5', '1'),
    ('50', '15', '1'),
    ('51', '2', '1'),
    ('51', '1', '1'),
    ('51', '5', '1'),
    ('51', '15', '1'),
    ('53', '1', '1'),
    ('53', '2', '1'),
    ('53', '3', '1'),
    ('53', '5', '1'),
    ('53', '15', '1'),
    ('54', '1', '1'),
    ('54', '2', '1'),
    ('54', '5', '1'),
    ('54', '15', '1'),
    ('55', '1', '1'),
    ('55', '2', '1'),
    ('55', '5', '1'),
    ('55', '15', '1'),
    ('56', '1', '1'),
    ('56', '2', '1'),
    ('56', '5', '1'),
    ('56', '15', '1'),
    ('57', '1', '1'),
    ('57', '3', '1'),
    ('57', '2', '1'),
    ('57', '5', '1'),
    ('57', '11', '1'),
    ('57', '15', '1'),
    ('58', '1', '1'),
    ('58', '2', '1'),
    ('58', '5', '1'),
    ('58', '15', '1'),
    ('59', '1', '1'),
    ('59', '2', '1'),
    ('59', '5', '1'),
    ('59', '15', '1'),
    ('60', '1', '1'),
    ('60', '2', '1'),
    ('60', '5', '1'),
    ('60', '15', '1'),
    ('61', '1', '1'),
    ('61', '2', '1'),
    ('61', '5', '1'),
    ('61', '15', '1'),
    ('62', '1', '1'),
    ('62', '2', '1'),
    ('62', '5', '1'),
    ('62', '15', '1'),
    ('63', '1', '1'),
    ('63', '2', '1'),
    ('63', '5', '1'),
    ('63', '15', '1'),
    ('64', '1', '1'),
    ('64', '2', '1'),
    ('64', '5', '1'),
    ('64', '15', '1'),
    ('65', '1', '1'),
    ('65', '2', '1'),
    ('65', '5', '1'),
    ('65', '15', '1'),
    ('66', '1', '1'),
    ('66', '2', '1'),
    ('66', '5', '1'),
    ('66', '15', '1'),
    ('67', '1', '1'),
    ('67', '2', '1'),
    ('67', '5', '1'),
    ('67', '15', '1'),
    ('68', '1', '1'),
    ('68', '2', '1'),
    ('68', '5', '1'),
    ('68', '15', '1'),
    ('69', '2', '1'),
    ('69', '1', '1'),
    ('69', '5', '1'),
    ('69', '15', '1'),
    ('70', '1', '1'),
    ('70', '2', '1'),
    ('70', '5', '1'),
    ('70', '15', '1'),
    ('71', '1', '1'),
    ('71', '2', '1'),
    ('71', '5', '1'),
    ('71', '15', '1'),
    ('72', '1', '1'),
    ('72', '2', '1'),
    ('72', '5', '1'),
    ('72', '15', '1'),
    ('73', '1', '1'),
    ('73', '2', '1'),
    ('73', '5', '1'),
    ('73', '15', '1'),
    ('74', '1', '1'),
    ('74', '2', '1'),
    ('74', '5', '1'),
    ('74', '15', '1'),
    ('75', '1', '1'),
    ('75', '2', '1'),
    ('75', '5', '1'),
    ('75', '15', '1'),
    ('76', '1', '1'),
    ('76', '2', '1'),
    ('76', '5', '1'),
    ('76', '15', '1'),
    ('77', '1', '1'),
    ('77', '2', '1'),
    ('77', '5', '1'),
    ('77', '15', '1'),
    ('78', '1', '1'),
    ('78', '2', '1'),
    ('78', '5', '1'),
    ('78', '15', '1'),
    ('79', '1', '1'),
    ('79', '2', '1'),
    ('79', '5', '1'),
    ('79', '15', '1'),
    ('80', '2', '1'),
    ('80', '1', '1'),
    ('80', '5', '1'),
    ('80', '15', '1'),
    ('81', '1', '1'),
    ('81', '2', '1'),
    ('81', '5', '1'),
    ('81', '15', '1'),
    ('82', '1', '1'),
    ('82', '2', '1'),
    ('82', '5', '1'),
    ('82', '15', '1'),
    ('83', '1', '1'),
    ('83', '2', '1'),
    ('83', '5', '1'),
    ('83', '15', '1'),
    ('84', '1', '1'),
    ('84', '2', '1'),
    ('84', '5', '1'),
    ('84', '15', '1'),
    ('85', '1', '1'),
    ('85', '2', '1'),
    ('85', '5', '1'),
    ('85', '15', '1'),
    ('86', '1', '1'),
    ('86', '2', '1'),
    ('86', '5', '1'),
    ('86', '15', '1'),
    ('87', '1', '1'),
    ('87', '2', '1'),
    ('87', '5', '1'),
    ('87', '15', '1'),
    ('88', '1', '1'),
    ('88', '2', '1'),
    ('88', '5', '1'),
    ('88', '15', '1'),
    ('89', '1', '1'),
    ('89', '2', '1'),
    ('89', '5', '1'),
    ('89', '15', '1'),
    ('90', '1', '1'),
    ('90', '2', '1'),
    ('90', '5', '1'),
    ('90', '15', '1'),
    ('91', '1', '1'),
    ('91', '2', '1'),
    ('91', '5', '1'),
    ('91', '15', '1'),
    ('92', '1', '1'),
    ('92', '2', '1'),
    ('92', '5', '1'),
    ('92', '15', '1'),
    ('93', '1', '1'),
    ('93', '2', '1'),
    ('93', '5', '1'),
    ('93', '15', '1'),
    ('94', '1', '1'),
    ('94', '2', '1'),
    ('94', '5', '1'),
    ('94', '15', '1'),
    ('95', '1', '1'),
    ('95', '2', '1'),
    ('95', '5', '1'),
    ('95', '15', '1'),
    ('96', '1', '1'),
    ('96', '2', '1'),
    ('96', '5', '1'),
    ('96', '15', '1'),
    ('97', '1', '1'),
    ('97', '3', '1'),
    ('98', '1', '1'),
    ('97', '2', '1'),
    ('98', '3', '1'),
    ('97', '5', '1'),
    ('98', '2', '1'),
    ('97', '15', '1'),
    ('98', '5', '1'),
    ('98', '15', '1'),
    ('99', '1', '1'),
    ('99', '2', '1'),
    ('99', '5', '1'),
    ('99', '15', '1'),
    ('100', '1', '1'),
    ('100', '2', '1'),
    ('100', '5', '1'),
    ('100', '15', '1'),
    ('101', '1', '1'),
    ('101', '2', '1'),
    ('101', '5', '1'),
    ('101', '15', '1'),
    ('102', '1', '1'),
    ('102', '2', '1'),
    ('102', '5', '1'),
    ('102', '15', '1'),
    ('103', '1', '1'),
    ('103', '2', '1'),
    ('103', '5', '1'),
    ('103', '15', '1'),
    ('104', '1', '1'),
    ('104', '2', '1'),
    ('104', '5', '1'),
    ('104', '15', '1'),
    ('105', '1', '1'),
    ('105', '2', '1'),
    ('105', '5', '1'),
    ('105', '15', '1'),
    ('106', '1', '1'),
    ('106', '2', '1'),
    ('106', '5', '1'),
    ('106', '15', '1'),
    ('107', '1', '1'),
    ('107', '2', '1'),
    ('107', '5', '1'),
    ('107', '15', '1'),
    ('108', '1', '1'),
    ('108', '2', '1'),
    ('108', '5', '1'),
    ('108', '15', '1'),
    ('110', '1', '1'),
    ('110', '2', '1'),
    ('110', '5', '1'),
    ('110', '15', '1'),
    ('112', '1', '1'),
    ('112', '2', '1'),
    ('112', '5', '1'),
    ('112', '15', '1'),
    ('113', '1', '1'),
    ('113', '2', '1'),
    ('113', '5', '1'),
    ('113', '15', '1'),
    ('114', '1', '1'),
    ('114', '2', '1'),
    ('114', '5', '1'),
    ('114', '15', '1'),
    ('115', '1', '1'),
    ('115', '2', '1'),
    ('115', '5', '1'),
    ('115', '15', '1'),
    ('117', '1', '1'),
    ('117', '2', '1'),
    ('117', '5', '1'),
    ('117', '15', '1'),
    ('118', '1', '1'),
    ('118', '2', '1'),
    ('118', '5', '1'),
    ('118', '15', '1'),
    ('119', '1', '1'),
    ('119', '2', '1'),
    ('119', '5', '1'),
    ('119', '15', '1'),
    ('120', '1', '1'),
    ('120', '2', '1'),
    ('120', '5', '1'),
    ('120', '15', '1'),
    ('121', '1', '1'),
    ('121', '2', '1'),
    ('121', '5', '1'),
    ('121', '15', '1'),
    ('122', '1', '1'),
    ('122', '2', '1'),
    ('122', '5', '1'),
    ('122', '15', '1'),
    ('123', '1', '1'),
    ('123', '2', '1'),
    ('123', '5', '1'),
    ('123', '15', '1'),
    ('124', '1', '1'),
    ('124', '2', '1'),
    ('125', '1', '1'),
    ('124', '5', '1'),
    ('125', '2', '1'),
    ('125', '5', '1'),
    ('125', '15', '1'),
    ('124', '15', '1'),
    ('126', '1', '1'),
    ('126', '2', '1'),
    ('126', '5', '1'),
    ('126', '15', '1'),
    ('127', '1', '1'),
    ('127', '2', '1'),
    ('127', '3', '1'),
    ('127', '4', '1'),
    ('127', '5', '1'),
    ('127', '15', '1'),
    ('128', '1', '1'),
    ('128', '2', '1'),
    ('128', '5', '1'),
    ('128', '15', '1'),
    ('129', '1', '1'),
    ('129', '2', '1'),
    ('129', '5', '1'),
    ('129', '15', '1'),
    ('130', '1', '1'),
    ('130', '2', '1'),
    ('130', '5', '1'),
    ('130', '15', '1'),
    ('131', '1', '1'),
    ('131', '2', '1'),
    ('131', '5', '1'),
    ('131', '15', '1'),
    ('132', '1', '1'),
    ('132', '2', '1'),
    ('132', '5', '1'),
    ('132', '15', '1'),
    ('133', '1', '1'),
    ('133', '2', '1'),
    ('133', '5', '1'),
    ('133', '15', '1'),
    ('134', '1', '1'),
    ('134', '2', '1'),
    ('134', '5', '1'),
    ('134', '15', '1'),
    ('135', '1', '1'),
    ('135', '2', '1'),
    ('135', '5', '1'),
    ('135', '15', '1'),
    ('136', '1', '1'),
    ('136', '2', '1'),
    ('136', '5', '1'),
    ('136', '15', '1'),
    ('137', '1', '1'),
    ('137', '2', '1'),
    ('137', '5', '1'),
    ('137', '15', '1'),
    ('138', '1', '1'),
    ('138', '2', '1'),
    ('138', '5', '1'),
    ('138', '15', '1'),
    ('139', '1', '1'),
    ('139', '2', '1'),
    ('139', '5', '1'),
    ('139', '15', '1'),
    ('141', '1', '1'),
    ('141', '2', '1'),
    ('141', '5', '1'),
    ('141', '15', '1'),
    ('142', '1', '1'),
    ('142', '2', '1'),
    ('142', '5', '1'),
    ('142', '15', '1'),
    ('143', '1', '1'),
    ('143', '2', '1'),
    ('143', '5', '1'),
    ('143', '15', '1'),
    ('144', '1', '1'),
    ('144', '2', '1'),
    ('144', '5', '1'),
    ('144', '15', '1'),
    ('145', '1', '1'),
    ('145', '2', '1'),
    ('145', '5', '1'),
    ('145', '15', '1'),
    ('146', '1', '1'),
    ('146', '2', '1'),
    ('146', '5', '1'),
    ('146', '15', '1'),
    ('147', '1', '1'),
    ('147', '2', '1'),
    ('147', '5', '1'),
    ('147', '15', '1'),
    ('148', '1', '1'),
    ('148', '2', '1'),
    ('148', '5', '1'),
    ('148', '15', '1'),
    ('149', '1', '1'),
    ('149', '2', '1'),
    ('149', '5', '1'),
    ('149', '15', '1'),
    ('150', '1', '1'),
    ('150', '2', '1'),
    ('150', '5', '1'),
    ('150', '15', '1'),
    ('151', '1', '1'),
    ('151', '2', '1'),
    ('151', '5', '1'),
    ('151', '15', '1'),
    ('152', '1', '1'),
    ('152', '2', '1'),
    ('152', '5', '1'),
    ('152', '15', '1'),
    ('153', '1', '1'),
    ('153', '2', '1'),
    ('153', '6', '1'),
    ('153', '5', '1'),
    ('153', '15', '1'),
    ('154', '1', '1'),
    ('154', '2', '1'),
    ('154', '5', '1'),
    ('154', '15', '1'),
    ('155', '1', '1'),
    ('155', '2', '1'),
    ('155', '5', '1'),
    ('155', '15', '1'),
    ('156', '1', '1'),
    ('156', '2', '1'),
    ('156', '5', '1'),
    ('156', '15', '1'),
    ('157', '1', '1'),
    ('157', '2', '1'),
    ('157', '5', '1'),
    ('157', '15', '1'),
    ('158', '1', '1'),
    ('158', '2', '1'),
    ('158', '5', '1'),
    ('158', '15', '1'),
    ('159', '1', '1'),
    ('159', '2', '1'),
    ('159', '5', '1'),
    ('159', '15', '1'),
    ('160', '1', '1'),
    ('160', '2', '1'),
    ('160', '5', '1'),
    ('160', '15', '1'),
    ('161', '1', '1'),
    ('161', '2', '1'),
    ('161', '5', '1'),
    ('161', '15', '1'),
    ('162', '1', '1'),
    ('162', '2', '1'),
    ('162', '5', '1'),
    ('162', '15', '1'),
    ('163', '1', '1'),
    ('163', '2', '1'),
    ('163', '5', '1'),
    ('163', '15', '1'),
    ('164', '1', '1'),
    ('164', '3', '1'),
    ('164', '2', '1'),
    ('164', '5', '1'),
    ('164', '15', '1'),
    ('165', '1', '1'),
    ('165', '2', '1'),
    ('165', '5', '1'),
    ('165', '15', '1'),
    ('166', '1', '1'),
    ('166', '2', '1'),
    ('166', '5', '1'),
    ('166', '15', '1'),
    ('167', '1', '1'),
    ('167', '2', '1'),
    ('167', '5', '1'),
    ('167', '15', '1'),
    ('168', '1', '1'),
    ('168', '2', '1'),
    ('168', '5', '1'),
    ('168', '15', '1'),
    ('169', '1', '1'),
    ('169', '2', '1'),
    ('169', '5', '1'),
    ('169', '15', '1'),
    ('170', '1', '1'),
    ('170', '2', '1'),
    ('170', '5', '1'),
    ('170', '15', '1'),
    ('171', '1', '1'),
    ('171', '2', '1'),
    ('171', '5', '1'),
    ('171', '15', '1'),
    ('172', '1', '1'),
    ('172', '2', '1'),
    ('172', '6', '1'),
    ('172', '5', '1'),
    ('172', '15', '1'),
    ('173', '1', '1'),
    ('173', '2', '1'),
    ('173', '5', '1'),
    ('173', '15', '1'),
    ('174', '1', '1'),
    ('174', '2', '1'),
    ('174', '5', '1'),
    ('174', '15', '1'),
    ('175', '1', '1'),
    ('175', '2', '1'),
    ('175', '5', '1'),
    ('175', '15', '1'),
    ('176', '1', '1'),
    ('176', '2', '1'),
    ('176', '5', '1'),
    ('176', '15', '1'),
    ('177', '1', '1'),
    ('177', '2', '1'),
    ('177', '5', '1'),
    ('177', '15', '1'),
    ('178', '1', '1'),
    ('178', '2', '1'),
    ('178', '5', '1'),
    ('178', '15', '1'),
    ('179', '1', '1'),
    ('179', '2', '1'),
    ('179', '4', '1'),
    ('179', '5', '1'),
    ('179', '15', '1'),
    ('180', '1', '1'),
    ('180', '2', '1'),
    ('180', '5', '1'),
    ('180', '15', '1'),
    ('181', '2', '1'),
    ('181', '1', '1'),
    ('181', '5', '1'),
    ('181', '15', '1'),
    ('182', '1', '1'),
    ('182', '2', '1'),
    ('182', '5', '1'),
    ('182', '15', '1'),
    ('183', '1', '1'),
    ('183', '2', '1'),
    ('183', '5', '1'),
    ('183', '15', '1'),
    ('184', '1', '1'),
    ('184', '2', '1'),
    ('184', '5', '1'),
    ('184', '15', '1'),
    ('185', '1', '1'),
    ('185', '2', '1'),
    ('185', '5', '1'),
    ('185', '15', '1'),
    ('186', '1', '1'),
    ('186', '2', '1'),
    ('186', '5', '1'),
    ('186', '15', '1'),
    ('187', '1', '1'),
    ('187', '2', '1'),
    ('187', '5', '1'),
    ('187', '15', '1'),
    ('188', '1', '1'),
    ('188', '2', '1'),
    ('188', '5', '1'),
    ('188', '15', '1'),
    ('189', '1', '1'),
    ('189', '2', '1'),
    ('189', '5', '1'),
    ('189', '15', '1'),
    ('190', '1', '1'),
    ('190', '2', '1'),
    ('190', '5', '1'),
    ('190', '15', '1'),
    ('191', '1', '1'),
    ('191', '2', '1'),
    ('191', '5', '1'),
    ('191', '15', '1'),
    ('192', '1', '1'),
    ('192', '2', '1'),
    ('192', '5', '1'),
    ('192', '15', '1'),
    ('193', '1', '1'),
    ('193', '2', '1'),
    ('193', '5', '1'),
    ('193', '15', '1'),
    ('194', '1', '1'),
    ('194', '2', '1'),
    ('194', '5', '1'),
    ('194', '15', '1'),
    ('195', '1', '1'),
    ('195', '2', '1'),
    ('195', '5', '1'),
    ('195', '15', '1'),
    ('196', '1', '1'),
    ('196', '2', '1'),
    ('196', '5', '1'),
    ('196', '15', '1'),
    ('197', '1', '1'),
    ('197', '2', '1'),
    ('197', '5', '1'),
    ('197', '15', '1'),
    ('198', '1', '1'),
    ('198', '2', '1'),
    ('198', '5', '1'),
    ('198', '15', '1'),
    ('199', '1', '1'),
    ('199', '2', '1'),
    ('199', '5', '1'),
    ('199', '15', '1'),
    ('200', '1', '1'),
    ('200', '2', '1'),
    ('200', '5', '1'),
    ('200', '15', '1'),
    ('201', '1', '1'),
    ('201', '2', '1'),
    ('201', '5', '1'),
    ('201', '15', '1'),
    ('202', '1', '1'),
    ('202', '2', '1'),
    ('202', '5', '1'),
    ('202', '15', '1'),
    ('203', '1', '1'),
    ('203', '2', '1'),
    ('203', '5', '1'),
    ('203', '15', '1'),
    ('204', '1', '1'),
    ('204', '2', '1'),
    ('204', '5', '1'),
    ('204', '15', '1'),
    ('205', '1', '1'),
    ('205', '2', '1'),
    ('205', '5', '1'),
    ('206', '1', '1'),
    ('206', '2', '1'),
    ('206', '5', '1'),
    ('206', '15', '1'),
    ('207', '1', '1'),
    ('207', '2', '1'),
    ('207', '5', '1'),
    ('207', '15', '1'),
    ('208', '1', '1'),
    ('208', '2', '1'),
    ('208', '5', '1'),
    ('208', '15', '1'),
    ('209', '1', '1'),
    ('209', '2', '1'),
    ('209', '5', '1'),
    ('209', '15', '1'),
    ('210', '1', '1'),
    ('210', '2', '1'),
    ('210', '5', '1'),
    ('210', '15', '1'),
    ('211', '1', '1'),
    ('211', '2', '1'),
    ('211', '5', '1'),
    ('211', '15', '1'),
    ('212', '1', '1'),
    ('212', '2', '1'),
    ('212', '5', '1'),
    ('212', '15', '1'),
    ('213', '1', '1'),
    ('213', '2', '1'),
    ('213', '5', '1'),
    ('213', '15', '1'),
    ('214', '1', '1'),
    ('214', '2', '1'),
    ('214', '5', '1'),
    ('214', '15', '1'),
    ('215', '1', '1'),
    ('215', '2', '1'),
    ('215', '5', '1'),
    ('215', '15', '1'),
    ('216', '1', '1'),
    ('216', '2', '1'),
    ('216', '5', '1'),
    ('216', '15', '1'),
    ('217', '1', '1'),
    ('217', '2', '1'),
    ('217', '5', '1'),
    ('217', '15', '1'),
    ('218', '1', '1'),
    ('218', '2', '1'),
    ('218', '5', '1'),
    ('218', '15', '1'),
    ('219', '1', '1'),
    ('219', '2', '1'),
    ('219', '5', '1'),
    ('219', '15', '1'),
    ('220', '1', '1'),
    ('220', '2', '1'),
    ('220', '5', '1'),
    ('220', '15', '1'),
    ('221', '1', '1'),
    ('221', '2', '1'),
    ('221', '5', '1'),
    ('221', '15', '1'),
    ('222', '1', '1'),
    ('222', '2', '1'),
    ('222', '5', '1'),
    ('222', '15', '1'),
    ('223', '1', '1'),
    ('223', '2', '1'),
    ('223', '5', '1'),
    ('223', '15', '1'),
    ('224', '1', '1'),
    ('224', '2', '1'),
    ('224', '3', '1'),
    ('224', '5', '1'),
    ('224', '15', '1'),
    ('225', '1', '1'),
    ('225', '2', '1'),
    ('225', '5', '1'),
    ('225', '15', '1'),
    ('226', '1', '1'),
    ('226', '2', '1'),
    ('226', '5', '1'),
    ('226', '15', '1'),
    ('227', '1', '1'),
    ('227', '2', '1'),
    ('227', '5', '1'),
    ('227', '15', '1'),
    ('228', '1', '1'),
    ('228', '2', '1'),
    ('228', '5', '1'),
    ('228', '15', '1'),
    ('229', '1', '1'),
    ('229', '2', '1'),
    ('229', '5', '1'),
    ('229', '15', '1'),
    ('230', '1', '1'),
    ('230', '2', '1'),
    ('230', '5', '1'),
    ('230', '15', '1'),
    ('231', '1', '1'),
    ('231', '2', '1'),
    ('231', '5', '1'),
    ('231', '15', '1'),
    ('232', '1', '1'),
    ('232', '2', '1'),
    ('232', '5', '1'),
    ('232', '15', '1'),
    ('233', '1', '1'),
    ('233', '2', '1'),
    ('233', '5', '1'),
    ('233', '15', '1'),
    ('234', '1', '1'),
    ('234', '2', '1'),
    ('234', '5', '1'),
    ('234', '15', '1'),
    ('235', '1', '1'),
    ('235', '2', '1'),
    ('235', '5', '1'),
    ('235', '15', '1'),
    ('236', '1', '1'),
    ('236', '2', '1'),
    ('236', '5', '1'),
    ('236', '15', '1'),
    ('237', '1', '1'),
    ('237', '5', '1'),
    ('237', '2', '1'),
    ('237', '15', '1'),
    ('238', '1', '1'),
    ('238', '2', '1'),
    ('238', '5', '1'),
    ('238', '15', '1'),
    ('239', '1', '1'),
    ('239', '2', '1'),
    ('239', '5', '1'),
    ('239', '15', '1'),
    ('240', '2', '1'),
    ('240', '1', '1'),
    ('240', '5', '1'),
    ('240', '15', '1'),
    ('241', '1', '1'),
    ('241', '2', '1'),
    ('241', '5', '1'),
    ('241', '15', '1'),
    ('242', '1', '1'),
    ('242', '2', '1'),
    ('242', '5', '1'),
    ('242', '15', '1'),
    ('243', '1', '1'),
    ('243', '2', '1'),
    ('243', '5', '1'),
    ('243', '15', '1'),
    ('244', '1', '1'),
    ('244', '2', '1'),
    ('244', '5', '1'),
    ('244', '15', '1'),
    ('245', '1', '1'),
    ('245', '2', '1'),
    ('245', '5', '1'),
    ('245', '15', '1'),
    ('246', '1', '1'),
    ('246', '2', '1'),
    ('246', '5', '1'),
    ('246', '15', '1'),
    ('247', '1', '1'),
    ('247', '2', '1'),
    ('247', '3', '1'),
    ('247', '5', '1'),
    ('247', '15', '1'),
    ('248', '1', '1'),
    ('248', '2', '1'),
    ('248', '5', '1'),
    ('248', '15', '1'),
    ('249', '1', '1'),
    ('249', '2', '1'),
    ('249', '5', '1'),
    ('249', '15', '1'),
    ('250', '1', '1'),
    ('250', '3', '1'),
    ('250', '5', '1'),
    ('250', '6', '1'),
    ('250', '15', '1'),
    ('251', '1', '1'),
    ('251', '3', '1'),
    ('251', '5', '1'),
    ('251', '6', '1'),
    ('251', '15', '1'),
    ('252', '1', '1'),
    ('252', '3', '1'),
    ('252', '5', '1'),
    ('252', '6', '1'),
    ('252', '15', '1'),
    ('253', '1', '1'),
    ('253', '3', '1'),
    ('253', '5', '1'),
    ('253', '6', '1'),
    ('253', '15', '1'),
    ('254', '1', '1'),
    ('254', '3', '1'),
    ('254', '5', '1'),
    ('254', '6', '1'),
    ('254', '15', '1'),
    ('255', '1', '1'),
    ('255', '3', '1'),
    ('255', '2', '1'),
    ('255', '5', '1'),
    ('255', '6', '1'),
    ('255', '15', '1'),
    ('256', '1', '1'),
    ('256', '3', '1'),
    ('256', '5', '1'),
    ('256', '6', '1'),
    ('256', '15', '1'),
    ('257', '1', '1'),
    ('257', '2', '1'),
    ('257', '3', '1'),
    ('257', '5', '1'),
    ('257', '6', '1'),
    ('257', '15', '1'),
    ('258', '1', '1'),
    ('258', '2', '1'),
    ('258', '3', '1'),
    ('258', '5', '1'),
    ('258', '6', '1'),
    ('258', '15', '1'),
    ('259', '1', '1'),
    ('259', '3', '1'),
    ('259', '5', '1'),
    ('259', '6', '1'),
    ('259', '15', '1'),
    ('260', '1', '1'),
    ('260', '3', '1'),
    ('260', '5', '1'),
    ('260', '6', '1'),
    ('260', '15', '1');



--
-- Data for Name: components; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.components (component_id, component_name, completion_date, start_date, deadline, status, equipment_id, department_id, component_recipe_id, total_time_spent)
VALUES
    ('18', 'teste', '2026-01-08 14:29:00', '2026-01-12 00:00:00', '2026-01-12 00:00:00', 'Pending', '3', '1', NULL, '12'),
    ('33', 'Laminação Casco', NULL, '2025-12-19 11:48:36.649266', '2025-12-19 12:33:36.649266', 'Completed', '15', NULL, NULL, '0'),
    ('36', 'Laminação Casco', '2026-01-15 12:45:00', '2025-12-19 14:48:00', '2025-12-19 15:33:00', 'Pending', '16', NULL, NULL, '0'),
    ('38', 'Montagem Tanque', '2026-02-25 12:29:00', '2025-12-16 00:00:00', '2025-12-17 00:00:00', 'Completed', '17', NULL, NULL, '0'),
    ('4', 'Montagem Tanque', NULL, '2025-02-02 00:00:00', '2025-02-25 00:00:00', 'Running', '3', '1', NULL, '0'),
    ('39', 'Revestimento Interno', '2026-01-31 12:29:00', '2025-12-29 00:00:00', '2025-12-30 00:00:00', 'Completed', '17', NULL, NULL, '0'),
    ('35', 'Reforço Estrutural', NULL, '2025-12-19 12:48:36.649266', '2025-12-27 00:00:00', 'Completed', '15', NULL, NULL, '0'),
    ('34', 'Acabamento Externo', NULL, '2025-12-02 00:00:00', '2025-12-19 14:33:36.649266', 'Completed', '15', NULL, NULL, '0'),
    ('37', 'Acabamento Externo', '2026-01-15 12:45:00', '2025-12-19 15:48:36.649266', '2025-12-19 16:33:36.649266', 'Pending', '16', NULL, NULL, '0'),
    ('3', 'Acabamento Externo', NULL, '2025-02-15 00:00:00', '2025-03-20 00:00:00', 'Pending', '2', '1', NULL, '0'),
    ('42', 'Laminado Planificado do Corpo 2,5 DN x 5,7 AL', NULL, NULL, NULL, 'Pending', '18', NULL, '97', '0'),
    ('43', 'Laminado Planificado do Corpo 2,5 DN x 5,7 AL', NULL, NULL, NULL, 'Pending', '18', NULL, '98', '0'),
    ('44', 'Laminado Planificado do Corpo 2,5 DN x 5,6 AL', NULL, NULL, NULL, 'Pending', '18', NULL, '96', '0'),
    ('45', 'Laminado Planificado do Corpo 2,5 DN x 5,5 AL', NULL, NULL, NULL, 'Pending', '18', NULL, '95', '0'),
    ('46', 'Fundo em PRFV 2,5m', NULL, NULL, NULL, 'Pending', '19', NULL, '15', '0'),
    ('47', 'Laminado Planificado do Corpo 2,5 DN x 5 AL', NULL, NULL, NULL, 'Pending', '19', NULL, '93', '0'),
    ('48', 'Laminado Planificado do Corpo 2,5 DN x 5,7 AL', NULL, NULL, NULL, 'Pending', '19', NULL, '97', '0'),
    ('49', 'Laminado Planificado do Corpo 2,5 DN x 5,7 AL', NULL, NULL, NULL, 'Pending', '19', NULL, '98', '0'),
    ('50', 'Laminado Planificado do Corpo 2,5 DN x 5,6 AL', NULL, NULL, NULL, 'Pending', '19', NULL, '96', '0'),
    ('51', 'Laminado Planificado do Corpo 2,5 DN x 5,5 AL', NULL, NULL, NULL, 'Pending', '19', NULL, '95', '0'),
    ('41', 'Laminado Planificado do Corpo 2,5 DN x 5 AL', '2026-05-26 12:45:00', NULL, NULL, 'Pending', '18', NULL, '93', '0'),
    ('52', 'Laminado Planificado do Corpo 2 DN x 6,2 AL', '2026-05-25 19:05:00', '2026-05-25 15:01:00', '2026-05-25 16:01:00', 'Pending', '18', '1', '79', '0'),
    ('40', 'Fundo em PRFV 2,5m', '2026-05-25 10:46:00', NULL, NULL, 'Pending', '18', NULL, '15', '0'),
    ('1', 'Laminação Casco', '2026-05-14 16:58:00', '2025-01-12 00:00:00', '2025-02-20 00:00:00', 'Running', '1', '1', NULL, '0'),
    ('2', 'Reforço Estrutural', '2026-05-06 17:57:00', '2025-01-25 00:00:00', '2025-03-05 00:00:00', 'Pending', '1', '1', NULL, '0');



--
-- Data for Name: components_materials; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.components_materials (component_id, material_id, consumed_quantity, consumption_log_id, consumption_date, user_id, consumption_type)
VALUES
    ('1', '1', '12.5', '1', '2025-12-04 11:16:15.865707', '3', 'consumido'),
    ('1', '2', '9.0', '2', '2025-12-04 11:16:15.865707', '3', 'consumido'),
    ('2', '2', '5.0', '4', '2025-12-04 11:16:15.865707', '5', 'consumido'),
    ('2', '3', '2.0', '5', '2025-12-04 11:16:15.865707', '5', 'consumido'),
    ('3', '1', '3.0', '6', '2025-12-04 11:16:15.865707', '4', 'consumido'),
    ('3', '7', '1.2', '7', '2025-12-04 11:16:15.865707', '4', 'consumido'),
    ('4', '1', '4.5', '8', '2025-12-04 11:16:15.865707', '3', 'consumido'),
    ('4', '6', '3.0', '9', '2025-12-04 11:16:15.865707', '3', 'consumido'),
    ('18', '2', '7.8', '29', '2026-01-06 08:49:12.649073', '2', 'consumido'),
    ('36', '1', '100', '33', '2026-01-14 15:47:12.887469', '2', 'consumido'),
    ('36', '6', '80', '34', '2026-01-14 15:47:12.948674', '2', 'consumido'),
    ('36', '2', '80', '35', '2026-01-14 15:47:12.949564', '2', 'consumido'),
    ('18', '2', '-0.8', '32', '2026-01-06 08:58:04.019569', '2', 'consumido'),
    ('1', '6', '7.5', '3', '2025-12-04 11:16:15.865707', '3', 'refugo'),
    ('18', '4', '10', '30', '2026-01-06 08:49:12.650465', '2', 'refugo'),
    ('18', '3', '20', '31', '2026-01-06 08:49:12.658594', '2', 'refugo'),
    ('39', '7', '5', '36', '2026-01-27 14:23:07.30716', '2', 'consumido'),
    ('39', '7', '7', '37', '2026-01-27 14:23:07.354424', '2', 'refugo');



--
-- Data for Name: components_timesheets; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.components_timesheets (timesheet_id, component_id, user_id, start_time, end_time, created_at)
VALUES
    ('1', '36', '4', '2025-12-19 14:48:00', '2025-12-19 16:48:00', '2026-01-15 10:36:04.404336'),
    ('2', '39', '6', '2026-01-15 11:25:00', '2026-01-15 14:25:00', '2026-01-15 11:25:22.954685'),
    ('3', '39', '6', '2026-01-15 11:28:00', '2026-01-15 15:28:00', '2026-01-15 11:28:05.444036');



--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.departments (department_id, department_name)
VALUES
    ('1', 'Produção'),
    ('2', 'Manutenção'),
    ('3', 'Administração'),
    ('4', 'Financeiro'),
    ('5', 'Engenharia'),
    ('6', 'Logística');



--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.employees (user_id, salary, performance, job_title, department_id)
VALUES
    ('4', '3500', '0.88', 'Técnico de Manutenção', '2'),
    ('5', '7000', '0.9', 'Engenheiro de Processos', '5'),
    ('6', '2800', '0.7', 'Auxiliar de Logística', '6'),
    ('3', '3000', '1', 'Operador de Máquina', '1'),
    ('2', '10000', '1', 'Gerente da Produção', '1');



--
-- Data for Name: employees_components; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.employees_components (user_id, component_id)
VALUES
    ('3', '1'),
    ('5', '2'),
    ('4', '3'),
    ('3', '4'),
    ('2', '18'),
    ('3', '18'),
    ('4', '18'),
    ('6', '39'),
    ('2', '52'),
    ('3', '52');



--
-- Data for Name: equipment_recipes; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.equipment_recipes (equipment_recipe_id, recipe_name)
VALUES
    ('1', 'Casco do Barco 28 pés'),
    ('2', 'Convés do Barco 28 pés'),
    ('3', 'Tanque Cilíndrico 2000L'),
    ('36', 'UASB 4 DN X 5,5 AL EM PRFV'),
    ('38', 'FLOCULADOR 2,5 X 5,5');



--
-- Data for Name: equipment_recipes_component_recipes; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.equipment_recipes_component_recipes (equipment_recipe_id, component_recipe_id, quantity_plan, id, planned_start_at, planned_end_at)
VALUES
    ('36', '27', '1', '38', '2026-04-13 00:00:00', '2026-04-14 00:00:00'),
    ('36', '21', '1', '37', '2026-04-13 00:00:00', '2026-04-13 00:00:00'),
    ('38', '15', '1', '44', NULL, NULL),
    ('38', '93', '1', '46', NULL, NULL),
    ('38', '97', '1', '47', NULL, NULL),
    ('38', '98', '1', '48', NULL, NULL),
    ('38', '96', '1', '49', NULL, NULL),
    ('38', '95', '1', '50', NULL, NULL);



--
-- Data for Name: equipments; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.equipments (equipment_id, equipment_name, start_date, end_date, deadline, project_id, equipment_recipe_id)
VALUES
    ('1', 'Mesa de Laminação 01', '2025-01-10', NULL, '2025-05-01', '1', NULL),
    ('2', 'Mesa de Laminação 02', '2025-01-10', NULL, '2025-05-01', '1', NULL),
    ('3', 'Cortadora de Fibra', '2025-01-15', NULL, '2025-04-20', '2', NULL),
    ('4', 'Tanque de Mistura 500L', '2025-02-01', NULL, '2025-03-20', '2', NULL),
    ('15', 'Casco do Barco 28 pés', '2025-12-02', NULL, '2025-12-27', '17', '1'),
    ('16', 'Convés do Barco 28 pés', '2025-12-19', NULL, '2025-12-19', '17', '2'),
    ('17', 'Tanque Cilíndrico 2000L', '2025-12-16', NULL, '2025-12-30', '17', '3'),
    ('18', 'FLOCULADOR 2,5 X 5,5', NULL, NULL, NULL, '18', '38'),
    ('19', 'FLOCULADOR 2,5 X 5,5', NULL, NULL, NULL, '19', '38');



--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.materials (material_id, material_name, material_desc, value, uni)
VALUES
    ('1', 'Resina', 'Resina poliéster padrão para laminação', '18.5', 'Kg'),
    ('2', 'Roving', 'Fibra de vidro roving para reforço estrutural', '12', 'Kg'),
    ('3', 'Tecido (Kg)', 'Tecido biaxial/fibra de vidro vendido por peso', '25', 'Kg'),
    ('4', 'Tecido (camadas)', 'Tecido estrutural contado por camadas', '3.5', 'camada'),
    ('5', 'Catalisador', 'Catalisador MEKP utilizado na cura da resina', '42', 'Kg'),
    ('6', 'Manta', 'Manta de fibra de vidro para laminação', '10', 'Kg'),
    ('7', 'Resina ISO', 'Resina ISO específica para aplicações de alta resistência', '32', 'Kg'),
    ('10', 'TESTE', 'BLÁ BLÁ BLÁ', '100', 'Kg'),
    ('11', 'texte sss', 'sfaef', '58', 'kg'),
    ('12', 'bfdsffdger', 'gfdd', '85', 't'),
    ('13', 'rgaer', 'rgrg', '58', 'kg'),
    ('15', 'Horas Homem', 'Horas Homem', '26', 'Uni');



--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.projects (project_id, project_name, project_desc, project_local, start_date, completion_date, deadline, status, budget_id)
VALUES
    ('1', 'Construção Barco 28 pés', 'Projeto para fabricação completa de embarcação 28 pés', 'Aracati', '2025-01-10', NULL, '2025-04-30', 'Running', NULL),
    ('2', 'Produção Tanque 2000L', 'Projeto de produção de tanque cilíndrico industrial de 2000 litros', 'Fortaleza', '2025-02-01', NULL, '2025-03-15', 'Running', NULL),
    ('17', 'teste', 'desc', 'teste', '2025-12-02', NULL, '2025-12-30', 'Pending', '3'),
    ('18', 'EDMIL - ETA BARRO PRETO ', 'desc', 'SANTANA DO  ACARAÚ', NULL, NULL, NULL, 'Pending', '12'),
    ('19', 'EDMIL - ETA BARRO PRETO ', 'desc', 'SANTANA DO  ACARAÚ', NULL, NULL, NULL, 'Pending', '12');



--
-- Data for Name: projects_users; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.projects_users (user_id, project_id)
VALUES
    ('2', '1'),
    ('3', '1'),
    ('4', '1'),
    ('5', '1'),
    ('6', '1'),
    ('2', '2'),
    ('3', '2'),
    ('5', '2'),
    ('2', '17'),
    ('2', '18'),
    ('2', '19');



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: gerente_pcp
--

INSERT INTO public.users (user_id, email, user_name, password, access_type)
VALUES
    ('7', 'teste@tecnosan.com', 'Teste', '$2b$14$BfT9qZd/xXXf0TYLYFfVCOlhreyHvbfTQiVdBJQR3VVw5Sh5oLaQ6', '1'),
    ('3', 'joao.silva@tecnosan.com', 'João Silva', '$2b$14$1Dag0mLNom/JDV51yTPONeRA.V0gXNslIJp78ZUqVPwHrSax/KGry', '3'),
    ('2', 'gerente.producao@tecnosan.com', 'Gerente Produção', '$2b$11$rqOFULKjdz.TmbHrS3OkBOU9mO7An.lGyFl.opff7lFafJj3LUeSC', '2'),
    ('1', 'admin@tecnosan.com', 'Administrador', '$2b$13$eqgcmvoQ4O.zkCEr6qvkv.s3L0hMHyDyJu84FnX6YKg9/bsCFM7ma', '1'),
    ('4', 'maria.oliveira@tecnosan.com', 'Maria Oliveira', '$2b$10$fFF4rBgwWidGMXfa/adye.QetDA.7YUdJetqh3xAwImiEV74Anv8e', '3'),
    ('5', 'carlos.souza@tecnosan.com', 'Carlos Souza', '$2b$12$QNisNUNqRGWIHn16Gmp.h..OpGcaJsOANeaeW3h9brZWe73Jpd68a', '3'),
    ('6', 'ana.lima@tecnosan.com', 'Ana Lima', '$2b$10$As2JRYhi5g/3PboCdiTdR.Mdp6ow7w9ijr0aZksBJC4LAMYcBUG1C', '3');



--
-- Name: absent_absent_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.absent_absent_id_seq', 1, false);


--
-- Name: accessories_accessory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.accessories_accessory_id_seq', 2, true);


--
-- Name: accessories_budgets_movement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.accessories_budgets_movement_id_seq', 3, true);


--
-- Name: accessories_projects_movement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.accessories_projects_movement_id_seq', 2, true);


--
-- Name: budgets_budget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.budgets_budget_id_seq', 12, true);


--
-- Name: clocked_clocked_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.clocked_clocked_id_seq', 1, false);


--
-- Name: component_recipes_component_recipe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.component_recipes_component_recipe_id_seq', 260, true);


--
-- Name: components_component_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.components_component_id_seq', 52, true);


--
-- Name: components_materials_consumption_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.components_materials_consumption_log_id_seq', 37, true);


--
-- Name: components_timesheets_timesheet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.components_timesheets_timesheet_id_seq', 3, true);


--
-- Name: departments_department_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.departments_department_id_seq', 6, true);


--
-- Name: equipment_recipes_component_recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.equipment_recipes_component_recipes_id_seq', 50, true);


--
-- Name: equipment_recipes_equipment_recipe_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.equipment_recipes_equipment_recipe_id_seq', 38, true);


--
-- Name: equipments_equipment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.equipments_equipment_id_seq', 19, true);


--
-- Name: materials_material_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.materials_material_id_seq', 15, true);


--
-- Name: projects_project_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.projects_project_id_seq', 19, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: gerente_pcp
--

SELECT pg_catalog.setval('public.users_user_id_seq', 7, true);


--
-- Name: absent_employee absent_employee_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.absent_employee
    ADD CONSTRAINT absent_employee_pkey PRIMARY KEY (user_id, absent_id);


--
-- Name: absent absent_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.absent
    ADD CONSTRAINT absent_pkey PRIMARY KEY (absent_id);


--
-- Name: accessories_budgets accessories_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_budgets
    ADD CONSTRAINT accessories_budgets_pkey PRIMARY KEY (movement_id);


--
-- Name: accessories accessories_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories
    ADD CONSTRAINT accessories_pkey PRIMARY KEY (accessory_id);


--
-- Name: accessories_projects accessories_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_projects
    ADD CONSTRAINT accessories_projects_pkey PRIMARY KEY (movement_id);


--
-- Name: budgets_equipments_recipes budgets_equipments_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.budgets_equipments_recipes
    ADD CONSTRAINT budgets_equipments_recipes_pkey PRIMARY KEY (budget_id, equipment_recipe_id);


--
-- Name: budgets budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.budgets
    ADD CONSTRAINT budgets_pkey PRIMARY KEY (budget_id);


--
-- Name: budgets_users budgets_users_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.budgets_users
    ADD CONSTRAINT budgets_users_pkey PRIMARY KEY (user_id, budget_id);


--
-- Name: clocked_employee clocked_employee_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.clocked_employee
    ADD CONSTRAINT clocked_employee_pkey PRIMARY KEY (user_id, clocked_id);


--
-- Name: clocked clocked_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.clocked
    ADD CONSTRAINT clocked_pkey PRIMARY KEY (clocked_id);


--
-- Name: component_recipes_materials component_recipes_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.component_recipes_materials
    ADD CONSTRAINT component_recipes_materials_pkey PRIMARY KEY (component_recipe_id, material_id);


--
-- Name: component_recipes component_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.component_recipes
    ADD CONSTRAINT component_recipes_pkey PRIMARY KEY (component_recipe_id);


--
-- Name: components_materials components_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components_materials
    ADD CONSTRAINT components_materials_pkey PRIMARY KEY (consumption_log_id);


--
-- Name: components components_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components
    ADD CONSTRAINT components_pkey PRIMARY KEY (component_id);


--
-- Name: components_timesheets components_timesheets_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components_timesheets
    ADD CONSTRAINT components_timesheets_pkey PRIMARY KEY (timesheet_id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_id);


--
-- Name: employees_components employees_components_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.employees_components
    ADD CONSTRAINT employees_components_pkey PRIMARY KEY (user_id, component_id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (user_id);


--
-- Name: equipment_recipes_component_recipes equipment_recipes_component_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.equipment_recipes_component_recipes
    ADD CONSTRAINT equipment_recipes_component_recipes_pkey PRIMARY KEY (id);


--
-- Name: equipment_recipes equipment_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.equipment_recipes
    ADD CONSTRAINT equipment_recipes_pkey PRIMARY KEY (equipment_recipe_id);


--
-- Name: equipments equipments_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.equipments
    ADD CONSTRAINT equipments_pkey PRIMARY KEY (equipment_id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (material_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (project_id);


--
-- Name: projects_users projects_users_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT projects_users_pkey PRIMARY KEY (project_id, user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_timesheets_component; Type: INDEX; Schema: public; Owner: gerente_pcp
--

CREATE INDEX idx_timesheets_component ON public.components_timesheets USING btree (component_id);


--
-- Name: idx_timesheets_user; Type: INDEX; Schema: public; Owner: gerente_pcp
--

CREATE INDEX idx_timesheets_user ON public.components_timesheets USING btree (user_id);


--
-- Name: vw_component_hours _RETURN; Type: RULE; Schema: public; Owner: gerente_pcp
--

CREATE OR REPLACE VIEW public.vw_component_hours AS
 SELECT c.component_id,
    c.equipment_id,
    c.component_name,
    c.start_date AS planned_start,
    c.deadline AS planned_end,
    min(ct.start_time) AS real_start,
    c.completion_date AS real_end,
    COALESCE(round(sum((EXTRACT(epoch FROM (ct.end_time - ct.start_time)) / (3600)::numeric)), 2), (0)::numeric) AS total_hours,
    count(DISTINCT ct.user_id) AS qtd_employees
   FROM (public.components c
     LEFT JOIN public.components_timesheets ct ON ((c.component_id = ct.component_id)))
  GROUP BY c.component_id, c.equipment_id, c.start_date, c.deadline, c.completion_date;


--
-- Name: vw_components_recipes_materials_summary _RETURN; Type: RULE; Schema: public; Owner: gerente_pcp
--

CREATE OR REPLACE VIEW public.vw_components_recipes_materials_summary AS
 SELECT cr.component_recipe_id,
    cr.recipe_name,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 1) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS resina,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 7) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS resina_iso,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 6) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS manta,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 2) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS roving,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 5) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS catalizador,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 3) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS tecido_kg,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 4) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS tecido_cmd,
    COALESCE(cr.man_hours, (0)::numeric) AS horas_homem,
    COALESCE(sum(((crm.quantity_plan)::double precision * m.value)), (0)::double precision) AS total_value,
    cr.qtd_employees,
    cr.qtd_hours
   FROM ((public.component_recipes cr
     LEFT JOIN public.component_recipes_materials crm ON ((cr.component_recipe_id = crm.component_recipe_id)))
     LEFT JOIN public.materials m ON ((crm.material_id = m.material_id)))
  GROUP BY cr.component_recipe_id, cr.recipe_name
  ORDER BY cr.recipe_name;


--
-- Name: vw_material_details_equipment_recipes _RETURN; Type: RULE; Schema: public; Owner: gerente_pcp
--

CREATE OR REPLACE VIEW public.vw_material_details_equipment_recipes AS
 SELECT cr.component_recipe_id AS equipment_recipe_id,
    cr.recipe_name,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 1) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS resina,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 7) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS resina_iso,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 6) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS manta,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 2) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS roving,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 5) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS catalizador,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 3) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS tecido_kg,
    COALESCE(sum(
        CASE
            WHEN (m.material_id = 4) THEN crm.quantity_plan
            ELSE (0)::numeric
        END), (0)::numeric) AS tecido_cmd,
    COALESCE(cr.man_hours, (0)::numeric) AS horas_homem,
    COALESCE(sum(((crm.quantity_plan)::double precision * m.value)), (0)::double precision) AS total_value
   FROM ((public.component_recipes cr
     LEFT JOIN public.component_recipes_materials crm ON ((cr.component_recipe_id = crm.component_recipe_id)))
     LEFT JOIN public.materials m ON ((crm.material_id = m.material_id)))
  GROUP BY cr.component_recipe_id, cr.recipe_name
  ORDER BY cr.recipe_name;


--
-- Name: equipments trg_auto_create_components; Type: TRIGGER; Schema: public; Owner: gerente_pcp
--

CREATE TRIGGER trg_auto_create_components AFTER INSERT ON public.equipments FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_components();


--
-- Name: projects trg_auto_create_equipments; Type: TRIGGER; Schema: public; Owner: gerente_pcp
--

CREATE TRIGGER trg_auto_create_equipments AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.fn_auto_create_equipments();


--
-- Name: projects trg_calc_project_dates; Type: TRIGGER; Schema: public; Owner: gerente_pcp
--

CREATE TRIGGER trg_calc_project_dates BEFORE INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.fn_calc_project_dates();


--
-- Name: accessories_projects trg_status_project; Type: TRIGGER; Schema: public; Owner: gerente_pcp
--

CREATE TRIGGER trg_status_project AFTER INSERT OR UPDATE ON public.accessories_projects FOR EACH ROW EXECUTE FUNCTION public.fn_auto_status_accessory();


--
-- Name: absent_employee absent_employee_absent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.absent_employee
    ADD CONSTRAINT absent_employee_absent_id_fkey FOREIGN KEY (absent_id) REFERENCES public.absent(absent_id) ON DELETE CASCADE;


--
-- Name: absent_employee absent_employee_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.absent_employee
    ADD CONSTRAINT absent_employee_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.employees(user_id) ON DELETE CASCADE;


--
-- Name: accessories_budgets accessories_budgets_accessory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_budgets
    ADD CONSTRAINT accessories_budgets_accessory_id_fkey FOREIGN KEY (accessory_id) REFERENCES public.accessories(accessory_id);


--
-- Name: accessories_budgets accessories_budgets_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_budgets
    ADD CONSTRAINT accessories_budgets_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(budget_id) ON DELETE CASCADE;


--
-- Name: accessories_budgets accessories_budgets_received_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_budgets
    ADD CONSTRAINT accessories_budgets_received_by_user_id_fkey FOREIGN KEY (received_by_user_id) REFERENCES public.users(user_id);


--
-- Name: accessories_budgets accessories_budgets_taken_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_budgets
    ADD CONSTRAINT accessories_budgets_taken_by_user_id_fkey FOREIGN KEY (taken_by_user_id) REFERENCES public.users(user_id);


--
-- Name: accessories_projects accessories_projects_accessory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_projects
    ADD CONSTRAINT accessories_projects_accessory_id_fkey FOREIGN KEY (accessory_id) REFERENCES public.accessories(accessory_id);


--
-- Name: accessories_projects accessories_projects_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_projects
    ADD CONSTRAINT accessories_projects_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: accessories_projects accessories_projects_received_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_projects
    ADD CONSTRAINT accessories_projects_received_by_user_id_fkey FOREIGN KEY (received_by_user_id) REFERENCES public.users(user_id);


--
-- Name: accessories_projects accessories_projects_taken_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.accessories_projects
    ADD CONSTRAINT accessories_projects_taken_by_user_id_fkey FOREIGN KEY (taken_by_user_id) REFERENCES public.users(user_id);


--
-- Name: projects budget_id; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT budget_id FOREIGN KEY (budget_id) REFERENCES public.budgets(budget_id);


--
-- Name: budgets_equipments_recipes budgets_equipments_recipes_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.budgets_equipments_recipes
    ADD CONSTRAINT budgets_equipments_recipes_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(budget_id) ON DELETE CASCADE;


--
-- Name: budgets_equipments_recipes budgets_equipments_recipes_equipment_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.budgets_equipments_recipes
    ADD CONSTRAINT budgets_equipments_recipes_equipment_recipe_id_fkey FOREIGN KEY (equipment_recipe_id) REFERENCES public.equipment_recipes(equipment_recipe_id) ON DELETE CASCADE;


--
-- Name: budgets_users budgets_users_budget_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.budgets_users
    ADD CONSTRAINT budgets_users_budget_id_fkey FOREIGN KEY (budget_id) REFERENCES public.budgets(budget_id) ON DELETE CASCADE;


--
-- Name: budgets_users budgets_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.budgets_users
    ADD CONSTRAINT budgets_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: clocked_employee clocked_employee_clocked_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.clocked_employee
    ADD CONSTRAINT clocked_employee_clocked_id_fkey FOREIGN KEY (clocked_id) REFERENCES public.clocked(clocked_id) ON DELETE CASCADE;


--
-- Name: clocked_employee clocked_employee_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.clocked_employee
    ADD CONSTRAINT clocked_employee_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.employees(user_id) ON DELETE CASCADE;


--
-- Name: component_recipes_materials component_recipes_materials_component_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.component_recipes_materials
    ADD CONSTRAINT component_recipes_materials_component_recipe_id_fkey FOREIGN KEY (component_recipe_id) REFERENCES public.component_recipes(component_recipe_id) ON DELETE CASCADE;


--
-- Name: component_recipes_materials component_recipes_materials_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.component_recipes_materials
    ADD CONSTRAINT component_recipes_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(material_id) ON DELETE CASCADE;


--
-- Name: components_materials components_materials_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components_materials
    ADD CONSTRAINT components_materials_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.components(component_id) ON DELETE CASCADE;


--
-- Name: components_materials components_materials_material_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components_materials
    ADD CONSTRAINT components_materials_material_id_fkey FOREIGN KEY (material_id) REFERENCES public.materials(material_id) ON DELETE CASCADE;


--
-- Name: components_materials components_materials_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components_materials
    ADD CONSTRAINT components_materials_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.employees(user_id);


--
-- Name: components_timesheets components_timesheets_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components_timesheets
    ADD CONSTRAINT components_timesheets_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.components(component_id) ON DELETE CASCADE;


--
-- Name: components_timesheets components_timesheets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components_timesheets
    ADD CONSTRAINT components_timesheets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.employees(user_id);


--
-- Name: components department_id; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components
    ADD CONSTRAINT department_id FOREIGN KEY (department_id) REFERENCES public.departments(department_id);


--
-- Name: employees_components employees_components_component_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.employees_components
    ADD CONSTRAINT employees_components_component_id_fkey FOREIGN KEY (component_id) REFERENCES public.components(component_id) ON DELETE CASCADE;


--
-- Name: employees_components employees_components_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.employees_components
    ADD CONSTRAINT employees_components_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.employees(user_id) ON DELETE CASCADE;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: components equipment_id; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components
    ADD CONSTRAINT equipment_id FOREIGN KEY (equipment_id) REFERENCES public.equipments(equipment_id) ON DELETE CASCADE;


--
-- Name: equipments equipment_recipe_id; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.equipments
    ADD CONSTRAINT equipment_recipe_id FOREIGN KEY (equipment_recipe_id) REFERENCES public.equipment_recipes(equipment_recipe_id);


--
-- Name: equipments equipments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.equipments
    ADD CONSTRAINT equipments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE SET NULL;


--
-- Name: equipment_recipes_component_recipes fk_component_recipe; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.equipment_recipes_component_recipes
    ADD CONSTRAINT fk_component_recipe FOREIGN KEY (component_recipe_id) REFERENCES public.component_recipes(component_recipe_id) ON DELETE CASCADE;


--
-- Name: components fk_components_recipes; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.components
    ADD CONSTRAINT fk_components_recipes FOREIGN KEY (component_recipe_id) REFERENCES public.component_recipes(component_recipe_id) ON DELETE SET NULL;


--
-- Name: equipment_recipes_component_recipes fk_equipment_recipe; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.equipment_recipes_component_recipes
    ADD CONSTRAINT fk_equipment_recipe FOREIGN KEY (equipment_recipe_id) REFERENCES public.equipment_recipes(equipment_recipe_id) ON DELETE CASCADE;


--
-- Name: projects_users projects_users_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT projects_users_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(project_id) ON DELETE CASCADE;


--
-- Name: projects_users projects_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: gerente_pcp
--

ALTER TABLE ONLY public.projects_users
    ADD CONSTRAINT projects_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--



--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--



--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--



--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--



--
-- PostgreSQL database dump complete
--


