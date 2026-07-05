import React, { useMemo } from "react";
import StatusBadge from "./StatusBadge";

function DataTable({
  columns,
  rows,
  onRowClick,
  rowAriaLabel,
  showSelection = false,
  selectedRowKeys = new Set(),
  onToggleRow,
  onToggleAll,
  getRowKey,
  isRowSelectionBlocked,
  onBlockedRowSelect,
  rowClassName,
  topRightControl,
  bottomContent,
}) {
  const rowMeta = useMemo(
    () =>
      rows.map((row, index) => {
        const key = getRowKey ? getRowKey(row, index) : `${index}-${row[columns[0].key]}`;
        const blockedBySelection = isRowSelectionBlocked?.(row, index) ?? false;
        return { row, index, key, blockedBySelection };
      }),
    [columns, getRowKey, isRowSelectionBlocked, rows]
  );

  const selectableRows = useMemo(
    () => rowMeta.filter((item) => !item.blockedBySelection).map((item) => item.row),
    [rowMeta]
  );
  const selectableKeys = useMemo(
    () => rowMeta.filter((item) => !item.blockedBySelection).map((item) => item.key),
    [rowMeta]
  );

  const allVisibleSelected = selectableKeys.length > 0 && selectableKeys.every((key) => selectedRowKeys.has(key));

  return (
    <>
      <div className="table-wrapper">
        {topRightControl && <div className="table-top-controls">{topRightControl}</div>}

        <table>
          <thead>
            <tr>
              {showSelection && (
                <th className="table-checkbox-cell">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={(event) => onToggleAll?.(event.target.checked, selectableRows)}
                    disabled={selectableKeys.length === 0}
                    aria-label="Select all visible rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowMeta.map(({ row, index: rowIndex, key: rowKey, blockedBySelection }) => {
              const extraRowClass = rowClassName?.(row, rowIndex) ?? "";
              const clickableClass = onRowClick ? "is-clickable" : "";
              const selectedClass = selectedRowKeys.has(rowKey) ? "is-row-selected" : "";
              return (
                <tr
                  key={rowKey}
                  className={[clickableClass, selectedClass, extraRowClass, blockedBySelection ? "is-selection-blocked" : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {showSelection && (
                    <td
                      className="table-checkbox-cell"
                      onClick={(event) => {
                        if (event.target instanceof HTMLInputElement) {
                          return;
                        }
                        const nextChecked = !selectedRowKeys.has(rowKey);
                        if (blockedBySelection && nextChecked) {
                          onBlockedRowSelect?.(row, rowIndex);
                          return;
                        }
                        onToggleRow?.(rowKey, row, nextChecked);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRowKeys.has(rowKey)}
                        onChange={(event) => {
                          if (blockedBySelection && event.target.checked) {
                            onBlockedRowSelect?.(row, rowIndex);
                            return;
                          }
                          onToggleRow?.(rowKey, row, event.target.checked);
                        }}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Select row for ${row[columns[0].key]}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = row[column.key];
                    const isStatus = column.kind === "status";
                    return (
                      <td
                        key={`${rowKey}-${column.key}`}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        aria-label={onRowClick ? rowAriaLabel?.(row) : undefined}
                      >
                        {isStatus ? <StatusBadge value={value} /> : value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {bottomContent && <div className="table-bottom-content">{bottomContent}</div>}
    </>
  );
}

DataTable.defaultProps = {
  onRowClick: undefined,
  rowAriaLabel: undefined,
  showSelection: false,
  selectedRowKeys: new Set(),
  onToggleRow: undefined,
  onToggleAll: undefined,
  getRowKey: undefined,
  isRowSelectionBlocked: undefined,
  onBlockedRowSelect: undefined,
  rowClassName: undefined,
  topRightControl: null,
  bottomContent: null,
};

export default DataTable;
