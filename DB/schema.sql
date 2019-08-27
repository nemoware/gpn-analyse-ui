SET check_function_bodies = false;
--
-- Definition for function f_get_new_guid (OID = 16449) :
--
SET search_path = public, pg_catalog;
CREATE FUNCTION public.f_get_new_guid (
)
RETURNS varchar
AS
$body$
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
END;$body$
LANGUAGE plpgsql;
--
-- Definition for function ft_attribute_key (OID = 16450) :
--
CREATE FUNCTION public.ft_attribute_key (
)
RETURNS trigger
AS
$body$
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
END;$body$
LANGUAGE plpgsql;
--
-- Definition for function ft_data_key (OID = 16452) :
--
CREATE FUNCTION public.ft_data_key (
)
RETURNS trigger
AS
$body$
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
END;$body$
LANGUAGE plpgsql;
--
-- Definition for function ft_inclusion_key (OID = 16454) :
--
CREATE FUNCTION public.ft_inclusion_key (
)
RETURNS trigger
AS
$body$
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
END;$body$
LANGUAGE plpgsql;
--
-- Definition for function ft_json_key (OID = 16456) :
--
CREATE FUNCTION public.ft_json_key (
)
RETURNS trigger
AS
$body$
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
END;$body$
LANGUAGE plpgsql;
--
-- Definition for function ft_type_key (OID = 16458) :
--
CREATE FUNCTION public.ft_type_key (
)
RETURNS trigger
AS
$body$
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
END;$body$
LANGUAGE plpgsql;
--
-- Definition for function f_has_permission (OID = 16706) :
--
CREATE FUNCTION public.f_has_permission (
  in_s_login character varying,
  in_s_role character varying
)
RETURNS varchar
AS
$body$
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
$body$
LANGUAGE plpgsql;
--
-- Structure for table json (OID = 16402) :
--
CREATE TABLE public.json (
    id_json uuid NOT NULL,
    json_name varchar(4000) NOT NULL,
    json_value text,
    json_path varchar(4000) NOT NULL,
    dtc timestamp without time zone,
    id_type uuid
)
WITH (oids = false);
--
-- Structure for table inclusion (OID = 16408) :
--
CREATE TABLE public.inclusion (
    id_inclusion uuid NOT NULL,
    description varchar(4000),
    id_type uuid NOT NULL,
    id_parent uuid,
    dtc timestamp without time zone
)
WITH (oids = false);
--
-- Structure for table attribute (OID = 16411) :
--
CREATE TABLE public.attribute (
    id_attribute uuid NOT NULL,
    id_inclusion uuid NOT NULL,
    description varchar(4000),
    dtc timestamp without time zone
)
WITH (oids = false);
--
-- Structure for table data (OID = 16420) :
--
CREATE TABLE public.data (
    id uuid NOT NULL,
    id_attribute uuid NOT NULL,
    value varchar,
    id_json uuid NOT NULL,
    dtc timestamp without time zone
)
WITH (oids = false);
--
-- Structure for table type (OID = 16423) :
--
CREATE TABLE public.type (
    id_type uuid NOT NULL,
    description varchar(4000),
    dtc timestamp without time zone
)
WITH (oids = false);
--
-- Structure for table guids (OID = 16440) :
--
CREATE TABLE public.guids (
    guid varchar NOT NULL
)
WITH (oids = false);
--
-- Structure for table contracts (OID = 16564) :
--
CREATE TABLE public.contracts (
    id serial NOT NULL,
    json_name_new varchar(255),
    json_value text,
    json_path varchar(255),
    dtc timestamp with time zone,
    id_type varchar(255),
    "createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    filename varchar(255),
    short_filename varchar(255),
    checksum numeric(20,0),
    filemtime numeric(20,0)
)
WITH (oids = false);
--
-- Structure for table tag_types (OID = 16576) :
--
CREATE TABLE public.tag_types (
    id integer DEFAULT nextval('tags_id_seq'::regclass) NOT NULL,
    name varchar(255),
    name_color varchar(255),
    "createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    name_class varchar(255),
    id_parent numeric(1,0),
    field_query varchar(255)
)
WITH (oids = false);
--
-- Structure for table docum_types (OID = 16615) :
--
CREATE TABLE public.docum_types (
    id serial NOT NULL,
    name varchar(255),
    "createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    str_id varchar(255)
)
WITH (oids = false);
--
-- Structure for table docum_tags (OID = 16636) :
--
CREATE TABLE public.docum_tags (
    id serial NOT NULL,
    id_docum numeric,
    id_type numeric,
    value varchar(255),
    "createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
)
WITH (oids = false);
--
-- Structure for table permissions (OID = 16668) :
--
CREATE TABLE public.permissions (
    id serial NOT NULL,
    name varchar(255),
    description varchar(255),
    "createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
)
WITH (oids = false);
--
-- Structure for table users (OID = 16679) :
--
CREATE TABLE public.users (
    id serial NOT NULL,
    login varchar(255),
    name varchar(255),
    description varchar(255),
    "createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
)
WITH (oids = false);
--
-- Structure for table roles (OID = 16690) :
--
CREATE TABLE public.roles (
    id serial NOT NULL,
    id_user numeric,
    id_permission numeric,
    "createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
)
WITH (oids = false);
--
-- Structure for table logs (OID = 16709) :
--
CREATE TABLE public.logs (
    id serial NOT NULL,
    login varchar(255),
    value varchar(255),
    "createdAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT ('now'::text)::date NOT NULL
)
WITH (oids = false);
--
-- Definition for index idx_guid (OID = 16448) :
--
CREATE INDEX idx_guid ON public.guids USING btree (guid);
--
-- Definition for index idx_inclusion_type (OID = 16495) :
--
CREATE INDEX idx_inclusion_type ON public.inclusion USING btree (id_type);
--
-- Definition for index idx_json_type (OID = 16496) :
--
CREATE INDEX idx_json_type ON public.json USING btree (id_type);
--
-- Definition for index idx_attribute_inclusion (OID = 16497) :
--
CREATE INDEX idx_attribute_inclusion ON public.attribute USING btree (id_inclusion);
--
-- Definition for index idx_data_attribute (OID = 16498) :
--
CREATE INDEX idx_data_attribute ON public.data USING btree (id_attribute);
--
-- Definition for index idx_data_json (OID = 16499) :
--
CREATE INDEX idx_data_json ON public.data USING btree (id_json);
--
-- Definition for index docum_tags_doc_ind (OID = 16645) :
--
CREATE INDEX docum_tags_doc_ind ON public.docum_tags USING btree (id_docum);
--
-- Definition for index docum_tags_tag_idx (OID = 16646) :
--
CREATE INDEX docum_tags_tag_idx ON public.docum_tags USING btree (id_type);
--
-- Definition for index pk_guid (OID = 16446) :
--
ALTER TABLE ONLY guids
    ADD CONSTRAINT pk_guid
    PRIMARY KEY (guid);
