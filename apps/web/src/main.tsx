import React from "react";
import ReactDOM from "react-dom/client";
import {
  Activity,
  Bell,
  Bot,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileText,
  FlaskConical,
  Globe2,
  HeartPulse,
  Link2,
  LayoutDashboard,
  LockKeyhole,
  Mic,
  MonitorSmartphone,
  Moon,
  PackageSearch,
  Plus,
  Search,
  ShieldCheck,
  Stethoscope,
  Sun,
  Trash2,
  Users,
  Video
} from "lucide-react";
import { io } from "socket.io-client";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import * as THREE from "three";
import "./styles.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const socket = io(apiUrl, { transports: ["websocket"] });

type RoleView = "admin" | "patient" | "employee";
type ModuleKey = "dashboard" | "patients" | "scheduling" | "emr" | "billing" | "inventory" | "lab" | "telemedicine" | "security";
type Language = "en" | "ur";
type ThemeMode = "system" | "light" | "dark";
type DensityMode = "adaptive" | "comfortable" | "compact";
type Alert = {
  type: string;
  severity: "info" | "warning" | "critical";
  message: string;
  createdAt: string;
};

type Patient = {
  id: string;
  name: string;
  mrn: string;
  status: string;
  diagnosis: string;
  nextVisit: string;
};

const moduleIcons: Record<ModuleKey, React.ElementType> = {
  dashboard: LayoutDashboard,
  patients: Users,
  scheduling: CalendarClock,
  emr: FileText,
  billing: CreditCard,
  inventory: PackageSearch,
  lab: FlaskConical,
  telemedicine: Video,
  security: LockKeyhole
};

const moduleAccess: Record<ModuleKey, RoleView[]> = {
  dashboard: ["admin", "patient", "employee"],
  patients: ["admin", "employee"],
  scheduling: ["admin", "patient", "employee"],
  emr: ["admin", "patient", "employee"],
  billing: ["admin", "patient"],
  inventory: ["admin", "employee"],
  lab: ["admin", "patient", "employee"],
  telemedicine: ["admin", "patient", "employee"],
  security: ["admin"]
};

const translations: Record<
  Language,
  Record<
    | ModuleKey
    | RoleView
    | "secureSession"
    | "commandCenter"
    | "theme"
    | "adaptive"
    | "voice"
    | "ai"
    | "blockchain"
    | "smartCare",
    string
  >
> = {
  en: {
    dashboard: "Dashboard",
    patients: "Patients",
    scheduling: "Scheduling",
    emr: "EMR",
    billing: "Billing",
    inventory: "Inventory",
    lab: "Lab",
    telemedicine: "Telemedicine",
    security: "Security",
    admin: "Admin",
    patient: "Patient",
    employee: "Employee",
    secureSession: "Secure session",
    commandCenter: "command center",
    theme: "Theme",
    adaptive: "Adaptive",
    voice: "Voice",
    ai: "AI",
    blockchain: "Blockchain",
    smartCare: "Smart care"
  },
  ur: {
    dashboard: "ڈیش بورڈ",
    patients: "مریض",
    scheduling: "شیڈولنگ",
    emr: "طبی ریکارڈ",
    billing: "بلنگ",
    inventory: "انوینٹری",
    lab: "لیب",
    telemedicine: "ٹیلی میڈیسن",
    security: "سیکیورٹی",
    admin: "ایڈمن",
    patient: "مریض",
    employee: "عملہ",
    secureSession: "محفوظ سیشن",
    commandCenter: "کمانڈ سینٹر",
    theme: "تھیم",
    adaptive: "مطابقتی",
    voice: "آواز",
    ai: "اے آئی",
    blockchain: "بلاک چین",
    smartCare: "سمارٹ کیئر"
  }
};

const roleLabels: Record<RoleView, string> = {
  admin: "Admin",
  patient: "Patient",
  employee: "Employee"
};

const patientsSeed: Patient[] = [
  { id: "p-1001", name: "Amina Reyes", mrn: "MRN-1001", status: "Admitted", diagnosis: "CHF monitoring", nextVisit: "Today 14:30" },
  { id: "p-1002", name: "Bilal Khan", mrn: "MRN-1002", status: "Outpatient", diagnosis: "Diabetes follow-up", nextVisit: "May 6 09:00" },
  { id: "p-1003", name: "Maya Chen", mrn: "MRN-1003", status: "Observation", diagnosis: "Post-op review", nextVisit: "Today 17:15" }
];

