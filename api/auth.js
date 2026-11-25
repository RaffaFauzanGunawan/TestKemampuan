import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { makeToken, send } from './lib/auth.js';
const sql=()=>{if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured'); return neon(process.env.DATABASE_URL)};
export default async function handler(req,res){
  if(req.method!=='POST') return send(res,405,{error:'Method not allowed'});
  try {
    const {nama,kelas,jurusan,password}=req.body||{};
    if(typeof nama!=='string'||nama.trim().length<2||nama.trim().length>100||typeof kelas!=='string'||!kelas.trim()||kelas.length>50||typeof jurusan!=='string'||!/^[-a-z0-9]{2,50}$/i.test(jurusan)||typeof password!=='string'||password.length<8||password.length>128) return send(res,400,{error:'Isi nama, kelas, jurusan, dan password minimal 8 karakter.'});
    const db=sql(), key=nama.trim().toLocaleLowerCase('id-ID').replace(/\s+/g,' ');
    let rows=await db`SELECT * FROM users WHERE nama_key=${key} LIMIT 1`, user=rows[0];
    if(user){
      if(!await bcrypt.compare(password,user.password_hash)) return send(res,401,{error:'Nama atau password salah.'});
      if(user.jurusan!==jurusan) return send(res,409,{error:'Jurusan akun ini sudah terkunci dan tidak dapat diubah.'});
    } else {
      const hash=await bcrypt.hash(password,12);
      try { rows=await db`INSERT INTO users(nama,nama_key,kelas,jurusan,password_hash) VALUES(${nama.trim()},${key},${kelas.trim()},${jurusan},${hash}) RETURNING *`; user=rows[0]; }
      catch(e){ if(e.code==='23505') return send(res,409,{error:'Akun baru saja dibuat. Coba masuk lagi.'}); throw e; }
    }
    const token=await makeToken(user);
    return send(res,200,{token,user:{nama:user.nama,kelas:user.kelas,jurusan:user.jurusan},progress:{coins:user.coins,completedGames:user.completed_games,equipped:user.equipped,ownedOutfits:user.owned_outfits,askedHistory:user.asked_history,theme:user.theme}});
  } catch(e){ console.error('auth error',e); return send(res,500,{error:'Server belum siap. Periksa konfigurasi database dan environment variables.'}); }
}
