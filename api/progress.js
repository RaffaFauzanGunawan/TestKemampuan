import { neon } from '@neondatabase/serverless';
import { getUserId, send } from './lib/auth.js';
const sql=()=>neon(process.env.DATABASE_URL);
export default async function handler(req,res){
  if(!['GET','PUT'].includes(req.method)) return send(res,405,{error:'Method not allowed'});
  try {
    const uid=await getUserId(req); if(!uid) return send(res,401,{error:'Sesi tidak valid. Masuk kembali.'});
    const db=sql();
    if(req.method==='GET'){
      const rows=await db`SELECT coins,completed_games,equipped,owned_outfits,asked_history,theme FROM users WHERE id=${uid} LIMIT 1`;
      if(!rows.length) return send(res,404,{error:'Akun tidak ditemukan'});
      const u=rows[0]; return send(res,200,{coins:u.coins,completedGames:u.completed_games,equipped:u.equipped,ownedOutfits:u.owned_outfits,askedHistory:u.asked_history,theme:u.theme});
    }
    const p=req.body||{};
    const coins=Math.max(0,Math.min(10000000,Math.floor(Number(p.coins)||0)));
    const arr=(v,max=500)=>Array.isArray(v)?v.slice(0,max):[];
    const completed=JSON.stringify(arr(p.completedGames,300));
    const equipped=JSON.stringify(p.equipped&&typeof p.equipped==='object'?p.equipped:{body:'body-default',head:'head-default'});
    const owned=JSON.stringify(arr(p.ownedOutfits,100));
    const history=JSON.stringify(p.askedHistory&&typeof p.askedHistory==='object'?p.askedHistory:{});
    const theme=p.theme==='light'?'light':'dark';
    await db`UPDATE users SET coins=${coins},completed_games=${completed}::jsonb,equipped=${equipped}::jsonb,owned_outfits=${owned}::jsonb,asked_history=${history}::jsonb,theme=${theme},updated_at=now() WHERE id=${uid}`;
    return send(res,200,{ok:true});
  } catch(e){ console.error('progress error',e); return send(res,500,{error:'Gagal menyimpan progres.'}); }
}
