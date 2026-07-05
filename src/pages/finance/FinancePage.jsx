import React, { useMemo, useState } from "react";
import DataTable from "../../shared/ui/DataTable";
import StatCard from "../../shared/ui/StatCard";
import TableFieldSearch from "../../shared/ui/TableFieldSearch";
import { financeRows, financeStats } from "../../shared/data/mockData";

const financeTabs = [
  "Students",
  "Billing Queue",
  "Invoices",
  "Overdue",
  "Payments",
  "Payment Plans",
  "Fee Schedules",
  "Withdrawals",
  "Agent Commissions",
  "Funding Summary",
  "Meshed Sync",
];

const columns = [
  { key: "student", header: "Student" },
  { key: "course", header: "Course" },
  { key: "mode", header: "Payment Mode", kind: "status" },
  { key: "signed", header: "Signed" },
  { key: "billingStatus", header: "Billing Status", kind: "status" },
  { key: "action", header: "Actions" },
];

const studentOverviewColumns = [
  { key: "student", header: "Student / Applicant" },
  { key: "course", header: "Course" },
  { key: "invoices", header: "Invoices" },
  { key: "invoiced", header: "Total Invoiced" },
  { key: "paid", header: "Total Paid" },
  { key: "outstanding", header: "Outstanding" },
  { key: "commission", header: "Commission" },
  { key: "statusLabel", header: "Status" },
  { key: "lastInvoice", header: "Last Invoice" },
];

const overdueRows = [
  { student: "Joana Antonieta Imaculada Correia", agency: "No agent", course: "PTE Examination Preparation", invoiceNo: "INV-2026-LJ0DV-TUT-01", due: "15/05/2026", status: "51d overdue", outstanding: "$590" },
  { student: "Anchisa Weerapatsirikul", agency: "No agent", course: "General English", invoiceNo: "INV-2026-VWWK2-TUI-01", due: "18/05/2026", status: "48d overdue", outstanding: "$2,400" },
  { student: "Anchisa Weerapatsirikul", agency: "No agent", course: "General English", invoiceNo: "INV-2026-V9BWJ-TUI-01", due: "18/05/2026", status: "48d overdue", outstanding: "$2,400" },
];

