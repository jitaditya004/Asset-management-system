export default function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select",
  getLabel,
  getValue,
  className = "",
  getKey
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`border p-2 rounded w-full ${className}`}
      >
        <option value="">{placeholder}</option>

        {options.map((item) => (
          <option key={getKey(item)} value={getValue(item)}>
            {getLabel(item)}
          </option>
        ))}
      </select>
    </div>
  );
}
