/**
 * js/scanner.js
 * Logic chính của Mobile Security Scanner
 *
 * Luồng hoạt động:
 *   click thiết bị
 *     → selectDevice()
 *     → runScan()  (animation setInterval 200ms)
 *     → renderResult()  (vẽ DOM từ DEVICES data)
 */

// ---- Trạng thái ứng dụng ----
let currentDevice = "medium";
let scanning      = false;
let logVisible    = false;

// ---- Các bước hiện trong animation quét ----
const SCAN_STEPS = [
  "Kiểm tra màn hình khóa...",
  "Phân tích mã hóa ổ đĩa...",
  "Quét kết nối mạng...",
  "Kiểm tra phiên bản hệ điều hành...",
  "Phân tích quyền ứng dụng...",
  "Xác minh trạng thái MDM...",
  "Kiểm tra xác thực đa yếu tố...",
  "Quét Bluetooth / NFC...",
  "Tổng hợp kết quả...",
];

// ---- Hàm chọn thiết bị ----
function selectDevice(btn, deviceKey) {
  if (scanning) return;

  // Cập nhật nút active
  document.querySelectorAll(".device-btn").forEach((b) =>
    b.classList.remove("active")
  );
  btn.classList.add("active");

  currentDevice = deviceKey;
  runScan();
}

// ---- Hàm chạy animation quét ----
function runScan() {
  if (scanning) return;
  scanning = true;

  // Ẩn log cũ
  logVisible = false;
  document.getElementById("log-panel").classList.remove("visible");

  // Làm mờ kết quả cũ, hiện overlay quét
  document.getElementById("result-area").classList.add("dimmed");
  document.getElementById("scanning-overlay").classList.add("visible");

  const bar    = document.getElementById("progress-fill");
  const status = document.getElementById("scan-status");
  let step     = 0;

  const interval = setInterval(() => {
    if (step < SCAN_STEPS.length) {
      status.textContent = SCAN_STEPS[step];
      bar.style.width    = Math.round(((step + 1) / SCAN_STEPS.length) * 100) + "%";
      step++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById("scanning-overlay").classList.remove("visible");
        document.getElementById("result-area").classList.remove("dimmed");
        renderResult(currentDevice);
        scanning = false;
      }, 300);
    }
  }, 200);
}

// ---- Hàm vẽ kết quả lên DOM ----
function renderResult(deviceKey) {
  const data = DEVICES[deviceKey];

  // --- Score circle ---
  // Dùng toán SVG stroke-dashoffset để vẽ vòng tròn tỷ lệ với điểm số
  // Chu vi vòng tròn r=40: C = 2π×40 ≈ 251.2
  const circumference = 2 * Math.PI * 40;
  const offset        = circumference - (data.score / 100) * circumference;
  const scoreColor    = getScoreColor(data.score);

  const arc = document.getElementById("score-arc");
  arc.setAttribute("stroke-dashoffset", offset.toFixed(1));
  arc.setAttribute("stroke", scoreColor);

  document.getElementById("score-number").textContent = data.score;
  document.getElementById("score-number").style.color = scoreColor;

  // --- Tiêu đề & mô tả ---
  document.getElementById("score-title").textContent = getScoreTitle(data.score);
  document.getElementById("score-desc").textContent  = getScoreDesc(deviceKey);

  const badge           = document.getElementById("risk-badge");
  const [label, bg, fg] = getRiskBadge(data.score);
  badge.textContent     = label;
  badge.style.background = bg;
  badge.style.color      = fg;

  // --- Check cards ---
  const grid = document.getElementById("checks-grid");
  grid.innerHTML = "";

  data.checks.forEach((check) => {
    const card = buildCheckCard(check);
    grid.appendChild(card);
  });

  // --- Log panel ---
  const logPanel  = document.getElementById("log-panel");
  logPanel.innerHTML = data.logLines
    .map((l) => `<div class="log-line ${l.cls}">${escapeHtml(l.text)}</div>`)
    .join("");
}

// ---- Tạo DOM cho một thẻ tiêu chí ----
function buildCheckCard(check) {
  const statusMap = {
    pass: ["Đạt",      "s-pass"],
    warn: ["Cảnh báo", "s-warn"],
    fail: ["Lỗi",      "s-fail"],
  };
  const [statusLabel, statusClass] = statusMap[check.level];

  const card = document.createElement("div");
  card.className = `check-card ${statusClass}`;

  card.innerHTML = `
    <div class="check-header">
      <div class="check-icon">${check.icon}</div>
      <span class="check-title">${check.title}</span>
      <span class="check-status">${statusLabel}</span>
    </div>
    <div class="check-desc">${check.desc}</div>
    <div class="check-detail">${check.detail}</div>
  `;

  // Click để toggle chi tiết
  card.addEventListener("click", () => card.classList.toggle("expanded"));
  return card;
}

// ---- Toggle hiện/ẩn log terminal ----
function toggleLog() {
  logVisible = !logVisible;
  document.getElementById("log-panel").classList.toggle("visible", logVisible);
}

// ---- Hàm tiện ích ----
function getScoreColor(score) {
  if (score >= 80) return "#185FA5";
  if (score >= 60) return "#854F0B";
  return "#A32D2D";
}

function getScoreTitle(score) {
  if (score >= 80) return "Mức độ bảo mật: Tốt";
  if (score >= 60) return "Mức độ bảo mật: Trung bình";
  return "Mức độ bảo mật: Nguy hiểm";
}

