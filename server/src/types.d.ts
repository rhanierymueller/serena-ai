declare namespace NodeJS {
  interface ProcessEnv {
    CLIENT_URL?: string;
    SESSION_SECRET?: string;
    COOKIE_DOMAIN?: string;
    REDIS_URL?: string;
    PORT?: string;
  }
} 