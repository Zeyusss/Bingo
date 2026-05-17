import { z } from "zod";

const objectId = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, "Invalid id format");

const productImageSchema = z.object({
  fileId: z.string().trim().min(1, "fileId is required"),
  file_url: z.string().url("file_url must be a valid URL"),
});

const tagsSchema = z
  .union([
    z.string().trim().min(1, "At least one tag is required"),
    z.array(z.string().trim().min(1)).min(1, "At least one tag is required"),
  ])
  .transform((tags) => (Array.isArray(tags) ? tags : tags.split(",")));

/** Treat empty / null / NaN as omitted (matches optional sale price field in seller UI). */
const optionalSalePrice = z.preprocess(
  (val) =>
    val === null ||
    val === undefined ||
    val === "" ||
    (typeof val === "number" && Number.isNaN(val))
      ? undefined
      : val,
  z.coerce
    .number({ invalid_type_error: "sale_price must be a number" })
    .positive("sale_price must be greater than 0")
    .optional(),
);

export const createDiscountCodesSchema = z
  .object({
    public_name: z.string().trim().min(1, "public_name is required").max(120),
    discountType: z.enum(["percentage", "flat"], {
      errorMap: () => ({
        message: 'discountType must be "percentage" or "flat"',
      }),
    }),
    discountValue: z.coerce
      .number({ invalid_type_error: "discountValue must be a number" })
      .positive("discountValue must be greater than 0"),
    discountCode: z
      .string()
      .trim()
      .min(1, "discountCode is required")
      .max(64, "discountCode is too long"),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "percentage" && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountValue"],
        message: "Percentage discount cannot exceed 100",
      });
    }
  });

export const createProductSchema = z
  .object({
    title: z.string().trim().min(1, "title is required").max(200),
    short_description: z
      .string()
      .trim()
      .min(1, "short_description is required")
      .max(500),
    detailed_description: z
      .string()
      .trim()
      .min(1, "detailed_description is required"),
    warranty: z.string().trim().optional(),
    custom_specifications: z
      .union([z.record(z.unknown()), z.array(z.unknown())])
      .optional()
      .transform((v) => (Array.isArray(v) ? {} : v))
      .default({}),
    slug: z
      .string()
      .trim()
      .min(1, "slug is required")
      .max(120)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "slug must be lowercase letters, numbers, and hyphens only",
      ),
    tags: tagsSchema,
    cash_on_delivery: z.union([z.string(), z.boolean()]).optional(),
    brand: z.string().trim().optional(),
    video_url: z
      .string()
      .url("video_url must be a valid URL")
      .optional()
      .or(z.literal("")),
    category: z.string().trim().min(1, "category is required"),
    subCategory: z.string().trim().min(1, "subCategory is required"),
    colors: z.array(z.string().trim().min(1)).optional().default([]),
    sizes: z.array(z.string().trim().min(1)).optional().default([]),
    discountCodes: z.array(objectId).optional().default([]),
    stock: z.coerce
      .number({ invalid_type_error: "stock must be a number" })
      .int("stock must be a whole number")
      .positive("stock must be greater than 0")
      .max(1_000_000, "stock is too large"),
    sale_price: optionalSalePrice,
    regular_price: z.coerce
      .number({ invalid_type_error: "regular_price must be a number" })
      .positive("regular_price must be greater than 0"),
    customProperties: z
      .union([z.record(z.unknown()), z.array(z.unknown())])
      .optional()
      .transform((v) => (Array.isArray(v) ? {} : v))
      .default({}),
    images: z
      .array(z.union([productImageSchema, z.null()]))
      .transform((arr) => arr.filter(Boolean))
      .pipe(
        z.array(productImageSchema).min(1, "At least one product image is required"),
      ),
    starting_date: z.coerce.date().optional().nullable(),
    ending_date: z.coerce.date().optional().nullable(),
    personalizationEnabled: z.coerce.boolean().optional().default(false),
    personalizationInstructions: z.string().optional().default(""),
    personalizationRequired: z.coerce.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.sale_price !== undefined && data.sale_price > data.regular_price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sale_price"],
        message: "sale_price cannot exceed regular_price",
      });
    }
    if (data.starting_date && data.ending_date) {
      if (data.ending_date <= data.starting_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ending_date"],
          message: "ending_date must be after starting_date",
        });
      }
    }
  });

export type CreateDiscountCodesInput = z.infer<typeof createDiscountCodesSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
