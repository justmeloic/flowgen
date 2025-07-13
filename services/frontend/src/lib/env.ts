import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_HOST: z.string().min(1, 'NEXT_PUBLIC_API_HOST is not set'),
  NEXT_PUBLIC_API_PORT: z.string().min(1, 'NEXT_PUBLIC_API_PORT is not set'),
  NEXT_PUBLIC_API_BASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is not set'),
});

export const env = envSchema.parse(process.env);
