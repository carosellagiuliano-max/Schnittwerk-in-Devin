export async function api<T=any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'admin',
      'x-user-email': 'admin@dev.local',
      ...(init.headers || {})
    }
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
