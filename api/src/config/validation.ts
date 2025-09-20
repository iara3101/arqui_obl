import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),
  LOG_LEVEL: Joi.string().default('info'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  API_KEY_SECRET: Joi.string().min(16).required(),
  BCRYPT_SALT_ROUNDS: Joi.number().integer().min(4).default(12),
  MAIL_HOST: Joi.string().default('127.0.0.1'),
  MAIL_PORT: Joi.number().default(1025),
  MAIL_USER: Joi.string().allow(''),
  MAIL_PASS: Joi.string().allow(''),
  MAIL_FROM: Joi.string().email().default('crm@example.com'),
  MINIO_ENDPOINT: Joi.string().default('127.0.0.1'),
  MINIO_PORT: Joi.number().default(9000),
  MINIO_BUCKET: Joi.string().default('attachments'),
  MINIO_ACCESS_KEY: Joi.string().default('minioadmin'),
  MINIO_SECRET_KEY: Joi.string().default('minioadmin'),
  MINIO_USE_SSL: Joi.boolean().truthy('true').falsy('false').default(false),
  MINIO_REGION: Joi.string().default('us-east-1'),
});
