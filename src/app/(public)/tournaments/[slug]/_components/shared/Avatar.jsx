export default function Avatar({ initials, size = 40, seed = false, className = "" }) {
  const sizeClass =
    size === 24 ? "av-24" : size === 32 ? "av-32" : size === 40 ? "av-40" : "av-24";
  return (
    <span className={`av ${sizeClass}${seed ? " av-seed" : ""}${className ? ` ${className}` : ""}`}>
      {initials}
    </span>
  );
}
