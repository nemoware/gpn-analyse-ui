--liquibase formatted sql
--changeset developer:schema.sql splitStatements:false

SET search_path = pg_catalog;

CREATE SEQUENCE public.tags_id_seq
	START WITH 1
	INCREMENT BY 1
	NO MAXVALUE
	NO MINVALUE
	CACHE 1;

ALTER SEQUENCE public.tags_id_seq OWNER TO postgres;

CREATE SEQUENCE public.docum_types_id_seq
	START WITH 1
	INCREMENT BY 1
	NO MAXVALUE
	NO MINVALUE
	CACHE 1;

ALTER SEQUENCE public.docum_types_id_seq OWNER TO postgres;

CREATE SEQUENCE public.contracts_id_seq
	START WITH 1
	INCREMENT BY 1
	NO MAXVALUE
	NO MINVALUE
	CACHE 1;

ALTER SEQUENCE public.contracts_id_seq OWNER TO postgres;

CREATE SEQUENCE public.docum_tags_id_seq
	START WITH 1
	INCREMENT BY 1
	NO MAXVALUE
	NO MINVALUE
	CACHE 1;

ALTER SEQUENCE public.docum_tags_id_seq OWNER TO postgres;

CREATE SEQUENCE public.permissions_id_seq
	START WITH 1
	INCREMENT BY 1
	NO MAXVALUE
	NO MINVALUE
	CACHE 1;

ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

CREATE SEQUENCE public.users_id_seq
	START WITH 1
	INCREMENT BY 1
	NO MAXVALUE
	NO MINVALUE
	CACHE 1;

ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

CREATE SEQUENCE public.roles_id_seq
	START WITH 1
	INCREMENT BY 1
	NO MAXVALUE
	NO MINVALUE
	CACHE 1;

ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

CREATE SEQUENCE public.logs_id_seq
	START WITH 1
	INCREMENT BY 1
	NO MAXVALUE
	NO MINVALUE
	CACHE 1;

ALTER SEQUENCE public.logs_id_seq OWNER TO postgres;

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
    and upper(p.name) = upper(in_s_role);

	if(v_count > 0) then return 1;
    else return 0;
    end if;

END;
$$;

ALTER FUNCTION public.f_has_permission(in_s_login character varying, in_s_role character varying) OWNER TO postgres;

CREATE TABLE public.contracts (
	id integer DEFAULT nextval('public.contracts_id_seq'::regclass) NOT NULL,
	json_name_new character varying(255),
	json_value text,
	json_path character varying(255),
	dtc timestamp with time zone,
	id_type character varying(255),
	"createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	filename character varying(255),
	short_filename character varying(255),
	checksum numeric(20,0),
	filemtime numeric(20,0)
);

ALTER TABLE public.contracts OWNER TO postgres;

CREATE TABLE public.tag_types (
	id integer DEFAULT nextval('public.tags_id_seq'::regclass) NOT NULL,
	name character varying(255),
	name_color character varying(255),
	"createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	name_class character varying(255),
	id_parent numeric(1,0),
	field_query character varying(255)
);

ALTER TABLE public.tag_types OWNER TO postgres;

CREATE TABLE public.docum_types (
	id integer DEFAULT nextval('public.docum_types_id_seq'::regclass) NOT NULL,
	name character varying(255),
	"createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	str_id character varying(255)
);

ALTER TABLE public.docum_types OWNER TO postgres;

CREATE TABLE public.docum_tags (
	id integer DEFAULT nextval('public.docum_tags_id_seq'::regclass) NOT NULL,
	id_docum integer,
	id_type integer,
	value character varying(255),
	"createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
);

ALTER TABLE public.docum_tags OWNER TO postgres;

CREATE TABLE public.permissions (
	id integer DEFAULT nextval('public.permissions_id_seq'::regclass) NOT NULL,
	name character varying(255),
	description character varying(255),
	"createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
);

ALTER TABLE public.permissions OWNER TO postgres;

CREATE TABLE public.users (
	id integer DEFAULT nextval('public.users_id_seq'::regclass) NOT NULL,
	login character varying(255),
	name character varying(255),
	description character varying(255),
	"createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
);

ALTER TABLE public.users OWNER TO postgres;

CREATE TABLE public.roles (
	id integer DEFAULT nextval('public.roles_id_seq'::regclass) NOT NULL,
	id_user integer,
	id_permission integer,
	"createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
);

ALTER TABLE public.roles OWNER TO postgres;

CREATE TABLE public.logs (
	id integer DEFAULT nextval('public.logs_id_seq'::regclass) NOT NULL,
	login character varying(255),
	value character varying(255),
	"createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
);

ALTER TABLE public.logs OWNER TO postgres;

ALTER TABLE public.contracts
	ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);

ALTER TABLE public.tag_types
	ADD CONSTRAINT tags_pkey PRIMARY KEY (id);

