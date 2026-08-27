import { z } from "zod";

const MAX_TEXT = 2000;
const MAX_TITLE = 200;

const localizedTextSchema = z.object({
  en: z.string().min(1).max(MAX_TEXT),
  ar: z.string().min(1).max(MAX_TEXT),
});

const orderSchema = z.number().int().min(0).max(1000000);

const isoDateSchema = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date, expected YYYY-MM-DD"),
  z.literal(""),
]);

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(320),
  password: z.string().min(1, "Password is required").max(72),
});

export const userCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(320),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  role: z.enum(["leader", "member", "client"]),
});

export const userSelfUpdateSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email("Invalid email address").max(320).optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72)
      .optional(),
    currentPassword: z.string().min(1).max(72).optional(),
  })
  .refine(
    (data) => data.name || data.email || data.password,
    "At least one field is required",
  );

export const userAdminUpdateSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email("Invalid email address").max(320).optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72)
      .optional(),
    role: z.enum(["leader", "member", "client"]).optional(),
    order: orderSchema.optional(),
  })
  .refine(
    (data) =>
      data.name ||
      data.email ||
      data.password ||
      data.role ||
      data.order !== undefined,
    "At least one field is required",
  );

export const projectCreateSchema = z.object({
  title: z.object({
    en: z
      .string()
      .min(3, "English title must be at least 3 characters")
      .max(MAX_TITLE),
    ar: z
      .string()
      .min(3, "Arabic title must be at least 3 characters")
      .max(MAX_TITLE),
  }),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
  status: z
    .enum(["planning", "active", "completed", "on_hold"])
    .default("planning"),
  teamMembers: z.array(z.string().uuid()).max(100).default([]),
  color: z.string().max(50).optional(),
  order: orderSchema.optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  id: z.never().optional(),
  createdBy: z.never().optional(),
  createdAt: z.never().optional(),
});

export const sectionCreateSchema = z.object({
  projectId: z.string().uuid("Invalid project id"),
  title: z.object({
    en: z
      .string()
      .min(3, "English title must be at least 3 characters")
      .max(MAX_TITLE),
    ar: z
      .string()
      .min(3, "Arabic title must be at least 3 characters")
      .max(MAX_TITLE),
  }),
  order: orderSchema.optional(),
});

export const sectionUpdateSchema = z.object({
  title: z
    .object({
      en: z.string().min(3).max(MAX_TITLE),
      ar: z.string().min(3).max(MAX_TITLE),
    })
    .optional(),
  order: orderSchema.optional(),
});

export const taskCreateSchema = z.object({
  sectionId: z.string().uuid("Invalid section id"),
  title: localizedTextSchema,
  description: localizedTextSchema,
  status: z.enum(["todo", "in_progress", "in_review", "done"]).default("todo"),
  assignedTo: z.array(z.string().uuid()).max(100).default([]),
  dueDate: isoDateSchema.optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  tags: z.array(z.string().max(50)).max(50).default([]),
  order: orderSchema.optional(),
  attachments: z
    .array(
      z
        .string()
        .regex(
          /^images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/,
          "Invalid attachment path",
        ),
    )
    .max(20)
    .default([]),
  assigneePrices: z
    .array(
      z.object({
        userId: z.string().uuid(),
        price: z.number().min(0).max(1000000000),
      }),
    )
    .max(100)
    .default([]),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  id: z.never().optional(),
  sectionId: z.string().uuid().optional(),
});

const reorderItemSchema = z.object({
  id: z.string().uuid(),
  order: orderSchema,
  sectionId: z.string().uuid().optional(),
});

export const reorderBodySchema = z.object({
  updates: z.array(reorderItemSchema).min(1).max(1000),
});

const userReorderItemSchema = z.object({
  id: z.string().uuid(),
  order: orderSchema,
});

export const userReorderBodySchema = z.object({
  updates: z.array(userReorderItemSchema).min(1).max(1000),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ProjectInput = z.infer<typeof projectCreateSchema>;
export type SectionInput = z.infer<typeof sectionCreateSchema>;
export type TaskInput = z.infer<typeof taskCreateSchema>;
