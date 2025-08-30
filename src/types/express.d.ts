import { Express } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      user?: { email: string; role: string } | null;
      file?: Express.Multer.File;
    }
  }
}

export {}