--
-- Definition for index pk_attribute (OID = 16460) :
--
ALTER TABLE ONLY attribute
    ADD CONSTRAINT pk_attribute
    PRIMARY KEY (id_attribute);
--
-- Definition for index pk_inclusion (OID = 16462) :
--
ALTER TABLE ONLY inclusion
    ADD CONSTRAINT pk_inclusion
    PRIMARY KEY (id_inclusion);
--
-- Definition for index fk_inclusion (OID = 16464) :
--
ALTER TABLE ONLY attribute
    ADD CONSTRAINT fk_inclusion
    FOREIGN KEY (id_inclusion) REFERENCES inclusion(id_inclusion);
--
-- Definition for index pk_type (OID = 16469) :
--
ALTER TABLE ONLY type
    ADD CONSTRAINT pk_type
    PRIMARY KEY (id_type);
--
-- Definition for index fk_type (OID = 16471) :
--
ALTER TABLE ONLY json
    ADD CONSTRAINT fk_type
    FOREIGN KEY (id_type) REFERENCES type(id_type);
--
-- Definition for index fk_type (OID = 16476) :
--
ALTER TABLE ONLY inclusion
    ADD CONSTRAINT fk_type
    FOREIGN KEY (id_type) REFERENCES type(id_type);
--
-- Definition for index pk_json (OID = 16481) :
--
ALTER TABLE ONLY json
    ADD CONSTRAINT pk_json
    PRIMARY KEY (id_json);
