declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      user?: { email: string; role: string } | null;
    }
  }
}
export {}
