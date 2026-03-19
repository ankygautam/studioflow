import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  role: z.enum(['admin', 'staff', 'receptionist', 'customer']),
})

export const registerSchema = z.object({
  businessName: z.string().min(2, 'Business name is required.'),
  businessType: z.string().min(2, 'Choose a business type.'),
  email: z.email('Enter a valid business email.'),
  fullName: z.string().min(2, 'Full name is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  role: z.enum(['admin', 'staff', 'receptionist']),
})

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
