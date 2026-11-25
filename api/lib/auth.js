import { SignJWT, jwtVerify } from 'jose';
export function secret(){
  if(!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters');
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}
export async function makeToken(user){ return new SignJWT({uid:String(user.id)}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret()); }
export async function getUserId(req){
  const h=req.headers.authorization||''; const token=h.startsWith('Bearer ')?h.slice(7):'';
  if(!token) return null;
  try { const {payload}=await jwtVerify(token,secret()); return payload.uid||null; } catch { return null; }
}
export function send(res,status,body){res.status(status).json(body);}
