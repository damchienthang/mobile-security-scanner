/**
 * js/crypto-demo.js
 * Mô phỏng hai luồng bảo mật:
 *   1. RSA + AES — trao đổi khóa và mã hóa dữ liệu
 *   2. MFA OTP  — xác thực đa yếu tố (TOTP + FIDO2)
 */

// ========================================================
//  PHẦN 1: RSA + AES KEY EXCHANGE
// ========================================================

const RSA_STEPS = [
  {
    id: "keygen",
    label: "Tạo cặp khóa RSA",
    actor: "server",
    color: "#185FA5",
    icon: "🔑",
    detail: "Máy chủ tạo cặp khóa RSA-2048: Public Key (công khai) và Private Key (bí mật). Public Key được gửi cho thiết bị di động.",
    visual: "keygen",
  },
  {
    id: "pubkey",
    label: "Gửi Public Key",
    actor: "arrow-right",
    color: "#185FA5",
    icon: "📤",
    detail: "Server → Thiết bị: Public Key RSA được gửi qua mạng. Dù bị chặn, kẻ tấn công cũng không làm được gì vì Public Key không có giá trị để giải mã.",
    visual: "pubkey",
  },
  {
    id: "aesgen",
    label: "Tạo AES Session Key",
    actor: "device",
    color: "#0F6E56",
    icon: "⚙️",
    detail: "Thiết bị tự sinh ngẫu nhiên một AES-256 Session Key (32 bytes = 256 bit). Khóa này sẽ dùng để mã hóa toàn bộ dữ liệu trong phiên làm việc.",
    visual: "aesgen",
  },
  {
    id: "encrypt-key",
    label: "Mã hóa AES Key bằng RSA",
    actor: "device",
    color: "#0F6E56",
    icon: "🔒",
    detail: "Thiết bị dùng Public Key của server để mã hóa AES Session Key. Chỉ server — người có Private Key — mới có thể giải mã ra AES Key gốc.",
    visual: "encrypt-key",
  },
  {
    id: "send-key",
    label: "Gửi AES Key (đã mã hóa)",
    actor: "arrow-right",
    color: "#0F6E56",
    icon: "📦",
    detail: "Thiết bị → Server: AES Key đã được mã hóa RSA. Kẻ nghe lén chỉ thấy chuỗi byte vô nghĩa — không thể lấy được AES Key thực.",
    visual: "send-key",
  },
  {
    id: "decrypt-key",
    label: "Server giải mã bằng Private Key",
    actor: "server",
    color: "#854F0B",
    icon: "🔓",
    detail: "Server dùng Private Key RSA để giải mã, thu được AES Session Key. Từ đây cả hai bên đều có cùng AES Key mà không cần truyền nó qua mạng dạng rõ.",
    visual: "decrypt-key",
  },
  {
    id: "data",
    label: "Truyền dữ liệu bằng AES",
    actor: "both",
    color: "#3B6D11",
    icon: "🔐",
    detail: "Toàn bộ dữ liệu từ đây được mã hóa bằng AES-256-GCM — nhanh, an toàn. RSA chỉ dùng một lần để trao đổi khóa; AES làm công việc mã hóa thực sự.",
    visual: "data",
  },
];

let rsaCurrentStep = -1;
let rsaPlaying = false;
let rsaTimer = null;

function rsaStart() {
  rsaCurrentStep = -1;
  rsaPlaying = true;
  document.getElementById("rsa-play-btn").textContent = "⏸ Dừng";
  document.getElementById("rsa-reset-btn").style.display = "inline-flex";
  rsaNext();
}

function rsaNext() {
  if (!rsaPlaying) return;
  rsaCurrentStep++;
  if (rsaCurrentStep >= RSA_STEPS.length) {
    rsaPlaying = false;
    document.getElementById("rsa-play-btn").textContent = "▶ Chạy lại";
    document.getElementById("rsa-play-btn").onclick = rsaReset;
    return;
  }
  renderRsaStep(rsaCurrentStep);
  rsaTimer = setTimeout(rsaNext, 2200);
}

function rsaPause() {
  rsaPlaying = false;
  clearTimeout(rsaTimer);
  document.getElementById("rsa-play-btn").textContent = "▶ Tiếp tục";
  document.getElementById("rsa-play-btn").onclick = rsaResume;
}

