/**
 * js/mobile-demo.js
 * Demo tập trung vào bảo mật thiết bị di động:
 *   1. MDM Dashboard — remote wipe, policy push, device management
 *   2. BYOD Attack Scenario — thiết bị bị mất → hệ thống phản ứng
 *   3. Containerization — tách vùng cá nhân / công ty
 *
 */

// ============================================================
//  PHẦN 1: MDM DASHBOARD
// ============================================================

const MDM_DEVICES = [
  { id: "DEV001", name: "Samsung Galaxy A55", user: "Nhân Viên A", os: "Android 14", status: "compliant",   mdm: "Intune",   lastSeen: "2 phút trước",  battery: 78,  encrypt: true,  os_update: true,  mdm_enrolled: true  },
  { id: "DEV002", name: "iPhone 15 Pro",      user: "Nhân Viên B",    os: "iOS 17.4",    status: "compliant",   mdm: "ABM",      lastSeen: "5 phút trước",  battery: 91,  encrypt: true,  os_update: true,  mdm_enrolled: true  },
  { id: "DEV003", name: "Xiaomi Redmi 12",    user: "Nhân Viên C",    os: "Android 13",  status: "non-comply",  mdm: "Không có", lastSeen: "3 ngày trước",  battery: 12,  encrypt: false, os_update: false, mdm_enrolled: false },
  { id: "DEV004", name: "Samsung Tab S9",     user: "Nhân Viên D", os: "Android 14",  status: "warning",     mdm: "Intune",   lastSeen: "1 giờ trước",   battery: 45,  encrypt: true,  os_update: false, mdm_enrolled: true  },
];

let mdmLog = [];

