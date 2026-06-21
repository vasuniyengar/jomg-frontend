function DivisionsIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9.5" fill="var(--accent)" />
      <g fill="var(--surface)">
        <circle cx="12" cy="6.5" r="1.3" />
        <circle cx="8.2" cy="9" r="1.3" />
        <circle cx="15.8" cy="9" r="1.3" />
        <circle cx="6.5" cy="13.5" r="1.3" />
        <circle cx="17.5" cy="13.5" r="1.3" />
        <circle cx="9" cy="17" r="1.3" />
        <circle cx="15" cy="17" r="1.3" />
      </g>
    </svg>
  );
}

function InfoBarIcon({ icon }) {
  if (icon === "calendar") return "🗓";
  if (icon === "clubs") return "🏟";
  if (icon === "divisions") return <DivisionsIcon />;
  return "•";
}

export default function InfoBar({ items }) {
  return (
    <div className="o3-ibar-wrap">
      <div className="ibar">
        {items.map((item) => (
          <div className="ib" key={`${item.label}-${item.value}`}>
            <span className="ib-ic">
              <InfoBarIcon icon={item.icon} />
            </span>
            <div>
              <div className="ib-k">{item.label}</div>
              <div className="ib-v">{item.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