function rsaResume() {
  rsaPlaying = true;
  document.getElementById("rsa-play-btn").textContent = "⏸ Dừng";
  document.getElementById("rsa-play-btn").onclick = rsaPause;
  rsaNext();
}

function rsaReset() {
  clearTimeout(rsaTimer);
  rsaPlaying = false;
  rsaCurrentStep = -1;
  renderRsaIdle();
  const btn = document.getElementById("rsa-play-btn");
  btn.textContent = "▶ Bắt đầu";
  btn.onclick = rsaToggle;
  document.getElementById("rsa-reset-btn").style.display = "none";
}

function rsaToggle() {
  if (!rsaPlaying && rsaCurrentStep === -1) rsaStart();
  else if (rsaPlaying) rsaPause();
  else rsaResume();
}

function renderRsaIdle() {
  document.getElementById("rsa-canvas").innerHTML = buildRsaCanvas(-1);
  document.getElementById("rsa-detail").innerHTML = `
    <p style="color:var(--text-muted);font-size:13px;text-align:center;padding:1rem 0">
      Nhấn <strong>Bắt đầu</strong> để xem từng bước hoạt động
    </p>`;
  document.getElementById("rsa-progress").innerHTML = RSA_STEPS.map((s, i) =>
    `<div class="rsa-step-dot" id="dot-${i}" title="${s.label}"></div>`
  ).join("");
}

