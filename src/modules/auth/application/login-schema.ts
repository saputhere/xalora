import { z } from "zod";
import { PASSWORD_MAX_LENGTH } from "./register-schema";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});