function renderMdmDashboard() {
  const statusCount = { compliant: 0, warning: 0, "non-comply": 0 };
  MDM_DEVICES.forEach(d => statusCount[d.status]++);

  document.getElementById("mdm-stat-ok").textContent   = statusCount.compliant;
  document.getElementById("mdm-stat-warn").textContent = statusCount.warning;
  document.getElementById("mdm-stat-fail").textContent = statusCount["non-comply"];

  const tbody = document.getElementById("mdm-device-list");
  tbody.innerHTML = MDM_DEVICES.map(d => {
    const sc = d.status === "compliant" ? { bg:"#EAF3DE", fg:"#3B6D11", label:"Tuân thủ" }
             : d.status === "warning"   ? { bg:"#FAEEDA", fg:"#854F0B", label:"Cảnh báo" }
             :                           { bg:"#FCEBEB", fg:"#A32D2D", label:"Vi phạm" };
    return `
      <tr style="border-bottom:0.5px solid var(--border)">
        <td style="padding:10px 12px;font-size:13px;font-weight:600">${d.name}<br><span style="font-size:11px;font-weight:400;color:var(--text-muted)">${d.user}</span></td>
        <td style="padding:10px 12px;font-size:12px;color:var(--text-muted)">${d.lastSeen}</td>
        <td style="padding:10px 12px">
          <span style="background:${sc.bg};color:${sc.fg};font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px">${sc.label}</span>
        </td>
        <td style="padding:10px 12px">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${d.encrypt      ? `<span style="background:#EAF3DE;color:#3B6D11;font-size:10px;padding:1px 6px;border-radius:99px">Mã hóa ✓</span>` : `<span style="background:#FCEBEB;color:#A32D2D;font-size:10px;padding:1px 6px;border-radius:99px">Mã hóa ✗</span>`}
            ${d.os_update    ? `<span style="background:#EAF3DE;color:#3B6D11;font-size:10px;padding:1px 6px;border-radius:99px">OS mới ✓</span>`   : `<span style="background:#FAEEDA;color:#854F0B;font-size:10px;padding:1px 6px;border-radius:99px">Chưa vá !</span>`}
            ${d.mdm_enrolled ? `<span style="background:#E6F1FB;color:#0C447C;font-size:10px;padding:1px 6px;border-radius:99px">MDM ✓</span>`       : `<span style="background:#FCEBEB;color:#A32D2D;font-size:10px;padding:1px 6px;border-radius:99px">MDM ✗</span>`}
          </div>
        </td>
        <td style="padding:10px 12px">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button onclick="mdmAction('wipe','${d.id}','${d.name}')" style="font-size:11px;padding:4px 8px;border:0.5px solid #E24B4A;border-radius:4px;background:#FCEBEB;color:#A32D2D;cursor:pointer">Remote Wipe</button>
            <button onclick="mdmAction('lock','${d.id}','${d.name}')" style="font-size:11px;padding:4px 8px;border:0.5px solid var(--border-md);border-radius:4px;background:var(--bg);color:var(--text);cursor:pointer">Khóa ngay</button>
            <button onclick="mdmAction('policy','${d.id}','${d.name}')" style="font-size:11px;padding:4px 8px;border:0.5px solid var(--border-md);border-radius:4px;background:var(--bg);color:var(--text);cursor:pointer">Push Policy</button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function mdmAction(action, deviceId, deviceName) {
  const device = MDM_DEVICES.find(d => d.id === deviceId);
  if (!device) return;

  const now = new Date().toLocaleTimeString("vi-VN");
  let logEntry = "";
  let confirmMsg = "";

  if (action === "wipe") {
    confirmMsg = `⚠ Xác nhận Remote Wipe toàn bộ dữ liệu trên "${deviceName}"?\nThao tác này KHÔNG THỂ hoàn tác!`;
    if (!confirm(confirmMsg)) return;
    logEntry = `[${now}] REMOTE WIPE gửi đến ${deviceName} (${deviceId}) — toàn bộ dữ liệu doanh nghiệp sẽ bị xóa`;
    device.status = "compliant";
    device.lastSeen = "Vừa xong";
    addMdmLog("wipe", logEntry);
  } else if (action === "lock") {
    logEntry = `[${now}] LOCK lệnh gửi đến ${deviceName} (${deviceId}) — thiết bị bị khóa ngay lập tức`;
    addMdmLog("lock", logEntry);
  } else if (action === "policy") {
    logEntry = `[${now}] POLICY PUSH → ${deviceName}: enforce FDE=true, PIN_min=6, BT_discoverable=false`;
    device.lastSeen = "Vừa xong";
    addMdmLog("policy", logEntry);
  }
  renderMdmDashboard();
}

function addMdmLog(type, text) {
  const colorMap = { wipe:"#A32D2D", lock:"#854F0B", policy:"#185FA5" };
  mdmLog.unshift({ text, color: colorMap[type] || "#444" });
  if (mdmLog.length > 6) mdmLog.pop();

  const logEl = document.getElementById("mdm-log");
  logEl.innerHTML = mdmLog.map(l =>
    `<div style="font-size:11px;font-family:monospace;color:${l.color};padding:3px 0;border-bottom:0.5px solid var(--border);line-height:1.5">${l.text}</div>`
  ).join("");
}

// ============================================================
//  PHẦN 2: BYOD ATTACK SCENARIO
// ============================================================

const BYOD_STEPS = [
  {
    title: "Thiết bị bị mất / đánh cắp",
    icon: "📱",
    actor: "threat",
    desc: "Nhân viên báo mất điện thoại công ty (Samsung A55) tại quán cà phê. Thiết bị có Work Profile chứa email và tài liệu doanh nghiệp.",
    sysResponse: null,
    deviceState: "lost",
  },
  {
    title: "Kẻ tấn công cố mở khóa",
    icon: "🔓",
    actor: "threat",
    desc: "Kẻ tấn công thử nhập PIN sai nhiều lần. Hệ thống ghi nhận 5 lần thất bại liên tiếp từ địa điểm bất thường.",
    sysResponse: "CẢNH BÁO: 5 lần nhập sai PIN — tài khoản tạm khóa 30 phút",
    deviceState: "locked",
  },
  {
    title: "MDM phát hiện thiết bị offline bất thường",
    icon: "📡",
    actor: "mdm",
    desc: "MDM Server (Intune) phát hiện thiết bị không heartbeat đúng lịch. Vị trí GPS cuối cùng khác nơi làm việc của nhân viên.",
    sysResponse: "MDM ALERT: Device DEV003 — offline 2h, location anomaly detected",
    deviceState: "suspect",
  },
  {
    title: "IT Admin kích hoạt Remote Lock",
    icon: "🔒",
    actor: "admin",
    desc: "IT Admin nhận cảnh báo qua email, đăng nhập MDM Console và gửi lệnh Remote Lock ngay lập tức đến thiết bị.",
    sysResponse: "COMMAND SENT: REMOTE_LOCK → DEV003. Status: delivered",
    deviceState: "locked",
  },
  {
    title: "Selective Wipe — xóa vùng công ty",
    icon: "🗑️",
    actor: "admin",
    desc: "Admin ra lệnh Selective Wipe: chỉ xóa Work Profile (email, file công ty, VPN config). Ảnh cá nhân, Zalo, ứng dụng cá nhân không bị ảnh hưởng.",
    sysResponse: "SELECTIVE WIPE: Work Profile deleted. Personal data preserved.",
    deviceState: "wiped",
  },
  {
    title: "Dữ liệu doanh nghiệp được bảo vệ",
    icon: "✅",
    actor: "safe",
    desc: "Toàn bộ dữ liệu doanh nghiệp đã bị xóa. Kẻ tấn công chỉ còn thấy ứng dụng cá nhân của nhân viên. Nhờ FDE + Work Profile, không có byte dữ liệu nào bị rò rỉ.",
    sysResponse: "AUDIT LOG: Incident resolved. 0 bytes corporate data exposed.",
    deviceState: "safe",
  },
];

let byodCurrentStep = 0;

function initByodDemo() {
  byodCurrentStep = 0;
  renderByodStep();
}

function renderByodStep() {
  const step = BYOD_STEPS[byodCurrentStep];
  const total = BYOD_STEPS.length;

  // Progress dots
  const dots = document.getElementById("byod-dots");
  dots.innerHTML = BYOD_STEPS.map((s, i) => {
    const color = i < byodCurrentStep ? "#3B6D11"
                : i === byodCurrentStep ? (s.actor === "threat" ? "#A32D2D" : s.actor === "safe" ? "#3B6D11" : "#185FA5")
                : "var(--border-md)";
    return `<div style="width:10px;height:10px;border-radius:50%;background:${color};transition:background 0.3s;flex-shrink:0"></div>`;
  }).join("");

  // Actor color
  const actorStyle = step.actor === "threat" ? { bg:"#FCEBEB", border:"#E24B4A", fg:"#A32D2D" }
                   : step.actor === "safe"   ? { bg:"#EAF3DE", border:"#639922", fg:"#3B6D11" }
                   : step.actor === "mdm"    ? { bg:"#E6F1FB", border:"#185FA5", fg:"#0C447C" }
                   :                          { bg:"#FAEEDA", border:"#BA7517", fg:"#633806" };

  document.getElementById("byod-step-box").style.cssText =
    `background:${actorStyle.bg};border:1px solid ${actorStyle.border};border-radius:var(--radius-lg);padding:1.25rem 1.5rem`;

  document.getElementById("byod-icon").textContent = step.icon;
  document.getElementById("byod-step-num").textContent = `Bước ${byodCurrentStep + 1} / ${total}`;
  document.getElementById("byod-step-title").textContent = step.title;
  document.getElementById("byod-step-title").style.color = actorStyle.fg;
  document.getElementById("byod-step-desc").textContent = step.desc;

  const sysEl = document.getElementById("byod-sys-response");
  if (step.sysResponse) {
    sysEl.style.display = "block";
    sysEl.textContent = step.sysResponse;
  } else {
    sysEl.style.display = "none";
  }

  // Device state visual
  const stateMap = {
    lost:    { icon:"📱", label:"Thiết bị: Mất tích",       color:"#A32D2D" },
    locked:  { icon:"🔒", label:"Thiết bị: Đã khóa",        color:"#854F0B" },
    suspect: { icon:"⚠️", label:"Thiết bị: Nghi vấn",       color:"#854F0B" },
    wiped:   { icon:"🗑️", label:"Work Profile: Đã xóa",     color:"#185FA5" },
    safe:    { icon:"✅", label:"Dữ liệu công ty: An toàn",  color:"#3B6D11" },
    normal:  { icon:"📱", label:"Thiết bị: Bình thường",     color:"#888" },
  };
  const state = stateMap[step.deviceState] || stateMap.normal;
  document.getElementById("byod-device-state").innerHTML =
    `<span style="font-size:18px">${state.icon}</span>
     <span style="font-size:12px;font-weight:600;color:${state.color}">${state.label}</span>`;

  // Buttons
  document.getElementById("byod-prev-btn").disabled = byodCurrentStep === 0;
  const nextBtn = document.getElementById("byod-next-btn");
  nextBtn.textContent = byodCurrentStep === total - 1 ? "↺ Xem lại" : "Tiếp →";
}

function byodNext() {
  if (byodCurrentStep === BYOD_STEPS.length - 1) {
    byodCurrentStep = 0;
  } else {
    byodCurrentStep++;
  }
  renderByodStep();
}

function byodPrev() {
  if (byodCurrentStep > 0) {
    byodCurrentStep--;
    renderByodStep();
  }
}

// ============================================================
//  PHẦN 3: CONTAINERIZATION
// ============================================================

let containerZone = "both"; // "personal" | "work" | "both"

const CONTAINER_PERSONAL = [
  { icon: "📷", name: "Camera & Ảnh",    desc: "Ảnh gia đình, cá nhân",         safe: true  },
  { icon: "💬", name: "Zalo / Facebook", desc: "Chat, mạng xã hội cá nhân",     safe: true  },
  { icon: "🎵", name: "Spotify / TikTok",desc: "Giải trí, âm nhạc",             safe: true  },
  { icon: "🏦", name: "Banking App",     desc: "Tài khoản ngân hàng cá nhân",   safe: true  },
];

const CONTAINER_WORK = [
  { icon: "📧", name: "Email công ty",   desc: "Outlook — corp.example.com",     safe: true  },
  { icon: "📁", name: "SharePoint",      desc: "File & tài liệu nội bộ",         safe: true  },
  { icon: "🔐", name: "VPN doanh nghiệp",desc: "Kết nối mạng nội bộ",           safe: true  },
  { icon: "📋", name: "CRM / ERP",       desc: "Dữ liệu khách hàng, vận hành",  safe: true  },
];

function renderContainerDemo() {
  const wipeWork = document.getElementById("container-wipe-work");
  const wipePers = document.getElementById("container-wipe-personal");

  renderContainerZone("container-personal-list", CONTAINER_PERSONAL, "personal");
  renderContainerZone("container-work-list",     CONTAINER_WORK,     "work");

  // Barrier label
  document.getElementById("container-barrier").innerHTML = `
    <div style="text-align:center;padding:8px 12px;background:var(--bg);border:0.5px solid var(--border-md);border-radius:99px;font-size:11px;font-weight:600;color:var(--text-muted)">
      🔒 Work Profile Boundary — kernel enforced
    </div>`;
}

function renderContainerZone(elId, items, zone) {
  const el = document.getElementById(elId);
  el.innerHTML = items.map(item => {
    const erased = (zone === "work" && !item.safe);
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;background:var(--bg);border:0.5px solid var(--border);margin-bottom:6px;transition:opacity 0.4s;opacity:${erased?0.3:1}">
        <span style="font-size:20px;flex-shrink:0">${item.icon}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.name}</div>
          <div style="font-size:11px;color:var(--text-muted)">${item.desc}</div>
        </div>
        ${erased ? `<span style="font-size:10px;color:#A32D2D;font-weight:600">WIPED</span>` : ""}
      </div>`;
  }).join("");
}