ALTER TABLE public.docum_types
	ADD CONSTRAINT docum_types_pkey PRIMARY KEY (id);

ALTER TABLE public.docum_tags
	ADD CONSTRAINT fk_docum_tags_docum FOREIGN KEY (id_docum) REFERENCES public.contracts(id);

ALTER TABLE public.docum_tags
	ADD CONSTRAINT fk_docum_tags_type FOREIGN KEY (id_type) REFERENCES public.tag_types(id);

ALTER TABLE public.docum_tags
	ADD CONSTRAINT docum_tags_pkey PRIMARY KEY (id);

ALTER TABLE public.permissions
	ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);

ALTER TABLE public.users
	ADD CONSTRAINT uniq_login UNIQUE (login);

ALTER TABLE public.users
	ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE public.roles
	ADD CONSTRAINT fk_roles_permissions FOREIGN KEY (id_permission) REFERENCES public.permissions(id);

ALTER TABLE public.roles
	ADD CONSTRAINT fk_roles_user FOREIGN KEY (id_user) REFERENCES public.users(id);

ALTER TABLE public.roles
	ADD CONSTRAINT roles_pkey PRIMARY KEY (id);

ALTER TABLE public.logs
	ADD CONSTRAINT logs_pkey PRIMARY KEY (id);

ALTER SEQUENCE public.tags_id_seq
	OWNED BY public.tag_types.id;

ALTER SEQUENCE public.docum_types_id_seq
	OWNED BY public.docum_types.id;

ALTER SEQUENCE public.contracts_id_seq
	OWNED BY public.contracts.id;

ALTER SEQUENCE public.docum_tags_id_seq
	OWNED BY public.docum_tags.id;

ALTER SEQUENCE public.permissions_id_seq
	OWNED BY public.permissions.id;

ALTER SEQUENCE public.users_id_seq
	OWNED BY public.users.id;

ALTER SEQUENCE public.roles_id_seq
	OWNED BY public.roles.id;

ALTER SEQUENCE public.logs_id_seq
	OWNED BY public.logs.id;

--rollback SET search_path = pg_catalog;
--rollback
--rollback -- DEPCY: This CONSTRAINT depends on the CONSTRAINT: public.contracts.contracts_pkey
--rollback
--rollback ALTER TABLE public.docum_tags
--rollback 	DROP CONSTRAINT fk_docum_tags_docum;
--rollback
--rollback ALTER TABLE public.contracts
--rollback 	DROP CONSTRAINT contracts_pkey;
--rollback
--rollback -- DEPCY: This CONSTRAINT depends on the CONSTRAINT: public.tag_types.tags_pkey
--rollback
--rollback ALTER TABLE public.docum_tags
--rollback 	DROP CONSTRAINT fk_docum_tags_type;
--rollback
--rollback ALTER TABLE public.tag_types
--rollback 	DROP CONSTRAINT tags_pkey;
--rollback
--rollback ALTER TABLE public.docum_types
--rollback 	DROP CONSTRAINT docum_types_pkey;
--rollback
--rollback ALTER TABLE public.docum_tags
--rollback 	DROP CONSTRAINT docum_tags_pkey;
--rollback
--rollback -- DEPCY: This CONSTRAINT depends on the CONSTRAINT: public.permissions.permissions_pkey
--rollback
--rollback ALTER TABLE public.roles
--rollback 	DROP CONSTRAINT fk_roles_permissions;
--rollback
--rollback ALTER TABLE public.permissions
--rollback 	DROP CONSTRAINT permissions_pkey;
--rollback
--rollback ALTER TABLE public.users
--rollback 	DROP CONSTRAINT uniq_login;
--rollback
--rollback -- DEPCY: This CONSTRAINT depends on the CONSTRAINT: public.users.users_pkey
--rollback
--rollback ALTER TABLE public.roles
--rollback 	DROP CONSTRAINT fk_roles_user;
--rollback
--rollback ALTER TABLE public.users
--rollback 	DROP CONSTRAINT users_pkey;
--rollback
--rollback ALTER TABLE public.roles
--rollback 	DROP CONSTRAINT roles_pkey;
--rollback
--rollback ALTER TABLE public.logs
--rollback 	DROP CONSTRAINT logs_pkey;
--rollback
--rollback DROP TABLE public.contracts;
--rollback
--rollback DROP TABLE public.tag_types;
--rollback
--rollback DROP TABLE public.docum_types;
--rollback
--rollback DROP TABLE public.docum_tags;
--rollback
--rollback DROP TABLE public.permissions;
--rollback
--rollback DROP TABLE public.users;
--rollback
--rollback DROP TABLE public.roles;
--rollback
--rollback DROP TABLE public.logs;
--rollback
--rollback DROP FUNCTION public.f_has_permission(in_s_login character varying, in_s_role character varying);
