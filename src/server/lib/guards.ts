import { Request, Response, NextFunction } from 'express'

export function tenantId(req: Request): string {
  if (!req.tenantId) throw new Error('Tenant not resolved')
  return req.tenantId
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const u = req.user
    if (!u) return res.status(401).json({ error: 'Not authenticated' })
    if (!roles.includes(u.role)) return res.status(403).json({ error: 'Forbidden' })
    next()
  }
}
