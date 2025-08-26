export default function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  name,
  id,
  autoComplete,
  disabled = false,
  style,
  inputProps = {},
}) {
  return (
    <div style={{ display: 'grid', gap: 4, ...style }}>
      {label ? (
        <label htmlFor={id || name} style={{ fontSize: 14 }}>{label}</label>
      ) : null}
      <input
        id={id || name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        {...inputProps}
      />
    </div>
  )
} 