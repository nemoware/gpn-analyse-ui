--liquibase formatted sql
--changeset developer:events.sql splitStatements:false

SET search_path = pg_catalog;

ALTER TABLE public.users
	DROP CONSTRAINT uniq_login;

ALTER TABLE public.roles
	DROP CONSTRAINT fk_roles_user;

ALTER TABLE public.roles
	DROP CONSTRAINT fk_roles_permissions;

ALTER TABLE ONLY public.permissions
	DROP COLUMN name;

ALTER TABLE ONLY public.permissions
	ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.permissions
	ALTER COLUMN id TYPE character varying(255) USING id::character varying(255); /* ТИП колонки изменился - Таблица: public.permissions оригинал: integer новый: character varying(255) */

CREATE SEQUENCE public.log_error_id_seq
	START WITH 1
	INCREMENT BY 1
	NO MAXVALUE
	NO MINVALUE
	CACHE 1;

ALTER SEQUENCE public.log_error_id_seq OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.f_has_permission(in_s_login character varying, in_s_role character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
v_count numeric;
BEGIN

select 
	count(*) into v_count 
    from
    permissions p
    join roles r on r.id_permission = p.id
    join users u on u.id = r.id_user
 where 
 	upper(u.login) = upper(in_s_login)
    and upper(p.id) = upper(in_s_role);
    
	if(v_count > 0) then return 1;
    else return 0;
    end if;
    
END;
$$;

ALTER FUNCTION public.f_has_permission(in_s_login character varying, in_s_role character varying) OWNER TO postgres;

CREATE TABLE public.events (
	id character varying(255) NOT NULL,
	description character varying(500),
	"createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
);

ALTER TABLE public.events OWNER TO postgres;

CREATE TABLE public.log_errors (
	id integer DEFAULT nextval('public.log_error_id_seq'::regclass) NOT NULL,
	login character varying(255),
	error text
);

ALTER TABLE public.log_errors OWNER TO postgres;

ALTER TABLE ONLY public.log_errors ALTER COLUMN id SET STATISTICS 0;

ALTER TABLE ONLY public.log_errors ALTER COLUMN login SET STATISTICS 0;

ALTER TABLE ONLY public.log_errors ALTER COLUMN error SET STATISTICS 0;

ALTER TABLE public.permissions
	ADD COLUMN app_page character varying(255);

ALTER TABLE public.logs
	ADD COLUMN id_event character varying(50) NOT NULL;

ALTER TABLE public.roles
	ALTER COLUMN id_permission TYPE character varying(255) USING id_permission::character varying(255); /* ТИП колонки изменился - Таблица: public.roles оригинал: integer новый: character varying(255) */

ALTER TABLE public.roles
	ADD CONSTRAINT fk_roles_id_user FOREIGN KEY (id_user) REFERENCES public.users(id);

ALTER TABLE public.roles
	ADD CONSTRAINT fk_roles_id_permission FOREIGN KEY (id_permission) REFERENCES public.permissions(id);

-- DEPCY: This CONSTRAINT is a dependency of CONSTRAINT: public.logs.fk_logs_id_event

ALTER TABLE public.events
	ADD CONSTRAINT events_pkey PRIMARY KEY (id);

ALTER TABLE public.logs
	ADD CONSTRAINT fk_logs_id_event FOREIGN KEY (id_event) REFERENCES public.events(id);

ALTER TABLE public.log_errors
	ADD CONSTRAINT log_error_pkey PRIMARY KEY (id);

ALTER SEQUENCE public.log_error_id_seq
	OWNED BY public.log_errors.id;

--rollback SET search_path = pg_catalog;
--rollback 
--rollback ALTER TABLE public.logs
--rollback 	DROP CONSTRAINT fk_logs_id_event;
--rollback 
--rollback ALTER TABLE public.events
--rollback 	DROP CONSTRAINT events_pkey;
--rollback 
--rollback ALTER TABLE public.log_errors
--rollback 	DROP CONSTRAINT log_error_pkey;
--rollback 
--rollback ALTER TABLE public.roles
--rollback 	DROP CONSTRAINT fk_roles_id_user;
--rollback 
--rollback ALTER TABLE public.roles
--rollback 	DROP CONSTRAINT fk_roles_id_permission;
--rollback 
--rollback ALTER TABLE ONLY public.logs
--rollback 	DROP COLUMN id_event;
--rollback 
--rollback DROP TABLE public.events;
--rollback 
--rollback DROP TABLE public.log_errors;
--rollback 
--rollback CREATE SEQUENCE public.permissions_id_seq
--rollback 	START WITH 1
--rollback 	INCREMENT BY 1
--rollback 	NO MAXVALUE
--rollback 	NO MINVALUE
--rollback 	CACHE 1;
--rollback 
--rollback ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;
--rollback 
--rollback CREATE OR REPLACE FUNCTION public.f_has_permission(in_s_login character varying, in_s_role character varying) RETURNS character varying
--rollback     LANGUAGE plpgsql
--rollback     AS $$
--rollback DECLARE
--rollback v_count numeric;
--rollback BEGIN
--rollback 
--rollback select 
--rollback 	count(*) into v_count 
--rollback     from
--rollback     permissions p
--rollback     join roles r on r.id_permission = p.id
--rollback     join users u on u.id = r.id_user
--rollback  where 
--rollback  	upper(u.login) = upper(in_s_login)
--rollback     and upper(p.name) = upper(in_s_role);
--rollback     
--rollback 	if(v_count > 0) then return 1;
--rollback     else return 0;
--rollback     end if;
--rollback     
--rollback END;
--rollback $$;
--rollback 
--rollback ALTER FUNCTION public.f_has_permission(in_s_login character varying, in_s_role character varying) OWNER TO postgres;
--rollback 
--rollback -- DEPCY: This CONSTRAINT depends on the TABLE: public.permissions
--rollback 
--rollback ALTER TABLE public.permissions
--rollback 	DROP CONSTRAINT permissions_pkey;
--rollback 
--rollback DROP TABLE public.permissions;
--rollback 
--rollback -- DEPCY: This TABLE is a dependency of COLUMN: public.permissions.name
--rollback 
--rollback CREATE TABLE public.permissions (
--rollback 	id integer DEFAULT nextval('public.permissions_id_seq'::regclass) NOT NULL,
--rollback 	name character varying(255),
--rollback 	description character varying(255),
--rollback 	"createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
--rollback 	"updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
--rollback );
--rollback 
--rollback ALTER TABLE public.permissions OWNER TO postgres;
--rollback 
--rollback ALTER TABLE public.roles
--rollback 	ALTER COLUMN id_permission TYPE integer USING id_permission::integer; /* ТИП колонки изменился - Таблица: public.roles оригинал: character varying(255) новый: integer */
--rollback 
--rollback ALTER TABLE public.users
--rollback 	ADD CONSTRAINT uniq_login UNIQUE (login);
--rollback 
--rollback ALTER TABLE public.roles
--rollback 	ADD CONSTRAINT fk_roles_user FOREIGN KEY (id_user) REFERENCES public.users(id);
--rollback 
--rollback -- DEPCY: This CONSTRAINT is a dependency of CONSTRAINT: public.roles.fk_roles_permissions
--rollback 
--rollback ALTER TABLE public.permissions
--rollback 	ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);
--rollback 
--rollback -- DEPCY: This COLUMN depends on the CONSTRAINT: public.roles.fk_roles_permissions
--rollback 
--rollback ALTER TABLE public.permissions
--rollback 	ALTER COLUMN id TYPE integer USING id::integer; /* ТИП колонки изменился - Таблица: public.permissions оригинал: character varying(255) новый: integer */
--rollback 
--rollback ALTER TABLE ONLY public.permissions
--rollback 	ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);
--rollback 
--rollback ALTER TABLE public.roles
--rollback 	ADD CONSTRAINT fk_roles_permissions FOREIGN KEY (id_permission) REFERENCES public.permissions(id);
--rollback 
--rollback ALTER SEQUENCE public.permissions_id_seq
--rollback 	OWNED BY public.permissions.id;
