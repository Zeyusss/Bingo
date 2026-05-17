import { z } from "zod";

const objectId = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, "Invalid product id format");

const eventDatesBase = z.object({
  productId: objectId,
  starting_date: z.coerce.date({
    invalid_type_error: "starting_date must be a valid date",
    required_error: "starting_date is required",
  }),
  ending_date: z.coerce.date({
    invalid_type_error: "ending_date must be a valid date",
    required_error: "ending_date is required",
  }),
  discount_percentage: z.coerce
    .number({ invalid_type_error: "discount_percentage must be a number" })
    .min(0, "discount_percentage cannot be negative")
    .max(100, "discount_percentage cannot exceed 100")
    .optional(),
});

const endAfterStart = (
  data: { starting_date: Date; ending_date: Date },
  ctx: z.RefinementCtx,
) => {
  if (data.ending_date <= data.starting_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ending_date"],
      message: "ending_date must be after starting_date",
    });
  }
};

export const createEventSchema = eventDatesBase.superRefine((data, ctx) => {
  endAfterStart(data, ctx);
  if (data.starting_date < new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["starting_date"],
      message: "starting_date cannot be in the past",
    });
  }
});

export const updateEventSchema = eventDatesBase.superRefine(endAfterStart);

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
