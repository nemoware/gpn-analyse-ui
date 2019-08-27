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

CREATE OR REPLACE FUNCTION public.f_get_new_guid() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
v_guid character varying;
v_count numeric;
BEGIN
v_count := -1;
select uuid_generate_v4() into v_guid;
select count(*) into v_count from guids where guid = v_guid;
WHILE v_count != 0 LOOP
 select uuid_generate_v4() into v_guid;
 select count(*) into v_count from guids where guid = v_guid;
END LOOP;
insert into guids(guid) values (v_guid);
RETURN v_guid;
END;$$;

ALTER FUNCTION public.f_get_new_guid() OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.ft_attribute_key() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_new_id character varying;
  v_new_date timestamp without time zone;

BEGIN
IF TG_OP = 'INSERT' THEN
  v_new_date := (now()::timestamp without time zone);
  SELECT f_get_new_guid() into v_new_id;
  NEW.id_attribute := v_new_id;
  NEW.dtc := v_new_date;
END IF;
RETURN NEW;
END;$$;

ALTER FUNCTION public.ft_attribute_key() OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.ft_data_key() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_new_id character varying;
  v_new_date timestamp without time zone;

BEGIN
IF TG_OP = 'INSERT' THEN
  v_new_date := (now()::timestamp without time zone);
  SELECT f_get_new_guid() into v_new_id;
  NEW.id_data := v_new_id;
  NEW.dtc := v_new_date;
END IF;
RETURN NEW;
END;$$;

ALTER FUNCTION public.ft_data_key() OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.ft_inclusion_key() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_new_id character varying;
  v_new_date timestamp without time zone;

BEGIN
IF TG_OP = 'INSERT' THEN
  v_new_date := (now()::timestamp without time zone);
  SELECT f_get_new_guid() into v_new_id;
  NEW.id_inclusion := v_new_id;
  NEW.dtc := v_new_date;
END IF;
RETURN NEW;
END;$$;

ALTER FUNCTION public.ft_inclusion_key() OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.ft_json_key() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_new_id character varying;
  v_new_date timestamp without time zone;

BEGIN
IF TG_OP = 'INSERT' THEN
  v_new_date := (now()::timestamp without time zone);
  SELECT f_get_new_guid() into v_new_id;
  NEW.id_json := v_new_id;
  NEW.dtc := v_new_date;
END IF;
RETURN NEW;
END;$$;

ALTER FUNCTION public.ft_json_key() OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.ft_type_key() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_new_id character varying;
  v_new_date timestamp without time zone;

BEGIN
IF TG_OP = 'INSERT' THEN
  v_new_date := (now()::timestamp without time zone);
  SELECT f_get_new_guid() into v_new_id;
  NEW.id_type := v_new_id;
  NEW.dtc := v_new_date;
END IF;
RETURN NEW;
END;$$;

ALTER FUNCTION public.ft_type_key() OWNER TO postgres;

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

CREATE TABLE public.json (
	id_json uuid NOT NULL,
	json_name character varying(4000) NOT NULL,
	json_value text,
	json_path character varying(4000) NOT NULL,
	dtc timestamp without time zone,
	id_type uuid
);

ALTER TABLE public.json OWNER TO postgres;

CREATE TABLE public.inclusion (
	id_inclusion uuid NOT NULL,
	description character varying(4000),
	id_type uuid NOT NULL,
	id_parent uuid,
	dtc timestamp without time zone
);

ALTER TABLE public.inclusion OWNER TO postgres;

CREATE TABLE public.attribute (
	id_attribute uuid NOT NULL,
	id_inclusion uuid NOT NULL,
	description character varying(4000),
	dtc timestamp without time zone
);

ALTER TABLE public.attribute OWNER TO postgres;

CREATE TABLE public.data (
	id uuid NOT NULL,
	id_attribute uuid NOT NULL,
	value character varying,
	id_json uuid NOT NULL,
	dtc timestamp without time zone
);

ALTER TABLE public.data OWNER TO postgres;

CREATE TABLE public.type (
	id_type uuid NOT NULL,
	description character varying(4000),
	dtc timestamp without time zone
);

ALTER TABLE public.type OWNER TO postgres;

CREATE TABLE public.guids (
	guid character varying NOT NULL
);

ALTER TABLE public.guids OWNER TO postgres;

