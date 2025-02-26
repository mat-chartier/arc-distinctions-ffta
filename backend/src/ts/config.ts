import 'dotenv/config';

export const ArcDistinctionsConfig = {
  dbConnectionUrl: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SCHEMA}`,
  encryptionKey: process.env.ENCRYPTION_KEY,
};
