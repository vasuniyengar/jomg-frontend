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
                {tier.items.map((item, index) => {
                  const hasName = Boolean(item.name?.trim());
                  return (
                    <a
                      className={`spon-tile${hasName ? "" : " spon-tile-logo-only"}`}
                      href={item.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={hasName ? item.name : undefined}
                      key={`${tier.name}-${item.id || item.logo || index}`}
                    >
                      {item.logo ? (
                        <span
                          className={`spon-logo img${item.darkLogo ? " dark" : ""}`}
                        >
                          <img src={item.logo} alt={hasName ? `${item.name} logo` : ""} />
                        </span>
                      ) : null}
                      {hasName ? (
                        <span className="spon-tile-name">{item.name}</span>
                      ) : null}
                    </a>
                  );
                })}
              </div>
            </div>
          ) : null
        )}
      </div>
    </>
  );
}
