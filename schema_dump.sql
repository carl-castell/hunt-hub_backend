--
-- PostgreSQL database dump
--

\restrict JRE4FQNp3qtePzqmUHksS9lBgG6fa6h9mACxIF4P7AGmOMdIzpDhWfkbk9YWwsr

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg110+2)
-- Dumped by pg_dump version 18.3

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
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: app
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO app;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: app
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO app;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: app
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO app;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: app
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: attachment_kind; Type: TYPE; Schema: public; Owner: app
--

CREATE TYPE public.attachment_kind AS ENUM (
    'photo',
    'document'
);


ALTER TYPE public.attachment_kind OWNER TO app;

--
-- Name: role; Type: TYPE; Schema: public; Owner: app
--

CREATE TYPE public.role AS ENUM (
    'admin',
    'manager',
    'staff',
    'guest'
);


ALTER TYPE public.role OWNER TO app;

--
-- Name: status; Type: TYPE; Schema: public; Owner: app
--

CREATE TYPE public.status AS ENUM (
    'open',
    'yes',
    'no'
);


ALTER TYPE public.status OWNER TO app;

--
-- Name: token_type; Type: TYPE; Schema: public; Owner: app
--

CREATE TYPE public.token_type AS ENUM (
    'activation',
    'password_reset'
);


ALTER TYPE public.token_type OWNER TO app;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.accounts (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    active boolean DEFAULT false NOT NULL
);


ALTER TABLE public.accounts OWNER TO app;

--
-- Name: areas; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.areas (
    id integer NOT NULL,
    estate_id integer,
    name character varying(255) NOT NULL
);


ALTER TABLE public.areas OWNER TO app;

--
-- Name: areas_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.areas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.areas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    event character varying(100) NOT NULL,
    ip character varying(255),
    metadata json,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO app;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.audit_logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: drive_groups; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.drive_groups (
    id integer NOT NULL,
    drive_id integer NOT NULL,
    leader_id integer,
    number integer NOT NULL
);


ALTER TABLE public.drive_groups OWNER TO app;

--
-- Name: drive_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.drive_groups ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.drive_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: drive_stand_assignments; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.drive_stand_assignments (
    id integer NOT NULL,
    drive_group_id integer NOT NULL,
    stand_id integer NOT NULL,
    user_id integer
);


ALTER TABLE public.drive_stand_assignments OWNER TO app;

--
-- Name: drive_stand_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.drive_stand_assignments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.drive_stand_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: drives; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.drives (
    id integer NOT NULL,
    event_id integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL
);


ALTER TABLE public.drives OWNER TO app;

--
-- Name: drives_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.drives ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.drives_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: estates; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.estates (
    id integer NOT NULL,
    name character varying(256)
);


ALTER TABLE public.estates OWNER TO app;

--
-- Name: estates_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.estates ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.estates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.events (
    id integer NOT NULL,
    estate_id integer NOT NULL,
    event_name character varying(255) NOT NULL,
    date date NOT NULL,
    "time" time without time zone NOT NULL
);


ALTER TABLE public.events OWNER TO app;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.events ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: guests; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.guests (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255),
    date_of_birth date,
    rating integer
);


ALTER TABLE public.guests OWNER TO app;

--
-- Name: hunting_license_attachments; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.hunting_license_attachments (
    id integer NOT NULL,
    estate_id integer NOT NULL,
    kind public.attachment_kind NOT NULL,
    key text NOT NULL,
    content_type text NOT NULL,
    original_name text NOT NULL,
    size_bytes integer NOT NULL,
    upload_date timestamp without time zone DEFAULT now() NOT NULL,
    license_id integer NOT NULL
);


ALTER TABLE public.hunting_license_attachments OWNER TO app;

