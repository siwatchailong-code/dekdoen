เด็กเดิน — ชุดแก้ใหม่
1) แทน index.html เดิมด้วยไฟล์นี้
2) แทน api/orders.js เดิมด้วยไฟล์นี้
3) แทน vercel.json เดิมด้วยไฟล์นี้
4) Vercel ต้องมี SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY
API คาดว่าตาราง orders มีอย่างน้อย id,status,customer,pickup,dropoff,item,note,body,created_at
โค้ด UI ใหม่ไม่ใช้ onclick และโครงสร้าง try/catch ถูกเขียนใหม่ทั้งหมด
