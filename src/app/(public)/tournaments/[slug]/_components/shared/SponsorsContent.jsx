export function hasSponsorsContent(data) {
  return Boolean(
    data?.tiers?.some((tier) => tier.items?.length > 0)
  );
}

export default function SponsorsContent({ data }) {
  return (
    <>
      {data.intro ? (
        <div className="info-v" style={{ marginBottom: 24 }}>
          {data.intro}
        </div>
      ) : null}
      <div className="spon-page">
        {data.tiers.map((tier) =>
          tier.items?.length ? (
            <div className="spon-tier" key={tier.name}>
              <div className="spon-tier-head">
                <span className="spon-tier-name">{tier.name}</span>
              </div>
              <div className={`spon-grid${tier.feature ? " feature" : ""}`}>
                {tier.items.map((item) => (
                  <a
                    className="spon-tile"
                    href={item.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.name}
                    key={`${tier.name}-${item.name}-${item.logo}`}
                  >
                    <span
                      className={`spon-logo img${item.darkLogo ? " dark" : ""}`}
                    >
                      <img src={item.logo} alt={`${item.name} logo`} />
                    </span>
                    <span className="spon-tile-name">{item.name}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    </>
  );
}
