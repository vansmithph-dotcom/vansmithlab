interface InputProps {
  type?: string;
  placeholder?: string;
  className?: string;
}

export default function Input({
  type = "text",
  placeholder = "",
  className = "",
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`input ${className}`}
    />
  );
}