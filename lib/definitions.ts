import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, { error: "Be at least 8 characters long" })
  .regex(/[a-zA-Z]/, { error: "Contain at least one letter" })
  .regex(/[0-9]/, { error: "Contain at least one number" });

const gmailSchema = z
  .email({ error: "Please enter a valid email" })
  .trim()
  .toLowerCase()
  .refine((email) => email.endsWith("@gmail.com"), {
    error: "Please use a Gmail address (@gmail.com)",
  });

export const RegisterFormSchema = z
  .object({
    companyName: z.string().min(2, { error: "Company name must be at least 2 characters long" }).trim(),
    name: z.string().min(2, { error: "Name must be at least 2 characters long" }).trim(),
    email: gmailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const LoginFormSchema = z.object({
  email: gmailSchema,
  password: z.string().min(1, { error: "Password is required" }),
});

export const ForgotPasswordFormSchema = z.object({
  email: gmailSchema,
});

export const ResetPasswordFormSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const UpdateProfileFormSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters long" }).trim(),
});

export const SearchJobFormSchema = z.object({
  productName: z.string().min(2, { error: "Product name must be at least 2 characters long" }).trim(),
  oemNumber: z.string().trim().optional(),
  hsCode: z.string().trim().optional(),
  imageDescription: z.string().trim().optional(),
  countries: z.array(z.string()).min(1, { error: "Select at least one country" }),
  searchEngines: z
    .array(z.enum(["google", "bing", "yandex"]))
    .min(1, { error: "Select at least one search engine" }),
  competitorBrands: z.array(z.string().trim().min(1)).optional().default([]),
  relatedIndustries: z.array(z.string()).optional().default([]),
});

export const MapsSearchJobFormSchema = z
  .object({
    countries: z.array(z.string()).min(1, { error: "Select at least one country" }),
    keyword: z.string().trim().optional(),
    industry: z.string().trim().optional(),
  })
  .refine((data) => data.keyword || data.industry, {
    error: "Enter a keyword or an industry",
    path: ["keyword"],
  });

export const CreateCampaignFormSchema = z.object({
  searchJobId: z.string().min(1, { error: "Select a search" }),
  fromEmail: z.email({ error: "Enter a valid sender email" }).trim(),
  fromName: z.string().min(1, { error: "Enter a sender name" }).trim(),
  subject: z.string().min(1, { error: "Enter a subject" }).trim(),
  bodyTemplate: z.string().min(1, { error: "Enter a message" }).trim(),
  recipientIds: z.array(z.string()).min(1, { error: "Select at least one recipient" }),
  sendRatePerMinute: z.coerce.number().int().positive().optional().default(20),
});

export const CheckoutFormSchema = z.object({
  planId: z.string().min(1, { error: "Select a plan" }),
  fullName: z.string().min(1, { error: "Enter your full name or company name" }).trim(),
  country: z.string().min(1, { error: "Enter your country" }).trim(),
  address: z.string().min(1, { error: "Enter your address" }).trim(),
  city: z.string().min(1, { error: "Enter your city" }).trim(),
  postalCode: z.string().min(1, { error: "Enter your postal code" }).trim(),
  taxId: z.string().trim().optional(),
  billingEmail: z.email({ error: "Enter a valid billing email" }).trim(),
  cardNumber: z.string().min(12, { error: "Enter a valid card number" }).trim(),
  expiryMonth: z.coerce.number().int().min(1).max(12, { error: "Enter a valid expiry month" }),
  expiryYear: z.coerce.number().int().min(new Date().getFullYear(), { error: "Enter a valid expiry year" }),
  cvc: z
    .string()
    .trim()
    .regex(/^\d{3,4}$/, { error: "Enter a valid CVC" }),
  cardholderName: z.string().min(1, { error: "Enter the name on the card" }).trim(),
  agreeTerms: z.literal("on", { error: "You must agree to the terms to continue" }),
});

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export type Role = "ADMIN" | "MEMBER";

export type SessionPayload = {
  userId: string;
  companyId: string;
  role: Role;
};