function getScoreDesc(deviceKey) {
  const descs = {
    high:   "Thiết bị được cấu hình bảo mật tốt. Mã hóa phần cứng, MDM đầy đủ và Passkey đang hoạt động. Duy trì cập nhật định kỳ.",
    medium: "Thiết bị có một số rủi ro cần khắc phục. Khuyến nghị bật mã hóa toàn bộ ổ đĩa và cập nhật hệ điều hành ngay.",
    low:    "Thiết bị có nguy cơ bảo mật nghiêm trọng. KHÔNG NÊN kết nối vào mạng doanh nghiệp cho đến khi khắc phục các lỗi nghiêm trọng.",
  };
  return descs[deviceKey];
}

function getRiskBadge(score) {
  if (score >= 80) return ["Rủi ro thấp",      "#EAF3DE", "#3B6D11"];
  if (score >= 60) return ["Rủi ro trung bình", "#FAEEDA", "#854F0B"];
  return                  ["Rủi ro cao",        "#FCEBEB", "#A32D2D"];
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
// ==========================================
// KHU VỰC LOGIC MÔ PHỎNG TẤN CÔNG (ATTACK SIMULATION)
// ==========================================

function simulateAttack(attackType) {
  if (scanning) return; // Không cho phép ấn tấn công khi đang quét

  let status = '', title = '', message = '';

  // Dựa vào thiết bị đang chọn để đưa ra kết quả tương ứng
  switch (attackType) {
    case 'mitm':
      if (currentDevice === 'high') {
        status = 'pass';
        title = '🛡️ Đã chặn MITM (Man-in-the-Middle)';
        message = 'Kẻ tấn công tạo Wi-Fi giả. Nhưng VPN Always-on và Certificate Pinning trên iPhone đã mã hóa toàn bộ dữ liệu. Tấn công vô hiệu.';
      } else if (currentDevice === 'medium') {
        status = 'warn';
        title = '⚠️ Cảnh báo kết nối không an toàn';
        message = 'Phát hiện chứng chỉ Wi-Fi lạ. Hệ thống VPN đang cố gắng thiết lập lại kết nối. Người dùng tạm thời bị ngắt mạng.';
      } else {
        status = 'fail';
        title = '🚨 BỊ HACK: Đánh cắp phiên đăng nhập';
        message = 'Xiaomi kết nối vào Wi-Fi giả mà không có VPN. Kẻ tấn công đã bắt được gói tin HTTP và đánh cắp Session Cookie!';
      }
      break;

    case 'phishing':
      if (currentDevice === 'high') {
        status = 'pass';
        title = '🛡️ Phishing thất bại (Nhờ Passkey)';
        message = 'Người dùng lỡ bấm vào link giả. Nhưng Passkey (FIDO2) từ chối xác thực vì sai tên miền (Domain Mismatch). Tài khoản an toàn.';
      } else if (currentDevice === 'medium') {
        status = 'warn';
        title = '⚠️ Lộ mật khẩu nhưng MFA chặn lại';
        message = 'Người dùng nhập mật khẩu vào web giả. Kẻ tấn công có mật khẩu nhưng không thể đăng nhập vì thiếu mã Authenticator (MFA).';
      } else {
        status = 'fail';
        title = '🚨 BỊ HACK: Mất quyền kiểm soát email';
        message = 'Người dùng nhập mật khẩu vào web giả. Do KHÔNG CÓ MFA, kẻ tấn công lập tức đăng nhập thành công vào email công ty!';
      }
      break;

    case 'malware':
      if (currentDevice === 'high') {
        status = 'pass';
        title = '🛡️ Mã độc bị cô lập (Sandbox)';
        message = 'Mã độc cố đọc clipboard. iOS App Sandbox chặn đứng hành vi này. Dữ liệu không thể lọt ra ngoài.';
      } else if (currentDevice === 'medium') {
        status = 'pass';
        title = '🛡️ MDM Intune can thiệp';
        message = 'Intune phát hiện hành vi app bất thường. Container công việc (Work Profile) tự động bị khóa để bảo vệ dữ liệu doanh nghiệp.';
      } else {
        status = 'fail';
        title = '🚨 BỊ HACK: Rò rỉ dữ liệu (Data Leak)';
        message = 'Mã độc Triada chạy ngầm. Do máy KHÔNG mã hóa ổ đĩa, nó đã đọc trộm toàn bộ file tài liệu và gửi về server của Hacker.';
      }
      break;
  }

  // 1. Hiển thị thông báo nổi
  showToast(status, title, message);

  // 2. Ghi log vào Terminal
  addLogLine(status, attackType, title, message);
}

// Hàm tạo thông báo nổi góc dưới
function showToast(status, title, message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${status}`;
  toast.innerHTML = `
    <span class="toast-title">${title}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Tự động xóa sau 5 giây
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300); // Đợi animation chạy xong mới xóa DOM
  }, 5000);
}

// Hàm thêm dòng log vào terminal động
function addLogLine(status, attackType, title, message) {
  const logPanel = document.getElementById('log-panel');
  const time = new Date().toLocaleTimeString('vi-VN');
  
  // Mapping class của CSS
  const clsMap = { 'pass': 'ok', 'warn': 'warn', 'fail': 'fail' };
  
  const line = document.createElement('div');
  line.className = `log-line ${clsMap[status]}`;
  
  // Format: [Thời gian] FAIL - TẤN CÔNG PHISHING: Chi tiết...
  line.textContent = `[${time}] ${status.toUpperCase()} - [TẤN CÔNG ${attackType.toUpperCase()}] ${title}: ${message}`;
  
  // Thêm vào cuối cùng
  logPanel.appendChild(line);
  
  // Nếu log đang hiện, tự động cuộn xuống dòng mới nhất
  if (logVisible) {
    logPanel.scrollTop = logPanel.scrollHeight;
  }
}
// ---- Khởi chạy lần đầu ----
renderResult(currentDevice);
