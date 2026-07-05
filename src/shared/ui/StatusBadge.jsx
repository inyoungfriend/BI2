import React from "react";

const toneClassMap = {
  Enrolled: "success",
  "Not Enrolled": "danger",
  "Under Review": "warning",
  "Offer Issued": "info",
  Invoiced: "success",
  "Partially Paid": "warning",
  "Awaiting Setup": "purple",
  Manual: "neutral",
};

function StatusBadge({ value }) {
  const tone = toneClassMap[value] ?? "neutral";

  return <span className={`status-badge status-${tone}`}>{value}</span>;
}

export default StatusBadge;
