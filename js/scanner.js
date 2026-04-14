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

// ---- Khởi chạy lần đầu ----
renderResult(currentDevice);
