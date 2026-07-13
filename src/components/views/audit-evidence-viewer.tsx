'use client';

export type EvidenceViewerState =
  | { status: 'idle' }
  | { status: 'loading'; path: string }
  | { status: 'text'; path: string; content: string; size: number }
  | { status: 'image'; path: string }
  | { status: 'unsupported'; path: string }
  | { status: 'error'; path: string; message: string };

/** Audit 证据内容查看器。 */
export default function AuditEvidenceViewer({
  state,
  onClose
}: {
  state: EvidenceViewerState;
  onClose: () => void;
}) {
  if (state.status === 'idle') return null;

  return (
    <div className="packet-panel evidence-viewer">
      <div className="evidence-viewer-head">
        <h3>证据查看器</h3>
        <code className="evidence-viewer-path">{state.path}</code>
        <button type="button" className="evidence-viewer-close" onClick={onClose} aria-label="关闭证据查看器">
          ✕
        </button>
      </div>
      {state.status === 'loading' && <p className="packet-empty">正在读取证据…</p>}
      {state.status === 'error' && <p className="evidence-viewer-error">{state.message}</p>}
      {state.status === 'unsupported' && (
        <p className="packet-empty">该文件类型暂不支持预览，请在编辑器中打开。</p>
      )}
      {state.status === 'image' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="evidence-image"
          src={`/api/audit/evidence?path=${encodeURIComponent(state.path)}&raw=1`}
          alt={state.path}
        />
      )}
      {state.status === 'text' && (
        <>
          <div className="file-preview-meta">{state.size.toLocaleString()} bytes</div>
          <pre className="file-content evidence-content">
            <code>{state.content}</code>
          </pre>
        </>
      )}
    </div>
  );
}
