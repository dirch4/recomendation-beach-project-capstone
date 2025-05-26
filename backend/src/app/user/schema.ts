import { z } from "zod";

export const userSchema = z.object({
  name: z.string(),
  email: z.string().email("invalid email format"),
  password: z.string(),
  confirmPassword: z.string(),
});
