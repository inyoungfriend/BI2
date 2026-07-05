const firstNames = [
  "Juan",
  "Cristian",
  "Nicolas",
  "Yohanes",
  "Alizee",
  "Sara",
  "Hassan",
  "Aimee",
  "Rosani",
  "Temulen",
];

const lastNames = [
  "Ramirez",
  "CABASCANGO",
  "Almanza",
  "JONATAHIR",
  "Martina",
  "Silva",
  "DAKKOUR",
  "Parker",
  "Gurung",
  "Gansukh",
];

const coursePool = [
  "General English A1",
  "General English A2",
  "General English B1",
  "Academic English",
  "PTE Foundation",
];

export const studentsRows = Array.from({ length: 50 }, (_, index) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[(index + 2) % lastNames.length];
  const course = coursePool[index % coursePool.length];
  const isEnrolled = index % 4 !== 0;
  const day = String((index % 28) + 1).padStart(2, "0");
  const month = String(((index + 4) % 6) + 1).padStart(2, "0");
  const year = "2026";
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}${index + 1}@example.com`;

  return {
    student: `${firstName} ${lastName}`,
    email,
    location: index % 3 === 0 ? "Onshore" : "Offshore",
    courses: course,
    status: isEnrolled ? "Enrolled" : "Not Enrolled",
    joined: `${day}/${month}/${year}`,
    action: isEnrolled ? "Deactivate" : "Portal",
  };
});

const enrolledCount = studentsRows.filter((row) => row.status === "Enrolled").length;
const notEnrolledCount = studentsRows.length - enrolledCount;

export const studentsStats = [
  { label: "Total Students", value: studentsRows.length, tone: "neutral" },
  { label: "Enrolled", value: enrolledCount, tone: "info" },
  { label: "Not Enrolled", value: notEnrolledCount, tone: "warning" },
];

export const applicationsStats = [
  { label: "Draft", value: 0, tone: "neutral" },
  { label: "Submitted", value: 8, tone: "info" },
  { label: "Under Review", value: 18, tone: "warning" },
  { label: "Offer Issued", value: 57, tone: "success" },
  { label: "Accepted", value: 6, tone: "success" },
  { label: "Enrolled", value: 27, tone: "info" },
  { label: "Rejected", value: 0, tone: "danger" },
  { label: "Withdrawn", value: 0, tone: "danger" },
];

export const applicationsRows = [
  {
    appNo: "BST-2607-00134",
    applicant: "Odalis Andreina Zambrano Alvar",
    course: "General English",
    type: "COE",
    category: "Flexi Course",
    status: "Under Review",
    submitted: "03 Jul 2026",
    action: "Resume",
  },
  {
    appNo: "BST-2607-00133",
    applicant: "Temulen Gansukh",
    course: "General English",
    type: "COE",
    category: "Flexi Course",
    status: "Under Review",
    submitted: "03 Jul 2026",
    action: "Resume",
  },
  {
    appNo: "BST-2607-00131",
    applicant: "Rosani Gurung",
    course: "General English",
    type: "COE",
    category: "Flexi Course",
    status: "Offer Issued",
    submitted: "03 Jul 2026",
    action: "Resume",
  },
  {
    appNo: "BST-2607-00129",
    applicant: "Aimee Parker",
    course: "Academic English",
    type: "COE",
    category: "Academic",
    status: "Submitted",
    submitted: "02 Jul 2026",
    action: "Resume",
  },
];

export const financeStats = [
  { label: "Total Revenue", value: "$36,824", tone: "info" },
  { label: "Outstanding", value: "$587,945", tone: "warning" },
  { label: "Overdue", value: "54", tone: "danger" },
  { label: "Active Plans", value: "4", tone: "success" },
  { label: "Billing Queue", value: "1", tone: "neutral" },
];

const financeCoursePool = [
  "General English",
  "English for Academic Purposes",
  "PTE Examination Preparation",
  "General English Intensive",
];

const financeStatusPool = ["Invoiced", "Partially Paid", "Awaiting Setup"];

export const financeRows = Array.from({ length: 56 }, (_, index) => {
  const firstName = firstNames[index % firstNames.length];
  const lastName = lastNames[(index + 4) % lastNames.length];
  const billingStatus = financeStatusPool[index % financeStatusPool.length];
  const day = String((index % 28) + 1).padStart(2, "0");
  const month = String(((index + 2) % 7) + 1).padStart(2, "0");
  return {
    student: `${firstName} ${lastName}`,
    course: financeCoursePool[index % financeCoursePool.length],
    mode: "Manual",
    signed: `${day}/${month}/2026`,
    billingStatus,
    action: billingStatus === "Awaiting Setup" ? "Setup Billing" : "View / Add",
  };
});

export const flowReview = {
  students: [
    {
      issue: "Row actions are too icon-dependent.",
      rationale:
        "Add clear action labels for non-tech-fluent users and improve keyboard-only accessibility.",
    },
    {
      issue: "Risk and compliance signals are scattered.",
      rationale:
        "Surface missing docs/on-hold/withdrawn flags in a sticky summary row for faster triage.",
    },
    {
      issue: "Student-detail popover mixes duplicated menus and too many one-level actions.",
      rationale:
        "Replace icon-heavy dense menus with grouped actions, role-priority tabs, and progressive disclosure for mobile usability.",
    },
  ],
  applications: [
    {
      issue: "Many statuses appear as equal priority.",
      rationale:
        "Use stronger visual hierarchy and grouped tabs so urgent items stand out first.",
    },
    {
      issue: "Category filters are broad.",
      rationale:
        "Add combined filters (course + status + submission date) for realistic operational workloads.",
    },
  ],
  finance: [
    {
      issue: "Overdue propagation is not explicit enough.",
      rationale:
        "Show direct links from overdue status to student profile and LMS lock status with reason.",
    },
    {
      issue: "Payment-plan vs lump-sum differences are hidden in table rows.",
      rationale:
        "Promote payment model and next due date to a KPI-level panel to reduce billing delays.",
    },
  ],
};

export const studentHubDetail = {
  id: "STU-2607-0001",
  name: "Juan Camilo Ramirez XXXXXX",
  email: "juanramirez97XXXX@gmail.com",
  phone: "045263XXXX",
  portalStatus: "Portal Active",
  metrics: [
    { label: "Applications", value: 0 },
    { label: "Enrolments", value: 15 },
    { label: "Units Complete", value: "0/0" },
    { label: "Outstanding", value: "$0.00" },
  ],
  navSections: [
    "Overview",
    "Profile",
    "Enrolments",
    "Attendance",
    "Assessments",
    "Applications",
    "Finance",
    "Docs & Certs",
    "Visa / PRISMS",
  ],
  groupedActions: [
    {
      title: "High Priority",
      actions: ["Attendance", "Finance", "Documents", "Interview Notes"],
    },
    {
      title: "Academic",
      actions: ["Results", "Course", "Training Plan", "Assessments"],
    },
    {
      title: "Support",
      actions: ["Email", "Upload", "Diary", "Sanction"],
    },
  ],
};
