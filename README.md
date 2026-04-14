# Mobile Security Scanner
Demo báo cáo môn An toàn & Bảo mật HTTT — Nhóm 14

## Cấu trúc thư mục

```
mobile-security-scanner/
│
├── index.html          ← Mở file này trên trình duyệt để chạy demo
│
├── css/
│   └── style.css       ← Toàn bộ giao diện, màu sắc, responsive
│
├── js/
│   └── scanner.js      ← Logic: chọn thiết bị, animation quét, vẽ kết quả
│
└── data/
    └── devices.js      ← Dữ liệu 3 thiết bị (điểm, tiêu chí, log)
```

## Cách chạy

Chỉ cần mở `index.html` bằng trình duyệt (Chrome, Firefox, Edge).
Không cần cài thêm gì, không cần server, không cần internet.

## Cách thêm thiết bị mới

Mở `data/devices.js` và thêm một key mới vào object `DEVICES`:

```js
DEVICES.myDevice = {
  name: "Tên thiết bị",
  os: "Android 14 · BYOD",
  score: 55,
  checks: [
    {
      icon: "🔒",
      title: "Màn hình khóa",
      level: "pass",          // pass | warn | fail
      desc: "Mô tả ngắn",
      detail: "Giải thích chi tiết khi người dùng click vào thẻ",
    },
    // ... thêm tối đa 8 tiêu chí
  ],
  logLines: [
    { cls: "info", text: "[09:31:00] Bắt đầu quét..." },
    { cls: "ok",   text: "[09:31:01] PASS  Màn hình khóa OK" },
    { cls: "fail", text: "[09:31:02] FAIL  Mã hóa chưa bật" },
  ],
};
```

Sau đó thêm nút trong `index.html`:

```html
<button class="device-btn" onclick="selectDevice(this, 'myDevice')">
  <div class="db-name">Tên thiết bị</div>
  <div class="db-os">Android 14 · BYOD</div>
</button>
```

## Liên kết với nội dung báo cáo

| Thiết bị          | Điểm | Minh họa nội dung báo cáo                          |
|-------------------|------|----------------------------------------------------|
| iPhone 15 Pro     |  92  | Chương 3: Mã hóa phần cứng Secure Enclave, Passkey |
| Samsung Galaxy A55|  70  | Chương 2: Rủi ro BYOD, MDM Intune, MFA             |
| Xiaomi Redmi 12   |  38  | Chương 2: Thiết bị unmanaged, tấn công phổ biến    |

## Nhóm thực hiện

| Họ tên            | MSV        | Phụ trách                |
|-------------------|------------|--------------------------|
| Đàm Chiến Thắng   | B23DCKH106 | Demo, kiến trúc bảo mật  |
| Trần Duy Đông     | B23DCKH025 | Demo, kiến trúc MDM      |
| Trần Tiến Dũng    | B23DCKH033 | Slide, rủi ro BYOD       |
| Nguyễn Mạnh Tuyển | B23DCKH132 | Điểm yếu, ứng dụng thực tiễn |