const metrics = {
  admin: [
    ["Admissions", "148", Activity, "green"],
    ["Staff utilization", "87%", Users, "blue"],
    ["Revenue cycle", "$412K", CreditCard, "gold"],
    ["Critical alerts", "9", Bell, "red"]
  ],
  patient: [
    ["Care plan", "Active", HeartPulse, "green"],
    ["Appointments", "3", CalendarClock, "blue"],
    ["Lab results", "2 new", FlaskConical, "gold"],
    ["Balance", "$180", CreditCard, "red"]
  ],
  employee: [
    ["Assigned tasks", "18", ClipboardCheck, "green"],
    ["Rounds", "12", Stethoscope, "blue"],
    ["Pending labs", "24", FlaskConical, "gold"],
    ["Low supplies", "11", PackageSearch, "red"]
  ]
} as const;

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: "#e6ecef" }, ticks: { precision: 0 } }
  }
};

function App() {
  const [role, setRole] = React.useState<RoleView>("admin");
  const [activeModule, setActiveModule] = React.useState<ModuleKey>("dashboard");
  const [language, setLanguage] = React.useState<Language>("en");
  const [themeMode, setThemeMode] = React.useState<ThemeMode>("system");
  const [densityMode, setDensityMode] = React.useState<DensityMode>("adaptive");
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [patients, setPatients] = React.useState<Patient[]>(patientsSeed);

  React.useEffect(() => {
    socket.on("alert", (alert: Alert) => setAlerts((items) => [alert, ...items].slice(0, 6)));
    return () => {
      socket.off("alert");
    };
  }, []);

  React.useEffect(() => {
    if (!moduleAccess[activeModule].includes(role)) setActiveModule("dashboard");
  }, [activeModule, role]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === "ur" ? "rtl" : "ltr";
    root.dataset.theme = themeMode;
    root.dataset.density = densityMode;
  }, [densityMode, language, themeMode]);

  const t = translations[language];
  const localizedRole = roleLabelsFor(language);
  const seededAlerts = alerts.length
    ? alerts
    : ([
        { type: "risk.readmission", severity: "critical", message: "Room 512 risk score crossed threshold", createdAt: new Date().toISOString() },
        { type: "inventory.low_stock", severity: "warning", message: "IV tubing stock is below reorder point", createdAt: new Date().toISOString() },
        { type: "telemedicine.ready", severity: "info", message: "Two virtual visits are waiting for clinicians", createdAt: new Date().toISOString() }
      ] satisfies Alert[]);

  return (
    <main className="shell" dir={language === "ur" ? "rtl" : "ltr"} data-theme={themeMode} data-density={densityMode}>
      <aside className="sidebar" aria-label="Main navigation">
        <Logo />
        <nav>
          {(Object.keys(moduleIcons) as ModuleKey[]).map((item) => {
            const Icon = moduleIcons[item];
            const allowed = moduleAccess[item].includes(role);
            return (
              <button
                key={item}
                title={allowed ? t[item] : `${t[item]} locked for ${localizedRole[role]}`}
                className={activeModule === item ? "active" : ""}
                aria-current={activeModule === item ? "page" : undefined}
                disabled={!allowed}
                onClick={() => setActiveModule(item)}
              >
                <Icon aria-hidden />
                <span>{t[item]}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>
              {localizedRole[role]} {t.commandCenter}
            </p>
            <h1>{activeModule === "dashboard" ? headlineFor(role, language) : moduleHeadline(activeModule, language)}</h1>
          </div>
          <div className="actions">
            <button className="icon-button" title="Change language" onClick={() => setLanguage(language === "en" ? "ur" : "en")}>
              <Globe2 aria-hidden />
              {language === "en" ? "EN" : "اردو"}
            </button>
            <button className="icon-button" title={t.theme} onClick={() => setThemeMode(nextTheme(themeMode))}>
              {themeMode === "dark" ? <Moon aria-hidden /> : themeMode === "light" ? <Sun aria-hidden /> : <MonitorSmartphone aria-hidden />}
              {themeLabel(themeMode, language)}
            </button>
            <button className="icon-button" title={t.adaptive} onClick={() => setDensityMode(nextDensity(densityMode))}>
              <MonitorSmartphone aria-hidden />
              {densityLabel(densityMode, language)}
            </button>
            <div className="segments" role="tablist" aria-label="Dashboard role">
              {(Object.keys(roleLabels) as RoleView[]).map((item) => (
                <button key={item} className={role === item ? "selected" : ""} onClick={() => setRole(item)}>
                  {localizedRole[item]}
                </button>
              ))}
            </div>
            <button className="primary">
              <ShieldCheck aria-hidden /> {t.secureSession}
            </button>
          </div>
        </header>

        {renderModule({
          activeModule,
          role,
          language,
          patients,
          setPatients,
          alerts: seededAlerts
        })}
      </section>
    </main>
  );
}

function renderModule({
  activeModule,
  role,
  language,
  patients,
  setPatients,
  alerts
}: {
  activeModule: ModuleKey;
  role: RoleView;
  language: Language;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  alerts: Alert[];
}) {
  switch (activeModule) {
    case "patients":
      return <PatientsModule patients={patients} setPatients={setPatients} language={language} />;
    case "scheduling":
      return <SchedulingModule patients={patients} />;
    case "emr":
      return <EmrModule patients={patients} role={role} language={language} />;
    case "billing":
      return <BillingModule />;
    case "inventory":
      return <InventoryModule />;
    case "lab":
      return <LabModule patients={patients} />;
    case "telemedicine":
      return <TelemedicineModule />;
    case "security":
      return <SecurityModule language={language} />;
    default:
      return <DashboardModule role={role} alerts={alerts} language={language} />;
  }
}

function Logo() {
  return (
    <div className="brand" aria-label="Aster Health System">
      <div className="logo-mark">
        <span />
        <Stethoscope aria-hidden />
      </div>
      <div>
        <strong>Aster Health</strong>
        <small>Hospital Information System</small>
      </div>
    </div>
  );
}

function roleLabelsFor(language: Language): Record<RoleView, string> {
  const t = translations[language];
  return { admin: t.admin, patient: t.patient, employee: t.employee };
}

function headlineFor(role: RoleView, language: Language) {
  if (language === "ur") {
    if (role === "patient") return "آپ کی نگہداشت، ملاقاتیں، لیب رپورٹس اور بلنگ ایک محفوظ جگہ پر";
    if (role === "employee") return "روزانہ کلینیکل ورک فلو، کام، مریض اور ٹیم الرٹس";
    return "ہسپتال آپریشنز، پیش گوئی خطرات، عملہ، مالیات اور سپلائی کی مکمل نگرانی";
  }
  if (role === "patient") return "Your care, visits, labs, and billing in one secure view";
  if (role === "employee") return "Daily clinical workflow, tasks, patients, and team alerts";
  return "Hospital-wide operations, predictive risk, staff, finance, and supply visibility";
}

function moduleHeadline(module: ModuleKey, language: Language) {
  const headlines: Record<Language, Record<ModuleKey, string>> = {
    en: {
      dashboard: "Hospital operations dashboard",
      patients: "Patient registry, privacy controls, and care tracking",
      scheduling: "Real-time appointment scheduling and doctor availability",
      emr: "Encrypted clinical records, treatment plans, prescriptions, and labs",
      billing: "Invoices, insurance claims, payments, and financial reporting",
      inventory: "Medical supply tracking, reorder alerts, and procurement",
      lab: "Lab orders, results processing, and EMR updates",
      telemedicine: "Secure video visits, documents, and remote monitoring",
      security: "Authentication, RBAC, audit controls, and compliance posture"
    },
    ur: {
      dashboard: "ہسپتال آپریشنز ڈیش بورڈ",
      patients: "مریض رجسٹری، رازداری کنٹرولز، اور نگہداشت ٹریکنگ",
      scheduling: "ڈاکٹر دستیابی کے ساتھ فوری اپائنٹمنٹ شیڈولنگ",
      emr: "خفیہ طبی ریکارڈ، علاج منصوبے، نسخے اور لیب رپورٹس",
      billing: "انوائسز، انشورنس کلیمز، ادائیگیاں اور مالی رپورٹس",
      inventory: "طبی سپلائی ٹریکنگ، ری آرڈر الرٹس اور خریداری",
      lab: "لیب آرڈرز، نتائج، اور طبی ریکارڈ اپ ڈیٹس",
      telemedicine: "محفوظ ویڈیو وزٹس، دستاویزات اور ریموٹ مانیٹرنگ",
      security: "لاگ ان، RBAC، آڈٹ کنٹرولز اور کمپلائنس"
    }
  };
  return headlines[language][module];
}

function nextTheme(theme: ThemeMode): ThemeMode {
  if (theme === "system") return "light";
  if (theme === "light") return "dark";
  return "system";
}

function themeLabel(theme: ThemeMode, language: Language) {
  const labels = {
    en: { system: "System", light: "Light", dark: "Dark" },
    ur: { system: "سسٹم", light: "لائٹ", dark: "ڈارک" }
  };
  return labels[language][theme];
}

function nextDensity(density: DensityMode): DensityMode {
  if (density === "adaptive") return "comfortable";
  if (density === "comfortable") return "compact";
  return "adaptive";
}

function densityLabel(density: DensityMode, language: Language) {
  const labels = {
    en: { adaptive: "Adaptive", comfortable: "Comfort", compact: "Compact" },
    ur: { adaptive: "مطابقتی", comfortable: "آرام دہ", compact: "مختصر" }
  };
  return labels[language][density];
}

function DashboardModule({ role, alerts, language }: { role: RoleView; alerts: Alert[]; language: Language }) {
  const localizedRole = roleLabelsFor(language);
  const smartCopy =
    language === "ur"
      ? {
          ai: "اے آئی خطرہ، علاج تجاویز، اور آپریشنل تاخیر کی پیش گوئی کر رہا ہے۔",
          blockchain: "ہر نسخہ اور اہم طبی تبدیلی ایک ناقابل تبدیل ہیش کے ساتھ محفوظ ہے۔",
          voice: "آواز سے تلاش، نوٹس اور شیڈولنگ کے لئے hands-free موڈ تیار ہے۔"
        }
      : {
          ai: "AI is scoring risk, treatment fit, and operational delays in real time.",
          blockchain: "Prescriptions and critical EMR updates are anchored with immutable hashes.",
          voice: "Hands-free search, notes, and scheduling are ready for clinical workflows."
        };
  return (
    <>
      <section className="metrics" aria-label={`${localizedRole[role]} metrics`}>
        {metrics[role].map(([label, value, Icon, tone]) => (
          <Metric key={label} icon={<Icon />} label={label} value={value} tone={tone} />
        ))}
      </section>

      <section className="dashboard-grid">
        <section className="visual-panel" aria-label="3D hospital data visualization">
          <div className="panel-heading">
            <h2>3D Capacity And Risk</h2>
            <span>Live operational model</span>
          </div>
          <HospitalScene role={role} />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>{role === "admin" ? "Operations Trend" : role === "patient" ? "Vitals Trend" : "Workload Trend"}</h2>
            <span>Predictive analytics</span>
          </div>
          <div className="chart">
            <Line data={lineData(role)} options={chartOptions} />
          </div>
        </section>

        <RoleDashboard role={role} />

        <NotificationsPanel alerts={alerts} />
        <SmartFeaturesPanel language={language} smartCopy={smartCopy} />
        <EnterpriseReadinessPanel language={language} />
      </section>
    </>
  );
}

function PatientsModule({
  patients,
  setPatients,
  language
}: {
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  language: Language;
}) {
  const [query, setQuery] = React.useState("");
  const [draft, setDraft] = React.useState({ name: "", diagnosis: "", nextVisit: "" });
  const visible = patients.filter((patient) => `${patient.name} ${patient.mrn} ${patient.diagnosis}`.toLowerCase().includes(query.toLowerCase()));

  const addPatient = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    setPatients((items) => [
      ...items,
      {
        id: `p-${Date.now()}`,
        name: draft.name,
        mrn: `MRN-${1000 + items.length + 1}`,
        status: "Registered",
        diagnosis: draft.diagnosis || "Needs assessment",
        nextVisit: draft.nextVisit || "Pending"
      }
    ]);
    setDraft({ name: "", diagnosis: "", nextVisit: "" });
  };

  return (
    <section className="module-page">
      <section className="panel module-main">
        <div className="panel-heading">
          <h2>{language === "ur" ? "مریض مینجمنٹ" : "Patient Management"}</h2>
          <span>{language === "ur" ? "AES سے محفوظ PHI فیلڈز" : "AES-protected PHI fields"}</span>
        </div>
        <label className="search-box">
          <Search aria-hidden />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === "ur" ? "نام، MRN، یا تشخیص سے تلاش کریں" : "Search by name, MRN, or diagnosis"} />
        </label>
        <div className="data-table" role="table" aria-label="Patients">
          {visible.map((patient) => (
            <div className="table-row" role="row" key={patient.id}>
              <div>
                <strong>{patient.name}</strong>
                <span>{patient.mrn}</span>
              </div>
              <span>{patient.status}</span>
              <span>{patient.diagnosis}</span>
              <span>{patient.nextVisit}</span>
              <button className="icon-only" title={`Remove ${patient.name}`} onClick={() => setPatients((items) => items.filter((item) => item.id !== patient.id))}>
                <Trash2 aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>{language === "ur" ? "مریض شامل کریں" : "Add Patient"}</h2>
          <span>{language === "ur" ? "HIPAA ورک فلو" : "HIPAA workflow"}</span>
        </div>
        <form className="stack-form" onSubmit={addPatient}>
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder={language === "ur" ? "پورا نام" : "Full name"} />
          <input value={draft.diagnosis} onChange={(event) => setDraft({ ...draft, diagnosis: event.target.value })} placeholder={language === "ur" ? "تشخیص یا وجہ" : "Diagnosis or reason"} />
          <input value={draft.nextVisit} onChange={(event) => setDraft({ ...draft, nextVisit: event.target.value })} placeholder={language === "ur" ? "اگلی ملاقات" : "Next appointment"} />
          <button className="primary" type="submit">
            <Plus aria-hidden /> {language === "ur" ? "رجسٹر کریں" : "Register"}
          </button>
        </form>
      </section>
    </section>
  );
}

function SchedulingModule({ patients }: { patients: Patient[] }) {
  const [selectedSlot, setSelectedSlot] = React.useState("10:30");
  const slots = ["08:00", "09:15", "10:30", "13:00", "14:45", "16:30"];

  return (
    <section className="module-page">
      <section className="panel module-main">
        <div className="panel-heading">
          <h2>Doctor Availability</h2>
          <span>Live confirmation</span>
        </div>
        <div className="slot-grid">
          {slots.map((slot) => (
            <button key={slot} className={selectedSlot === slot ? "slot selected-slot" : "slot"} onClick={() => setSelectedSlot(slot)}>
              <CalendarClock aria-hidden />
              {slot}
            </button>
          ))}
        </div>
        <div className="confirmation">
          <CheckCircle2 aria-hidden />
          Appointment selected for {patients[0]?.name ?? "patient"} at {selectedSlot} with Dr. Shah.
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Upcoming</h2>
          <span>Automated reminders</span>
        </div>
        {patients.map((patient) => (
          <div className="row" key={patient.id}>
            <span>{patient.name}</span>
            <strong>{patient.nextVisit}</strong>
          </div>
        ))}
      </section>
    </section>
  );
}

function EmrModule({ patients, role, language }: { patients: Patient[]; role: RoleView; language: Language }) {
  return (
    <section className="module-page">
      <section className="panel module-main">
        <div className="panel-heading">
          <h2>{language === "ur" ? "کلینیکل ٹائم لائن" : "Clinical Timeline"}</h2>
          <span>{role === "patient" ? (language === "ur" ? "صرف پڑھنے کی مریض رسائی" : "Read-only patient access") : language === "ur" ? "کلینشن اپ ڈیٹ رسائی" : "Clinician update access"}</span>
        </div>
        {patients.map((patient) => (
          <article className="timeline-item" key={patient.id}>
            <strong>{patient.name}</strong>
            <p>{patient.diagnosis}</p>
            <span>Prescription: carvedilol 6.25 mg, lab panel linked, treatment plan active</span>
          </article>
        ))}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Decision Support</h2>
          <span>ML assisted</span>
        </div>
        {["Readmission risk: 0.31", "Medication interaction scan: clear", "Treatment effectiveness: improving"].map((item) => (
          <div className="row" key={item}>
            <span>{item}</span>
            <strong>Reviewed</strong>
          </div>
        ))}
      </section>
    </section>
  );
}

function BillingModule() {
  return (
    <section className="module-page">
      <section className="panel module-main">
        <div className="panel-heading">
          <h2>Invoices And Claims</h2>
          <span>Payment tracking</span>
        </div>
        {[
          ["INV-2041", "Amina Reyes", "$420", "Submitted"],
          ["INV-2042", "Bilal Khan", "$180", "Patient due"],
          ["INV-2043", "Maya Chen", "$1,240", "Paid"]
        ].map(([invoice, patient, amount, status]) => (
          <div className="table-row" key={invoice}>
            <strong>{invoice}</strong>
            <span>{patient}</span>
            <span>{amount}</span>
            <span>{status}</span>
            <button className="secondary">Submit claim</button>
          </div>
        ))}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Revenue</h2>
          <span>Last 6 days</span>
        </div>
        <div className="chart">
          <Bar data={billingData} options={chartOptions} />
        </div>
      </section>
    </section>
  );
}

function InventoryModule() {
  return (
    <section className="module-page">
      <section className="panel module-main">
        <div className="panel-heading">
          <h2>Supply Chain</h2>
          <span>Low-stock automation</span>
        </div>
        {[
          ["IV tubing", "18", "25", "Create PO"],
          ["N95 masks", "420", "200", "OK"],
          ["Syringes", "72", "100", "Create PO"],
          ["Saline bags", "310", "150", "OK"]
        ].map(([item, onHand, reorder, action]) => (
          <div className="table-row" key={item}>
            <strong>{item}</strong>
            <span>{onHand} on hand</span>
            <span>Reorder at {reorder}</span>
            <span className={action === "OK" ? "good" : "warn"}>{action}</span>
          </div>
        ))}
      </section>
      <NotificationsPanel
        alerts={[
          { type: "inventory.low_stock", severity: "warning", message: "IV tubing purchase order queued", createdAt: "now" },
          { type: "supplier.sync", severity: "info", message: "Supplier catalog refreshed", createdAt: "now" }
        ]}
      />
    </section>
  );
}

function LabModule({ patients }: { patients: Patient[] }) {
  return (
    <section className="module-page">
      <section className="panel module-main">
        <div className="panel-heading">
          <h2>Lab Orders</h2>
          <span>Integrated with EMR</span>
        </div>
        {patients.map((patient, index) => (
          <div className="table-row" key={patient.id}>
            <strong>{patient.name}</strong>
            <span>{index === 0 ? "CBC" : index === 1 ? "A1C" : "CMP"}</span>
            <span>{index === 0 ? "Abnormal" : "Resulted"}</span>
            <button className="secondary">Post to EMR</button>
          </div>
        ))}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Result Queue</h2>
          <span>Real-time updates</span>
        </div>
        {["12 pending results", "4 critical values", "8 reports signed"].map((item) => (
          <div className="row" key={item}>
            <span>{item}</span>
            <strong>Live</strong>
          </div>
        ))}
      </section>
    </section>
  );
}

function TelemedicineModule() {
  return (
    <section className="module-page">
      <section className="panel module-main">
        <div className="panel-heading">
          <h2>Virtual Care Room</h2>
          <span>Secure document sharing</span>
        </div>
        <div className="video-room">
          <Video aria-hidden />
          <strong>Dr. Shah and Amina Reyes</strong>
          <span>Encrypted session ready, prescriptions and lab packet attached.</span>
          <button className="primary">
            <Video aria-hidden /> Join consult
          </button>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Remote Monitoring</h2>
          <span>Live vitals</span>
        </div>
        <div className="chart">
          <Line data={lineData("patient")} options={chartOptions} />
        </div>
      </section>
    </section>
  );
}

function SecurityModule({ language }: { language: Language }) {
  return (
    <section className="module-page">
      <section className="panel module-main">
        <div className="panel-heading">
          <h2>{language === "ur" ? "RBAC میٹرکس" : "RBAC Matrix"}</h2>
          <span>OAuth2, JWT, AES</span>
        </div>
        {[
          ["Admin", "Full system access", "MFA required"],
          ["Doctor", "EMR, lab, scheduling", "Break-glass audited"],
          ["Nurse", "Care tasks and patient view", "Least privilege"],
          ["Patient", "Own records only", "Consent managed"]
        ].map(([role, access, control]) => (
          <div className="table-row" key={role}>
            <strong>{role}</strong>
            <span>{access}</span>
            <span>{control}</span>
            <span className="good">Compliant</span>
          </div>
        ))}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>{language === "ur" ? "آڈٹ اسٹریم" : "Audit Stream"}</h2>
          <span>{language === "ur" ? "ناقابل تبدیل ٹریل" : "Immutable trail"}</span>
        </div>
        {["JWT rotation verified", "PHI export blocked", "Consent record updated"].map((item) => (
          <div className="row" key={item}>
            <span>{item}</span>
            <strong>Logged</strong>
          </div>
        ))}
      </section>
      <SmartFeaturesPanel
        language={language}
        smartCopy={
          language === "ur"
            ? {
                ai: "اے آئی مشکوک رسائی، خطرات، اور علاج کے رجحانات پر مسلسل نظر رکھتا ہے۔",
                blockchain: "مریض ریکارڈ اور نسخوں کے ہیش بلاک چین لیجر میں محفوظ ہوتے ہیں۔",
                voice: "ڈاکٹر آواز سے ریکارڈ کھول سکتے ہیں، نوٹ لکھ سکتے ہیں، اور الرٹس دیکھ سکتے ہیں۔"
              }
            : {
                ai: "AI continuously watches suspicious access, clinical risk, and treatment trends.",
                blockchain: "Patient record and prescription hashes are anchored to a blockchain ledger.",
                voice: "Clinicians can open records, dictate notes, and review alerts by voice."
              }
        }
      />
    </section>
  );
}

function SmartFeaturesPanel({ language, smartCopy }: { language: Language; smartCopy: { ai: string; blockchain: string; voice: string } }) {
  return (
    <section className="panel smart-panel">
      <div className="panel-heading">
        <h2>{translations[language].smartCare}</h2>
        <span>AI + Blockchain + Voice</span>
      </div>
      <div className="smart-grid">
        <article>
          <BrainCircuit aria-hidden />
          <strong>{translations[language].ai}</strong>
          <p>{smartCopy.ai}</p>
        </article>
        <article>
          <Link2 aria-hidden />
          <strong>{translations[language].blockchain}</strong>
          <p>{smartCopy.blockchain}</p>
          <code>0x9f2...a71</code>
        </article>
        <VoiceAssistant language={language} text={smartCopy.voice} />
      </div>
    </section>
  );
}

function VoiceAssistant({ language, text }: { language: Language; text: string }) {
  const [listening, setListening] = React.useState(false);
  const supported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  return (
    <article>
      <Mic aria-hidden />
      <strong>{translations[language].voice}</strong>
      <p>{text}</p>
      <button className={listening ? "primary pulse" : "secondary"} type="button" onClick={() => setListening((value) => !value)}>
        <Mic aria-hidden />
        {listening ? (language === "ur" ? "سن رہا ہے" : "Listening") : language === "ur" ? "آواز شروع کریں" : "Start voice"}
      </button>
      <small>{supported ? (language === "ur" ? "براؤزر وائس API دستیاب ہے" : "Browser voice API available") : language === "ur" ? "ڈیمو موڈ" : "Demo mode"}</small>
    </article>
  );
}

function EnterpriseReadinessPanel({ language }: { language: Language }) {
  const items =
    language === "ur"
      ? [
          ["OPD/IPD + Bed Board", "بیڈ ٹریکنگ، داخلہ، ڈسچارج اور وارڈ کپیسٹی"],
          ["FHIR/HL7", "انٹرآپریبل مریض ڈیٹا ایکسچینج"],
          ["Collaboration", "محفوظ چیٹ، راؤنڈ رومز اور مشترکہ بورڈز"],
          ["Offline First", "کمزور کنکشن میں محفوظ sync queue"],
          ["Kubernetes", "رولنگ اپ ڈیٹس، HPA اور readiness probes"],
          ["Accessibility", "RTL، ڈارک موڈ، adaptive density اور screen-reader labels"]
        ]
      : [
          ["OPD/IPD + Bed Board", "Admissions, discharge, bed tracking, and ward capacity"],
          ["FHIR/HL7", "Interoperable clinical data exchange boundary"],
          ["Collaboration", "Secure chat, rounding rooms, and shared boards"],
          ["Offline First", "Safe sync queue for weak connectivity environments"],
          ["Kubernetes", "Rolling updates, HPA, and readiness probes"],
          ["Accessibility", "RTL, dark mode, adaptive density, and screen-reader labels"]
        ];

  return (
    <section className="panel smart-panel">
      <div className="panel-heading">
        <h2>{language === "ur" ? "انٹرپرائز تیاری" : "Enterprise Readiness"}</h2>
        <span>{language === "ur" ? "کلینیکل تعیناتی" : "Clinical deployment"}</span>
      </div>
      <div className="readiness-grid">
        {items.map(([title, text], index) => {
          const Icon = [Activity, Link2, Users, MonitorSmartphone, Bot, ShieldCheck][index];
          return (
            <article key={title}>
              <Icon aria-hidden />
              <strong>{title}</strong>
              <p>{text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <article className={`metric ${tone}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function RoleDashboard({ role }: { role: RoleView }) {
  if (role === "patient") return <PatientDashboard />;
  if (role === "employee") return <EmployeeDashboard />;
  return <AdminDashboard />;
}

function AdminDashboard() {
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <h2>Service Lines</h2>
          <span>Patient distribution</span>
        </div>
        <div className="chart">
          <Doughnut data={serviceLineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }} />
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>System Health</h2>
          <span>Secure infrastructure</span>
        </div>
        {["API latency 84 ms", "PostgreSQL replica healthy", "Redis cache hit rate 91%", "Audit trail immutable"].map((item) => (
          <div className="row" key={item}>
            <span>{item}</span>
            <strong>OK</strong>
          </div>
        ))}
      </section>
    </>
  );
}

function PatientDashboard() {
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <h2>Care Plan</h2>
          <span>Treatment status</span>
        </div>
        {["Cardiology follow-up", "Medication reminder", "Lab review", "Telemedicine consult"].map((item, index) => (
          <div className="row" key={item}>
            <span>{item}</span>
            <strong>{index === 0 ? "Today" : "Open"}</strong>
          </div>
        ))}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Billing And Insurance</h2>
          <span>Claim status</span>
        </div>
        <div className="billing-status">
          <CreditCard aria-hidden />
          <div>
            <strong>$180 due</strong>
            <p>Insurance claim AC-2041 is under review.</p>
          </div>
        </div>
      </section>
    </>
  );
}

function EmployeeDashboard() {
  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <h2>Task Board</h2>
          <span>Team collaboration</span>
        </div>
        {["Review abnormal CBC", "Discharge education", "Medication reconciliation", "Room 310 handoff"].map((item, index) => (
          <div className="row" key={item}>
            <span>{item}</span>
            <strong>{index === 0 ? "Urgent" : "Queued"}</strong>
          </div>
        ))}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Appointments</h2>
          <span>Live schedule</span>
        </div>
        <div className="chart">
          <Bar data={appointmentData} options={chartOptions} />
        </div>
      </section>
    </>
  );
}

function NotificationsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <section className="panel alerts-panel">
      <div className="panel-heading">
        <h2>Real-time Notifications</h2>
        <span>WebSocket stream</span>
      </div>
      {alerts.map((alert) => (
        <div className={`alert ${alert.severity}`} key={`${alert.type}-${alert.createdAt}`}>
          <span>{alert.type}</span>
          <p>{alert.message}</p>
        </div>
      ))}
    </section>
  );
}

function HospitalScene({ role }: { role: RoleView }) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8fbfc");
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(5, 6, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.dataset.testid = "hospital-3d-canvas";
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight("#ffffff", 1.8));
    const light = new THREE.DirectionalLight("#ffffff", 2.2);
    light.position.set(4, 7, 6);
    scene.add(light);

    const base = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.18, 5.2), new THREE.MeshStandardMaterial({ color: "#d9e5e8" }));
    base.position.y = -0.1;
    scene.add(base);

    const palette = role === "admin" ? ["#16805f", "#2764a8", "#b42318"] : role === "patient" ? ["#2764a8", "#5bbf95", "#d69b20"] : ["#5bbf95", "#2764a8", "#d69b20"];
    const blocks: THREE.Mesh[] = [];

    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        const height = 0.6 + ((row + col) % 4) * 0.42 + (role === "admin" ? 0.25 : 0);
        const material = new THREE.MeshStandardMaterial({ color: palette[(row + col) % palette.length], roughness: 0.55 });
        const block = new THREE.Mesh(new THREE.BoxGeometry(0.82, height, 0.82), material);
        block.position.set(col * 1.25 - 2.5, height / 2, row * 1.25 - 1.25);
        scene.add(block);
        blocks.push(block);
      }
    }

    const grid = new THREE.GridHelper(8, 8, "#9fb0b7", "#dce6ea");
    grid.position.y = 0.02;
    scene.add(grid);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      blocks.forEach((block, index) => {
        block.scale.y = 1 + Math.sin(Date.now() * 0.001 + index) * 0.035;
      });
      scene.rotation.y += 0.0025;
      renderer.render(scene, camera);
    };

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("resize", resize);
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [role]);

  return <div className="three-scene" ref={mountRef} />;
}

function lineData(role: RoleView) {
  const values = role === "admin" ? [72, 75, 79, 83, 86, 91] : role === "patient" ? [98, 97, 99, 101, 100, 98] : [32, 38, 35, 41, 39, 44];
  return {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        data: values,
        borderColor: "#126b57",
        backgroundColor: "rgba(18, 107, 87, 0.14)",
        fill: true,
        tension: 0.38,
        pointRadius: 3
      }
    ]
  };
}

const serviceLineData = {
  labels: ["Emergency", "Cardiology", "Surgery", "Pediatrics"],
  datasets: [{ data: [32, 22, 18, 28], backgroundColor: ["#b42318", "#2764a8", "#16805f", "#d69b20"], borderWidth: 0 }]
};

const appointmentData = {
  labels: ["8a", "10a", "12p", "2p", "4p"],
  datasets: [{ data: [6, 12, 8, 14, 9], backgroundColor: "#2764a8", borderRadius: 6 }]
};

const billingData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  datasets: [{ data: [42, 55, 51, 63, 69, 74], backgroundColor: "#126b57", borderRadius: 6 }]
};

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
