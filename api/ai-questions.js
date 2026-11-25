import { getUserId, send } from './lib/auth.js';
export default async function handler(req,res){
  if(req.method!=='POST') return send(res,405,{error:'Method not allowed'});
  try {
    const uid=await getUserId(req); if(!uid) return send(res,401,{error:'Masuk untuk memakai fitur AI.'});
    if(!process.env.ANTHROPIC_API_KEY) return send(res,503,{error:'Fitur AI belum dikonfigurasi; bank soal lokal tetap dapat digunakan.'});
    const {prompt}=req.body||{};
    if(typeof prompt!=='string'||prompt.length<1||prompt.length>12000) return send(res,400,{error:'Prompt tidak valid.'});
    const upstream=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1200,messages:[{role:'user',content:prompt}]})});
    const data=await upstream.json(); if(!upstream.ok){console.error('Anthropic status',upstream.status);return send(res,502,{error:'Layanan AI sedang tidak tersedia.'});}
    return send(res,200,{content:(data.content||[]).map(c=>c.text||'').join('')});
  }catch(e){console.error('AI endpoint error',e);return send(res,500,{error:'Permintaan AI gagal.'});}
}
