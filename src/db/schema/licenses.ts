import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  date,
  text,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

/**
 * Hunting Licenses
 *
 * Includes estateId for tenant scoping.
 * estateId should match the user's estateId at creation time.
 */
export const huntingLicensesTable = pgTable(
  "hunting_licenses",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    estateId: integer("estate_id").notNull(),

    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    checked: boolean().notNull().default(false),

    // If this is the real expiry of the hunting license, keep it here
    expiryDate: date("expiry_date").notNull(),

    uploadDate: timestamp("upload_date").notNull().defaultNow(),
  },
  (t) => [
    index("idx_hunting_licenses_estate_id").on(t.estateId),
    index("idx_hunting_licenses_user_id").on(t.userId),
    index("idx_hunting_licenses_expiry_date").on(t.expiryDate),
  ]
);

/**
 * Training Certificates
 *
 * Includes estateId for tenant scoping.
 * If certificates expire after one year and you want to query expired efficiently,
 * consider adding expiresAt later (timestamp/date) and indexing it.
 */
export const trainingCertificatesTable = pgTable(
  "training_certificates",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    estateId: integer("estate_id").notNull(),

    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    checked: boolean().notNull().default(false),

    issueDate: date("issue_date").notNull(),

    uploadDate: timestamp("upload_date").notNull().defaultNow(),
  },
  (t) => [
    index("idx_training_certificates_estate_id").on(t.estateId),
    index("idx_training_certificates_user_id").on(t.userId),
    index("idx_training_certificates_issue_date").on(t.issueDate),
  ]
);

/**
 * Attachments
 *
 * One row per file stored in object storage (MinIO/S3/R2/etc).
 *
 * Business rules (enforce in backend):
 * - hunting_license: either <= 4 photos OR 1 document (pdf)
 * - training_certificate: either <= 2 photos OR 1 document (pdf)
 *
 * Suggested object keys:
 * - estates/<estateId>/hunting_licenses/<licenseId>/photos/<attachmentId>.<ext>
 * - estates/<estateId>/hunting_licenses/<licenseId>/pdf/<attachmentId>.pdf
 * - estates/<estateId>/training_certificates/<certId>/photos/<attachmentId>.<ext>
 * - estates/<estateId>/training_certificates/<certId>/pdf/<attachmentId>.pdf
 */
export const attachmentEntityType = pgEnum("attachment_entity_type", [
  "hunting_license",
  "training_certificate",
]);

export const attachmentKind = pgEnum("attachment_kind", ["photo", "document"]);

export const attachmentsTable = pgTable(
  "attachments",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    estateId: integer("estate_id").notNull(),

    entityType: attachmentEntityType("entity_type").notNull(),

    /**
     * Polymorphic pointer:
     * - if entityType='hunting_license' then entityId = hunting_licenses.id
     * - if entityType='training_certificate' then entityId = training_certificates.id
     *
     * Cannot be a DB FK to both at once; enforce correctness in backend.
     */
    entityId: integer("entity_id").notNull(),

    kind: attachmentKind("kind").notNull(),

    // Object storage pointer + metadata
    key: text("key").notNull(),
    contentType: text("content_type").notNull(), // image/jpeg | image/png | image/webp | application/pdf | ...
    originalName: text("original_name").notNull(),
    sizeBytes: integer("size_bytes").notNull(),

    uploadDate: timestamp("upload_date").notNull().defaultNow(),
  },
  (t) => [
    index("idx_attachments_entity").on(t.estateId, t.entityType, t.entityId),
    index("idx_attachments_kind").on(
      t.estateId,
      t.entityType,
      t.entityId,
      t.kind
    ),
    index("idx_attachments_key").on(t.key),
  ]
);

/**
 * Relations
 *
 * Note: attachments are polymorphic, so in queries always filter on:
 *   entityType + entityId (+ estateId)
 */
export const huntingLicensesRelations = relations(
  huntingLicensesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [huntingLicensesTable.userId],
      references: [usersTable.id],
    }),
    attachments: many(attachmentsTable, {
      relationName: "hunting_license_attachments",
    }),
  })
);

export const trainingCertificatesRelations = relations(
  trainingCertificatesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [trainingCertificatesTable.userId],
      references: [usersTable.id],
    }),
    attachments: many(attachmentsTable, {
      relationName: "training_certificate_attachments",
    }),
  })
);

export const attachmentsRelations = relations(attachmentsTable, ({ one }) => ({
  // Virtual relations (polymorphic). Always check entityType in code.
  huntingLicense: one(huntingLicensesTable, {
    fields: [attachmentsTable.entityId],
    references: [huntingLicensesTable.id],
    relationName: "hunting_license_attachments",
  }),
  trainingCertificate: one(trainingCertificatesTable, {
    fields: [attachmentsTable.entityId],
    references: [trainingCertificatesTable.id],
    relationName: "training_certificate_attachments",
  }),
}));
