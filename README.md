# AI Withholding Tax Assistant - Group XX

เว็บต้นแบบสำหรับงาน AC317 การบัญชีภาษีอากร

## สมาชิกกลุ่ม
1. อรรฆพร ปลื้มประภากร
2. จุฑามาศ แสงทวีป
3. นันทรัตน์ ชัยดี
4. ฐานิดา แสนสิงห์

## ทดลองใช้งาน
- เปิด `index.html` บน Chrome, Safari, Edge หรือ Firefox ได้ทันที
- ไม่มี dependency และไม่ต้องติดตั้ง package
- ทดสอบกรณีในเมนู “กรณีทดสอบ 10 ข้อ” หรือกรอกข้อมูลใน “คำนวณภาษี”

## ขอบเขตระบบ
Prototype นี้เป็น **rule-based decision-support tool** ไม่ใช่ LLM ที่เชื่อมต่อ API ภายนอก จึงทำงานแบบ static ได้โดยไม่ต้องใส่ API key และไม่ส่งข้อมูลออกนอกเครื่อง รองรับกรณีทั่วไปภายในประเทศตามกฎที่ระบุเท่านั้น

## เผยแพร่สาธารณะด้วย GitHub Pages
1. แตกไฟล์ zip แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ไปยัง root ของ repository `ai-withholding-tax` บน branch `main`
2. ใน GitHub เปิด Settings > Pages
3. เลือก Build and deployment: Deploy from a branch
4. เลือก Branch `main`, Folder `/ (root)` แล้วกด Save
5. รอ GitHub Actions ทำงาน จากนั้นตรวจ URL ที่ GitHub Pages แสดงใน Settings > Pages

Repository ปัจจุบัน: https://github.com/atkaporn9-afk/ai-withholding-tax

## ข้อควรทราบ
- ก่อนส่งงานให้กรอกหมายเลขกลุ่มแทน `XX` ในชื่อไฟล์ตามที่อาจารย์กำหนด
- โปรดตรวจผลทดสอบรอบแรกของ Prompt v1 ด้วยตนเอง ผลตัวอย่างที่ระบุในไฟล์ TestResults เป็น “ผลจำลองเพื่อแสดงจุดผิดพลาดที่ควรทดสอบ” ไม่ใช่ผลรันจริงจาก LLM
- ตรวจสอบกฎหมายอีกครั้งก่อนใช้กับธุรกรรมจริง โดยเฉพาะสัญญาผสม ภาษีมูลค่าเพิ่ม และผู้รับต่างประเทศ