function renderRsaStep(idx) {
  const step = RSA_STEPS[idx];

  // Cập nhật canvas
  document.getElementById("rsa-canvas").innerHTML = buildRsaCanvas(idx);

  // Cập nhật detail box
  document.getElementById("rsa-detail").innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <span style="font-size:20px">${step.icon}</span>
      <span style="font-size:14px;font-weight:600;color:var(--text)">Bước ${idx + 1}/${RSA_STEPS.length}: ${step.label}</span>
    </div>
    <p style="font-size:13px;color:var(--text-muted);line-height:1.6">${step.detail}</p>
  `;

  // Cập nhật progress dots
  document.querySelectorAll(".rsa-step-dot").forEach((dot, i) => {
    dot.classList.remove("active", "done");
    if (i < idx) dot.classList.add("done");
    else if (i === idx) dot.classList.add("active");
  });
}

function buildRsaCanvas(activeIdx) {
  // Vẽ sơ đồ hai node: Device ←→ Server
  const step = activeIdx >= 0 ? RSA_STEPS[activeIdx] : null;

  const deviceColor  = step && step.actor === "device" ? "#0F6E56" : "#444";
  const serverColor  = step && step.actor === "server" ? "#185FA5" : "#444";
  const arrowVisible = step && step.actor.startsWith("arrow");
  const bothActive   = step && step.actor === "both";
  const arrowLabel   = step ? step.label : "";
  const arrowColor   = step ? step.color : "#888";

  // Key visualization overlay
  let overlay = "";
  if (step) {
    if (step.visual === "keygen") {
      overlay = `
        <div style="position:absolute;top:10px;right:12px;background:var(--blue-light);border:0.5px solid var(--blue);border-radius:6px;padding:5px 10px;font-size:11px;color:var(--blue-dark);font-family:monospace">
          n=p×q<br/>e=65537<br/>d=e⁻¹ mod φ(n)
        </div>`;
    } else if (step.visual === "aesgen") {
      overlay = `
        <div style="position:absolute;top:10px;left:12px;background:#E1F5EE;border:0.5px solid #1D9E75;border-radius:6px;padding:5px 10px;font-size:11px;color:#085041;font-family:monospace">
          AES-Key:<br/>a3f8c2...e91b
        </div>`;
    } else if (step.visual === "encrypt-key") {
      overlay = `
        <div style="position:absolute;top:10px;left:12px;background:#FAEEDA;border:0.5px solid #BA7517;border-radius:6px;padding:5px 10px;font-size:11px;color:#633806;font-family:monospace">
          RSA_encrypt(<br/>AES_key,<br/>pub_key)
        </div>`;
    } else if (step.visual === "data") {
      overlay = `
        <div style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:#EAF3DE;border:0.5px solid #639922;border-radius:6px;padding:5px 14px;font-size:11px;color:#27500A;font-family:monospace;white-space:nowrap">
          AES-256-GCM(data) ↔ ↔ ↔
        </div>`;
    }
  }

  return `
  <div style="position:relative;display:flex;align-items:center;justify-content:space-between;height:120px;padding:0 8px">
    ${overlay}
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;transition:all .3s">
      <div style="width:52px;height:52px;border-radius:10px;background:${bothActive || step?.actor==='device' ? '#E1F5EE' : 'var(--surface)'};border:1.5px solid ${deviceColor};display:flex;align-items:center;justify-content:center;font-size:22px;transition:all .3s">📱</div>
      <span style="font-size:11px;font-weight:600;color:${deviceColor}">Thiết bị</span>
    </div>

    <div style="flex:1;margin:0 12px;display:flex;flex-direction:column;align-items:center;gap:4px">
      ${arrowVisible || bothActive ? `
        <div style="font-size:10px;color:${arrowColor};font-weight:600;margin-bottom:2px;text-align:center;max-width:120px;line-height:1.3">${arrowLabel}</div>
        <div style="display:flex;align-items:center;width:100%;gap:4px">
          <div style="flex:1;height:2px;background:${arrowColor};border-radius:1px;animation:flowAnim 0.8s ease-in-out"></div>
          <span style="color:${arrowColor};font-size:16px">${step?.actor === 'arrow-right' || bothActive ? '→' : '←'}</span>
        </div>
      ` : `<div style="flex:1;height:1px;background:var(--border)"></div>`}
    </div>

    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;transition:all .3s">
      <div style="width:52px;height:52px;border-radius:10px;background:${bothActive || step?.actor==='server' ? '#E6F1FB' : 'var(--surface)'};border:1.5px solid ${serverColor};display:flex;align-items:center;justify-content:center;font-size:22px;transition:all .3s">🖥️</div>
      <span style="font-size:11px;font-weight:600;color:${serverColor}">Server</span>
    </div>
  </div>`;
}

// ========================================================
//  PHẦN 2: MFA OTP SIMULATOR
// ========================================================

let otpInterval  = null;
let otpValue     = "";
let mfaStage     = "idle"; // idle | input | otp | success | fail | fido
let passwordInput = "";

function startMfaDemo(type) {
  mfaStage = "input";
  passwordInput = "";
  document.getElementById("mfa-type-select").style.display = "none";
  renderMfaStage();
}

function renderMfaStage() {
  const container = document.getElementById("mfa-demo-area");

  if (mfaStage === "input") {
    container.innerHTML = `
      <div style="background:var(--surface);border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;max-width:340px;margin:0 auto">
        <div style="text-align:center;margin-bottom:1.2rem">
          <div style="font-size:28px;margin-bottom:6px">🏢</div>
          <div style="font-size:14px;font-weight:600">Đăng nhập hệ thống công ty</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">corp.example.com</div>
        </div>
        <div style="margin-bottom:10px">
          <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Email</label>
          <input type="text" value="nguyen.thang@corp.vn" readonly style="width:100%;padding:8px 10px;border:0.5px solid var(--border-md);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px"/>
        </div>
        <div style="margin-bottom:16px">
          <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Mật khẩu</label>
          <input type="password" id="pw-input" placeholder="Nhập mật khẩu..." style="width:100%;padding:8px 10px;border:0.5px solid var(--border-md);border-radius:6px;background:var(--bg);color:var(--text);font-size:13px" oninput="passwordInput=this.value"/>
        </div>
        <button onclick="submitPassword()" class="btn primary" style="width:100%;justify-content:center">Đăng nhập →</button>
      </div>`;
  }

  else if (mfaStage === "otp") {
    startOtpTimer();
    container.innerHTML = `
      <div style="background:var(--surface);border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;max-width:340px;margin:0 auto">
        <div style="text-align:center;margin-bottom:1.2rem">
          <div style="font-size:28px;margin-bottom:6px">📱</div>
          <div style="font-size:14px;font-weight:600">Xác thực 2 bước (TOTP)</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;line-height:1.5">Mật khẩu đúng. Mở app <strong>Authenticator</strong><br/>và nhập mã OTP 6 chữ số bên dưới.</div>
        </div>

        <div style="background:var(--bg);border-radius:8px;padding:14px;text-align:center;margin-bottom:14px">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Mã OTP từ Authenticator App</div>
          <div id="otp-display" style="font-size:32px;font-weight:700;font-family:monospace;letter-spacing:6px;color:var(--blue)">------</div>
          <div style="margin-top:8px;display:flex;align-items:center;justify-content:center;gap:6px">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted)"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style="font-size:11px;color:var(--text-muted)">Hết hạn sau <span id="otp-timer" style="font-weight:600;color:var(--amber)">30</span>s</span>
          </div>
        </div>

        <div style="margin-bottom:12px">
          <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:4px">Nhập mã OTP</label>
          <input type="text" id="otp-input" maxlength="6" placeholder="______" style="width:100%;padding:10px;border:0.5px solid var(--border-md);border-radius:6px;background:var(--bg);color:var(--text);font-size:20px;font-family:monospace;text-align:center;letter-spacing:4px" oninput="autoVerifyOtp(this.value)"/>
        </div>
        <button onclick="verifyOtp()" class="btn primary" style="width:100%;justify-content:center">Xác nhận →</button>
        <button onclick="tryAttack()" class="btn" style="width:100%;justify-content:center;margin-top:6px;font-size:12px;color:var(--red)">⚠ Thử nhập sai (xem kết quả)</button>
      </div>`;
    // Hiện OTP ngay
    generateOtp();
  }

  else if (mfaStage === "success") {
    stopOtpTimer();
    container.innerHTML = `
      <div style="background:var(--green-light);border:0.5px solid var(--green);border-radius:var(--radius-lg);padding:2rem;max-width:340px;margin:0 auto;text-align:center">
        <div style="font-size:40px;margin-bottom:12px">✅</div>
        <div style="font-size:15px;font-weight:600;color:var(--green);margin-bottom:6px">Đăng nhập thành công!</div>
        <div style="font-size:12px;color:#3B6D11;line-height:1.6;margin-bottom:16px">
          Cả hai yếu tố xác thực đã được xác minh:<br/>
          ✓ Mật khẩu (Yếu tố 1 — thứ bạn biết)<br/>
          ✓ OTP 6 chữ số (Yếu tố 2 — thứ bạn có)
        </div>
        <div style="background:white;border-radius:6px;padding:10px;font-size:11px;color:var(--text-muted);text-align:left;font-family:monospace;line-height:1.8;margin-bottom:14px">
          Auth-Method: TOTP (RFC 6238)<br/>
          Session-TTL: 8h<br/>
          IP: 192.168.1.42 ✓<br/>
          Risk-Score: LOW
        </div>
        <button onclick="resetMfa()" class="btn" style="font-size:12px">↺ Thử lại</button>
        <button onclick="showFido()" class="btn" style="font-size:12px;margin-left:6px">Xem FIDO2/Passkey →</button>
      </div>`;
  }

  else if (mfaStage === "fail") {
    stopOtpTimer();
    container.innerHTML = `
      <div style="background:var(--red-light);border:0.5px solid var(--red);border-radius:var(--radius-lg);padding:2rem;max-width:340px;margin:0 auto;text-align:center">
        <div style="font-size:40px;margin-bottom:12px">❌</div>
        <div style="font-size:15px;font-weight:600;color:var(--red);margin-bottom:6px">OTP không hợp lệ!</div>
        <div style="font-size:12px;color:#7B1C1C;line-height:1.6;margin-bottom:14px">
          Mã OTP sai hoặc đã hết hạn (30s). Dù kẻ tấn công biết mật khẩu, họ vẫn không thể đăng nhập nếu không có thiết bị Authenticator của bạn.
        </div>
        <div style="background:white;border-radius:6px;padding:10px;font-size:11px;color:var(--text-muted);text-align:left;font-family:monospace;line-height:1.8;margin-bottom:14px">
          WARN: Failed OTP attempt<br/>
          IP: 185.220.101.9 ⚠<br/>
          Attempts: 1/3<br/>
          Action: BLOCK after 3
        </div>
        <button onclick="mfaStage='otp';renderMfaStage()" class="btn primary" style="font-size:12px">↺ Thử lại</button>
      </div>`;
  }

  else if (mfaStage === "fido") {
    container.innerHTML = `
      <div style="background:var(--surface);border:0.5px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;max-width:360px;margin:0 auto">
        <div style="text-align:center;margin-bottom:1rem">
          <div style="font-size:28px;margin-bottom:6px">🔐</div>
          <div style="font-size:14px;font-weight:600">FIDO2 / Passkey</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Xác thực không cần mật khẩu</div>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
          ${["Thiết bị tạo cặp khóa riêng cho trang này", "Private Key lưu trong Secure Enclave — không rời thiết bị", "Server chỉ lưu Public Key", "Khi đăng nhập: ký thách thức bằng Private Key + Face ID", "Server xác minh chữ ký bằng Public Key"].map((t, i) => `
            <div class="fido-step-item" id="fido-item-${i}" style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:6px;background:var(--bg);opacity:0.35;transition:opacity 0.4s,background 0.4s">
              <span style="width:20px;height:20px;border-radius:50%;background:var(--blue-light);color:var(--blue-dark);font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</span>
              <span style="font-size:12px;color:var(--text);line-height:1.5">${t}</span>
            </div>`).join("")}
        </div>

        <div id="fido-result" style="display:none;background:var(--green-light);border-radius:6px;padding:10px;text-align:center;font-size:12px;color:var(--green);font-weight:600;margin-bottom:12px">
          ✅ Xác thực FIDO2 thành công — Không thể bị phishing!
        </div>

        <button id="fido-btn" onclick="runFidoAnimation()" class="btn primary" style="width:100%;justify-content:center">▶ Mô phỏng đăng nhập Passkey</button>
        <button onclick="resetMfa()" class="btn" style="width:100%;justify-content:center;margin-top:6px;font-size:12px">↺ Quay lại</button>
      </div>`;
  }
}

function submitPassword() {
  const pw = document.getElementById("pw-input").value;
  if (!pw || pw.length < 3) {
    document.getElementById("pw-input").style.borderColor = "var(--red)";
    return;
  }
  mfaStage = "otp";
  renderMfaStage();
}

let otpSecret = Math.floor(100000 + Math.random() * 900000);

function generateOtp() {
  otpValue = String(otpSecret).padStart(6, "0");
  const el = document.getElementById("otp-display");
  if (el) el.textContent = otpValue;
}

function startOtpTimer() {
  let remaining = 30;
  stopOtpTimer();
  otpInterval = setInterval(() => {
    remaining--;
    const timerEl = document.getElementById("otp-timer");
    if (timerEl) timerEl.textContent = remaining;
    if (remaining <= 0) {
      otpSecret = Math.floor(100000 + Math.random() * 900000);
      generateOtp();
      remaining = 30;
    }
  }, 1000);
}

function stopOtpTimer() {
  if (otpInterval) clearInterval(otpInterval);
  otpInterval = null;
}

function autoVerifyOtp(val) {
  if (val.length === 6) verifyOtp();
}

function verifyOtp() {
  const input = document.getElementById("otp-input");
  if (!input) return;
  if (input.value === otpValue) {
    mfaStage = "success";
  } else {
    mfaStage = "fail";
  }
  renderMfaStage();
}

function tryAttack() {
  const input = document.getElementById("otp-input");
  if (input) input.value = "000000";
  mfaStage = "fail";
  renderMfaStage();
}

function showFido() {
  mfaStage = "fido";
  renderMfaStage();
}

function resetMfa() {
  stopOtpTimer();
  mfaStage = "idle";
  document.getElementById("mfa-type-select").style.display = "flex";
  document.getElementById("mfa-demo-area").innerHTML = `
    <p style="color:var(--text-muted);font-size:13px;text-align:center;padding:1rem 0">Chọn loại xác thực để bắt đầu mô phỏng</p>`;
}

let fidoStep = -1;
function runFidoAnimation() {
  document.getElementById("fido-btn").style.display = "none";
  fidoStep = 0;
  animateFido();
}

function animateFido() {
  if (fidoStep >= 5) {
    document.getElementById("fido-result").style.display = "block";
    return;
  }
  const el = document.getElementById(`fido-item-${fidoStep}`);
  if (el) {
    el.style.opacity = "1";
    el.style.background = "#E6F1FB";
  }
  fidoStep++;
  setTimeout(animateFido, 900);
}

// ========================================================
//  KHỞI TẠO KHI TAB ĐƯỢC MỞ
// ========================================================
function initCryptoTab() {
  renderRsaIdle();
  document.getElementById("rsa-play-btn").onclick = rsaToggle;

  resetMfa();
}
