export interface AppConfig {
  app: {
    port: number;
    env: string;
    logLevel: string;
  };
  database: {
    url: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    apiKeySecret: string;
    passwordSaltRounds: number;
  };
  mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
  storage: {
    endpoint: string;
    port: number;
    bucket: string;
    accessKey: string;
    secretKey: string;
    useSsl: boolean;
    region: string;
  };
}

export default (): AppConfig => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    env: process.env.NODE_ENV ?? 'development',
    logLevel: process.env.LOG_LEVEL ?? 'info',
  },
  database: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/crm',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'development-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    apiKeySecret: process.env.API_KEY_SECRET ?? 'development-api-key-secret',
    passwordSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
  },
  mail: {
    host: process.env.MAIL_HOST ?? '127.0.0.1',
    port: parseInt(process.env.MAIL_PORT ?? '1025', 10),
    user: process.env.MAIL_USER ?? '',
    pass: process.env.MAIL_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'crm@example.com',
  },
  storage: {
    endpoint: process.env.MINIO_ENDPOINT ?? '127.0.0.1',
    port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
    bucket: process.env.MINIO_BUCKET ?? 'attachments',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    useSsl: (process.env.MINIO_USE_SSL ?? 'false').toLowerCase() === 'true',
    region: process.env.MINIO_REGION ?? 'us-east-1',
  },
});
