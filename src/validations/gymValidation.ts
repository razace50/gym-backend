import { z } from "zod";

export const createMemberSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional().nullable(),
  age: z.coerce.number().int().positive().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  membershipId: z.coerce.number().int().positive().optional().nullable(),
  trainerId: z.coerce.number().int().positive().optional().nullable(),
});

export const updateMemberSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  age: z.coerce.number().int().positive().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  membershipId: z.coerce.number().int().positive().optional().nullable(),
  trainerId: z.coerce.number().int().positive().optional().nullable(),
});

export const updateMemberStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"]),
});

export const renewMembershipSchema = z.object({
  membershipId: z.coerce.number().int().positive(),
});

export const createPaymentSchema = z.object({
  memberId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
});

export const checkInSchema = z.object({
  memberId: z.coerce.number().int().positive(),
});