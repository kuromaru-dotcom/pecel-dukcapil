import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getApp } from '../server/app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  return app(req as any, res as any);
}
