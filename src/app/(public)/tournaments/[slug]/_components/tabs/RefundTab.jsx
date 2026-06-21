export default function RefundTab({ data }) {
  return (
    <div className="o3-pane active">
      <div className="vcard dsec">
        <div className="sh">
          <div className="sh-title">{data.title}</div>
        </div>
        {data.blocks.map((block) => (
          <div className="info-block" key={block.label}>
            <div className="info-k">{block.label}</div>
            <div className="info-v">
              {block.email ? (
                <>
                  Reach out to JOMG Pickleball at{" "}
                  <a
                    href={`mailto:${block.email}`}
                    style={{ color: "var(--accent-deep)", fontWeight: 600 }}
                  >
                    {block.email}
                  </a>
                  .
                </>
              ) : block.label === "Full Refund Window" ? (
                <>
                  Players or clubs receive a{" "}
                  <b>full refund up until the week before the tournament date</b>
                  . No refunds are issued after that.
                </>
              ) : block.label === "Replacement Players" ? (
                <>
                  Players with a replacement can <b>swap</b> by reaching out to us.
                </>
              ) : (
                block.text
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
