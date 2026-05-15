import { useState, useCallback } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const USERS = [
  { id: "emp1", name: "สมหญิง ใจดี",        role: "emp", roleLabel: "พนักงาน",           badgeClass: "emp", icon: "👩‍💻", bg: "#f5f3ff", dept: "ฝ่าย HR",          empId: "EMP-0042", email: "somying@company.com",   pass: "1234" },
  { id: "emp2", name: "กิตติศักดิ์ วัฒนา",  role: "emp", roleLabel: "พนักงาน",           badgeClass: "emp", icon: "👨‍💻", bg: "#f5f3ff", dept: "ฝ่ายปฏิบัติการ", empId: "EMP-0055", email: "kitti@company.com",     pass: "1234" },
  { id: "hr1",  name: "กัญญา มีสุข",         role: "hr",  roleLabel: "หัวหน้าแผนก HR",   badgeClass: "hr",  icon: "👩‍💼", bg: "#f0fdf4", dept: "ฝ่าย HR",          empId: "HR-001",   email: "kanya@company.com",    pass: "1234" },
  { id: "acc1", name: "ธนภัทร วงค์คำ",      role: "acc", roleLabel: "หัวหน้าแผนกบัญชี", badgeClass: "acc", icon: "👨‍💼", bg: "#eff6ff", dept: "ฝ่ายบัญชี",        empId: "ACC-001",  email: "thanapat@company.com", pass: "1234" },
  { id: "md1",  name: "วิชัย ศรีสกุล",      role: "md",  roleLabel: "กรรมการผู้จัดการ", badgeClass: "md",  icon: "👔",  bg: "#fffbeb", dept: "ผู้บริหาร",        empId: "MD-001",   email: "wichai@company.com",   pass: "1234" },
];

const INITIAL_MEMOS = [
  {
    id: "HR-260513-001", employee: "สมหญิง ใจดี", employeeId: "emp1",
    dept: "ฝ่าย HR", category: "สวัสดิการพนักงาน", amount: 2000,
    date: "13 พ.ค. 2569", desc: "ค่ารักษาพยาบาลประจำปี 2569",
    attachments: ["ใบเสร็จรพ.pdf", "บัตรทอง.jpg"],
    approvers: { hr: { status: "pending", time: "" }, acc: { status: "pending", time: "" }, md: { status: "pending", time: "" } },
  },
  {
    id: "TRN-260513-002", employee: "กิตติศักดิ์ วัฒนา", employeeId: "emp2",
    dept: "ฝ่ายปฏิบัติการ", category: "ฝึกอบรม", amount: 12500,
    date: "13 พ.ค. 2569", desc: "ค่าลงทะเบียนอบรม Agile Scrum",
    attachments: ["invoice.pdf"],
    approvers: { hr: { status: "approved", time: "13 พ.ค. 09:30" }, acc: { status: "pending", time: "" }, md: { status: "pending", time: "" } },
  },
  {
    id: "WF-260513-003", employee: "สมหญิง ใจดี", employeeId: "emp1",
    dept: "ฝ่าย HR", category: "กิจกรรมบริษัท", amount: 5800,
    date: "12 พ.ค. 2569", desc: "ค่าจัดงาน Team Building Q2",
    attachments: ["slip.jpg", "quotation.pdf"],
    approvers: { hr: { status: "approved", time: "12 พ.ค. 14:00" }, acc: { status: "approved", time: "12 พ.ค. 15:30" }, md: { status: "pending", time: "" } },
  },
  {
    id: "EQ-260512-004", employee: "กิตติศักดิ์ วัฒนา", employeeId: "emp2",
    dept: "ฝ่ายปฏิบัติการ", category: "อุปกรณ์สำนักงาน", amount: 8900,
    date: "11 พ.ค. 2569", desc: "ซื้อ RAM เพิ่ม และ SSD สำรองข้อมูล",
    attachments: ["receipt.pdf"],
    approvers: { hr: { status: "approved", time: "11 พ.ค. 10:00" }, acc: { status: "approved", time: "11 พ.ค. 11:00" }, md: { status: "approved", time: "11 พ.ค. 13:00" } },
  },
];

const CATEGORIES = [
  { value: "สวัสดิการพนักงาน", used: 42000, budget: 60000 },
  { value: "ฝึกอบรม",          used: 28500, budget: 50000 },
  { value: "กิจกรรมบริษัท",   used: 18000, budget: 40000 },
  { value: "อุปกรณ์สำนักงาน", used: 40000, budget: 50000 },
];

