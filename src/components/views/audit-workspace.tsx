'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import AuditEvidenceViewer, { type EvidenceViewerState } from './audit-evidence-viewer';

import type {
  AuditRun,
  ChangedFile,
  EvidenceStatus,
  ReconciliationEntry,
  ReviewDecision,
  ReviewRecord,
  RiskLevel,
  VerificationClaim
} from '../../lib/data/audit-types';

const riskLabel: Record<RiskLevel, string> = {
  red: '待重点审查',
  amber: '需留意',
  green: '可快速放行'
};

const evidenceMeta: Record<EvidenceStatus, { label: string; className: string }> = {
  proven: { label: '有证据', className: 'ev-proven' },
  gap: { label: '缺证据', className: 'ev-gap' },
  skipped: { label: '已跳过', className: 'ev-skipped' },
  failed: { label: '失败', className: 'ev-failed' }
};

const scopeMeta: Record<ChangedFile['scope'], { label: string; className: string }> = {
  in: { label: '范围内', className: 'scope-in' },
  declared: { label: '已声明', className: 'scope-declared' },
  out: { label: '范围外', className: 'scope-out' }
};

const decisionLabel: Record<ReviewDecision, string> = {
  approved: '批准边界',
  changes: '要求补证据',
  rejected: '打回'
};