--
-- Name: hunting_license_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.hunting_license_attachments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hunting_license_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: hunting_licenses; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.hunting_licenses (
    id integer NOT NULL,
    estate_id integer NOT NULL,
    user_id integer NOT NULL,
    checked boolean DEFAULT false NOT NULL,
    checked_at timestamp without time zone,
    expiry_date date NOT NULL,
    upload_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.hunting_licenses OWNER TO app;

--
-- Name: hunting_licenses_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.hunting_licenses ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.hunting_licenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invitations; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.invitations (
    id integer NOT NULL,
    event_id integer NOT NULL,
    user_id integer NOT NULL,
    status public.status DEFAULT 'open'::public.status NOT NULL,
    rsvp_date date NOT NULL
);


ALTER TABLE public.invitations OWNER TO app;

--
-- Name: invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.invitations ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.invitations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: stands; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.stands (
    id integer NOT NULL,
    number character varying NOT NULL,
    area_id integer NOT NULL,
    location point
);


ALTER TABLE public.stands OWNER TO app;

--
-- Name: stands_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.stands ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.stands_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: template_groups; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.template_groups (
    id integer NOT NULL,
    stand_id integer NOT NULL,
    name character varying(255) NOT NULL,
    number integer NOT NULL
);


ALTER TABLE public.template_groups OWNER TO app;

--
-- Name: template_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.template_groups ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.template_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: template_stand_assignments; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.template_stand_assignments (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    template_group_id integer NOT NULL,
    stand_id integer NOT NULL
);


ALTER TABLE public.template_stand_assignments OWNER TO app;

--
-- Name: template_stand_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.template_stand_assignments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.template_stand_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: training_certificate_attachments; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.training_certificate_attachments (
    id integer NOT NULL,
    estate_id integer NOT NULL,
    kind public.attachment_kind NOT NULL,
    key text NOT NULL,
    content_type text NOT NULL,
    original_name text NOT NULL,
    size_bytes integer NOT NULL,
    upload_date timestamp without time zone DEFAULT now() NOT NULL,
    cert_id integer NOT NULL
);


ALTER TABLE public.training_certificate_attachments OWNER TO app;

--
-- Name: training_certificate_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.training_certificate_attachments ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.training_certificate_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: training_certificates; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.training_certificates (
    id integer NOT NULL,
    estate_id integer NOT NULL,
    user_id integer NOT NULL,
    checked boolean DEFAULT false NOT NULL,
    checked_at timestamp without time zone,
    issue_date date NOT NULL,
    upload_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.training_certificates OWNER TO app;

--
-- Name: training_certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.training_certificates ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.training_certificates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_auth_tokens; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.user_auth_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    type public.token_type NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.user_auth_tokens OWNER TO app;

--
-- Name: user_auth_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.user_auth_tokens ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_auth_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: app
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    role public.role NOT NULL,
    estate_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT estate_id_required_for_non_admin CHECK (((role = 'admin'::public.role) OR (estate_id IS NOT NULL)))
);


ALTER TABLE public.users OWNER TO app;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: app
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: accounts accounts_email_unique; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_email_unique UNIQUE (email);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (user_id);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: drive_groups drive_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.drive_groups
    ADD CONSTRAINT drive_groups_pkey PRIMARY KEY (id);


--
-- Name: drive_stand_assignments drive_stand_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.drive_stand_assignments
    ADD CONSTRAINT drive_stand_assignments_pkey PRIMARY KEY (id);


--
-- Name: drives drives_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.drives
    ADD CONSTRAINT drives_pkey PRIMARY KEY (id);


--
-- Name: estates estates_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.estates
    ADD CONSTRAINT estates_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (user_id);


--
-- Name: hunting_license_attachments hunting_license_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.hunting_license_attachments
    ADD CONSTRAINT hunting_license_attachments_pkey PRIMARY KEY (id);


--
-- Name: hunting_licenses hunting_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.hunting_licenses
    ADD CONSTRAINT hunting_licenses_pkey PRIMARY KEY (id);


--
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- Name: stands stands_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.stands
    ADD CONSTRAINT stands_pkey PRIMARY KEY (id);


--
-- Name: template_groups template_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.template_groups
    ADD CONSTRAINT template_groups_pkey PRIMARY KEY (id);


--
-- Name: template_stand_assignments template_stand_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.template_stand_assignments
    ADD CONSTRAINT template_stand_assignments_pkey PRIMARY KEY (id);


--
-- Name: training_certificate_attachments training_certificate_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.training_certificate_attachments
    ADD CONSTRAINT training_certificate_attachments_pkey PRIMARY KEY (id);


--
-- Name: training_certificates training_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.training_certificates
    ADD CONSTRAINT training_certificates_pkey PRIMARY KEY (id);


--
-- Name: user_auth_tokens user_auth_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.user_auth_tokens
    ADD CONSTRAINT user_auth_tokens_pkey PRIMARY KEY (id);


--
-- Name: user_auth_tokens user_auth_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.user_auth_tokens
    ADD CONSTRAINT user_auth_tokens_token_unique UNIQUE (token);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_hl_attachments_key; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_hl_attachments_key ON public.hunting_license_attachments USING btree (key);


--
-- Name: idx_hl_attachments_kind; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_hl_attachments_kind ON public.hunting_license_attachments USING btree (license_id, kind);


--
-- Name: idx_hl_attachments_license_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_hl_attachments_license_id ON public.hunting_license_attachments USING btree (license_id);


--
-- Name: idx_hunting_licenses_estate_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_hunting_licenses_estate_id ON public.hunting_licenses USING btree (estate_id);


--
-- Name: idx_hunting_licenses_expiry_date; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_hunting_licenses_expiry_date ON public.hunting_licenses USING btree (expiry_date);


--
-- Name: idx_hunting_licenses_user_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_hunting_licenses_user_id ON public.hunting_licenses USING btree (user_id);


--
-- Name: idx_tc_attachments_cert_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_tc_attachments_cert_id ON public.training_certificate_attachments USING btree (cert_id);


--
-- Name: idx_tc_attachments_key; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_tc_attachments_key ON public.training_certificate_attachments USING btree (key);


--
-- Name: idx_tc_attachments_kind; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_tc_attachments_kind ON public.training_certificate_attachments USING btree (cert_id, kind);


--
-- Name: idx_training_certificates_estate_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_training_certificates_estate_id ON public.training_certificates USING btree (estate_id);


--
-- Name: idx_training_certificates_issue_date; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_training_certificates_issue_date ON public.training_certificates USING btree (issue_date);


--
-- Name: idx_training_certificates_user_id; Type: INDEX; Schema: public; Owner: app
--

CREATE INDEX idx_training_certificates_user_id ON public.training_certificates USING btree (user_id);


--
-- Name: accounts accounts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: drive_groups drive_groups_drive_id_drives_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.drive_groups
    ADD CONSTRAINT drive_groups_drive_id_drives_id_fk FOREIGN KEY (drive_id) REFERENCES public.drives(id) ON DELETE CASCADE;


--
-- Name: drive_groups drive_groups_leader_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.drive_groups
    ADD CONSTRAINT drive_groups_leader_id_users_id_fk FOREIGN KEY (leader_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: drive_stand_assignments drive_stand_assignments_drive_group_id_drive_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.drive_stand_assignments
    ADD CONSTRAINT drive_stand_assignments_drive_group_id_drive_groups_id_fk FOREIGN KEY (drive_group_id) REFERENCES public.drive_groups(id) ON DELETE CASCADE;


--
-- Name: drive_stand_assignments drive_stand_assignments_stand_id_stands_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.drive_stand_assignments
    ADD CONSTRAINT drive_stand_assignments_stand_id_stands_id_fk FOREIGN KEY (stand_id) REFERENCES public.stands(id) ON DELETE CASCADE;


--
-- Name: drive_stand_assignments drive_stand_assignments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.drive_stand_assignments
    ADD CONSTRAINT drive_stand_assignments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: drives drives_event_id_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.drives
    ADD CONSTRAINT drives_event_id_events_id_fk FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: guests guests_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: hunting_license_attachments hunting_license_attachments_license_id_hunting_licenses_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.hunting_license_attachments
    ADD CONSTRAINT hunting_license_attachments_license_id_hunting_licenses_id_fk FOREIGN KEY (license_id) REFERENCES public.hunting_licenses(id) ON DELETE CASCADE;


--
-- Name: hunting_licenses hunting_licenses_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.hunting_licenses
    ADD CONSTRAINT hunting_licenses_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: invitations invitations_event_id_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_event_id_events_id_fk FOREIGN KEY (event_id) REFERENCES public.events(id);


--
-- Name: invitations invitations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: stands stands_area_id_areas_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.stands
    ADD CONSTRAINT stands_area_id_areas_id_fk FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;


--
-- Name: template_groups template_groups_stand_id_stands_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.template_groups
    ADD CONSTRAINT template_groups_stand_id_stands_id_fk FOREIGN KEY (stand_id) REFERENCES public.stands(id) ON DELETE CASCADE;


--
-- Name: template_stand_assignments template_stand_assignments_stand_id_stands_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.template_stand_assignments
    ADD CONSTRAINT template_stand_assignments_stand_id_stands_id_fk FOREIGN KEY (stand_id) REFERENCES public.stands(id) ON DELETE CASCADE;


--
-- Name: template_stand_assignments template_stand_assignments_template_group_id_template_groups_id; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.template_stand_assignments
    ADD CONSTRAINT template_stand_assignments_template_group_id_template_groups_id FOREIGN KEY (template_group_id) REFERENCES public.template_groups(id) ON DELETE CASCADE;


--
-- Name: training_certificate_attachments training_certificate_attachments_cert_id_training_certificates_; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.training_certificate_attachments
    ADD CONSTRAINT training_certificate_attachments_cert_id_training_certificates_ FOREIGN KEY (cert_id) REFERENCES public.training_certificates(id) ON DELETE CASCADE;


--
-- Name: training_certificates training_certificates_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.training_certificates
    ADD CONSTRAINT training_certificates_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_auth_tokens user_auth_tokens_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.user_auth_tokens
    ADD CONSTRAINT user_auth_tokens_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_estate_id_estates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_estate_id_estates_id_fk FOREIGN KEY (estate_id) REFERENCES public.estates(id);


--
-- PostgreSQL database dump complete
--

\unrestrict JRE4FQNp3qtePzqmUHksS9lBgG6fa6h9mACxIF4P7AGmOMdIzpDhWfkbk9YWwsr

