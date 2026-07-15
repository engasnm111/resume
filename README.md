# 📄 Antigravity Resume Builder (Pixel-Perfect Resume Builder)

ระบบสร้างเรซูเม่ออนไลน์ระดับมืออาชีพที่แสดงผลได้อย่างแม่นยำ (Pixel-perfect) พร้อมความสามารถในการส่งออก (Export) เป็น PDF และรูปภาพ PNG ความละเอียดสูงผ่านการใช้ Puppeteer บน Server-side

---

## ✨ คุณสมบัติเด่น (Key Features)

*   **A4 Auto-Fit Engine**: มีอัลกอริทึมคำนวณพื้นที่หน้ากระดาษ A4 (794x1123 px) อัตโนมัติ หากข้อมูลยาวเกินไป ระบบจะสเกลขนาดตัวอักษรและระยะขอบลงให้พอดีในหน้าเดียวอย่างสมบูรณ์แบบโดยที่ตัวอักษรไม่ตกขอบหรือโดนตัดขาด
*   **Dynamic Customization**: ปรับแต่งธีมสีหลัก, ระยะขอบ (Compact, Normal, Spacious), ขนาดตัวอักษร (Small, Medium, Large) และฟอนต์ยอดนิยมทั้งภาษาไทยและอังกฤษ เช่น Prompt, Sarabun, Noto Sans Thai, Inter, Lora, และ Playfair Display
*   **Fully Functional Resume API**: จัดการข้อมูลเรซูเม่ได้อย่างยืดหยุ่น (สร้าง, บันทึก, ลบ, คัดลอก/Duplicate เรซูเม่พร้อมคัดลอกรูปภาพโปรไฟล์อัตโนมัติ)
*   **High-Resolution Server-side Export**: ส่งออกเรซูเม่เป็น **A4 PDF** หรือ **PNG ความละเอียดสูง (2x DPI Scale)** ด้วยการสั่งงานผ่าน Puppeteer (Headless Browser) จากหลังบ้าน เพื่อให้แน่ใจว่าหน้าตาไฟล์เอกสารที่ได้จะเหมือนกับสิ่งที่เห็นบนหน้าจอ 100%
*   **Profile Image Upload**: รองรับการอัปโหลดและจัดการรูปภาพโปรไฟล์ผ่าน Multer Middleware

---

## 🛠️ Stack เทคโนโลยี (Tech Stack)

### Frontend
*   **HTML5 & Vanilla JavaScript** (โครงสร้างและการประมวลผลบนเบราว์เซอร์)
*   **Tailwind CSS** (สำหรับ UI ที่สวยงาม ทันสมัย และ Responsive)
*   **FontAwesome Icons** (สัญลักษณ์และไอคอนประกอบ)
*   **SweetAlert2** (ระบบแจ้งเตือนแบบ Pop-up ที่สวยงาม)

### Backend
*   **Node.js & Express** (Server และ RESTful API)
*   **Multer** (ระบบจัดการไฟล์อัปโหลดรูปภาพ)
*   **Puppeteer** (เครื่องมือจำลองเบราว์เซอร์สำหรับส่งออก PDF/PNG)
*   **SQLite3** (ฐานข้อมูลสำหรับจัดเก็บข้อมูลเรซูเม่และเส้นทางรูปภาพ)

---

## ⚙️ ขั้นตอนการติดตั้งและรันโปรแกรม (Setup & Installation)

### 1. ความต้องการของระบบ (Prerequisites)
*   [Node.js](https://nodejs.org/) (เวอร์ชัน 16 ขึ้นไป)
*   [Google Chrome](https://www.google.com/chrome/) (ระบบจะเรียกใช้ Chrome หลักบน Windows อัตโนมัติเพื่อความรวดเร็วและประหยัดพื้นที่ในการติดตั้ง Puppeteer หรือดาวน์โหลด Chromium ในขั้นตอนถัดไป)

### 2. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์ของโปรเจกต์แล้วรันคำสั่ง:
```bash
npm install
```

### 3. รันเซิร์ฟเวอร์
เริ่มต้นเซิร์ฟเวอร์ในโหมดพัฒนา (Development Mode):
```bash
npm run dev
# หรือ
npm start
```
เซิร์ฟเวอร์จะรันที่ [http://localhost:3000](http://localhost:3000)

---

## 🌐 โครงสร้าง API Endpoints

| Method | Endpoint | รายละเอียด (Description) |
|---|---|---|
| **GET** | `/api/resumes` | แสดงรายชื่อเรซูเม่ทั้งหมดที่บันทึกไว้ |
| **GET** | `/api/resumes/:id` | ดึงข้อมูล JSON ของเรซูเม่ตาม ID ที่ระบุ |
| **POST** | `/api/resumes` | บันทึกข้อมูลเรซูเม่ใหม่ หรืออัปเดตข้อมูลเรซูเม่เดิม |
| **DELETE** | `/api/resumes/:id` | ลบเรซูเม่ตาม ID |
| **POST** | `/api/resumes/:id/duplicate` | คัดลอกเรซูเม่ (Clone) พร้อมคัดลอกรูปโปรไฟล์แยกไฟล์ใหม่ |
| **POST** | `/api/resumes/upload-image` | อัปโหลดรูปภาพโปรไฟล์ใหม่ลงในเซิร์ฟเวอร์ (จำกัด 5MB) |
| **GET** | `/api/resumes/:id/export?format=pdf` | ส่งออกเรซูเม่เป็นไฟล์ **PDF** ขนาด A4 |
| **GET** | `/api/resumes/:id/export?format=png` | ส่งออกเรซูเม่เป็นรูปภาพ **PNG (2x DPI Scale)** |

---

## 📂 โครงสร้างโฟลเดอร์ (Project Structure)

```text
resume/
├── .agents/               # โฟลเดอร์การตั้งค่าความร่วมมือของ Agent
├── .git/                  # โฟลเดอร์ Git repository
├── node_modules/          # โฟลเดอร์บันทึกไลบรารีของโปรเจกต์
├── public/                # โฟลเดอร์ให้บริการไฟล์สถิต (Static Assets)
│   ├── js/
│   │   └── resume-renderer.js # ระบบหลักในการเรนเดอร์เรซูเม่และจัดการหน้ากระดาษ A4
│   ├── export-preview.html    # หน้าสำหรับให้ Puppeteer สแกนเพื่อส่งออก PDF/PNG
│   └── index.html             # อินเตอร์เฟสหน้าเว็บหลักของโปรแกรมสร้างเรซูเม่
├── uploads/               # โฟลเดอร์หลักสำหรับจัดเก็บรูปภาพโปรไฟล์ตั้งต้น
├── .gitignore             # ไฟล์กำหนดข้อยกเว้นไม่บันทึกข้อมูลเข้า Git
├── example.html           # หน้าตัวอย่างหน้าตาเรซูเม่ที่เสร็จสมบูรณ์
├── package.json           # ไฟล์กำหนดคุณสมบัติและสคริปต์ของโปรเจกต์
├── resume_builder.db      # ฐานข้อมูล SQLite3 (ถูกจำลองขึ้นในเครื่อง)
└── server.js              # ระบบหลังบ้านและ Express Server หลัก
```

---

## 📄 ข้อมูลใบอนุญาต (License)

โปรเจกต์นี้ได้รับการพัฒนาขึ้นเพื่ออำนวยความสะดวกในการจัดทำเรซูเม่แบบ Pixel-Perfect