/** 从一段文本中提取反引号包裹的证据路径。 */
function extractEvidencePaths(text: string): string[] {
  const paths: string[] = [];
  const pattern = /`([^`]+)`/g;
  let match = pattern.exec(text);
  while (match) {
    const value = match[1].trim();
    if (value && !/^(n\/a|none|无|-)$/i.test(value)) paths.push(value);
    match = pattern.exec(text);
  }
  return paths;
}

function RiskDot({ level }: { level: RiskLevel }) {
  return <span className={`risk-dot risk-${level}`} aria-label={riskLabel[level]} title={riskLabel[level]} />;
}

function FleetRow({
  run,
  active,
  onSelect
}: {
  run: AuditRun;
  active: boolean;
  onSelect: () => void;
}) {
  const { signals } = run;
  return (
    <button type="button" className={`fleet-row ${active ? 'active' : ''}`} onClick={onSelect}>
      <div className="fleet-row-top">
        <RiskDot level={signals.riskLevel} />
        <span className="fleet-title">{run.title}</span>
      </div>
      <div className="fleet-metrics">
        <span className={`fleet-metric ${signals.evidenceGap > 0 ? 'bad' : ''}`}>
          证据 {signals.evidenceProven}/{signals.evidenceTotal}
        </span>
        <span className={`fleet-metric ${signals.outOfScopeCount > 0 ? 'warn' : ''}`}>
          {signals.outOfScopeCount > 0 ? `范围外 ${signals.outOfScopeCount}` : '范围一致'}
        </span>
        <span className={`fleet-metric ${signals.humanConfirmed ? '' : 'warn'}`}>
          {signals.humanConfirmed ? '已确认' : '未确认'}
        </span>
      </div>
    </button>
  );
}

function EvidenceMatrix({
  claims,
  onOpenEvidence
}: {
  claims: VerificationClaim[];
  onOpenEvidence: (path: string) => void;
}) {
  if (claims.length === 0) {
    return <p className="packet-empty">该记录未填写验证项。</p>;
  }

  return (
    <ul className="evidence-list">
      {claims.map((claim, index) => {
        const meta = evidenceMeta[claim.status];
        const paths = extractEvidencePaths(`${claim.evidence} ${claim.method}`);
        const fallback = claim.evidence || claim.method || claim.note || '—';
        return (
          <li key={`${claim.item}-${index}`} className={`evidence-item ${meta.className}`}>
            <div className="evidence-head">
              <span className="evidence-item-name">{claim.item || '未命名验证项'}</span>
              <span className={`evidence-badge ${meta.className}`}>{meta.label}</span>
            </div>
            {claim.status === 'gap' ? (
              <p className="evidence-proof">缺少命令或证据文件，需补充。</p>
            ) : paths.length > 0 ? (
              <div className="evidence-chips">
                {paths.map((filePath) => (
                  <button
                    key={filePath}
                    type="button"
                    className="evidence-chip"
                    onClick={() => onOpenEvidence(filePath)}
                    title={`查看 ${filePath}`}
                  >
                    {filePath.split('/').pop()}
                  </button>
                ))}
              </div>
            ) : (
              <p className="evidence-proof">{fallback}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ImpactMap({
  files,
  onOpenEvidence
}: {
  files: ChangedFile[];
  onOpenEvidence: (path: string) => void;
}) {
  if (files.length === 0) {
    return <p className="packet-empty">未记录改动文件。</p>;
  }

  return (
    <ul className="impact-list">
      {files.map((file) => {
        const meta = scopeMeta[file.scope];
        const viewable = file.path.startsWith('specs/');
        return (
          <li key={file.path} className={`impact-item ${meta.className}`}>
            <span className={`scope-tag ${meta.className}`}>{meta.label}</span>
            {viewable ? (
              <button
                type="button"
                className="impact-path impact-path-link"
                onClick={() => onOpenEvidence(file.path)}
                title={`查看 ${file.path}`}
              >
                {file.path}
              </button>
            ) : (
              <span className="impact-path">{file.path}</span>
            )}
            {(file.reason || file.note) && (
              <span className="impact-note">{file.reason || file.note}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ReviewPacket({ run }: { run: AuditRun }) {
  const [decision, setDecision] = useState<ReviewDecision | ''>(run.review?.decision ?? '');
  const [reviewer, setReviewer] = useState(run.review?.reviewer ?? '');
  const [note, setNote] = useState(run.review?.note && run.review.note !== '无' ? run.review.note : '');
  const [saved, setSaved] = useState<ReviewRecord | undefined>(run.review);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [viewer, setViewer] = useState<EvidenceViewerState>({ status: 'idle' });
  const { signals } = run;

  useEffect(() => {
    setDecision(run.review?.decision ?? '');
    setReviewer(run.review?.reviewer ?? '');
    setNote(run.review?.note && run.review.note !== '无' ? run.review.note : '');
    setSaved(run.review);
    setSaveError('');
    setViewer({ status: 'idle' });
  }, [run.feature, run.review]);

  const sortedRisks = useMemo(() => {
    const weight = { high: 0, medium: 1, low: 2 } as const;
    return [...run.risks].sort((a, b) => weight[a.severity] - weight[b.severity]);
  }, [run.risks]);

  const openEvidence = useCallback(async (filePath: string) => {
    setViewer({ status: 'loading', path: filePath });
    try {
      const response = await fetch(`/api/audit/evidence?path=${encodeURIComponent(filePath)}`);
      if (!response.ok) throw new Error('读取失败');
      const data = await response.json();
      if (data.kind === 'text') {
        setViewer({ status: 'text', path: filePath, content: data.content, size: data.size });
      } else if (data.kind === 'image') {
        setViewer({ status: 'image', path: filePath });
      } else {
        setViewer({ status: 'unsupported', path: filePath });
      }
    } catch (error) {
      setViewer({ status: 'error', path: filePath, message: error instanceof Error ? error.message : '读取失败' });
    }
  }, []);

  const submitReview = useCallback(async () => {
    if (!decision) return;
    setSaving(true);
    setSaveError('');
    try {
      const response = await fetch('/api/audit/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature: run.feature, decision, reviewer, note })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? '回写失败');
      setSaved(data.review as ReviewRecord);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : '回写失败');
    } finally {
      setSaving(false);
    }
  }, [decision, note, reviewer, run.feature]);

  return (
    <section className="packet">
      <header className="packet-header">
        <div>
          <div className="packet-title-row">
            <RiskDot level={signals.riskLevel} />
            <h2>{run.title}</h2>
            <span className={`status-chip status-${signals.riskLevel}`}>{run.status}</span>
          </div>
          <p className="packet-meta">
            {run.tool} · {run.owner} · {run.date || '未标注日期'} · {run.feature}
          </p>
        </div>
        <span className={`risk-banner risk-${signals.riskLevel}`}>{riskLabel[signals.riskLevel]}</span>
      </header>

      {run.summary && <p className="packet-summary">{run.summary}</p>}

      <div className="packet-signals">
        <div className={`signal-card ${signals.evidenceGap > 0 ? 'bad' : 'ok'}`}>
          <span className="signal-value">
            {signals.evidenceProven}/{signals.evidenceTotal}
          </span>
          <span className="signal-label">主张有证据</span>
        </div>
        <div className={`signal-card ${signals.evidenceGap > 0 ? 'bad' : 'ok'}`}>
          <span className="signal-value">{signals.evidenceGap}</span>
          <span className="signal-label">证据缺口</span>
        </div>
        <div className={`signal-card ${signals.outOfScopeCount > 0 ? 'warn' : 'ok'}`}>
          <span className="signal-value">{signals.outOfScopeCount}</span>
          <span className="signal-label">范围外改动</span>
        </div>
        <div className={`signal-card ${signals.humanConfirmed ? 'ok' : 'warn'}`}>
          <span className="signal-value">{signals.humanConfirmed ? '是' : '否'}</span>
          <span className="signal-label">人工确认</span>
        </div>
      </div>

      <div className="packet-grid">
        <div className="packet-panel">
          <h3>影响面地图</h3>
          <ImpactMap files={run.changedFiles} onOpenEvidence={openEvidence} />
        </div>
        <div className="packet-panel">
          <h3>风险与未决项</h3>
          {sortedRisks.length === 0 ? (
            <p className="packet-empty">未发现证据缺口、范围外改动或失败项。</p>
          ) : (
            <ul className="risk-list">
              {sortedRisks.map((risk, index) => (
                <li key={`${risk.label}-${index}`} className={`risk-item sev-${risk.severity}`}>
                  <span className={`sev-tag sev-${risk.severity}`}>{risk.severity}</span>
                  <span className="risk-text">{risk.label}</span>
                  <span className="risk-source">{risk.source}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="packet-panel">
        <h3>证据矩阵 · 主张 ↔ 证据</h3>
        <EvidenceMatrix claims={run.claims} onOpenEvidence={openEvidence} />
      </div>

      <AuditEvidenceViewer state={viewer} onClose={() => setViewer({ status: 'idle' })} />

      {run.interventions.length > 0 && (
        <div className="packet-panel">
          <h3>人工介入</h3>
          <ul className="intervention-list">
            {run.interventions.map((item, index) => (
              <li key={`${item.type}-${index}`}>
                <span className="intervention-type">{item.type}</span>
                <span className="intervention-detail">{item.detail}</span>
                {item.reason && <span className="intervention-reason">{item.reason}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="packet-panel review-panel">
        <h3>审查决定</h3>
        {saved && (
          <p className={`review-saved decision-${saved.decision}`}>
            已回写：<strong>{decisionLabel[saved.decision]}</strong> · {saved.reviewer} ·{' '}
            {new Date(saved.time).toLocaleString('zh-CN')}
            {saved.note && saved.note !== '无' ? ` · ${saved.note}` : ''}
          </p>
        )}
        <div className="review-buttons">
          <button
            type="button"
            className={`review-btn approve ${decision === 'approved' ? 'active' : ''}`}
            onClick={() => setDecision('approved')}
          >
            批准边界
          </button>
          <button
            type="button"
            className={`review-btn changes ${decision === 'changes' ? 'active' : ''}`}
            onClick={() => setDecision('changes')}
          >
            要求补证据
          </button>
          <button
            type="button"
            className={`review-btn reject ${decision === 'rejected' ? 'active' : ''}`}
            onClick={() => setDecision('rejected')}
          >
            打回
          </button>
        </div>
        <div className="review-form">
          <input
            className="review-input"
            type="text"
            placeholder="审查人（选填）"
            value={reviewer}
            onChange={(event) => setReviewer(event.target.value)}
          />
          <input
            className="review-input review-input-wide"
            type="text"
            placeholder="审查备注（选填）"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <button type="button" className="review-submit" onClick={submitReview} disabled={!decision || saving}>
            {saving ? '回写中…' : '回写到 Run Record'}
          </button>
        </div>
        {saveError && <p className="evidence-viewer-error">{saveError}</p>}
      </div>
    </section>
  );
}

/**
 * AI 交付审计台主组件 (AuditWorkspace)
 *
 * 左侧为按风险优先排序的分诊列表，右侧为选中 Run 的 Review Packet 判断页，
 * 用证据矩阵、影响面地图和风险清单，把人类审查 AI 改动的成本降到最低。
 *
 * @param {{ runs: AuditRun[]; reconciliation: ReconciliationEntry[] }} props - 审计模型列表与工作区实时对账
 * @returns {JSX.Element} 审计台可视化页面
 */
export default function AuditWorkspace({
  runs,
  reconciliation
}: {
  runs: AuditRun[];
  reconciliation: ReconciliationEntry[];
}) {
  const [activeFeature, setActiveFeature] = useState(runs[0]?.feature ?? '');

  const activeRun = useMemo(
    () => runs.find((run) => run.feature === activeFeature) ?? runs[0],
    [runs, activeFeature]
  );

  const counts = useMemo(() => {
    return runs.reduce(
      (acc, run) => {
        acc[run.signals.riskLevel] += 1;
        acc.gaps += run.signals.evidenceGap;
        acc.outOfScope += run.signals.outOfScopeCount;
        return acc;
      },
      { red: 0, amber: 0, green: 0, gaps: 0, outOfScope: 0 }
    );
  }, [runs]);

  const undisclosed = useMemo(
    () => reconciliation.filter((entry) => !entry.covered),
    [reconciliation]
  );

  if (runs.length === 0) {
    return (
      <main className="page-shell">
        <p className="packet-empty">未找到任何 run-record，无法生成审计视图。</p>
      </main>
    );
  }

  return (
    <main className="page-shell audit-shell">
      <header className="audit-hero">
        <div>
          <h1>AI 交付审计台</h1>
          <p>按风险优先排序，让人类先看最可能出问题的 AI 改动，把审查成本降到最低。</p>
        </div>
        <div className="audit-summary">
          <span className="summary-pill red">重点 {counts.red}</span>
          <span className="summary-pill amber">留意 {counts.amber}</span>
          <span className="summary-pill green">放行 {counts.green}</span>
          <span className="summary-pill flat">证据缺口 {counts.gaps}</span>
          <span className="summary-pill flat">范围外 {counts.outOfScope}</span>
        </div>
      </header>

      {reconciliation.length > 0 && (
        <section className={`reconcile ${undisclosed.length > 0 ? 'has-drift' : ''}`}>
          <div className="reconcile-head">
            <span className="reconcile-title">
              工作区实时 Diff 对账 · {reconciliation.length} 个未提交改动
            </span>
            <span className={`reconcile-badge ${undisclosed.length > 0 ? 'bad' : 'ok'}`}>
              {undisclosed.length > 0 ? `${undisclosed.length} 个未披露漂移` : '全部已被 Run 覆盖'}
            </span>
          </div>
          <ul className="reconcile-list">
            {reconciliation.map((entry) => (
              <li key={entry.path} className={`reconcile-item ${entry.covered ? 'covered' : 'drift'}`}>
                <span className="reconcile-flag">{entry.covered ? '已披露' : '未披露'}</span>
                <span className="reconcile-path">{entry.path}</span>
                {entry.covered && <span className="reconcile-owner">{entry.coveredBy.join(', ')}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="audit-layout">
        <aside className="fleet">
          <div className="fleet-head">分诊列表 · {runs.length} 个 Run</div>
          {runs.map((run) => (
            <FleetRow
              key={run.feature}
              run={run}
              active={run.feature === activeRun?.feature}
              onSelect={() => setActiveFeature(run.feature)}
            />
          ))}
        </aside>
        {activeRun && <ReviewPacket key={activeRun.feature} run={activeRun} />}
      </div>
    </main>
  );
}
