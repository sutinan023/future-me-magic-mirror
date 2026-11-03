# Future Me Magic Mirror — Prototype 02: Astronaut AR

โปรเจกต์ Next.js + **JavaScript (.jsx)** แยกจาก Magic Mirror Fantasy โดยสมบูรณ์ ใช้พอร์ต **3117** (Fantasy เดิม 3107)

## ฟีเจอร์
- UI และลำดับการเล่น **6 หน้าจอ** จาก Prototype 01 ยังอยู่ครบ
- สุ่ม 6 อาชีพแบบไม่ซ้ำรอบก่อน; อาชีพอื่นอีก 5 แบบยังเป็น **Mock**
- **นักบินอวกาศเท่านั้น:** เมื่อเปิดกล้องและโหลด MediaPipe Pose สำเร็จ จะแสดงหมวกและชุด SVG โปร่งใส ติดตามจุดศีรษะ ไหล่ และสะโพกแบบ Real-time
- ปุ่ม **ทดสอบชุดนักบินอวกาศโดยตรง** ในหน้าพร้อมเล่น เพื่อทดสอบ AR โดยไม่ต้องรอสุ่มได้อาชีพนี้
- ภาพถ่าย PNG ของนักบินอวกาศจะนำชุด AR มาประกอบกับภาพกล้องเมื่อพบ Pose ครบ
- ยังคงมีโหมด Mock หากไม่เปิดกล้องหรือโหลด AI ไม่สำเร็จ
- ไม่มีการส่งภาพกล้องหรือภาพถ่ายขึ้นเซิร์ฟเวอร์ในเวอร์ชันนี้

## รันใน Windows / VS Code

ใช้ Node.js 20 ขึ้นไป (แนะนำ 22 LTS)

```bash
npm install
npm run dev
```

เปิด **http://localhost:3117**

`npm install` จะเรียก `postinstall` เพื่อคัดลอก MediaPipe WASM ไปไว้ที่ `public/mediapipe/wasm` เพื่อไม่ให้เจอปัญหา CDN 404 แบบโปรเจกต์ Fantasy รุ่นแรก โมเดล Pose ยังโหลดจาก Google Storage จึงต้องมีอินเทอร์เน็ตครั้งที่ใช้งาน

## วิธีทดสอบ AR

1. เปิดเว็บ → **เริ่มเล่นเลย!** → **เปิดกล้อง** และอนุญาตการเข้าถึง
2. ตรวจข้อความ `AI พร้อมใช้งาน · Astronaut AR` (ถ้าขึ้นโหลด AI ไม่สำเร็จ ให้เปิด DevTools Console)
3. กด **ทดสอบชุดนักบินอวกาศโดยตรง** เพื่อข้ามการสุ่ม หรือกดพร้อมแล้วเพื่อทดสอบ Flow การสุ่ม
4. ขยับให้กล้องเห็น **ใบหน้า หู ไหล่ และสะโพก** ทั้งสองด้าน (การเห็นแค่ใบหน้าไม่พอ)
5. ดูชุด SVG ตามตัว จากนั้นกดถ่ายภาพ และตรวจว่าภาพ PNG มีชุดติดอยู่ด้วย
6. กดจบเกมเพื่อปิดกล้องและล้างสถานะการเล่น

ทดสอบ Responsive: Chrome → F12 → Ctrl+Shift+M → 540 × 960 หรือ 1080 × 1920; Desktop ใช้ Preview 9:16 พร้อม Side Panel

## ข้อจำกัดสำคัญ

- เป็น **2D AR Costume Prototype**: หมวกกับชุดเป็น SVG ตัวอย่าง ไม่ใช่ AI Virtual Try-on / การเปลี่ยนเสื้อผ้าสมจริง
- มุมกล้องหรือระยะที่เห็นศีรษะและสะโพกไม่ครบจะไม่แสดงชุด
- ชุดส่วนแขนยังไม่แยกตามข้อศอก; เมื่อหมุนตัวมาก อาจดูไม่สมจริง
- Pose เป็นโมเดลของ MediaPipe ที่รันบน Browser การตรวจจับจริงและ FPS ต้องทดสอบกับกล้องและอุปกรณ์เป้าหมาย
- โหมดภาพผลลัพธ์สำหรับอีก 5 อาชีพยังเป็น Mock เท่านั้น
- ควรมีผู้ปกครอง/เจ้าหน้าที่กำกับการใช้กล้องในงานเด็ก และจัดการความยินยอมก่อนเปิดจริง

