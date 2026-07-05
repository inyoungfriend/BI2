import React from "react";

function TableFieldSearch({
  fieldOptions,
  selectedField,
  onFieldChange,
  inputValue,
  onInputChange,
  onApply,
  onReset,
  placeholder = "Type keyword and press Enter",
  fieldSelectId = "table-field-search-select",
  inputId = "table-field-search-input",
  inputLabel = "Search keyword",
  customInput = null,
}) {
  return (
    <div className="table-field-search">
      <label htmlFor={fieldSelectId} className="visually-hidden">
        Column
      </label>
      <select id={fieldSelectId} value={selectedField} onChange={(event) => onFieldChange(event.target.value)}>
        {fieldOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {customInput ?? (
        <>
          <label htmlFor={inputId} className="visually-hidden">
            {inputLabel}
          </label>
          <input
            id={inputId}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onApply();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                onReset();
              }
            }}
          />
        </>
      )}
    </div>
  );
}

export default TableFieldSearch;