function containerSelectiveWipe() {
  CONTAINER_WORK.forEach(item => item.safe = false);
  renderContainerZone("container-work-list", CONTAINER_WORK, "work");

  document.getElementById("container-wipe-result").style.display = "block";
  document.getElementById("container-wipe-result").innerHTML = `
    <div style="background:#EAF3DE;border:0.5px solid #639922;border-radius:var(--radius-md);padding:10px 14px;font-size:12px;color:#3B6D11;margin-top:10px">
      ✅ <strong>Selective Wipe hoàn tất</strong> — Toàn bộ Work Profile đã bị xóa.<br>
      Ảnh cá nhân, Zalo, Banking App <strong>không bị ảnh hưởng</strong>.<br>
      <span style="color:#0F6E56">Đây chính là ưu điểm của Containerization so với Full Wipe.</span>
    </div>`;
  document.getElementById("container-wipe-btn").style.display = "none";
  document.getElementById("container-reset-btn").style.display = "inline-flex";
}

function containerReset() {
  CONTAINER_WORK.forEach(item => item.safe = true);
  renderContainerZone("container-work-list", CONTAINER_WORK, "work");
  document.getElementById("container-wipe-result").style.display = "none";
  document.getElementById("container-wipe-btn").style.display = "inline-flex";
  document.getElementById("container-reset-btn").style.display = "none";
}

// ============================================================
//  KHỞI TẠO
// ============================================================
function initMobileTab() {
  renderMdmDashboard();
  initByodDemo();
  renderContainerDemo();
}