function FinancePage() {
  const [columnSearchField, setColumnSearchField] = useState("student");
  const [columnSearchInput, setColumnSearchInput] = useState("");
  const [appliedColumnSearch, setAppliedColumnSearch] = useState({
    field: "student",
    keyword: "",
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("Billing Queue");
  const [activeBillingRow, setActiveBillingRow] = useState(null);
  const [paymentRows, setPaymentRows] = useState([]);
  const [studentTabKeyword, setStudentTabKeyword] = useState("");
  const [studentRowsPerPage, setStudentRowsPerPage] = useState(10);
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const awaitingSetupCount = useMemo(
    () => financeRows.filter((row) => row.billingStatus === "Awaiting Setup").length,
    []
  );
  const partiallyPaidCount = useMemo(
    () => financeRows.filter((row) => row.billingStatus === "Partially Paid").length,
    []
  );

  const filteredRows = useMemo(() => {
    const keyword = appliedColumnSearch.keyword.trim().toLowerCase();

    return financeRows.filter((row) => {
      const targetValue = String(row[appliedColumnSearch.field] ?? "").toLowerCase();
      const matchesKeyword = keyword.length === 0 || targetValue.includes(keyword);

      const billingStatus = row.billingStatus.toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "invoiced" && billingStatus === "invoiced") ||
        (statusFilter === "partial" && billingStatus === "partially paid") ||
        (statusFilter === "awaiting" && billingStatus === "awaiting setup");

      return matchesKeyword && matchesStatus;
    });
  }, [appliedColumnSearch.field, appliedColumnSearch.keyword, statusFilter]);

  const tableRows = useMemo(
    () =>
      filteredRows.map((row) => ({
        ...row,
        action: (
          <button
            type="button"
            className="finance-row-action"
            onClick={(event) => {
              event.stopPropagation();
              setActiveBillingRow(row);
              setPaymentRows([{ id: crypto.randomUUID(), description: "", dueDate: "2026-07-05", amount: "" }]);
            }}
          >
            {row.action}
          </button>
        ),
      })),
    [filteredRows]
  );

  const closeBillingModal = () => {
    setActiveBillingRow(null);
    setPaymentRows([]);
  };

  const totalAmount = paymentRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const studentOverviewRows = useMemo(
    () =>
      financeRows.map((row, index) => {
        const email = `${row.student.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")}${index + 1}@gmail.com`;
        const invoiceCount = (index % 7) + 3;
        const invoicedAmount = 9500 + (index % 13) * 825;
        const paidAmount = index % 4 === 0 ? 0 : Math.floor(invoicedAmount * (index % 3 === 0 ? 0.35 : 0.6));
        const outstandingAmount = Math.max(0, invoicedAmount - paidAmount);
        const day = String((index % 28) + 1).padStart(2, "0");
        const month = String(((index + 5) % 12) + 1).padStart(2, "0");
        return {
          student: (
            <>
              <strong>{row.student}</strong>
              <small>{email}</small>
              <small>Applicant</small>
            </>
          ),
          course: row.course,
          invoices: invoiceCount,
          invoiced: `$${invoicedAmount.toLocaleString()}`,
          paid: <span className="is-success-text">${paidAmount.toLocaleString()}</span>,
          outstanding: <span className="is-danger-text">${outstandingAmount.toLocaleString()}</span>,
          commission: "-",
          statusLabel: <span className="status-badge status-neutral">{invoiceCount} draft</span>,
          lastInvoice: `${day}/${month}/2026`,
          _searchText: `${row.student} ${email} ${row.course}`.toLowerCase(),
        };
      }),
    []
  );

  const filteredStudentOverviewRows = useMemo(() => {
    const keyword = studentTabKeyword.trim().toLowerCase();
    if (!keyword) {
      return studentOverviewRows;
    }
    return studentOverviewRows.filter((row) => row._searchText.includes(keyword));
  }, [studentOverviewRows, studentTabKeyword]);

  const totalStudentPages = Math.max(1, Math.ceil(filteredStudentOverviewRows.length / studentRowsPerPage));
  const safeStudentPage = Math.min(studentCurrentPage, totalStudentPages);
  const pagedStudentOverviewRows = useMemo(() => {
    const start = (safeStudentPage - 1) * studentRowsPerPage;
    return filteredStudentOverviewRows.slice(start, start + studentRowsPerPage);
  }, [filteredStudentOverviewRows, safeStudentPage, studentRowsPerPage]);

  const renderBillingQueuePanel = () => (
    <DataTable
      columns={columns}
      rows={tableRows}
      topRightControl={
        <div className="table-controls-combined">
          <TableFieldSearch
            fieldOptions={[
              { value: "student", label: "Student" },
              { value: "course", label: "Course" },
            ]}
            selectedField={columnSearchField}
            onFieldChange={(nextField) => {
              setColumnSearchField(nextField);
              setColumnSearchInput("");
              setAppliedColumnSearch({
                field: nextField,
                keyword: "",
              });
            }}
            inputValue={columnSearchInput}
            onInputChange={setColumnSearchInput}
            onApply={() =>
              setAppliedColumnSearch({
                field: columnSearchField,
                keyword: columnSearchInput,
              })
            }
            onReset={() => {
              setColumnSearchInput("");
              setAppliedColumnSearch((prev) => ({
                field: prev.field,
                keyword: "",
              }));
            }}
            fieldSelectId="finance-column-search-select"
            inputId="finance-column-search-input"
          />

          <div className="rows-per-page-control">
            <label htmlFor="finance-status-filter">Status</label>
            <select
              id="finance-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="invoiced">Invoiced</option>
              <option value="partial">Partially Paid</option>
              <option value="awaiting">Awaiting Setup</option>
            </select>
          </div>
        </div>
      }
    />
  );

  const renderStudentsPanel = () => (
    <section className="finance-panel">
      <div className="finance-panel-head">
        <div>
          <h3>Student Finance Overview</h3>
          <p>All students and applicants with invoices. Click a row to view full invoice and payment details.</p>
        </div>
        <div className="finance-inline-controls">
          <input
            type="text"
            placeholder="Search name, email or course..."
            value={studentTabKeyword}
            onChange={(event) => {
              setStudentTabKeyword(event.target.value);
              setStudentCurrentPage(1);
            }}
          />
          <select defaultValue="balance" aria-label="Sort student finance rows">
            <option value="balance">Balance</option>
            <option value="recent">Recent Invoice</option>
          </select>
        </div>
      </div>
      <DataTable
        columns={studentOverviewColumns}
        rows={pagedStudentOverviewRows}
        topRightControl={
          <div className="table-controls-combined">
            <div className="rows-per-page-control">
              <label htmlFor="finance-student-rows-select">Rows</label>
              <select
                id="finance-student-rows-select"
                value={studentRowsPerPage}
                onChange={(event) => {
                  setStudentRowsPerPage(Number(event.target.value));
                  setStudentCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={40}>40</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        }
        bottomContent={
          <div className="table-pagination">
            <button
              type="button"
              className="pagination-button"
              onClick={() => setStudentCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeStudentPage === 1}
            >
              Prev
            </button>
            {Array.from({ length: totalStudentPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={`pagination-button${page === safeStudentPage ? " is-active" : ""}`}
                onClick={() => setStudentCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="pagination-button"
              onClick={() => setStudentCurrentPage((prev) => Math.min(totalStudentPages, prev + 1))}
              disabled={safeStudentPage === totalStudentPages}
            >
              Next
            </button>
          </div>
        }
      />
    </section>
  );

  const renderInvoicesPanel = () => (
    <section className="finance-panel">
      <div className="finance-panel-head">
        <h3>Invoices</h3>
        <div className="finance-actions">
          <button type="button" className="tab-action-ghost">49 Unlinked Invoices</button>
          <button type="button" className="tab-action-primary">+ Create Invoice</button>
        </div>
      </div>
      <div className="finance-inline-controls">
        <input type="text" placeholder="Search student, email or course..." />
        <select defaultValue="all">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
        </select>
      </div>
      <div className="finance-list">
        {studentOverviewRows.map((row) => (
          <article key={`invoice-${row.student}`} className="finance-list-item">
            <div>
              <strong>{row.student}</strong>
              <small>{row.email}</small>
              <small>{row.course}</small>
            </div>
            <p>
              Invoices
              <strong>{row.invoices}</strong>
            </p>
            <p>
              Total
              <strong>{row.invoiced}</strong>
            </p>
            <p>
              Outstanding
              <strong className="is-danger-text">{row.outstanding}</strong>
            </p>
          </article>
        ))}
      </div>
    </section>
  );

  const renderOverduePanel = () => (
    <section className="finance-panel">
      <div className="finance-summary-grid">
        <article className="stat-card stat-danger">
          <p>Total Overdue</p>
          <strong>$81,510.00</strong>
          <small>54 invoices - oldest 51d</small>
        </article>
        <article className="stat-card">
          <p>Due This Week</p>
          <strong>$16,135.00</strong>
          <small>12 invoices</small>
        </article>
        <article className="stat-card">
          <p>Due This Month</p>
          <strong>$50,340.00</strong>
          <small>28 invoices</small>
        </article>
        <article className="stat-card stat-success">
          <p>Collected This Month</p>
          <strong>$1,230.00</strong>
          <small>Across all payment methods</small>
        </article>
      </div>

      <article className="finance-subpanel">
        <h4>Overdue Ageing</h4>
        <div className="ageing-grid">
          <div><p>0-7 days</p><strong>$16,135.00</strong></div>
          <div><p>8-30 days</p><strong>$31,550.00</strong></div>
          <div><p>31-60 days</p><strong>$33,825.00</strong></div>
          <div><p>60+ days</p><strong>$0.00</strong></div>
        </div>
      </article>

      <article className="finance-subpanel">
        <div className="finance-panel-head">
          <div>
            <h4>Overdue & Upcoming Invoices</h4>
            <p>All unpaid invoices that are overdue plus anything due within the next 14 days.</p>
          </div>
          <div className="finance-actions">
            <select defaultValue="past"><option value="past">Any past due (54)</option></select>
            <button type="button" className="tab-action-ghost">Export CSV</button>
            <button type="button" className="tab-action-ghost">Audit Log</button>
            <button type="button" className="tab-action-primary">Send Reminders (0)</button>
          </div>
        </div>
        <div className="finance-plain-table-wrap">
          <table className="finance-plain-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Agency CC</th>
                <th>Course</th>
                <th>Invoice #</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Outstanding</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {overdueRows.map((row) => (
                <tr key={row.invoiceNo}>
                  <td><strong>{row.student}</strong></td>
                  <td>{row.agency}</td>
                  <td>{row.course}</td>
                  <td>{row.invoiceNo}</td>
                  <td>{row.due}</td>
                  <td><span className="status-badge status-danger">{row.status}</span></td>
                  <td className="is-danger-text">{row.outstanding}</td>
                  <td><button type="button" className="tab-action-ghost">Remind</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );

  const renderPaymentsPanel = () => (
    <section className="finance-panel">
      <div className="finance-panel-head">
        <h3>Payments</h3>
        <button type="button" className="tab-action-primary">+ Record Payment</button>
      </div>
      <div className="finance-inline-controls">
        <input type="text" placeholder="Search student or email..." />
        <select defaultValue="all"><option value="all">All methods</option></select>
      </div>
      <div className="finance-list">
        {["Advay Pillai", "ANGIE YURLEY GUAITERO CARRENO", "ESTEBAN EMILIO DIAZ ARANEDA", "Fan Yang"].map((name, idx) => (
          <article key={name} className="finance-list-item">
            <div><strong>{name}</strong><small>applicant{idx + 1}@gmail.com</small></div>
            <p>Payments<strong>1</strong></p>
            <p>Total Paid<strong className="is-success-text">${[350, 1170, 460, 1380][idx]}</strong></p>
          </article>
        ))}
      </div>
    </section>
  );

  const renderPaymentPlansPanel = () => (
    <section className="finance-panel">
      <div className="finance-panel-head">
        <h3>Payment Plans</h3>
        <button type="button" className="tab-action-primary">+ Create Plan</button>
      </div>
      <div className="finance-inline-controls">
        <input type="text" placeholder="Search student or email..." />
        <select defaultValue="all"><option value="all">All statuses</option></select>
      </div>
      <div className="finance-list">
        {["Dipak Pudasaini", "FATIMA ROSARIO TORRES GUEVARA", "Ramorn Nal", "Tenzin Dema"].map((name) => (
          <article key={name} className="finance-list-item">
            <div><strong>{name}</strong><small>Applicant</small></div>
            <p>Plans<strong>1</strong></p>
            <p>Active<strong>1</strong></p>
          </article>
        ))}
      </div>
    </section>
  );

  const renderFeeSchedulesPanel = () => (
    <section className="finance-panel">
      <div className="finance-panel-head">
        <h3>Fee Schedules</h3>
        <div className="finance-actions">
          <input type="text" placeholder="Search course or description..." />
          <select defaultValue="all"><option value="all">All types</option></select>
          <button type="button" className="tab-action-primary">+ Add Fee</button>
        </div>
      </div>
      <div className="finance-plain-table-wrap">
        <table className="finance-plain-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {[
              ["IELTS Examination Preparation", "Tuition", "Tuition (14 weeks @ $220/week - International)", "$3,080"],
              ["Business & Communication Skills", "Tuition", "Tuition (28 weeks @ $240/week - International)", "$6,720"],
              ["General English", "Tuition", "Tuition (60 weeks @ $190/week - International)", "$11,400"],
            ].map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
                <td><button type="button" className="billing-delete-row-button">Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderWithdrawalsPanel = () => (
    <section className="finance-panel">
      <div className="finance-panel-head">
        <h3>Withdrawal Requests</h3>
        <div className="finance-inline-controls">
          <input type="text" placeholder="Search student or course..." />
          <select defaultValue="all"><option value="all">All statuses</option></select>
        </div>
      </div>
      <div className="finance-plain-table-wrap">
        <table className="finance-plain-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Weeks</th>
              <th>Fee Paid</th>
              <th>Refund</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2a55745e</td>
              <td>PTE</td>
              <td>4/12</td>
              <td>$600</td>
              <td>$0</td>
              <td><span className="status-badge status-danger">rejected</span></td>
              <td>28/02/2026</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderAgentCommissionsPanel = () => (
    <section className="finance-panel">
      <div className="finance-panel-head">
        <div>
          <h3>Agent Commission Management</h3>
          <p>Review agent-submitted invoices and record payouts.</p>
        </div>
        <input type="text" placeholder="Search agent or company..." />
      </div>
      <div className="finance-summary-grid">
        <article className="stat-card"><p>Pending Commissions</p><strong>$0</strong></article>
        <article className="stat-card"><p>Approved (Invoiced)</p><strong>$201</strong></article>
        <article className="stat-card"><p>Total Paid Out</p><strong>$0</strong></article>
        <article className="stat-card"><p>Awaiting Your Review</p><strong>1</strong></article>
      </div>
      <article className="finance-highlight-card">
        <h4>Agent-Submitted Commission Invoices — Awaiting Your Review</h4>
        <p>Omkar Consultancy Pty Ltd. Submitted: 08 May 2026</p>
        <div className="finance-actions">
          <button type="button" className="tab-action-primary">Approve</button>
          <button type="button" className="tab-action-ghost">Reject</button>
          <button type="button" className="tab-action-ghost">Put on Hold</button>
          <button type="button" className="tab-action-ghost">Record Payout</button>
        </div>
      </article>
      <div className="finance-plain-table-wrap">
        <table className="finance-plain-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payout</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>08/05/2026</td>
              <td>Commission — Omkar Chaudhary (INV-2026-L37S4-W01-01)</td>
              <td>30%</td>
              <td>$201</td>
              <td><span className="status-badge status-info">Pending Review</span></td>
              <td><span className="status-badge status-warning">Unsettled</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderFundingSummaryPanel = () => (
    <section className="finance-panel">
      <div className="finance-panel-head">
        <div>
          <h3>Funding Summary</h3>
          <p>Breakdown of total invoiced amounts by funding type - aligned with Meshed RTO Manager and AVETMISS funding categories.</p>
        </div>
      </div>
      <div className="funding-card">
        <p>Unclassified</p>
        <strong>$634,645</strong>
        <small>$4734 collected - 395 invoices</small>
        <small>7% collected</small>
      </div>
      <article className="finance-subpanel">
        <h4>Invoices Pending Meshed Sync</h4>
        <p>395 invoices not yet synced to Meshed</p>
        <small>Go to the Meshed Sync tab to export and sync these invoices.</small>
      </article>
    </section>
  );

  const renderMeshedSyncPanel = () => (
    <section className="finance-panel">
      <div className="finance-panel-head">
        <div>
          <h3>Meshed RTO Manager — Bidirectional Sync</h3>
          <p>Export Boston data to Meshed-compatible CSVs, or import data exported from Meshed RTO Manager.</p>
        </div>
      </div>

      <div className="meshed-sync-grid">
        <article className="finance-subpanel">
          <h4>Export to Meshed</h4>
          <div className="meshed-date-grid">
            <label>
              From Date
              <input type="date" defaultValue="2026-07-01" />
            </label>
            <label>
              To Date
              <input type="date" defaultValue="2026-07-31" />
            </label>
          </div>
          <div className="meshed-checks">
            <p>Include in export</p>
            <label><input type="checkbox" defaultChecked /> Students</label>
            <label><input type="checkbox" defaultChecked /> Enrolments</label>
            <label><input type="checkbox" defaultChecked /> Finance</label>
            <label><input type="checkbox" defaultChecked /> Units</label>
          </div>
          <button type="button" className="tab-action-primary is-wide">Export ZIP</button>
        </article>

        <article className="finance-subpanel">
          <h4>Import from Meshed</h4>
          <button type="button" className="meshed-dropzone">
            <span className="meshed-dropzone-icon">⇪</span>
            <span>Drag & drop a Meshed CSV here, or click to select</span>
          </button>
        </article>
      </div>
    </section>
  );

  const renderTabContent = () => {
    if (activeTab === "Billing Queue") return renderBillingQueuePanel();
    if (activeTab === "Students") return renderStudentsPanel();
    if (activeTab === "Invoices") return renderInvoicesPanel();
    if (activeTab === "Overdue") return renderOverduePanel();
    if (activeTab === "Payments") return renderPaymentsPanel();
    if (activeTab === "Payment Plans") return renderPaymentPlansPanel();
    if (activeTab === "Fee Schedules") return renderFeeSchedulesPanel();
    if (activeTab === "Withdrawals") return renderWithdrawalsPanel();
    if (activeTab === "Agent Commissions") return renderAgentCommissionsPanel();
    if (activeTab === "Funding Summary") return renderFundingSummaryPanel();
    return renderMeshedSyncPanel();
  };

  return (
    <section className="page-section">
      <div className="section-heading">
        <h2>Finance</h2>
        <p>Billing queue focused view with overdue propagation and payment-plan visibility.</p>
      </div>

      <div className="stat-grid stat-grid-5 finance-kpi-grid">
        {financeStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            tone={stat.tone}
            className={`finance-kpi-card finance-kpi-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
          />
        ))}
      </div>

      <div className="tab-swiper" role="tablist" aria-label="Finance menu tabs">
        {financeTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`tab-chip${activeTab === tab ? " is-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === "Students" && <span className="tab-count-chip">100</span>}
            {tab === "Billing Queue" && (
              <>
                <span className="tab-count-chip is-purple">{awaitingSetupCount}</span>
                <span className="tab-count-chip is-amber">{partiallyPaidCount}</span>
              </>
            )}
            {tab === "Overdue" && <span className="tab-count-chip is-red">54</span>}
          </button>
        ))}
      </div>

      {renderTabContent()}

      {activeBillingRow && (
        <section
          className="billing-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Billing setup"
          onClick={closeBillingModal}
        >
          <article className="billing-modal-sheet" onClick={(event) => event.stopPropagation()}>
            <header className="billing-modal-header">
              <div>
                <h3>Billing Setup — {activeBillingRow.student}</h3>
                <p>
                  Course: <strong>{activeBillingRow.course}</strong>
                  <span>Payment mode: </span>
                  <span className="billing-mode-chip">{activeBillingRow.mode}</span>
                  <span>Signed: {activeBillingRow.signed}</span>
                </p>
              </div>
              <button type="button" className="billing-close-button" onClick={closeBillingModal} aria-label="Close billing modal">
                ×
              </button>
            </header>

            <p className="billing-modal-description">
              Student selected manual payment. Add the installment rows as agreed with the student — each row becomes a separate draft invoice.
            </p>

            <div className="billing-schedule-header">
              <h4>Payment Schedule</h4>
              <button
                type="button"
                className="billing-add-row-button"
                onClick={() =>
                  setPaymentRows((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), description: "", dueDate: "2026-07-05", amount: "" },
                  ])
                }
              >
                + Add Row
              </button>
            </div>

            <div className="billing-table-wrap">
              <table className="billing-edit-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th>Amount ($)</th>
                    <th aria-label="Delete row" />
                  </tr>
                </thead>
                <tbody>
                  {paymentRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <input
                          type="text"
                          placeholder="Description"
                          value={row.description}
                          onChange={(event) =>
                            setPaymentRows((prev) =>
                              prev.map((item) => (item.id === row.id ? { ...item, description: event.target.value } : item))
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          value={row.dueDate}
                          onChange={(event) =>
                            setPaymentRows((prev) =>
                              prev.map((item) => (item.id === row.id ? { ...item, dueDate: event.target.value } : item))
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={row.amount}
                          onChange={(event) =>
                            setPaymentRows((prev) =>
                              prev.map((item) => (item.id === row.id ? { ...item, amount: event.target.value } : item))
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="billing-delete-row-button"
                          onClick={() => setPaymentRows((prev) => prev.filter((item) => item.id !== row.id))}
                          aria-label="Delete row"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="billing-total">
              Total: <strong>${totalAmount.toLocaleString()}</strong> across {paymentRows.length} invoice{paymentRows.length === 1 ? "" : "s"}
            </p>

            <footer className="billing-modal-footer">
              <button type="button" className="billing-footer-button is-ghost" onClick={closeBillingModal}>
                Cancel
              </button>
              <button type="button" className="billing-footer-button is-primary">
                Create {paymentRows.length} Invoice{paymentRows.length === 1 ? "" : "s"}
              </button>
            </footer>
            <p className="billing-footer-note">Invoices are created as Draft. Go to the Invoices tab to send them or record payments.</p>
          </article>
        </section>
      )}
    </section>
  );
}

export default FinancePage;
