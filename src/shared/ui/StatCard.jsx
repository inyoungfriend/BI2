import React from "react";

function StatCard({ label, value, tone = "neutral" }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

export default StatCard;
