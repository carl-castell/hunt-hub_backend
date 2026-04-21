CREATE TYPE "public"."role" AS ENUM('admin', 'manager', 'staff', 'guest');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('open', 'yes', 'no');--> statement-breakpoint
CREATE TYPE "public"."attachment_entity_type" AS ENUM('hunting_license', 'training_certificate');--> statement-breakpoint
CREATE TYPE "public"."attachment_kind" AS ENUM('photo', 'document');--> statement-breakpoint
CREATE TYPE "public"."token_type" AS ENUM('activation', 'password_reset');--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"role" "role" NOT NULL,
	"estate_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "estate_id_required_for_non_admin" CHECK ("users"."role" = 'admin' OR "users"."estate_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"active" boolean DEFAULT false NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(255),
	"date_of_birth" date,
	"rating" integer
);
--> statement-breakpoint
CREATE TABLE "drives" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "drives_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "estates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256)
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"estate_id" integer,
	"event_name" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"time" time NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invitations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" "status" DEFAULT 'open' NOT NULL,
	"rsvp_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "attachments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"estate_id" integer NOT NULL,
	"entity_type" "attachment_entity_type" NOT NULL,
	"entity_id" integer NOT NULL,
	"kind" "attachment_kind" NOT NULL,
	"key" text NOT NULL,
	"content_type" text NOT NULL,
	"original_name" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"upload_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hunting_licenses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hunting_licenses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"estate_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"checked" boolean DEFAULT false NOT NULL,
	"expiry_date" date NOT NULL,
	"upload_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_certificates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "training_certificates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"estate_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"checked" boolean DEFAULT false NOT NULL,
	"issue_date" date NOT NULL,
	"upload_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stands" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stands_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"number" varchar NOT NULL,
	"area_id" integer NOT NULL,
	"location" "point"
);
--> statement-breakpoint
CREATE TABLE "areas" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "areas_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"estate_id" integer,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_auth_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_auth_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"type" "token_type" NOT NULL,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "user_auth_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer,
	"event" varchar(100) NOT NULL,
	"ip" varchar(255),
	"metadata" json,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "template_groups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "template_groups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"area_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"number" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_stand_assignments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "template_stand_assignments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"template_group_id" integer NOT NULL,
	"stand_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drive_groups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "drive_groups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"drive_id" integer NOT NULL,
	"leader_id" integer,
	"number" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drive_stand_assignments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "drive_stand_assignments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"drive_group_id" integer NOT NULL,
	"stand_id" integer NOT NULL,
	"user_id" integer
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_estate_id_estates_id_fk" FOREIGN KEY ("estate_id") REFERENCES "public"."estates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hunting_licenses" ADD CONSTRAINT "hunting_licenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_certificates" ADD CONSTRAINT "training_certificates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_auth_tokens" ADD CONSTRAINT "user_auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_groups" ADD CONSTRAINT "template_groups_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_stand_assignments" ADD CONSTRAINT "template_stand_assignments_template_group_id_template_groups_id_fk" FOREIGN KEY ("template_group_id") REFERENCES "public"."template_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_stand_assignments" ADD CONSTRAINT "template_stand_assignments_stand_id_stands_id_fk" FOREIGN KEY ("stand_id") REFERENCES "public"."stands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drive_groups" ADD CONSTRAINT "drive_groups_drive_id_drives_id_fk" FOREIGN KEY ("drive_id") REFERENCES "public"."drives"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drive_groups" ADD CONSTRAINT "drive_groups_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drive_stand_assignments" ADD CONSTRAINT "drive_stand_assignments_drive_group_id_drive_groups_id_fk" FOREIGN KEY ("drive_group_id") REFERENCES "public"."drive_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drive_stand_assignments" ADD CONSTRAINT "drive_stand_assignments_stand_id_stands_id_fk" FOREIGN KEY ("stand_id") REFERENCES "public"."stands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drive_stand_assignments" ADD CONSTRAINT "drive_stand_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_attachments_entity" ON "attachments" USING btree ("estate_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_attachments_kind" ON "attachments" USING btree ("estate_id","entity_type","entity_id","kind");--> statement-breakpoint
CREATE INDEX "idx_attachments_key" ON "attachments" USING btree ("key");--> statement-breakpoint
CREATE INDEX "idx_hunting_licenses_estate_id" ON "hunting_licenses" USING btree ("estate_id");--> statement-breakpoint
CREATE INDEX "idx_hunting_licenses_user_id" ON "hunting_licenses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_hunting_licenses_expiry_date" ON "hunting_licenses" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_training_certificates_estate_id" ON "training_certificates" USING btree ("estate_id");--> statement-breakpoint
CREATE INDEX "idx_training_certificates_user_id" ON "training_certificates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_training_certificates_issue_date" ON "training_certificates" USING btree ("issue_date");