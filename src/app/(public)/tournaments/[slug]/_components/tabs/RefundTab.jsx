export default function RefundTab({ data }) {
  return (
    <div className="o3-pane active">
      <div className="vcard dsec">
        <div className="sh">
          <div className="sh-title">{data.title}</div>
        </div>
        {data.blocks
          .filter((block) => block.text?.trim())
          .map((block) => (
            <div className="info-block" key={block.label}>
              <div className="info-k">{block.label}</div>
              <div className="info-v">{block.text}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
