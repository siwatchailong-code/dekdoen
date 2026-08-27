DEK-DERN MVP V5 — Backend Ready
================================

เพิ่มใน V5:
- /api/orders endpoint สำหรับสร้าง/อ่าน/แก้ไขออเดอร์
- หน้าเว็บเรียก API เมื่อส่งข้อมูลลูกค้า
- โครงลิงก์ ?view=customer&order=DD-xxxx และ ?view=rider&order=DD-xxxx
- vercel.json พร้อม deploy

ข้อจำกัดของ V5:
- ตัวอย่าง API นี้ใช้ memory store เพื่อทดสอบ contract เท่านั้น; Vercel serverless ไม่รับประกันข้อมูลคงอยู่ข้าม instance/deploy
- ก่อนใช้งานจริงต้องต่อฐานข้อมูลถาวร เช่น Supabase/Postgres
- ยังไม่เชื่อม Google Maps ตามแผน

เป้าหมาย 2 ชั่วโมงรอบนี้:
1) ล็อกโครงออเดอร์กลาง
2) ทำ API contract
3) ทำ frontend เรียก API
4) เตรียม deploy
