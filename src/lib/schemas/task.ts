import { z } from 'zod'

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().nullable().optional(),
  assigneeId: z.string().uuid('Invalid assignee ID').nullable().optional(),
})

export const UpdateTaskSchema = z
  .object({
    title: z.string().min(1, 'Title cannot be empty').max(255, 'Title is too long').optional(),
    description: z.string().nullable().optional(),
    assigneeId: z.string().uuid('Invalid assignee ID').nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export const MoveTaskSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
    errorMap: () => ({ message: 'Invalid status value' }),
  }),
  order: z.number().int().min(0, 'Order must be non-negative'),
})

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>
export type MoveTaskInput = z.infer<typeof MoveTaskSchema>