--
-- Definition for index pk_data (OID = 16483) :
--
ALTER TABLE ONLY data
    ADD CONSTRAINT pk_data
    PRIMARY KEY (id);
--
-- Definition for index fk_attribute (OID = 16485) :
--
ALTER TABLE ONLY data
    ADD CONSTRAINT fk_attribute
    FOREIGN KEY (id_attribute) REFERENCES attribute(id_attribute);
--
-- Definition for index fk_json (OID = 16490) :
--
ALTER TABLE ONLY data
    ADD CONSTRAINT fk_json
    FOREIGN KEY (id_json) REFERENCES json(id_json);
--
-- Definition for index contracts_pkey (OID = 16571) :
--
ALTER TABLE ONLY contracts
    ADD CONSTRAINT contracts_pkey
    PRIMARY KEY (id);
--
-- Definition for index tags_pkey (OID = 16583) :
--
ALTER TABLE ONLY tag_types
    ADD CONSTRAINT tags_pkey
    PRIMARY KEY (id);
--
-- Definition for index docum_types_pkey (OID = 16619) :
--
ALTER TABLE ONLY docum_types
    ADD CONSTRAINT docum_types_pkey
    PRIMARY KEY (id);
--
-- Definition for index docum_tags_pkey (OID = 16643) :
--
ALTER TABLE ONLY docum_tags
    ADD CONSTRAINT docum_tags_pkey
    PRIMARY KEY (id);
--
-- Definition for index permissions_pkey (OID = 16675) :
--
ALTER TABLE ONLY permissions
    ADD CONSTRAINT permissions_pkey
    PRIMARY KEY (id);
--
-- Definition for index users_pkey (OID = 16686) :
--
ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey
    PRIMARY KEY (id);
--
-- Definition for index roles_pkey (OID = 16697) :
--
ALTER TABLE ONLY roles
    ADD CONSTRAINT roles_pkey
    PRIMARY KEY (id);
--
-- Definition for index logs_pkey (OID = 16716) :
--
ALTER TABLE ONLY logs
    ADD CONSTRAINT logs_pkey
    PRIMARY KEY (id);
--
-- Definition for trigger tr_attribute_key (OID = 16451) :
--
CREATE TRIGGER tr_attribute_key
    BEFORE INSERT ON attribute
    FOR EACH ROW
    EXECUTE PROCEDURE ft_attribute_key ();
--
-- Definition for trigger tr_data_key (OID = 16453) :
--
CREATE TRIGGER tr_data_key
    BEFORE INSERT ON data
    FOR EACH ROW
    EXECUTE PROCEDURE ft_data_key ();
--
-- Definition for trigger tr_inclusion_key (OID = 16455) :
--
CREATE TRIGGER tr_inclusion_key
    BEFORE INSERT ON inclusion
    FOR EACH ROW
    EXECUTE PROCEDURE ft_inclusion_key ();
--
-- Definition for trigger tr_json_key (OID = 16457) :
--
CREATE TRIGGER tr_json_key
    BEFORE INSERT ON json
    FOR EACH ROW
    EXECUTE PROCEDURE ft_json_key ();

ALTER TABLE json
  DISABLE TRIGGER tr_json_key;
--
-- Definition for trigger tr_type_key (OID = 16459) :
--
CREATE TRIGGER tr_type_key
    BEFORE INSERT ON type
    FOR EACH ROW
    EXECUTE PROCEDURE ft_type_key ();
--
-- Comments
--
COMMENT ON SCHEMA public IS 'standard public schema';
COMMENT ON TABLE public.guids IS 'Использованные GUID-ов. Функция генерации f_get_new_guid() проверяет уникальность полученного GUID-а и записывает в эту таблицу';
