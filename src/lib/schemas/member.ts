import { z } from 'zod'

export const CreateMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email'),
})

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>
