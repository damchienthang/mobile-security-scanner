# Mobile Security Scanner

**Demo môn: An toàn & Bảo mật Hệ thống Thông tin — Nhóm 14**

---

## Giới thiệu

Mobile Security Scanner là một **ứng dụng web mô phỏng đánh giá bảo mật thiết bị di động**, được xây dựng nhằm minh họa các nội dung:

* Quản lý thiết bị di động (**MDM**)
* Rủi ro **BYOD**
* Mô hình **bảo mật đa lớp**
* **Mã hóa (RSA + AES)**
* **Xác thực đa yếu tố (MFA)**

Ứng dụng không quét thật, mà **mô phỏng theo chuẩn thực tế (NIST + OWASP MASVS)**.

---

## Tính năng chính

### 1. Security Scanner (Chương 2)

* Quét 8 tiêu chí bảo mật:

  * Màn hình khóa
  * Mã hóa ổ đĩa
  * Kết nối mạng
  * Cập nhật hệ thống
  * Quyền ứng dụng
  * MDM / Chính sách
  * MFA
  * Bluetooth / NFC

* Hiển thị:

  * Điểm bảo mật (0–100)
  * Mức rủi ro
  * Log kỹ thuật dạng terminal
  * Chi tiết từng tiêu chí

Logic nằm trong: `scanner.js` 

---

### 2. Attack Simulation (Demo nâng cao)

Cho phép mô phỏng tấn công:

* MITM (Wi-Fi giả mạo)
* SMS Phishing
* Malware ẩn
 Dùng để minh họa **rủi ro thực tế BYOD**

---

### 3. MDM Dashboard

* Quản lý nhiều thiết bị
* Trạng thái: compliant / warning / non-comply
* Thao tác:

  * Remote wipe
  * Lock device
  * Push policy

 Logic: `mobile-demo.js` 

---

### 4. Crypto Demo (Chương 3)

Mô phỏng:

#### RSA + AES Key Exchange

* Server tạo RSA key
* Device tạo AES session key
* Mã hóa bằng RSA
* Truyền dữ liệu bằng AES

#### MFA Authentication

* OTP (TOTP)
* Passkey (FIDO2)

 Logic: `crypto-demo.js` 

---

### 5. Kiến trúc bảo mật đa lớp

Hiển thị mô hình:

* App Permissions
* Sandbox
* Encryption
* Trusted Execution Environment (TEE)

---

## Thiết bị mô phỏng

| Thiết bị        | OS         | Điểm | Mức        |
| --------------- | ---------- | ---- | ---------- |
| iPhone 15 Pro   | iOS 17.4   | 92   | Thấp       |
| Samsung A55     | Android 14 | 70   | Trung bình |
| Xiaomi Redmi 12 | Android 13 | 38   | Cao        |

 Data: `devices.js` 



## Cấu trúc project

mobile-security-scanner/
│
├── index.html        ← Giao diện chính
├── css/
│   └── style.css     ← UI/UX
├── js/
│   ├── scanner.js    ← Logic quét
│   ├── mobile-demo.js← MDM + BYOD
│   ├── crypto-demo.js← RSA + MFA
│
└── data/
    └── devices.js    ← Dữ liệu thiết bị



##  Cách chạy

* Mở file `index.html`
* Không cần server
* Không cần backend


## Liên hệ với báo cáo

| Demo              | Nội dung                |
| ----------------- | ----------------------- |
| Scanner           | Chương 2 – BYOD + MDM   |
| MDM Dashboard     | Quản lý thiết bị        |
| Attack Simulation | Rủi ro thực tế          |
| Crypto Demo       | Chương 3 – Mã hóa & MFA |
| Architecture      | Bảo mật đa lớp          |


##  Nhóm thực hiện

* Đàm Chiến Thắng
* Trần Duy Đông
* Trần Tiến Dũng
* Nguyễn Mạnh Tuyển



## Ghi chú

Đây là hệ thống demo phục vụ học tập, **không phải công cụ bảo mật thực tế**.

