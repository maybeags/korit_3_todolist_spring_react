import dotenv from 'dotenv';

dotenv.config();

const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return value;
};

export const env = {
  PORT: getEnvVar('PORT'),
  DB_HOST: getEnvVar('DB_HOST'),
  DB_PORT: parseInt(getEnvVar('DB_PORT'), 10),
  DB_USER: getEnvVar('DB_USER'),
  DB_PASSWORD: getEnvVar('DB_PASSWORD'),
  DB_DATABASE: getEnvVar('DB_DATABASE'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
};