## Build / Deploy

```bash
npm run build
```

ถ้าเชื่อม GitHub กับ Vercel แล้ว สามารถ commit + push ไปยัง repo **Future Me แยกจาก Fantasy** เพื่อให้ Vercel Deploy HTTPS อัตโนมัติ ค่า `3117` มีผลแค่รัน Local

## โครงสร้างหลัก

- `app/page.jsx` — 6 หน้าจอ, MediaPipe Pose, Gesture/Camera, Roulette, Capture
- `lib-ar.js` — แปลงพิกัดกล้อง (object-fit: cover + mirror) และวาดชุด Astronaut
- `public/assets/astronaut/helmet.svg` — หมวกโปร่งกลางให้เห็นใบหน้าจริง
- `public/assets/astronaut/suit.svg` — ชุดท่อนบน
- `scripts/copy-mediapipe-wasm.mjs` — คัดลอกไฟล์ WASM ตามเวอร์ชันที่ pin ไว้

**หมายเหตุการตรวจสอบ:** ตรวจ JSX syntax, SVG และโครงสร้าง ZIP แล้ว แต่ยังไม่ได้รัน `npm run build` สำเร็จในสภาพแวดล้อมนี้เพราะติดตั้ง npm dependencies ไม่ได้ จึงควร Build บนเครื่องก่อนอัปเดต Vercel


## V02.1 — Portrait Kiosk Layout Fix
- When the viewport is portrait (including Chrome DevTools 1080 x 1920), the Kiosk fills the height and sidebar/desktop branding is hidden.
- Landscape Desktop keeps the existing Preview + Sidebar layout.
- No changes to Camera / MediaPipe / AR renderer / screen logic or port **3117**.

### Test
1. `npm install` then `npm run dev`, open http://localhost:3117.
2. In Chrome DevTools device mode, Responsive 540 x 960 and 1080 x 1920. Make sure only the kiosk shows with no sidebar or page scroll.
3. Check 1920 x 1080 landscape: the sidebar must remain.
4. Go to the Astronaut screen and validate the helmet/suit positioning, then test photo capture.

The browser viewport's aspect ratio, not its width alone, now selects the kiosk-only layout. Device emulation still uses your computer webcam and is not an actual mobile device test.


## V02.2 — Auto Photo Capture

- หน้า Transformation (หน้าที่ 4) เริ่มนับถอยหลังเตรียมถ่ายอัตโนมัติ **5 วินาที** หลังเข้าสู่หน้า
- ต่อด้วยหน้า Photo Moment พร้อม Countdown **3–2–1** แล้วบันทึกภาพพร้อม AR ในหน้า Result โดยอัตโนมัติ (ไม่ดาวน์โหลดไฟล์โดยไม่ได้กด)
- ปุ่ม **ปิดออโต้/เปิดออโต้** ใช้สลับระหว่าง Auto และ Manual; ค่าเริ่มต้นเปิด Auto
- ปุ่ม **ถ่ายรูปตอนนี้** ยังคงใช้ได้ เพื่อข้ามช่วงรอ 5 วินาที
- เมื่อเปลี่ยนหน้า ยกเลิก หรือเล่นรอบใหม่ ระบบจะล้าง Timer เดิม ไม่ให้ถ่ายซ้ำจากรอบก่อน
- เมื่อ Browser Tab อยู่เบื้องหลัง ตัวนับเตรียมถ่ายจะหยุดชั่วคราว
- สามารถกดแชร์/บันทึกไฟล์เองในหน้า Result เพื่อไม่ให้มือถือดาวน์โหลดโดยไม่ตั้งใจ
- โหมด AR ยังรองรับ Astronaut เท่านั้น อีกห้าอาชีพยังเป็น Mock ตาม V02.1
- คงพอร์ต **3117** และ UI Portrait Kiosk V02.1
