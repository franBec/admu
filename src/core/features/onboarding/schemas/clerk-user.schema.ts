import { z } from "zod";

export const clerkUserInZObject = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  imageUrl: z.string().url().optional(),
});

export type ClerkUserIn = z.infer<typeof clerkUserInZObject>;
