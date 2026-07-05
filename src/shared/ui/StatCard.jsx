import React from "react";

function StatCard({ label, value, tone = "neutral", className = "" }) {
  return (
    <article className={`stat-card stat-${tone} ${className}`.trim()}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

export default StatCard;