COMMENT ON TABLE public.guids IS 'РСЃРїРѕР»СЊР·РѕРІР°РЅРЅС‹Рµ GUID-РѕРІ. Р¤СѓРЅРєС†РёСЏ РіРµРЅРµСЂР°С†РёРё f_get_new_guid() РїСЂРѕРІРµСЂСЏРµС‚ СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚СЊ РїРѕР»СѓС‡РµРЅРЅРѕРіРѕ GUID-Р° Рё Р·Р°РїРёСЃС‹РІР°РµС‚ РІ СЌС‚Сѓ С‚Р°Р±Р»РёС†Сѓ';

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
	id_docum numeric,
	id_type numeric,
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
	id_user numeric,
	id_permission numeric,
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

ALTER TABLE public.json
	ADD CONSTRAINT pk_json PRIMARY KEY (id_json);

-- DEPCY: This CONSTRAINT is a dependency of CONSTRAINT: public.json.fk_type

ALTER TABLE public.type
	ADD CONSTRAINT pk_type PRIMARY KEY (id_type);

ALTER TABLE public.json
	ADD CONSTRAINT fk_type FOREIGN KEY (id_type) REFERENCES public.type(id_type);

ALTER TABLE public.inclusion
	ADD CONSTRAINT fk_type FOREIGN KEY (id_type) REFERENCES public.type(id_type);

ALTER TABLE public.inclusion
	ADD CONSTRAINT pk_inclusion PRIMARY KEY (id_inclusion);

ALTER TABLE public.attribute
	ADD CONSTRAINT fk_inclusion FOREIGN KEY (id_inclusion) REFERENCES public.inclusion(id_inclusion);

ALTER TABLE public.attribute
	ADD CONSTRAINT pk_attribute PRIMARY KEY (id_attribute);

ALTER TABLE public.data
	ADD CONSTRAINT fk_json FOREIGN KEY (id_json) REFERENCES public.json(id_json);

ALTER TABLE public.data
	ADD CONSTRAINT fk_attribute FOREIGN KEY (id_attribute) REFERENCES public.attribute(id_attribute);

ALTER TABLE public.data
	ADD CONSTRAINT pk_data PRIMARY KEY (id);

ALTER TABLE public.guids
	ADD CONSTRAINT pk_guid PRIMARY KEY (guid);

ALTER TABLE public.contracts
	ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);

ALTER TABLE public.tag_types
	ADD CONSTRAINT tags_pkey PRIMARY KEY (id);

ALTER TABLE public.docum_types
	ADD CONSTRAINT docum_types_pkey PRIMARY KEY (id);

ALTER TABLE public.docum_tags
	ADD CONSTRAINT docum_tags_pkey PRIMARY KEY (id);

ALTER TABLE public.permissions
	ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);

ALTER TABLE public.users
	ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE public.roles
	ADD CONSTRAINT roles_pkey PRIMARY KEY (id);

ALTER TABLE public.logs
	ADD CONSTRAINT logs_pkey PRIMARY KEY (id);

CREATE INDEX idx_json_type ON public.json USING btree (id_type);

CREATE INDEX idx_inclusion_type ON public.inclusion USING btree (id_type);

CREATE INDEX idx_attribute_inclusion ON public.attribute USING btree (id_inclusion);

CREATE INDEX idx_data_json ON public.data USING btree (id_json);

CREATE INDEX idx_data_attribute ON public.data USING btree (id_attribute);

CREATE INDEX idx_guid ON public.guids USING btree (guid);

CREATE INDEX docum_tags_tag_idx ON public.docum_tags USING btree (id_type);

CREATE INDEX docum_tags_doc_ind ON public.docum_tags USING btree (id_docum);

CREATE TRIGGER tr_json_key
	BEFORE INSERT ON public.json
	FOR EACH ROW
	EXECUTE PROCEDURE public.ft_json_key();

CREATE TRIGGER tr_inclusion_key
	BEFORE INSERT ON public.inclusion
	FOR EACH ROW
	EXECUTE PROCEDURE public.ft_inclusion_key();

CREATE TRIGGER tr_attribute_key
	BEFORE INSERT ON public.attribute
	FOR EACH ROW
	EXECUTE PROCEDURE public.ft_attribute_key();

CREATE TRIGGER tr_data_key
	BEFORE INSERT ON public.data
	FOR EACH ROW
	EXECUTE PROCEDURE public.ft_data_key();

CREATE TRIGGER tr_type_key
	BEFORE INSERT ON public.type
	FOR EACH ROW
	EXECUTE PROCEDURE public.ft_type_key();

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
