/**
 * data/devices.js
 * Dữ liệu mô phỏng các thiết bị di động và kết quả quét bảo mật
 * Để thêm thiết bị mới: thêm key mới vào object DEVICES bên dưới
 */

const DEVICES = {
  medium: {
    name: "Samsung Galaxy A55",
    os: "Android 14 · BYOD",
    score: 70,
    checks: [
      {
        icon: "🔒",
        title: "Màn hình khóa",
        level: "pass",
        desc: "Bật PIN + nhận diện khuôn mặt",
        detail:
          "Thiết bị đang sử dụng PIN 6 chữ số kết hợp Face ID. Đây là cấu hình khuyến nghị. Timeout tự khóa: 30 giây.",
      },
      {
        icon: "💾",
        title: "Mã hóa ổ đĩa",
        level: "warn",
        desc: "Chưa bật mã hóa toàn bộ",
        detail:
          "Full-disk encryption (FDE) chưa được kích hoạt. Nếu thiết bị bị mất cắp, dữ liệu có thể bị truy cập bằng công cụ forensic. Vào Settings → Security → Encryption để bật.",
      },
      {
        icon: "📡",
        title: "Kết nối mạng",
        level: "pass",
        desc: "VPN đang hoạt động",
        detail:
          "Kết nối VPN AES-256 đang active. TLS 1.3 được dùng cho tất cả kết nối HTTPS. Không phát hiện kết nối Wi-Fi công cộng không bảo mật.",
      },
      {
        icon: "🔄",
        title: "Cập nhật hệ thống",
        level: "warn",
        desc: "Có 2 bản vá bảo mật chờ",
        detail:
          "Android Security Patch: tháng 10/2024 (lạc hậu 2 tháng). Có 2 CVE nghiêm trọng chưa được vá liên quan đến kernel và Bluetooth. Nên cập nhật ngay.",
      },
      {
        icon: "📱",
        title: "Quyền ứng dụng",
        level: "fail",
        desc: "3 app nguy cơ cao phát hiện",
        detail:
          "Phát hiện: TikTok (truy cập clipboard liên tục), một app không rõ nguồn gốc có quyền RECORD_AUDIO khi màn hình tắt, Flashlight app yêu cầu quyền GPS. Khuyến nghị gỡ hoặc thu hồi quyền.",
      },
      {
        icon: "🛡️",
        title: "MDM / Chính sách",
        level: "pass",
        desc: "Đã đăng ký MDM doanh nghiệp",
        detail:
          "Thiết bị đã enroll vào Microsoft Intune. Work Profile (container) đang hoạt động — dữ liệu cá nhân và công ty được tách biệt. Selective Wipe được kích hoạt.",
      },
      {
        icon: "🔑",
        title: "Xác thực (MFA)",
        level: "pass",
        desc: "MFA bật cho tài khoản công ty",
        detail:
          "Microsoft Authenticator đang hoạt động. TOTP-based OTP (RFC 6238). Tất cả tài khoản doanh nghiệp đều yêu cầu xác thực 2 bước. Phiên đăng nhập timeout sau 8 tiếng.",
      },
      {
        icon: "📶",
        title: "Bluetooth / NFC",
        level: "fail",
        desc: "Bluetooth bật liên tục",
        detail:
          "Bluetooth đang bật và ở chế độ discoverable. Rủi ro: tấn công BlueBorne, BIAS attack. NFC bật nhưng Host Card Emulation (HCE) đã tắt. Khuyến nghị tắt Bluetooth khi không dùng.",
      },
    ],
    logLines: [
      { cls: "info", text: "[2024-12-15 09:31:02] Bắt đầu quét bảo mật — Samsung Galaxy A55 (Android 14)" },
      { cls: "ok",   text: "[09:31:03] PASS  Màn hình khóa: PIN-6 + FaceID enabled. Timeout=30s" },
      { cls: "warn", text: "[09:31:04] WARN  Mã hóa ổ đĩa: FDE disabled — dữ liệu có thể bị truy cập offline" },
      { cls: "ok",   text: "[09:31:05] PASS  VPN: AES-256-GCM active. TLS 1.3 detected on all HTTPS" },
      { cls: "warn", text: "[09:31:06] WARN  OS patch: 2024-10 (2 tháng chưa cập nhật). CVE-2024-43093 chưa vá" },
      { cls: "fail", text: "[09:31:08] FAIL  App permissions: 3 high-risk apps (clipboard snoop, audio bg, GPS abuse)" },
      { cls: "ok",   text: "[09:31:09] PASS  MDM: Intune enrolled. Work profile active. Selective wipe enabled" },
      { cls: "ok",   text: "[09:31:10] PASS  MFA: TOTP via MS Authenticator. Session TTL=8h" },
      { cls: "fail", text: "[09:31:11] FAIL  Bluetooth: discoverable mode ON — BlueBorne attack surface exposed" },
      { cls: "info", text: "[09:31:11] Kết quả: Score 70/100 — Rủi ro TRUNG BÌNH. 2 lỗi nghiêm trọng cần xử lý." },
    ],
  },

  high: {
    name: "iPhone 15 Pro",
    os: "iOS 17.4 · BYOD",
    score: 92,
    checks: [
      {
        icon: "🔒",
        title: "Màn hình khóa",
        level: "pass",
        desc: "Face ID + PIN phức tạp",
        detail:
          "Face ID thế hệ mới (TrueDepth). PIN 8 ký tự alphanumeric. Auto-lock: 1 phút. Erase data sau 10 lần nhập sai.",
      },
      {
        icon: "💾",
        title: "Mã hóa ổ đĩa",
        level: "pass",
        desc: "AES-256 phần cứng (Secure Enclave)",
        detail:
          "Toàn bộ dữ liệu mã hóa bằng AES-256 tích hợp phần cứng tại Secure Enclave (T2 chip). Khóa mã hóa không bao giờ rời chip. Xóa khóa = xóa dữ liệu tức thì.",
      },
      {
        icon: "📡",
        title: "Kết nối mạng",
        level: "pass",
        desc: "VPN + Certificate Pinning",
        detail:
          "VPN Always-on. Certificate Pinning cho tất cả app doanh nghiệp ngăn MITM. TLS 1.3 only.",
      },
      {
        icon: "🔄",
        title: "Cập nhật hệ thống",
        level: "pass",
        desc: "iOS 17.4 — mới nhất",
        detail:
          "Cập nhật bảo mật mới nhất. Rapid Security Response tự động bật. Không phát hiện CVE nào chưa vá.",
      },
      {
        icon: "📱",
        title: "Quyền ứng dụng",
        level: "pass",
        desc: "App Sandbox nghiêm ngặt",
        detail:
          "iOS App Sandbox ngăn các app truy cập tài nguyên hệ thống. Privacy Report cho thấy không có app nào truy cập camera/mic bất thường trong 7 ngày qua.",
      },
      {
        icon: "🛡️",
        title: "MDM / Chính sách",
        level: "pass",
        desc: "Managed Device — Supervised",
        detail:
          "Apple Business Manager + Supervised mode. IT có thể push config, revoke certs, remote wipe. Container hoàn toàn tách biệt.",
      },
      {
        icon: "🔑",
        title: "Xác thực (MFA)",
        level: "pass",
        desc: "Passkey + Biometric",
        detail:
          "Tài khoản doanh nghiệp dùng Passkey (FIDO2) — không thể bị phishing. Backup: TOTP hardware key. Zero password reuse detected.",
      },
      {
        icon: "📶",
        title: "Bluetooth / NFC",
        level: "warn",
        desc: "NFC bật — giám sát cần thiết",
        detail:
          "NFC bật cho Apple Pay. Nguy cơ relay attack trong môi trường đông người. Khuyến nghị tắt NFC khi không dùng thanh toán.",
      },
    ],
    logLines: [
      { cls: "info", text: "[2024-12-15 09:31:02] Bắt đầu quét bảo mật — iPhone 15 Pro (iOS 17.4)" },
      { cls: "ok",   text: "[09:31:03] PASS  Face ID + PIN-8 alphanum. Auto-lock=1min. Erase-on-fail=10" },
      { cls: "ok",   text: "[09:31:04] PASS  Secure Enclave AES-256. Hardware-bound key. Instant wipe capable" },
      { cls: "ok",   text: "[09:31:05] PASS  VPN Always-on. Cert pinning active. TLS 1.3 enforced" },
      { cls: "ok",   text: "[09:31:06] PASS  iOS 17.4 — latest. No unpatched CVEs. Rapid Security Response ON" },
      { cls: "ok",   text: "[09:31:08] PASS  App Sandbox strict. Privacy Report: no anomalous sensor access" },
      { cls: "ok",   text: "[09:31:09] PASS  Apple Business Manager. Supervised. Remote wipe ready" },
      { cls: "ok",   text: "[09:31:10] PASS  Passkey (FIDO2) active. No phishable credentials. TOTP backup OK" },
      { cls: "warn", text: "[09:31:11] WARN  NFC: enabled for Apple Pay — relay attack risk in crowded areas" },
      { cls: "info", text: "[09:31:11] Kết quả: Score 92/100 — Rủi ro THẤP. 1 cảnh báo nhỏ." },
    ],
  },

  low: {
    name: "Xiaomi Redmi 12",
    os: "Android 13 · Unmanaged",
    score: 38,
    checks: [
      {
        icon: "🔒",
        title: "Màn hình khóa",
        level: "warn",
        desc: "Chỉ dùng pattern đơn giản",
        detail:
          "Pattern unlock 4 điểm — dễ đoán qua vết tay trên màn hình. Không có biometric. Timeout: 5 phút. Khuyến nghị: bật PIN 6 số hoặc mật khẩu và Face Unlock.",
      },
      {
        icon: "💾",
        title: "Mã hóa ổ đĩa",
        level: "fail",
        desc: "Mã hóa CHƯA được bật",
        detail:
          "Full-disk encryption hoàn toàn tắt. Dữ liệu lưu dạng plaintext. Kẻ tấn công có thể dùng ADB hoặc flash recovery để dump toàn bộ dữ liệu mà không cần mật khẩu.",
      },
      {
        icon: "📡",
        title: "Kết nối mạng",
        level: "fail",
        desc: "Không VPN, kết nối Wi-Fi lạ",
        detail:
          "Phát hiện kết nối vào 3 mạng Wi-Fi công cộng không mã hóa trong 7 ngày qua. Không có VPN. Tất cả lưu lượng HTTP bị lộ. Nguy cơ MITM rất cao.",
      },
      {
        icon: "🔄",
        title: "Cập nhật hệ thống",
        level: "fail",
        desc: "Android 13 — lạc hậu 8 tháng",
        detail:
          "Security patch: tháng 4/2024. Có 11 CVE nghiêm trọng chưa được vá bao gồm CVE-2024-32896 (leo thang đặc quyền kernel). Thiết bị này không còn được Xiaomi hỗ trợ cập nhật.",
      },
      {
        icon: "📱",
        title: "Quyền ứng dụng",
        level: "fail",
        desc: "7 app cài từ APK không rõ nguồn",
        detail:
          "Phát hiện 7 ứng dụng cài từ nguồn ngoài CH Play. Một app có signature trùng với mã độc Triada. Nhiều app yêu cầu READ_SMS, SEND_SMS, RECEIVE_BOOT_COMPLETED.",
      },
      {
        icon: "🛡️",
        title: "MDM / Chính sách",
        level: "fail",
        desc: "Thiết bị chưa được quản lý",
        detail:
          "Không có MDM. Thiết bị không nằm trong hệ thống quản lý của doanh nghiệp. IT không thể remote wipe, push policy, hoặc kiểm soát truy cập tài nguyên nội bộ.",
      },
      {
        icon: "🔑",
        title: "Xác thực (MFA)",
        level: "warn",
        desc: "MFA chưa bật cho email công ty",
        detail:
          "Tài khoản Google Workspace của doanh nghiệp đăng nhập mà không bật MFA. Mật khẩu yếu (8 ký tự, không có ký tự đặc biệt). Phát hiện cùng mật khẩu được dùng cho 3 dịch vụ khác.",
      },
      {
        icon: "📶",
        title: "Bluetooth / NFC",
        level: "fail",
        desc: "Bluetooth + NFC luôn bật",
        detail:
          "Bluetooth discoverable, chấp nhận kết nối từ thiết bị lạ. NFC bật không cần xác nhận. Phát hiện thiết bị Bluetooth lạ đã pair trong lịch sử — nguy cơ BlueSnarfing.",
      },
    ],
    logLines: [
      { cls: "info", text: "[2024-12-15 09:31:02] Bắt đầu quét bảo mật — Xiaomi Redmi 12 (Android 13, Unmanaged)" },
      { cls: "warn", text: "[09:31:03] WARN  Màn hình khóa: Pattern-4 only. No biometric. Timeout=5min" },
      { cls: "fail", text: "[09:31:04] FAIL  Mã hóa ổ đĩa: DISABLED — plaintext storage, ADB dump possible" },
      { cls: "fail", text: "[09:31:05] FAIL  Mạng: 3 public Wi-Fi (unencrypted) in 7 days. No VPN. MITM risk CRITICAL" },
      { cls: "fail", text: "[09:31:06] FAIL  OS: patch 2024-04. 11 unpatched CVEs incl. kernel priv-esc CVE-2024-32896" },
      { cls: "fail", text: "[09:31:08] FAIL  Apps: 7 sideloaded APKs. 1 matches Triada malware signature. SMS permissions" },
      { cls: "fail", text: "[09:31:09] FAIL  MDM: NOT enrolled. No remote wipe. No policy enforcement" },
      { cls: "warn", text: "[09:31:10] WARN  MFA: disabled on corporate email. Weak password reused across 3 services" },
      { cls: "fail", text: "[09:31:11] FAIL  BT/NFC: discoverable+unprompted NFC. Unknown device paired. BlueSnarfing risk" },
      { cls: "info", text: "[09:31:11] Kết quả: Score 38/100 — Rủi ro CAO. 6 lỗi nghiêm trọng. KHÔNG NÊN kết nối mạng công ty!" },
    ],
  },
};
