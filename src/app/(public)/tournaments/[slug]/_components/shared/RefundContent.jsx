export function hasRefundContent(data) {
  return Boolean(
    data?.blocks?.some((block) => block.text?.trim())
  );
}

export default function RefundContent({ data }) {
  const blocks = data?.blocks?.filter((block) => block.text?.trim()) ?? [];

  return (
    <>
      {blocks.map((block) => (
        <div className="info-block" key={block.label}>
          <div className="info-k">{block.label}</div>
          <div className="info-v">{block.text}</div>
        </div>
      ))}
    </>
  );
}
