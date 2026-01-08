import { ChevronDown } from "lucide-react";

export default function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  getLabel = (i) => i.label,
  getValue = (i) => i.value,
  getKey = (i) => i.id,
  className = ""
}) {
  const isEmpty = !value;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-white/80"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`
            w-full appearance-none
            rounded-xl px-4 py-2.5 pr-10
            bg-white/10 backdrop-blur-lg
            border border-white/20
            ${isEmpty ? "text-white/50" : "text-white"}
            transition-all duration-200
            hover:border-white/40
            focus:outline-none
            focus:ring-2 focus:ring-indigo-500/60
            focus:border-indigo-400
            shadow-lg
            ${className}
          `}
        >
          <option value="" disabled className="bg-zinc-900 text-white/60">
            {placeholder}
          </option>

          {options.map((item) => (
            <option
              key={getKey(item)}
              value={getValue(item)}
              className="bg-zinc-900 text-white"
            >
              {getLabel(item)}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none"
        />
      </div>
    </div>
  );
}
