import Joi from 'joi';
import { CompanySize, UserRole } from '../types';

export const userValidationSchema = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
      .messages({
        'string.pattern.base': 'Le mot de passe doit contenir au moins une lettre minuscule, une majuscule, un chiffre et un caractère spécial'
      }),
    role: Joi.string().valid(...Object.values(UserRole)).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
  }),
};

export const companyValidationSchema = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    siret: Joi.string().pattern(/^[0-9]{14}$/).optional(),
    sector: Joi.string().min(2).max(50).required(),
    size: Joi.string().valid(...Object.values(CompanySize)).required(),
    revenue: Joi.number().min(0).optional(),
    location: Joi.string().min(2).max(100).required(),
    address: Joi.string().max(200).optional(),
    phone: Joi.string().pattern(/^(\+33|0)[1-9](\d{8})$/).optional(),
    website: Joi.string().uri().optional(),
    description: Joi.string().max(1000).optional(),
    foundedYear: Joi.number().min(1800).max(new Date().getFullYear()).optional(),
    employeeCount: Joi.number().min(0).optional(),
    legalForm: Joi.string().max(50).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    siret: Joi.string().pattern(/^[0-9]{14}$/).optional(),
    sector: Joi.string().min(2).max(50).optional(),
    size: Joi.string().valid(...Object.values(CompanySize)).optional(),
    revenue: Joi.number().min(0).optional(),
    location: Joi.string().min(2).max(100).optional(),
    address: Joi.string().max(200).optional(),
    phone: Joi.string().pattern(/^(\+33|0)[1-9](\d{8})$/).optional(),
    website: Joi.string().uri().optional(),
    description: Joi.string().max(1000).optional(),
    foundedYear: Joi.number().min(1800).max(new Date().getFullYear()).optional(),
    employeeCount: Joi.number().min(0).optional(),
    legalForm: Joi.string().max(50).optional(),
  }),
};

export const organizationValidationSchema = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    type: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(1000).optional(),
    website: Joi.string().uri().optional(),
    phone: Joi.string().pattern(/^(\+33|0)[1-9](\d{8})$/).optional(),
    address: Joi.string().max(200).optional(),
    contactInfo: Joi.object().optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    type: Joi.string().min(2).max(50).optional(),
    description: Joi.string().max(1000).optional(),
    website: Joi.string().uri().optional(),
    phone: Joi.string().pattern(/^(\+33|0)[1-9](\d{8})$/).optional(),
    address: Joi.string().max(200).optional(),
    contactInfo: Joi.object().optional(),
  }),
};

export const programValidationSchema = {
  create: Joi.object({
    title: Joi.string().min(10).max(200).required(),
    description: Joi.string().min(50).max(5000).required(),
    criteria: Joi.object().required(),
    amountMin: Joi.number().min(0).optional(),
    amountMax: Joi.number().min(0).optional(),
    deadline: Joi.date().min('now').optional(),
    sector: Joi.array().items(Joi.string()).min(1).required(),
    companySize: Joi.array().items(Joi.string().valid(...Object.values(CompanySize))).min(1).required(),
    location: Joi.array().items(Joi.string()).min(1).required(),
    tags: Joi.array().items(Joi.string()).optional(),
    requirements: Joi.object().optional(),
    applicationForm: Joi.object().optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(10).max(200).optional(),
    description: Joi.string().min(50).max(5000).optional(),
    criteria: Joi.object().optional(),
    amountMin: Joi.number().min(0).optional(),
    amountMax: Joi.number().min(0).optional(),
    deadline: Joi.date().min('now').optional(),
    sector: Joi.array().items(Joi.string()).min(1).optional(),
    companySize: Joi.array().items(Joi.string().valid(...Object.values(CompanySize))).min(1).optional(),
    location: Joi.array().items(Joi.string()).min(1).optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    requirements: Joi.object().optional(),
    applicationForm: Joi.object().optional(),
  }),
};

export const applicationValidationSchema = {
  create: Joi.object({
    programId: Joi.string().required(),
    data: Joi.object().required(),
  }),

  update: Joi.object({
    data: Joi.object().optional(),
    status: Joi.string().optional(),
    score: Joi.number().min(0).max(100).optional(),
  }),
};

export const validate = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new Error(error.details.map(d => d.message).join(', '));
  }
  return value;
};