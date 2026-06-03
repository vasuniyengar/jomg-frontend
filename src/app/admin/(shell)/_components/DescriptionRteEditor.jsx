"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function execOn(el, cmd, value = null) {
  if (!el) return;
  el.focus();
  document.execCommand(cmd, false, value);
}

const TOOLBAR_BUTTONS = [
  { cmd: "bold", label: "B", title: "Bold" },
  { cmd: "italic", label: "I", title: "Italic" },
  { cmd: "underline", label: "U", title: "Underline" },
  { cmd: "insertUnorderedList", label: "•≡", title: "Bullet list" },
  { cmd: "insertOrderedList", label: "1.≡", title: "Numbered list" },
];

export default function DescriptionRteEditor({
  value,
  onChange,
  placeholder = "Tell players about this event…",
  minHeight = 120,
  showExpand = true,
}) {
  const editorRef = useRef(null);
  const modalEditorRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalHtml, setModalHtml] = useState("");

  const syncFromValue = useCallback(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  useEffect(() => {
    syncFromValue();
  }, [syncFromValue]);

  const emitChange = () => {
    const html = editorRef.current?.innerHTML || "";
    onChange(html);
  };

  const openModal = () => {
    setModalHtml(value || editorRef.current?.innerHTML || "");
    setModalOpen(true);
    setTimeout(() => {
      if (modalEditorRef.current) {
        modalEditorRef.current.innerHTML = value || editorRef.current?.innerHTML || "";
      }
    }, 0);
  };

  const saveModal = () => {
    const html = modalEditorRef.current?.innerHTML || modalHtml;
    onChange(html);
    if (editorRef.current) editorRef.current.innerHTML = html;
    setModalOpen(false);
  };

  const runCmd = (cmd, targetRef = editorRef) => {
    execOn(targetRef.current, cmd);
    if (targetRef === editorRef) emitChange();
  };

  const insertLink = (targetRef = editorRef) => {
    const url = window.prompt("Link URL");
    if (url) execOn(targetRef.current, "createLink", url);
    if (targetRef === editorRef) emitChange();
  };

  const Toolbar = ({ targetRef }) => (
    <div className="rte-toolbar" style={{ flexWrap: "wrap", marginBottom: 8 }}>
      {TOOLBAR_BUTTONS.map((b) => (
        <button
          key={b.cmd}
          type="button"
          className="rte-btn"
          title={b.title}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCmd(b.cmd, targetRef)}
        >
          {b.label}
        </button>
      ))}
      <span className="rte-divider" />
      <button
        type="button"
        className="rte-btn"
        title="Insert link"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => insertLink(targetRef)}
      >
        🔗
      </button>
      <button
        type="button"
        className="rte-btn"
        title="Undo"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => runCmd("undo", targetRef)}
      >
        ↺
      </button>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {showExpand ? (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={openModal}
            style={{ marginLeft: "auto" }}
          >
            ⛶ Expand
          </button>
        ) : null}
      </div>
      <Toolbar targetRef={editorRef} />
      <div
        ref={editorRef}
        className="rte-editor form-textarea"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emitChange}
        onBlur={emitChange}
        style={{ minHeight }}
      />

      {modalOpen ? (
        <div
          className="modal-overlay"
          style={{
            display: "flex",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 400,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              maxWidth: 900,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
              }}
            >
              Edit Description
            </div>
            <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
              <Toolbar targetRef={modalEditorRef} />
              <div
                ref={modalEditorRef}
                className="rte-editor"
                contentEditable
                suppressContentEditableWarning
                style={{
                  minHeight: 280,
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "16px",
                }}
                onInput={() =>
                  setModalHtml(modalEditorRef.current?.innerHTML || "")
                }
              />
            </div>
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-md"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-md" onClick={saveModal}>
                ✓ Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
