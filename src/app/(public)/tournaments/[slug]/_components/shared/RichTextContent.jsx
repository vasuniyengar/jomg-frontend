import { richTextToDisplayHtml } from "@/lib/sanitizeRichText";

export default function RichTextContent({
  html,
  className = "info-v info-v-multiline",
}) {
  const safeHtml = richTextToDisplayHtml(html);
  if (!safeHtml) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
