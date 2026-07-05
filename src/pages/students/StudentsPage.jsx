import React, { useEffect, useMemo, useState } from "react";
import DataTable from "../../shared/ui/DataTable";
import StatCard from "../../shared/ui/StatCard";
import TableFieldSearch from "../../shared/ui/TableFieldSearch";
import { studentHubDetail, studentsRows, studentsStats } from "../../shared/data/mockData";

const studentActionItems = [
  "Profile",
  "Vaccination",
  "Email",
  "Letter",
  "Course",
  "Checklist",
  "Result",
  "Defer",
  "English Test",
  "Intervention",
  "Diary",
  "Upload",
  "Payment",
  "Photo",
  "Student Card",
  "Attendance",
  "OSHC",
  "Interview",
  "Sanction",
  "Training Plan",
  "Claim Tracking",
  "Search",
];

const emailTemplates = [
  "Orientation",
  "Attendance",
  "Payment Reminder",
  "Course Update",
  "Visa Reminder",
  "General",
  "Document Request",
  "Welcome Back",
];

const ccRecipients = [
  "Info",
  "Ops Marketing",
  "Rupinder",
  "Boston Developer (Staff)",
  "Cathyrine (Staff)",
  "Chandni Goyal (Staff)",
  "Darshana (Staff)",
  "InYoung Intern (Staff)",
];

const hubSecondaryMenu = ["Progress", "Agent", "Credentials", "Email"];
const defaultEmailBody = `Dear Juan Camilo Ramirez Roldan,

Warm greetings from everyone at Boston Institute.

To help you start smoothly, please complete the following before your first class:
1. Watch the Orientation Video
2. Complete the Placement Test
3. Review your class timetable and attendance policy

If you have questions, please reply to this email and our team will assist you.`;

const columns = [
  { key: "student", header: "Student" },
  { key: "email", header: "Email" },
  { key: "location", header: "Location" },
  { key: "courses", header: "Courses" },
  { key: "status", header: "Status", kind: "status" },
  { key: "joined", header: "Joined" },
];

function StudentsPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [columnSearchField, setColumnSearchField] = useState("student");
  const [columnSearchInput, setColumnSearchInput] = useState("");
  const [columnSearchPresetValue, setColumnSearchPresetValue] = useState("all");
  const [appliedColumnSearch, setAppliedColumnSearch] = useState({
    field: "student",
    keyword: "",
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState(new Set());
  const [toastMessage, setToastMessage] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeHubTab, setActiveHubTab] = useState("Overview");

  const mergedHubData = useMemo(() => {
    if (!selectedStudent) {
      return null;
    }
    return {
      ...studentHubDetail,
      name: selectedStudent.student,
      email: selectedStudent.email,
      primaryCourse: selectedStudent.courses,
    };
  }, [selectedStudent]);

  const filteredRows = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const columnKeyword = appliedColumnSearch.keyword.trim().toLowerCase();

    return studentsRows.filter((row) => {
      const matchesKeyword =
        keyword.length === 0 ||
        row.student.toLowerCase().includes(keyword) ||
        row.email.toLowerCase().includes(keyword);

      const courseText = row.courses.toLowerCase();
      const matchesCourse =
        courseFilter === "all" ||
        (courseFilter === "english" && courseText.includes("english")) ||
        (courseFilter === "pte" && courseText.includes("pte"));

      const targetValue = String(row[appliedColumnSearch.field] ?? "").toLowerCase();
      const matchesColumnKeyword = columnKeyword.length === 0 || targetValue.includes(columnKeyword);

      return matchesKeyword && matchesCourse && matchesColumnKeyword;
    });
  }, [appliedColumnSearch.field, appliedColumnSearch.keyword, courseFilter, searchKeyword]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, searchKeyword, courseFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setToastMessage("");
    }, 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const pagedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredRows, rowsPerPage]);

  const selectedCount = selectedRowKeys.size;
  const isPresetField = columnSearchField === "location" || columnSearchField === "status";
  const rowLookup = useMemo(() => new Map(studentsRows.map((row) => [row.email, row])), []);

  const resolveBulkActionType = (row) => (row.action.toLowerCase().includes("portal") ? "portal" : "deactivate");
  const resolveRowTypeLabel = (type) => {
    if (type === "portal") {
      return "Not Enrolled";
    }
    if (type === "deactivate") {
      return "Enroll";
    }
    return type;
  };

  const getSelectionTypeFromKeys = (keys) => {
    let currentType = "";
    for (const key of keys) {
      const row = rowLookup.get(key);
      if (!row) {
        continue;
      }
      const rowType = resolveBulkActionType(row);
      if (!currentType) {
        currentType = rowType;
        continue;
      }
      if (currentType !== rowType) {
        return "mixed";
      }
    }
    return currentType;
  };

  const selectedActionType = useMemo(() => getSelectionTypeFromKeys(selectedRowKeys), [selectedRowKeys]);
  const getRowSelectionType = (row) => resolveBulkActionType(row);
  const isSelectionBlockedRow = (row) =>
    !!selectedActionType && selectedActionType !== "mixed" && getRowSelectionType(row) !== selectedActionType;

  const showSelectionToast = (message) => {
    setToastMessage(message);
  };

  const applyColumnSearch = () => {
    setAppliedColumnSearch({
      field: columnSearchField,
      keyword: columnSearchInput,
    });
  };

  const toggleRowSelection = (rowKey, _row, isChecked) => {
    setSelectedRowKeys((prev) => {
      const currentType = getSelectionTypeFromKeys(prev);
      const rowType = resolveBulkActionType(_row);
      const next = new Set(prev);
      if (isChecked) {
        if (currentType && currentType !== "mixed" && currentType !== rowType) {
          showSelectionToast(
            `To select ${resolveRowTypeLabel(rowType)} rows, clear the current ${resolveRowTypeLabel(currentType)} selection first.`
          );
          return prev;
        }
        next.add(rowKey);
      } else {
        next.delete(rowKey);
      }
      return next;
    });
  };

  const toggleAllVisibleSelection = (isChecked, visibleRows) => {
    setSelectedRowKeys((prev) => {
      const currentType = getSelectionTypeFromKeys(prev);
      const next = new Set(prev);
      if (isChecked) {
        if (!currentType) {
          const visibleTypes = new Set(visibleRows.map((row) => resolveBulkActionType(row)));
          if (visibleTypes.size > 1) {
            showSelectionToast("Select one action type per batch: Portal or Deactivate.");
            return prev;
          }
          visibleRows.forEach((row) => {
            next.add(row.email);
          });
          return next;
        }
        if (currentType === "mixed") {
          showSelectionToast("Mixed selection is not allowed. Clear selection and try again.");
          return prev;
        }
        visibleRows.forEach((row) => {
          if (resolveBulkActionType(row) === currentType) {
            next.add(row.email);
          }
        });
        return next;
      }
      visibleRows.forEach((row) => {
        next.delete(row.email);
      });
      return next;
    });
  };

  const paginationButtons = Array.from({ length: totalPages }, (_, i) => i + 1);

  const renderTabContent = () => {
    if (!mergedHubData) {
      return null;
    }

    if (activeHubTab === "Email") {
      return (
        <section className="compose-email-panel" aria-label="Compose email">
          <h4>Compose Email</h4>
          <p className="template-label">Template</p>
          <div className="template-grid">
            {emailTemplates.map((template) => (
              <button key={template} type="button" className="template-chip">
                {template}
              </button>
            ))}
          </div>

          <div className="email-row">
            <label>
              To *
              <input type="text" value={mergedHubData.email} readOnly />
            </label>
            <label>
              CC (optional)
              <input type="text" placeholder="Type email, press Enter or comma..." />
            </label>
          </div>

          <div className="cc-recipient-list">
            {ccRecipients.map((person) => (
              <span key={person} className="cc-chip">
                + {person}
              </span>
            ))}
          </div>

          <div className="email-row is-single">
            <label>
              Reply-To (optional)
              <input type="text" placeholder="replies@example.com" />
            </label>
          </div>

          <div className="email-row is-single">
            <label>
              Email Body *
              <textarea rows={12} defaultValue={defaultEmailBody} />
            </label>
          </div>
        </section>
      );
    }

    if (activeHubTab === "Overview") {
      return (
        <>
          <div className="hub-metrics-grid is-compact">
            {mergedHubData.metrics.map((item) => (
              <article key={item.label} className="hub-metric-card">
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          <div className="split-panel-grid">
            <article className="tab-panel-card">
              <h4>Enrolled Courses</h4>
              <p>No courses</p>
            </article>
            <article className="tab-panel-card">
              <h4>Enrolled Classes</h4>
              <p>No classes</p>
            </article>
          </div>

          <article className="tab-panel-card">
            <h4>Exam Details</h4>
            <div className="form-grid-two">
              <label>
                Desired Score
                <input type="text" value="80+" readOnly />
              </label>
              <label>
                Exam Date
                <input type="text" value="2026. 07. 31." readOnly />
              </label>
            </div>
            <button type="button" className="tab-action-button">
              Save Changes
            </button>
          </article>
        </>
      );
    }

    if (activeHubTab === "Profile") {
      return (
        <>
          <div className="tab-heading-row">
            <div>
              <h4>Personal & Compliance Profile</h4>
              <p>Used for ID cards, CoE letters and AVETMISS reporting.</p>
            </div>
            <div className="tab-action-row">
              <button type="button" className="tab-action-ghost">
                Sync from Application
              </button>
              <button type="button" className="tab-action-ghost">
                Link Application
              </button>
              <button type="button" className="tab-action-primary">
                Edit Profile
              </button>
            </div>
          </div>

          <article className="tab-panel-card">
            <h4>Personal Details</h4>
            <div className="detail-grid-three">
              <p>
                Full Name
                <strong>{mergedHubData.name}</strong>
              </p>
              <p>
                Preferred Name
                <strong>Juan</strong>
              </p>
              <p>
                Gender
                <strong>Male</strong>
              </p>
              <p>
                Date of Birth
                <strong>05 May 1997</strong>
              </p>
              <p>
                Country of Birth
                <strong>Colombia</strong>
              </p>
              <p>
                Nationality
                <strong>Colombia</strong>
              </p>
              <p>
                Email
                <strong>{mergedHubData.email}</strong>
              </p>
              <p>
                Phone
                <strong>{mergedHubData.phone}</strong>
              </p>
              <p>
                Provider Student ID
                <strong>—</strong>
              </p>
            </div>
          </article>

          <article className="tab-panel-card">
            <h4>Identity & Visa</h4>
            <div className="detail-grid-three">
              <p>
                Passport Number
                <strong>BHXXXXXX</strong>
              </p>
              <p>
                Visa Subclass
                <strong>Bridging Visa</strong>
              </p>
              <p>
                Visa Expiry
                <strong>31 May 2026</strong>
              </p>
              <p>
                Student Location
                <strong>I am currently in Australia</strong>
              </p>
              <p>
                USI
                <strong>—</strong>
              </p>
              <p>
                Citizenship
                <strong>Colombia</strong>
              </p>
            </div>
          </article>
        </>
      );
    }

    if (activeHubTab === "Enrolments") {
      return (
        <>
          <div className="tab-heading-row">
            <h4>15 enrolments</h4>
            <button type="button" className="tab-action-primary">
              + Add Enrolment
            </button>
          </div>
          <article className="tab-list-card">
            <strong>English for Academic Purposes</strong>
            <p>1 class · 1 approved</p>
          </article>
          <article className="tab-list-card">
            <strong>General English</strong>
            <p>14 classes · 14 approved</p>
          </article>
        </>
      );
    }

    if (activeHubTab === "Attendance") {
      return (
        <>
          <div className="tab-heading-row">
            <h4>0 sessions</h4>
            <button type="button" className="tab-action-primary">
              + Mark Attendance
            </button>
          </div>
          <article className="tab-empty-card">No attendance records</article>
        </>
      );
    }

    if (activeHubTab === "Assessments") {
      return (
        <>
          <div className="tab-heading-row">
            <h4>0 assessments</h4>
            <button type="button" className="tab-action-primary">
              + Add Assessment
            </button>
          </div>
          <article className="tab-empty-card">No assessments</article>
        </>
      );
    }

    if (activeHubTab === "Applications") {
      return (
        <>
          <div className="tab-heading-row">
            <h4>0 applications</h4>
            <button type="button" className="tab-action-primary">
              + New Application
            </button>
          </div>
          <article className="tab-empty-card">No applications yet</article>
        </>
      );
    }

    if (activeHubTab === "Finance") {
      return (
        <>
          <div className="tab-heading-row">
            <h4>Finance Summary</h4>
            <button type="button" className="tab-action-ghost">
              Capture Receipt
            </button>
          </div>
          <div className="hub-metrics-grid is-compact">
            <article className="hub-metric-card">
              <p>Total Invoiced</p>
              <strong>$0.00</strong>
            </article>
            <article className="hub-metric-card">
              <p>Total Paid</p>
              <strong className="is-success">$0.00</strong>
            </article>
            <article className="hub-metric-card">
              <p>Outstanding</p>
              <strong className="is-danger">$0.00</strong>
            </article>
            <article className="hub-metric-card">
              <p>Active Plans</p>
              <strong>0</strong>
            </article>
          </div>
          <article className="tab-panel-card">
            <h4>Invoices</h4>
            <p>No invoices</p>
          </article>
          <article className="tab-panel-card">
            <h4>Payment History</h4>
            <p>No payments recorded</p>
          </article>
        </>
      );
    }

    if (activeHubTab === "Docs & Certs") {
      return (
        <>
          <div className="tab-heading-row">
            <h4>Generated Documents</h4>
            <div className="tab-action-row">
              <button type="button" className="tab-action-ghost">
                Upload COE
              </button>
              <button type="button" className="tab-action-ghost">
                Generate Document
              </button>
            </div>
          </div>
          <article className="tab-panel-card">
            <p>No documents generated</p>
          </article>
          <article className="tab-panel-card">
            <h4>Generated Certificates</h4>
            <p>No certificates yet</p>
          </article>
        </>
      );
    }

    if (activeHubTab === "Visa / PRISMS") {
      return (
        <>
          <article className="tab-panel-card">
            <h4>PRISMS Student Details</h4>
            <div className="detail-grid-three">
              <p>
                Student Location
                <strong>I Am Currently In Australia</strong>
              </p>
              <p>
                Visa Subclass
                <strong>—</strong>
              </p>
              <p>
                Citizenship
                <strong>—</strong>
              </p>
              <p>
                OSHC Provider
                <strong>—</strong>
              </p>
              <p>
                OSHC Policy #
                <strong>—</strong>
              </p>
              <p>
                Study Load
                <strong>Full-Time</strong>
              </p>
            </div>
          </article>
          <article className="tab-panel-card">
            <h4>Visa Records</h4>
            <p>No visa records</p>
          </article>
          <article className="tab-panel-card">
            <h4>CoE Records</h4>
            <p>No CoE records</p>
          </article>
        </>
      );
    }

    if (activeHubTab === "Progress") {
      return (
        <>
          <article className="tab-panel-card">
            <h4>Visa Compliance Snapshot</h4>
            <div className="progress-line">
              <span>Attendance</span>
              <strong>0%</strong>
            </div>
            <div className="progress-line">
              <span>Course Progress</span>
              <strong>0%</strong>
            </div>
            <div className="risk-chip-row">
              <span className="status-badge status-danger">Attendance At Risk</span>
              <span className="status-badge status-warning">Progress Behind</span>
            </div>
          </article>
          <article className="tab-panel-card">
            <div className="notes-tab-row">
              <button type="button" className="tab-action-ghost is-active">
                Notes (1)
              </button>
              <button type="button" className="tab-action-ghost">
                Comms (0)
              </button>
              <button type="button" className="tab-action-ghost">
                Reports (0)
              </button>
            </div>
            <button type="button" className="tab-action-primary">
              + Add Note
            </button>
            <article className="note-card">
              <strong>test</strong>
              <p>By InYoung (Intern) · 04 Jul 2026 19:31</p>
            </article>
          </article>
        </>
      );
    }

    if (activeHubTab === "Agent") {
      return (
        <>
          <article className="tab-panel-card">
            <h4>Linked Agents</h4>
            <p>No agent linked to this student yet.</p>
          </article>
          <article className="tab-panel-card">
            <h4>Link an Agent</h4>
            <input type="text" placeholder="Search agents by name or email..." />
            <button type="button" className="tab-action-primary is-wide">
              Link Selected Agent
            </button>
          </article>
        </>
      );
    }

    if (activeHubTab === "Credentials") {
      return (
        <article className="tab-panel-card">
          <h4>Portal Credentials</h4>
          <div className="form-grid-two">
            <label>
              Portal Name / Label
              <input type="text" value="PTE Practice Portal" readOnly />
            </label>
            <label>
              Tag (admin reference)
              <input type="text" value="pte_practice" readOnly />
            </label>
            <label>
              Username
              <input type="text" value="student@example.com" readOnly />
            </label>
            <label>
              Password
              <input type="password" value="password123" readOnly />
            </label>
            <label className="is-wide-field">
              Portal URL (optional)
              <input type="text" value="https://online.bostoninstitute.nsw.edu.au" readOnly />
            </label>
            <label className="is-wide-field">
              Notes (internal)
              <textarea rows={3} defaultValue="Internal notes..." />
            </label>
          </div>
          <button type="button" className="tab-action-primary">
            Save Credentials
          </button>
        </article>
      );
    }

    return <article className="tab-empty-card">No data in this section yet.</article>;
  };

  return (
    <section className="page-section">
      <div className="section-heading">
        <h2>Students</h2>
        <p>Directory with realistic operations for 50+ row scale workflows.</p>
        {selectedCount > 0 && (
          <div className="selection-action-wrap">
            <button type="button" className="table-action-button">
              {selectedActionType === "deactivate"
                ? `Deactivate portals (${selectedCount})`
                : `Create portals (${selectedCount})`}
            </button>
            <button type="button" className="table-action-button is-ghost" onClick={() => setSelectedRowKeys(new Set())}>
              Clear selection
            </button>
          </div>
        )}
      </div>

      <div className="stat-grid stat-grid-3">
        {studentsStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} tone={stat.tone} />
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={pagedRows}
        showSelection
        selectedRowKeys={selectedRowKeys}
        getRowKey={(row) => row.email}
        onToggleRow={toggleRowSelection}
        onToggleAll={toggleAllVisibleSelection}
        isRowSelectionBlocked={isSelectionBlockedRow}
        onBlockedRowSelect={(row) => {
          const blockedType = getRowSelectionType(row);
          showSelectionToast(
            `To select ${resolveRowTypeLabel(blockedType)} rows, clear your current selection first.`
          );
        }}
        rowClassName={(row) => (isSelectionBlockedRow(row) ? "is-selection-blocked-row" : "")}
        topRightControl={
          <div className="table-controls-combined">
            <TableFieldSearch
              fieldOptions={[
                { value: "student", label: "Student" },
                { value: "email", label: "Email" },
                { value: "location", label: "Location" },
                { value: "courses", label: "Courses" },
                { value: "status", label: "Status" },
              ]}
              selectedField={columnSearchField}
              onFieldChange={(nextField) => {
                setColumnSearchField(nextField);
                setColumnSearchInput("");
                setColumnSearchPresetValue("all");
                setAppliedColumnSearch({
                  field: nextField,
                  keyword: "",
                });
              }}
              inputValue={columnSearchInput}
              onInputChange={setColumnSearchInput}
              onApply={applyColumnSearch}
              onReset={() => {
                setColumnSearchInput("");
                setAppliedColumnSearch((prev) => ({
                  field: prev.field,
                  keyword: "",
                }));
              }}
              fieldSelectId="student-column-search-select"
              inputId="student-column-search-input"
              customInput={
                isPresetField ? (
                  <>
                    <label htmlFor="student-column-search-preset" className="visually-hidden">
                      Preset filter
                    </label>
                    <select
                      id="student-column-search-preset"
                      value={columnSearchPresetValue}
                      onChange={(event) => {
                        const value = event.target.value;
                        setColumnSearchPresetValue(value);
                        setAppliedColumnSearch({
                          field: columnSearchField,
                          keyword: value === "all" ? "" : value,
                        });
                      }}
                    >
                      <option value="all">All</option>
                      {columnSearchField === "location" ? (
                        <>
                          <option value="onshore">Onshore</option>
                          <option value="offshore">Offshore</option>
                        </>
                      ) : (
                        <>
                          <option value="enrolled">Enrolled</option>
                          <option value="not enrolled">Not Enrolled</option>
                        </>
                      )}
                    </select>
                  </>
                ) : null
              }
            />

            <div className="rows-per-page-control">
              <label htmlFor="rows-per-page-select">Rows</label>
              <select
                id="rows-per-page-select"
                value={rowsPerPage}
                onChange={(event) => setRowsPerPage(Number(event.target.value))}
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {paginationButtons.map((page) => (
              <button
                key={page}
                type="button"
                className={`pagination-button${page === currentPage ? " is-active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              className="pagination-button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        }
        onRowClick={(row) => {
          setSelectedStudent(row);
          setActiveHubTab("Overview");
        }}
        rowAriaLabel={(row) => `Open student hub for ${row.student}`}
      />

      {mergedHubData && (
        <section className="student-hub-overlay" aria-label="Student hub details">
          <article className="student-hub-sheet">
            <header className="hub-header">
              <div className="hub-title-wrap">
                <strong>Student Actions Workspace</strong>
                <p>{activeHubTab}</p>
              </div>
              <button type="button" className="ghost-button" onClick={() => setSelectedStudent(null)}>
                Close
              </button>
            </header>

            <div className="hub-body">
              <aside className="hub-profile">
                <div className="hub-profile-top">
                  <span>STUDENT HUB</span>
                </div>
                <div className="avatar-placeholder" aria-hidden="true">
                  👤
                </div>
                <button type="button" className="upload-photo-button">
                  Upload photo
                </button>
                <h3 className="hub-student-name">{mergedHubData.name}</h3>
                <p className="hub-student-meta">
                  {mergedHubData.email}
                  <br />
                  {mergedHubData.phone}
                </p>
                <span className="status-badge status-success">{mergedHubData.portalStatus}</span>

                <nav className="hub-nav" aria-label="Student hub sections">
                  {[...mergedHubData.navSections, ...hubSecondaryMenu].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`hub-nav-item${activeHubTab === item ? " is-active" : ""}`}
                      onClick={() => setActiveHubTab(item)}
                    >
                      {item}
                    </button>
                  ))}
                </nav>
              </aside>

              <section className="hub-main">
                <div className="hub-main-heading">
                  <h3>Student Actions</h3>
                </div>

                <div className="student-actions-grid">
                  {studentActionItems.map((action) => (
                    <button key={action} type="button" className="student-action-button">
                      <span className="student-action-icon">{action.charAt(0)}</span>
                      <span>{action}</span>
                    </button>
                  ))}
                </div>

                {renderTabContent()}
              </section>
            </div>
          </article>
        </section>
      )}

      {toastMessage && (
        <div className="selection-toast" role="alert" aria-live="assertive">
          {toastMessage}
        </div>
      )}
    </section>
  );
}

export default StudentsPage;
