export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store");
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return res.status(500).json({error:"ยังไม่ได้ตั้ง SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน Vercel"});
 const endpoint=url.replace(/\/$/,"")+"/rest/v1/orders";
 try{
  if(req.method==="POST"){
   const body=typeof req.body==="string"?JSON.parse(req.body||"{}"):(req.body||{});
   if(!body.customer?.name)return res.status(400).json({error:"กรุณาใส่ชื่อลูกค้า"});
   if(!Array.isArray(body.stops)||!body.stops.length)return res.status(400).json({error:"กรุณาเพิ่มอย่างน้อย 1 จุด"});
   const row={status:body.status||"customer_submitted",customer:body.customer||{},pickup:body.pickup||"",dropoff:body.dropoff||"",item:body.items||"",note:body.note||"",body:JSON.stringify(body)};
   const r=await fetch(endpoint,{method:"POST",headers:{"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json","Prefer":"return=representation"},body:JSON.stringify(row)});
   const text=await r.text();let data={};try{data=JSON.parse(text)}catch{}
   if(!r.ok)return res.status(r.status).json({error:data?.message||data?.hint||data?.details||"บันทึกออเดอร์ไม่สำเร็จ"});
   const created=Array.isArray(data)?data[0]:data;
   return res.status(201).json({ok:true,id:created?.id||null,order:created||row});
  }
  if(req.method==="GET"){
   const r=await fetch(endpoint+"?select=*&order=created_at.desc&limit=100",{headers:{"apikey":key,"Authorization":"Bearer "+key}});
   const text=await r.text();let data=[];try{data=JSON.parse(text)}catch{}
   if(!r.ok)return res.status(r.status).json({error:data?.message||data?.hint||data?.details||"โหลดออเดอร์ไม่สำเร็จ"});
   return res.status(200).json({ok:true,orders:Array.isArray(data)?data:[]});
  }
  res.setHeader("Allow","GET, POST");return res.status(405).json({error:"Method not allowed"});
 }catch(e){console.error(e);return res.status(500).json({error:e?.message||"เซิร์ฟเวอร์เกิดข้อผิดพลาด"})}
}