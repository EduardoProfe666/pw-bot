import * as Joi from 'joi';

export const configSchema = Joi.object({
  APP_PORT: Joi.number().default(4001).required(),
  APP_UI: Joi.string().uri().required(),
  EMAIL_RESET_PASSWORD_URL: Joi.string().uri().required(),
  TELEGRAM_TOKEN: Joi.string().required(),
  SECRET_KEY: Joi.string().required(),
  ADMIN_USERNAME: Joi.string().required(),
  ADMIN_PASSWORD: Joi.string().required(),
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().default(465).required(),
  MAIL_USER: Joi.string().email().required(),
  MAIL_PASSWORD: Joi.string().required(),
  SENDER_EMAIL: Joi.string().email().required(),
  SENDER_NAME: Joi.string().required(),
  DB_HOST: Joi.string().default('localhost').required(),
  DB_PORT: Joi.number().default(5432).required(),
  DB_DATABASE: Joi.string().default('pw-bot').required(),
  DB_USERNAME: Joi.string().default('postgres').required(),
  DB_PASSWORD: Joi.string().required()
}).unknown();