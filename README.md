# Future Me Magic Mirror — V02.3 Three.js Transformation FX

ต่อยอดจาก V02.2 Auto Photo (ไม่ใช่โปรเจกต์ Fantasy) โดย **ไม่แก้ระบบกล้อง/MediaPipe, UI 6 หน้า, Astronaut 2D AR, ระบบสุ่ม, Auto Photo และพอร์ต 3117**

## มีอะไรใหม่
- Three.js WebGL layer แบบโปร่งใสในหน้า **Transformation** และ **Photo Moment**: วงแหวนเวท 3 ชั้น, วง Halo, ดาวรอบผู้เล่น พร้อมแอนิเมชันเริ่มแปลงร่าง
- Theme tint ใช้สีประจำอาชีพทั้ง 6 (อาชีพอื่นยังเป็นชุด Mock ไม่ใช่ชุด AR จริง)
- Export PNG รวม WebGL effect โดยใช้ `preserveDrawingBuffer` และ Canvas `drawImage` เมื่อถ่ายภาพ หากอุปกรณ์ไม่รองรับ WebGL ระบบอื่นยังทำงานต่อได้
- จำกัด Pixel Ratio ที่ 1.5 และลดอัตรา render ประมาณ 30 FPS เพื่อลดภาระมือถือ

## รันบน Windows
```bash
npm install
npm run dev
```
เปิด **http://localhost:3117** (พอร์ต Fantasy 3107 ไม่ถูกใช้) ตรวจพอร์ตชนด้วย `netstat -ano | findstr :3117` และหยุดเฉพาะ terminal ของ Future Me ตัวก่อนถ้ารันอยู่

## วิธีทดสอบ
1. Welcome > Ready > เปิดกล้อง > Test Astronaut AR (หรือเล่นสุ่มครบ flow)
2. หน้า Transformation ควรมีวงแหวนสีทอง/ม่วงและดาวเคลื่อนรอบตัว โดยยังเห็นภาพกล้องและชุด Astronaut เดิม
3. ดู Countdown 5 วินาทีตามเดิม > Photo Moment 3,2,1 > Result
4. ดาวน์โหลด PNG ตรวจดูว่ามีชุดและวงแหวนแสดงด้วย ถ้าไม่มี WebGL ให้ลองดู Console และตรวจ `WebGL` ของอุปกรณ์
5. ทดสอบ 540x960, 1080x1920 และ 1920x1080 (DevTools) รวมถึง Safari/Chrome มือถือผ่าน HTTPS
6. อาชีพอื่นยังเป็น Mock ตามขอบเขตเดิม อย่าเข้าใจว่าเปลี่ยนชุดได้ครบแล้ว

## การนำขึ้น Vercel
Push โค้ดไปยัง GitHub repo ของ **Future Me** เท่านั้น; Vercel จะ Deploy อัตโนมัติตามสาขาที่ตั้งไว้. ก่อน Push แนะนำ `npm run build` บนเครื่อง. ไม่มีความจำเป็นต้องตั้งค่า Port บน Vercel.

## Technical Notes
- JavaScript JSX, Next.js 15, React 19, MediaPipe 0.10.21, Three.js 0.180.0
- Three.js แบบ dynamically imported บน client เท่านั้น (ไม่สร้าง WebGL ขณะ SSR)
- WebGL effect นี้เป็นภาพตกแต่งวงรอบตัว **ยังไม่ใช่ชุด 3D หรือ Face Tracking**
- ขณะถ่ายภาพสามวินาทีหลังเริ่ม Countdown, WebGL canvas มีการเรนเดอร์ต่อเนื่องและบันทึกลงใน PNG (หาก WebGL available)
- ไม่อัปโหลดภาพผู้เล่นขึ้น server
- เป็น MVP ที่ควรทดสอบ Build และกล้องจริงบนอุปกรณ์เป้าหมาย