const APPROVER_DEFS = [
  { key: "hr",  name: "กัญญา มีสุข",    role: "หัวหน้า HR",        bg: "#f0fdf4", icon: "👩‍💼" },
  { key: "acc", name: "ธนภัทร วงค์คำ", role: "หัวหน้าบัญชี",      bg: "#eff6ff", icon: "👨‍💼" },
  { key: "md",  name: "วิชัย ศรีสกุล", role: "กรรมการผู้จัดการ",  bg: "#fffbeb", icon: "👔"  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getMemoStatus(m) {
  const vals = [m.approvers.hr.status, m.approvers.acc.status, m.approvers.md.status];
  if (vals.includes("rejected")) return "rejected";
  if (vals.every((v) => v === "approved")) return "approved";
  return "pending";
}

function canAct(m, role) {
  if (getMemoStatus(m) !== "pending") return false;
  if (m.approvers[role].status !== "pending") return false;
  if (role === "acc" && m.approvers.hr.status !== "approved") return false;
  if (role === "md" && (m.approvers.hr.status !== "approved" || m.approvers.acc.status !== "approved")) return false;
  return true;
}

function isWaiting(m, role) {
  if (m.approvers[role].status !== "pending") return false;
  if (role === "acc" && m.approvers.hr.status !== "approved") return true;
  if (role === "md" && (m.approvers.hr.status !== "approved" || m.approvers.acc.status !== "approved")) return true;
  return false;
}

function nowTime() {
  const n = new Date();
  return `${n.getDate()} พ.ค. ${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
}

function genMemoId(user, counter) {
  const prefix = user.dept.includes("ปฏิบัติ") ? "OPR" : user.dept.includes("HR") ? "HR" : "EMP";
  const d = new Date();
  const ds = `${String(d.getFullYear() - 543).slice(-2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `${prefix}-${ds}-${String(counter).padStart(3, "0")}`;
}

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const T = {
  bg: "#f3f4f6",
  white: "#fff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
  faint: "#9ca3af",
  radius: { sm: 10, md: 14, lg: 20 },
};

const badgeStyles = {
  emp: { background: "#f5f3ff", color: "#6d28d9", border: "1px solid #ddd6fe" },
  hr:  { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  acc: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  md:  { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
};

const inputCss = {
  width: "100%", padding: "9px 12px", borderRadius: T.radius.sm,
  border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit",
  outline: "none", color: T.text, boxSizing: "border-box", background: T.white,
};

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

function RoleBadge({ user }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 11px", borderRadius: 999, fontSize: 11, fontWeight: 600, ...badgeStyles[user.badgeClass] }}>
      {user.icon} {user.roleLabel}
    </span>
  );
}

const PILL_MAP = {
  approved: { bg: "#dcfce7", color: "#166534", label: "อนุมัติแล้ว" },
  rejected: { bg: "#fee2e2", color: "#dc2626", label: "ไม่อนุมัติ"  },
  pending:  { bg: "#fef3c7", color: "#92400e", label: "รออนุมัติ"   },
  wait:     { bg: "#f3f4f6", color: "#6b7280", label: "รอขั้นก่อนหน้า" },
  draft:    { bg: "#f5f3ff", color: "#6d28d9", label: "ร่าง"         },
};

function Pill({ status }) {
  const s = PILL_MAP[status] || PILL_MAP.pending;
  return (
    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: T.white, borderRadius: T.radius.lg, border: `1px solid ${T.border}`, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
      <span style={{ width: 26, height: 26, borderRadius: 8, background: T.bg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{icon}</span>
      {children}
    </div>
  );
}

function Btn({ onClick, variant = "default", disabled, style, children }) {
  const variants = {
    default: { background: T.white, color: "#374151", border: `1px solid ${T.border}` },
    primary: { background: T.text, color: T.white, border: `1px solid ${T.text}` },
    danger:  { background: T.white, color: "#dc2626", border: "1px solid #fecaca" },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: "7px 14px", borderRadius: T.radius.md, fontSize: 12, fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
        opacity: disabled ? 0.4 : 1, transition: "opacity .15s", ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function FieldGroup({ label, required, children, span2 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, ...(span2 ? { gridColumn: "span 2" } : {}) }}>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>
          {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

function Notice({ type = "warn", icon, children }) {
  const map = {
    warn:    { bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
    info:    { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
  };
  const s = map[type];
  return (
    <div style={{ display: "flex", gap: 8, background: s.bg, borderRadius: T.radius.sm, padding: "10px 13px", border: `1px solid ${s.border}` }}>
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ fontSize: 12, lineHeight: 1.5, color: s.color }}>{children}</div>
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", background: T.white, borderRadius: T.radius.md, padding: 4, border: `1px solid ${T.border}` }}>
      {tabs.map((t) => (
        <button key={t.value} onClick={() => onChange(t.value)}
          style={{ flex: 1, padding: "7px 8px", borderRadius: T.radius.sm, fontSize: 12, fontWeight: 500,
            cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all .18s",
            background: active === t.value ? T.text : "transparent",
            color: active === t.value ? T.white : T.muted }}>
          {t.label}
          {t.count != null && (
            <span style={{ background: active === t.value ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.08)", borderRadius: 999, padding: "1px 6px", fontSize: 10, marginLeft: 3 }}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

function StatGrid({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
      {items.map((s, i) => (
        <div key={i} style={{ background: T.white, borderRadius: 15, border: `1px solid ${T.border}`, padding: 13, textAlign: "center" }}>
          <div style={{ fontSize: s.small ? 14 : 19, fontWeight: 700 }}>{s.value}</div>
          <div style={{ fontSize: 10, color: T.faint, marginTop: 3 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: T.bg, margin: "10px 0" }} />;
}

function TblRow({ children, onClick }) {
  return (
    <tr onClick={onClick} style={{ cursor: "pointer" }}>
      {children}
    </tr>
  );
}

function TblCell({ children, head, bold, muted }) {
  const base = { padding: "10px", borderTop: head ? "none" : `1px solid ${T.bg}`, textAlign: "left", whiteSpace: head ? "nowrap" : "normal" };
  if (head) return <th style={{ ...base, padding: "0 10px 10px", fontSize: 11, fontWeight: 600, color: T.faint }}>{children}</th>;
  return <td style={{ ...base, fontWeight: bold ? 700 : 400, color: muted ? T.muted : T.text }}>{children}</td>;
}

// ─── APPROVAL FLOW ────────────────────────────────────────────────────────────

function ApprovalFlow({ memo }) {
  const steps = [
    { key: "hr",  label: "หัวหน้า HR",   icon: "🟢" },
    { key: "acc", label: "หัวหน้าบัญชี", icon: "🔵" },
    { key: "md",  label: "MD",            icon: "🟡" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "flex-start", overflowX: "auto", padding: "4px 0" }}>
      {steps.map((s, i) => {
        const st = memo.approvers[s.key].status;
        const prevOk = i === 0 || memo.approvers[steps[i - 1].key].status === "approved";
        const state = st === "approved" ? "done" : st === "rejected" ? "rejected" : prevOk ? "active" : "idle";

        const circleStyle = {
          width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: state === "done" ? 13 : 15,
          border: `2.5px solid ${state === "done" ? T.text : state === "active" ? "#f59e0b" : state === "rejected" ? "#dc2626" : T.border}`,
          background: state === "done" ? T.text : state === "active" ? "#fffbeb" : state === "rejected" ? "#fef2f2" : T.white,
          color: state === "done" ? T.white : T.text,
        };

        return (
          <div key={s.key} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 100, flex: 1 }}>
              <div style={circleStyle}>{st === "approved" ? "✓" : st === "rejected" ? "✕" : s.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#374151", marginTop: 5, textAlign: "center" }}>{s.label}</div>
              <div style={{ fontSize: 9, color: T.faint, textAlign: "center", marginTop: 2 }}>{memo.approvers[s.key].time || "รอ"}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2.5, background: st === "approved" ? T.text : T.border, marginTop: 19, alignSelf: "flex-start" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ApproverCards({ memo, myRole }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {APPROVER_DEFS.map((c) => {
        const st = memo.approvers[c.key].status;
        const isMe = c.key === myRole;
        return (
          <div key={c.key} style={{ borderRadius: 13, border: `1.5px solid ${isMe ? T.text : T.border}`, padding: "11px 13px", display: "flex", alignItems: "center", gap: 10, background: isMe ? "#fafafa" : T.white }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{c.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>
                {c.name}
                {isMe && <span style={{ fontSize: 9, background: T.text, color: T.white, padding: "2px 6px", borderRadius: 999, marginLeft: 5 }}>ฉัน</span>}
              </div>
              <div style={{ fontSize: 10, color: T.faint, marginTop: 1 }}>{c.role}</div>
              {memo.approvers[c.key].time && <div style={{ fontSize: 10, color: T.faint, fontStyle: "italic", marginTop: 2 }}>{memo.approvers[c.key].time}</div>}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: st === "approved" ? "#16a34a" : st === "rejected" ? "#dc2626" : "#d97706" }}>
              {st === "approved" ? "✓ อนุมัติแล้ว" : st === "rejected" ? "✕ ไม่อนุมัติ" : "⏳ รอ"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── MEMO DETAIL PANEL ────────────────────────────────────────────────────────

function MemoDetail({ memo, myRole, onClose, onAction }) {
  const [comment, setComment] = useState("");
  const overall = getMemoStatus(memo);
  const can     = myRole ? canAct(memo, myRole) : false;
  const waiting = myRole ? isWaiting(memo, myRole) : false;
  const mySt    = myRole ? memo.approvers[myRole]?.status : null;

  const infoRows = [
    ["เลข Memo",    memo.id],
    ["พนักงาน",     `${memo.employee} (${memo.dept})`],
    ["หมวด",        memo.category],
    ["จำนวนเงิน",   <span style={{ fontSize: 15, fontWeight: 700 }}>฿{memo.amount.toLocaleString()}</span>],
    ["วันที่",      memo.date],
    ["สถานะ",       <Pill status={overall} />],
  ];

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <SectionTitle icon="🔍">รายละเอียด Memo</SectionTitle>
        <Btn onClick={onClose}>✕ ปิด</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {infoRows.map(([label, val]) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <label style={{ fontSize: 10, color: T.faint }}>{label}</label>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>
          </div>
        ))}
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 2 }}>
          <label style={{ fontSize: 10, color: T.faint }}>รายละเอียด</label>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{memo.desc}</span>
        </div>
      </div>

      <Divider />
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 8 }}>ขั้นตอนการอนุมัติ</div>
      <ApprovalFlow memo={memo} />

      <Divider />
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 8 }}>สถานะผู้อนุมัติ</div>
      <ApproverCards memo={memo} myRole={myRole} />

      {memo.attachments?.length > 0 && (
        <>
          <Divider />
          <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 7 }}>เอกสารแนบ</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {memo.attachments.map((a) => (
              <div key={a} style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9fafb", border: `1px solid ${T.border}`, borderRadius: 9, padding: "6px 11px", fontSize: 12, cursor: "pointer" }}>
                {a.endsWith(".pdf") ? "📄" : "🖼️"} {a}
              </div>
            ))}
          </div>
        </>
      )}

      {myRole && (
        <>
          <Divider />
          {can ? (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 7 }}>ความคิดเห็น / หมายเหตุ</div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="ระบุเหตุผลหากไม่อนุมัติ..." rows={3}
                style={{ ...inputCss, resize: "vertical" }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <Btn variant="danger" onClick={() => onAction("rejected", comment)}>✕ ไม่อนุมัติ</Btn>
                <Btn variant="primary" onClick={() => onAction("approved", comment)}>✓ อนุมัติ</Btn>
              </div>
            </div>
          ) : waiting ? (
            <Notice type="warn" icon="⏳">รอการอนุมัติจากขั้นตอนก่อนหน้า — ท่านจะสามารถดำเนินการได้เมื่อขั้นตอนก่อนหน้าเสร็จสิ้น</Notice>
          ) : mySt === "approved" ? (
            <Notice type="success" icon="✓">ท่านได้อนุมัติรายการนี้แล้ว{memo.approvers[myRole].time ? ` เมื่อ ${memo.approvers[myRole].time}` : ""}</Notice>
          ) : mySt === "rejected" ? (
            <Notice type="warn" icon="✕">ท่านได้ปฏิเสธรายการนี้แล้ว</Notice>
          ) : overall === "approved" ? (
            <Notice type="success" icon="✓">Memo นี้ผ่านการอนุมัติครบทุกขั้นตอนแล้ว</Notice>
          ) : overall === "rejected" ? (
            <Notice type="warn" icon="✕">Memo นี้ถูกปฏิเสธแล้ว</Notice>
          ) : null}
        </>
      )}
    </Card>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function LoginPage({ onLogin }) {
  const [selectedId, setSelectedId] = useState(null);
  const [pass, setPass]             = useState("");
  const [err, setErr]               = useState(false);

  function handleLogin() {
    if (!selectedId) return;
    const u = USERS.find((x) => x.id === selectedId);
    if (pass !== u.pass) { setErr(true); return; }
    onLogin(u);
  }

  const groups = [
    { label: "พนักงาน",   users: USERS.filter((u) => u.role === "emp") },
    { label: "ผู้อนุมัติ", users: USERS.filter((u) => u.role !== "emp") },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, background: "linear-gradient(135deg,#f8fafc,#e5e7eb)" }}>
      <div style={{ background: T.white, borderRadius: 24, border: `1px solid ${T.border}`, padding: "36px 32px", width: "100%", maxWidth: 440, boxShadow: "0 8px 32px rgba(0,0,0,.07)" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, background: T.text, borderRadius: 15, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 12px" }}>📋</div>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>HR Memo System</h2>
          <p style={{ fontSize: 12, color: T.faint, marginTop: 3 }}>ระบบจัดการและอนุมัติค่าใช้จ่าย</p>
        </div>

        {groups.map((grp) => (
          <div key={grp.label} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.faint, letterSpacing: ".05em", marginBottom: 6 }}>{grp.label.toUpperCase()}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {grp.users.map((u) => (
                <div key={u.id} onClick={() => { setSelectedId(u.id); setErr(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: T.radius.md, border: `2px solid ${selectedId === u.id ? T.text : T.border}`, cursor: "pointer", background: selectedId === u.id ? "#f8fafc" : T.white, transition: "all .18s" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: u.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{u.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: T.faint, marginTop: 1 }}>{u.roleLabel}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selectedId === u.id ? T.text : T.border}`, background: selectedId === u.id ? T.text : T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.white, transition: "all .18s" }}>
                    {selectedId === u.id ? "✓" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: T.muted, display: "block", marginBottom: 5 }}>รหัสผ่าน</label>
          <input type="password" value={pass}
            onChange={(e) => { setPass(e.target.value); setErr(false); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="กรอกรหัสผ่าน" style={inputCss} />
          {err && <div style={{ fontSize: 12, color: "#dc2626", marginTop: 6, textAlign: "center" }}>รหัสผ่านไม่ถูกต้อง</div>}
        </div>

        <button onClick={handleLogin}
          style={{ width: "100%", padding: 11, borderRadius: 13, background: T.text, color: T.white, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
          เข้าสู่ระบบ
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: T.faint, marginTop: 12 }}>รหัสผ่านทดสอบทุกบัญชี: <b>1234</b></p>
      </div>
    </div>
  );
}

// ─── EMPLOYEE VIEW ────────────────────────────────────────────────────────────

function EmployeeView({ user, memos, onCreateMemo }) {
  const [tab, setTab]         = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const myMemos = memos.filter((m) => m.employeeId === user.id);
  const filtered = myMemos.filter((m) => {
    const s = getMemoStatus(m);
    if (tab === "pending")  return s === "pending";
    if (tab === "approved") return s === "approved";
    if (tab === "rejected") return s === "rejected";
    return true;
  });

  const selected  = memos.find((m) => m.id === selectedId);
  const cntPend   = myMemos.filter((m) => getMemoStatus(m) === "pending").length;
  const cntApprv  = myMemos.filter((m) => getMemoStatus(m) === "approved").length;
  const total     = myMemos.reduce((s, m) => s + m.amount, 0);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 700 }}>Memo ของฉัน</h1>
          <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>ติดตามและยื่นคำขอเบิกค่าใช้จ่าย</p>
        </div>
        <Btn variant="primary" onClick={onCreateMemo}>+ สร้าง Memo ใหม่</Btn>
      </div>

      <StatGrid items={[
        { value: myMemos.length, label: "Memo ทั้งหมด" },
        { value: cntPend,        label: "รออนุมัติ" },
        { value: cntApprv,       label: "อนุมัติแล้ว" },
        { value: `฿${total.toLocaleString()}`, label: "ยอดรวม", small: true },
      ]} />

      <Tabs active={tab} onChange={(v) => { setTab(v); setSelectedId(null); }} tabs={[
        { value: "all",      label: "ทั้งหมด" },
        { value: "pending",  label: "รออนุมัติ" },
        { value: "approved", label: "อนุมัติแล้ว" },
        { value: "rejected", label: "ไม่อนุมัติ" },
      ]} />

      <Card>
        <SectionTitle icon="📋">รายการ Memo</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>{["เลข Memo", "หมวด", "จำนวนเงิน", "วันที่", "สถานะ", ""].map((h) => <TblCell key={h} head>{h}</TblCell>)}</tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 28, color: T.faint }}>ไม่มีรายการ</td></tr>
              ) : filtered.map((m) => (
                <TblRow key={m.id} onClick={() => setSelectedId(m.id === selectedId ? null : m.id)}>
                  <TblCell bold>{m.id}</TblCell>
                  <TblCell>{m.category}</TblCell>
                  <TblCell bold>฿{m.amount.toLocaleString()}</TblCell>
                  <TblCell muted>{m.date}</TblCell>
                  <TblCell><Pill status={getMemoStatus(m)} /></TblCell>
                  <TblCell><Btn>ดู</Btn></TblCell>
                </TblRow>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <MemoDetail memo={selected} myRole={null} onClose={() => setSelectedId(null)} onAction={() => {}} />
      )}
    </div>
  );
}

// ─── CREATE FORM ──────────────────────────────────────────────────────────────

function CreateMemoView({ user, memoCounter, onSubmit, onBack }) {
  const [form, setForm]   = useState({ title: "", category: "", date: new Date().toISOString().slice(0, 10), amount: "", payType: "เงินสดส่วนตัว (ขอคืน)", desc: "" });
  const [files, setFiles] = useState([]);
  const [chk1, setChk1]   = useState(false);
  const [chk2, setChk2]   = useState(false);

  const memoId = genMemoId(user, memoCounter);
  const cat    = CATEGORIES.find((c) => c.value === form.category);
  const ready  = chk1 && chk2;

  function handleSubmit() {
    if (!form.title || !form.category || !form.amount) return;
    if (!ready) return;
    const d = new Date();
    onSubmit({
      id: memoId, employee: user.name, employeeId: user.id,
      dept: user.dept, category: form.category, amount: parseFloat(form.amount),
      date: `${d.getDate()} พ.ค. ${d.getFullYear() - 543 + 2512}`,
      desc: form.desc || form.title,
      attachments: files.map((f) => f.name),
      approvers: { hr: { status: "pending", time: "" }, acc: { status: "pending", time: "" }, md: { status: "pending", time: "" } },
    });
  }

  const selectStyle = { ...inputCss, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28 };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Btn onClick={onBack}>← กลับ</Btn>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 19, fontWeight: 700 }}>สร้าง Memo ใหม่</h1>
          <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>เลข Memo: <b>{memoId}</b></p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn>บันทึกร่าง</Btn>
          <Btn variant="primary" onClick={handleSubmit}>ส่งอนุมัติ →</Btn>
        </div>
      </div>

      {/* Progress steps */}
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {["ยื่นเรื่อง", "HR ตรวจสอบ", "บัญชีอนุมัติ", "MD อนุมัติ"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, border: `2px solid ${i === 0 ? T.text : T.border}`, background: i === 0 ? T.text : T.white, color: i === 0 ? T.white : T.faint }}>{i + 1}</div>
                <div style={{ fontSize: 10, color: i === 0 ? T.text : T.faint, fontWeight: i === 0 ? 600 : 400, marginTop: 4, textAlign: "center" }}>{label}</div>
              </div>
              {i < 3 && <div style={{ flex: 1, height: 2, background: T.border, marginTop: 14, alignSelf: "flex-start" }} />}
            </div>
          ))}
        </div>
      </Card>

      {/* Requester */}
      <Card>
        <SectionTitle icon="👤">ข้อมูลผู้ยื่นเรื่อง</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
          {[["ชื่อ-นามสกุล", user.name], ["แผนก", user.dept], ["รหัสพนักงาน", user.empId], ["อีเมล", user.email]].map(([lbl, val]) => (
            <FieldGroup key={lbl} label={lbl}>
              <input readOnly value={val} style={{ ...inputCss, background: "#f9fafb", color: T.muted }} />
            </FieldGroup>
          ))}
        </div>
      </Card>

      {/* Expense */}
      <Card>
        <SectionTitle icon="📋">รายละเอียดค่าใช้จ่าย</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
          <FieldGroup label="หัวข้อ Memo" required span2>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="ระบุหัวข้อ เช่น ค่าเบี้ยเลี้ยงเดินทาง" style={inputCss} />
          </FieldGroup>
          <FieldGroup label="หมวดค่าใช้จ่าย" required>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={selectStyle}>
              <option value="">-- เลือกหมวด --</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.value}</option>)}
            </select>
            {cat && (
              <div style={{ marginTop: 5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.faint, marginBottom: 3 }}>
                  <span>ใช้ไป ฿{cat.used.toLocaleString()}</span>
                  <span>คงเหลือ ฿{(cat.budget - cat.used).toLocaleString()}</span>
                </div>
                <div style={{ height: 4, background: T.border, borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(cat.used / cat.budget) * 100}%`, background: T.text, borderRadius: 999 }} />
                </div>
              </div>
            )}
          </FieldGroup>
          <FieldGroup label="วันที่เกิดค่าใช้จ่าย" required>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inputCss} />
          </FieldGroup>
          <FieldGroup label="จำนวนเงิน (บาท)" required>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: T.faint, pointerEvents: "none" }}>฿</span>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" min="0" style={{ ...inputCss, paddingLeft: 24 }} />
            </div>
          </FieldGroup>
          <FieldGroup label="ประเภทการชำระ">
            <select value={form.payType} onChange={(e) => setForm({ ...form, payType: e.target.value })} style={selectStyle}>
              {["เงินสดส่วนตัว (ขอคืน)", "บัตรบริษัท", "โอนผ่านธนาคาร"].map((v) => <option key={v}>{v}</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="รายละเอียด / หมายเหตุ" span2>
            <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="ระบุรายละเอียดเพิ่มเติม..." rows={3} style={{ ...inputCss, resize: "vertical" }} />
          </FieldGroup>
        </div>
        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: T.muted }}>ยอดรวมที่ขอเบิก</span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>฿{(parseFloat(form.amount) || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
        </div>
      </Card>

      {/* Attach */}
      <Card>
        <SectionTitle icon="📎">แนบเอกสาร / ใบเสร็จ</SectionTitle>
        <Notice type="warn" icon="💡">กรุณาแนบหลักฐานการชำระเงิน เช่น ใบเสร็จ, สลิปโอน เพื่อให้การอนุมัติรวดเร็วขึ้น</Notice>
        <div onClick={() => document.getElementById("hrMemoFileInput").click()}
          style={{ border: "1.5px dashed #d1d5db", borderRadius: 12, padding: 18, textAlign: "center", cursor: "pointer", marginTop: 12 }}>
          <div style={{ fontSize: 26, marginBottom: 6 }}>📂</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>คลิกเพื่อเลือกไฟล์</div>
          <div style={{ fontSize: 11, color: T.faint, marginTop: 3 }}>PDF, JPG, PNG ไม่เกิน 10MB</div>
        </div>
        <input type="file" id="hrMemoFileInput" style={{ display: "none" }} multiple accept=".pdf,.jpg,.png"
          onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files)])} />
        {files.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 11px", background: "#f9fafb", border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 12, marginTop: 8 }}>
            {f.name.endsWith(".pdf") ? "📄" : "🖼️"}
            <span style={{ flex: 1 }}>{f.name}</span>
            <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, fontSize: 14 }}>✕</button>
          </div>
        ))}
      </Card>

      {/* Confirm */}
      <Card>
        <SectionTitle icon="✅">ยืนยันก่อนส่ง</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[[chk1, setChk1, "ข้าพเจ้าขอรับรองว่าค่าใช้จ่ายที่ยื่นนี้เป็นค่าใช้จ่ายจริงเพื่อกิจการของบริษัท"],
            [chk2, setChk2, "ได้แนบหลักฐานครบถ้วนแล้ว"]].map(([val, set, label], i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "#374151" }}>
              <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} style={{ width: 15, height: 15, accentColor: T.text }} />
              {label}
            </label>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <Btn onClick={onBack}>ยกเลิก</Btn>
          <Btn variant="primary" disabled={!ready} onClick={handleSubmit}>ส่งอนุมัติ →</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── APPROVER VIEW ────────────────────────────────────────────────────────────

function ApproverView({ user, memos, onAction }) {
  const [tab, setTab]               = useState("pending");
  const [selectedId, setSelectedId] = useState(null);
  const myRole = user.role;

  const filtered = memos.filter((m) => {
    const s = getMemoStatus(m);
    if (tab === "pending")  return s === "pending";
    if (tab === "approved") return s === "approved";
    if (tab === "rejected") return s === "rejected";
    return true;
  });

  const cntPend  = memos.filter((m) => getMemoStatus(m) === "pending").length;
  const cntApprv = memos.filter((m) => getMemoStatus(m) === "approved").length;
  const cntRej   = memos.filter((m) => getMemoStatus(m) === "rejected").length;
  const total    = memos.reduce((s, m) => s + m.amount, 0);
  const selected = memos.find((m) => m.id === selectedId);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 19, fontWeight: 700 }}>ระบบอนุมัติ — {user.roleLabel}</h1>
        <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>จัดการรายการค่าใช้จ่ายในสิทธิ์ของท่าน</p>
      </div>

      <StatGrid items={[
        { value: cntPend,  label: "รออนุมัติ" },
        { value: cntApprv, label: "อนุมัติแล้ว" },
        { value: cntRej,   label: "ไม่อนุมัติ" },
        { value: `฿${total.toLocaleString()}`, label: "ยอดรวม", small: true },
      ]} />

      <Tabs active={tab} onChange={(v) => { setTab(v); setSelectedId(null); }} tabs={[
        { value: "pending",  label: "รออนุมัติ", count: cntPend },
        { value: "approved", label: "อนุมัติแล้ว" },
        { value: "rejected", label: "ไม่อนุมัติ" },
        { value: "all",      label: "ทั้งหมด" },
      ]} />

      <Card>
        <SectionTitle icon="📋">รายการ Memo</SectionTitle>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>{["เลข Memo", "พนักงาน", "หมวด", "จำนวนเงิน", "วันที่", "สถานะรวม", "สถานะของฉัน", ""].map((h) => <TblCell key={h} head>{h}</TblCell>)}</tr>
            </thead>
            <tbody>
              {!filtered.length ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 28, color: T.faint }}>ไม่มีรายการ</td></tr>
              ) : filtered.map((m) => {
                const mySt = m.approvers[myRole].status;
                const myPillStatus = mySt === "approved" ? "approved" : mySt === "rejected" ? "rejected" : isWaiting(m, myRole) ? "wait" : "pending";
                return (
                  <TblRow key={m.id} onClick={() => setSelectedId(m.id === selectedId ? null : m.id)}>
                    <TblCell bold>{m.id}</TblCell>
                    <TblCell>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.bg, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: T.muted, marginRight: 5 }}>{m.employee.charAt(0)}</div>
                        {m.employee}
                      </div>
                    </TblCell>
                    <TblCell>{m.category}</TblCell>
                    <TblCell bold>฿{m.amount.toLocaleString()}</TblCell>
                    <TblCell muted>{m.date}</TblCell>
                    <TblCell><Pill status={getMemoStatus(m)} /></TblCell>
                    <TblCell><Pill status={myPillStatus} /></TblCell>
                    <TblCell><Btn>ดู</Btn></TblCell>
                  </TblRow>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {selected && (
        <MemoDetail
          memo={selected} myRole={myRole}
          onClose={() => setSelectedId(null)}
          onAction={(action) => onAction(selectedId, myRole, action)}
        />
      )}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar({ user, onLogout }) {
  return (
    <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 54, position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, background: T.text, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📋</div>
        HR Memo System
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <RoleBadge user={user} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</span>
        <button onClick={onLogout} style={{ padding: "6px 12px", borderRadius: 9, fontSize: 12, fontWeight: 500, border: `1px solid ${T.border}`, background: T.white, cursor: "pointer", fontFamily: "inherit" }}>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: T.text, color: T.white, padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,.25)", whiteSpace: "nowrap", pointerEvents: "none" }}>
      {message}
    </div>
  );
}

// ─── ROOT COMPONENT ───────────────────────────────────────────────────────────

export default function HRMemoSystem() {
  const [user, setUser]       = useState(null);
  const [view, setView]       = useState("login"); // "login" | "emp" | "create" | "approver"
  const [memos, setMemos]     = useState(INITIAL_MEMOS);
  const [counter, setCounter] = useState(5);
  const [toast, setToast]     = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleLogin(u) {
    setUser(u);
    setView(u.role === "emp" ? "emp" : "approver");
  }

  function handleLogout() {
    setUser(null);
    setView("login");
  }

  function handleCreateMemo(newMemo) {
    setMemos((prev) => [newMemo, ...prev]);
    setCounter((c) => c + 1);
    showToast(`✓ ส่ง Memo ${newMemo.id} เรียบร้อย!`);
    setView("emp");
  }

  const handleAprAction = useCallback((memoId, role, action) => {
    setMemos((prev) =>
      prev.map((m) =>
        m.id !== memoId ? m : { ...m, approvers: { ...m.approvers, [role]: { status: action, time: nowTime() } } }
      )
    );
    showToast(`${action === "approved" ? "✓ อนุมัติแล้ว" : "✕ ไม่อนุมัติ"} — ${memoId}`);
  }, []);

  if (view === "login") {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toast message={toast} />
      </>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Navbar user={user} onLogout={handleLogout} />
      {view === "emp"      && <EmployeeView user={user} memos={memos} onCreateMemo={() => setView("create")} />}
      {view === "create"   && <CreateMemoView user={user} memoCounter={counter} onSubmit={handleCreateMemo} onBack={() => setView("emp")} />}
      {view === "approver" && <ApproverView user={user} memos={memos} onAction={handleAprAction} />}
      <Toast message={toast} />
    </div>
  );
}
