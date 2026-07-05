# Boston Institute Admin Flow Review (React)

This repository contains a focused Stage 2 delivery for admin-side portal areas:
- Students
- Finance

The build intentionally prioritizes implementation quality and clear structure for review.

## What is included

### 1) Structured review of admin flows
The structured review is documented directly below.

#### Students flow
- **Issue:** Row actions are too icon-dependent and fragmented.  
  **Rationale:** Add explicit action labels and consistent action groups to improve speed and accessibility.
- **Issue:** Risk/compliance signals are scattered across screens.  
  **Rationale:** Surface missing documents, on-hold, and withdrawn states in one operational snapshot.
- **Issue:** Student row click opens a dense detail panel with duplicated menus/functions, which is hard to use on mobile.  
  **Rationale:** Replace one-layer icon clusters with grouped action cards (`High Priority`, `Academic`, `Support`), role-priority tabs, and progressive disclosure for small screens.
- **Issue:** Personal info was duplicated between hub header and profile panel.  
  **Rationale:** Keep personal identity data only in `hub-profile` (single source), and keep `hub-title-wrap` focused on task context to reduce repetition.

#### Finance flow
- **Issue:** Overdue state does not clearly propagate to learning-access outcomes.  
  **Rationale:** Link finance records to profile and LMS-lock reason for transparent decision-making.
- **Issue:** Payment-plan vs lump-sum context is hidden in table detail.  
  **Rationale:** Promote payment model and next due date to summary-level visibility.

### 2) Working React screens for key admin flows
Implemented routes:
- `/students`
- `/finance`

The screens are built with reusable components and realistic mock operational data.
In the Students screen, clicking a table row now opens a mobile-friendly Student Hub sheet with consolidated navigation and grouped actions.
Each screen toolbar input/select is functional: search and filter conditions are applied directly to table data.
In the Finance screen, the upper menu tabs are implemented as a horizontal swiper/scroll strip so the layout height stays stable even when tab counts grow on both desktop and mobile.
In the Student Hub detail view, the `Student Actions` icon menu is also implemented as a horizontal swiper/scroll strip to keep panel height stable while preserving access to many actions.
In the Students table wrapper, admins can control visible row count via a rows-per-page option box (`10/20/30/40/50`).
The same area also includes column-targeted search (`Student/Email/Location/Courses/Status`): for `Student/Email/Courses`, keyword search runs on Enter and resets on Escape; for `Location/Status`, the input is replaced with a preset dropdown (`Onshore/Offshore`, `Enrolled/Not Enrolled`) and applies instantly on selection.
The same `table-field-search` component pattern is reused on Finance (`Student/Course`), intentionally using Enter-to-apply instead of keystroke-by-keystroke filtering to avoid noisy result jitter while users are still typing or correcting typos in high-volume tables.
For bulk portal operations, row checkboxes now enforce a single action type per batch. Once users start with `Portal` (or `Deactivate`) rows, incompatible rows are visually greyed out. If users still click an incompatible checkbox, a red bottom toast appears with guidance to clear current selections before switching action type.
To reduce duplicated controls, the Students table `Actions` column was removed and row-detail opening is now bound only to non-checkbox data cells (`td` except `.table-checkbox-cell`), preventing accidental modal open while selecting rows. This cleanup was intentional because `Not Enrolled` rows were already mapped to `Portal` (activate) behavior and `Enrolled` rows were already mapped to `Deactivate` behavior, so keeping the `Actions` column caused redundant state exposure and duplicated activate/deactivate interaction paths.
From a UX perspective, checkbox hit-area accessibility was improved by allowing selection toggle through the entire `.table-checkbox-cell` (not only the tiny checkbox icon), reducing precision-click burden and speeding up repetitive admin operations.

### 3) Clear component structure + responsive behavior
Core reusable UI:
- `src/shared/ui/StatCard.jsx`
- `src/shared/ui/DataTable.jsx`
- `src/shared/ui/StatusBadge.jsx`

Mock datasets:
- `src/shared/data/mockData.js`

Layout and responsive styling:
- `src/app/layout/AdminLayout.jsx`
- `src/index.css`

## Design/engineering decisions

- **Role-scoped delivery:** Only admin flows were implemented first, based on current accessible scope.
- **Readability first:** Dense operational pages were simplified using strong hierarchy and consistent section blocks.
- **Single-source profile context:** In Student Hub, personal info is displayed in one place (`hub-profile`) while the header is used for action context only.
- **Operational realism:** Data includes real-world statuses (e.g., under review, partially paid, not enrolled).
- **Trade-off 1 (Section 2.2 depth):** I intentionally did not fully implement the complete “individual student profile screen” requested in the task (enrolment details, all courses, attendance summary, financial status, documents like Offer Letter/COE in one coherent view). The information density and cross-domain dependencies are high, and building a truly coherent single-screen model required more domain understanding time than was available in this submission window.
- **Trade-off 2 (Section 2.3 finance internals):** I focused on a reviewable front-end structure and representative UI states rather than claiming full finance-process fidelity. The available admin test environment had limited/partial behavior in several areas (some actions not fully working, sparse or missing historical data), which made it difficult to reliably reconstruct the institution’s real billing and payout lifecycle from UI observation alone.

## Constraints and why some areas were hard

- **Limited domain context for finance rules:** Critical context (payment lifecycle details, internal approval rules, payout exception handling, historical edge-case examples) was not available in the provided materials/environment.
- **Test-environment ambiguity:** Even after flow checking, it was hard to confirm which behaviors represented production logic versus test placeholders due to incomplete interactions and missing records.
- **Time-to-comprehension bottleneck:** The assignment asks for broad role/system coverage, but understanding and modeling a high-density all-in-one student profile plus finance internals to a defensible level required more discovery time than this iteration allowed.
- **Submission strategy:** Due to the limits above, the implementation quality in this iteration is not strong enough for full-confidence feature claims. I therefore chose a documentation-first strategy: clearly recording assumptions, gaps, and trade-offs rather than overstating the completeness of the build.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in terminal.

## Build

```bash
npm run build
npm run preview
```
