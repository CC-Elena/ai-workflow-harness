'use client';

import { useEffect, useMemo, useState } from 'react';

import { assets, pilots, planTasks, stages, type AssetCategory, type StageStatus } from '../../lib/data/workflow-data';
import qualitySnapshot from '../../lib/data/quality-metrics.generated.json';

type RunDraft = {
  featureName: string;
  owner: string;
  status: string;
  notes: string;
  verificationSummary: string;
};

type MvpMetric = {
  label: string;
  value: string;
  detail: string;
};

const initialDraft: RunDraft = {
  featureName: 'ai-run-record-entry',
  owner: 'Codex',
  status: 'Success',
  notes: '完成 PRD、Spec、Tasks、Run Record 的文档链路验证。',
  verificationSummary: 'Build passed; screenshot verification pending for UI changes.'
};

const completedTasks = planTasks.filter((task) => task.status === 'Done').length;
const completedPilots = pilots.filter((pilot) => pilot.status === 'Done').length;
const latestTask = planTasks.at(-1);

const mvpMetrics: MvpMetric[] = [
  {
    label: 'Development plan',
    value: `${completedTasks}/${planTasks.length}`,
    detail: '所有 MVP 工作流资产任务已完成'
  },
  {
    label: 'Real pilots',
    value: `${completedPilots}/${pilots.length}`,
    detail: 'P1、P2、P3 均已完成闭环记录'
  },
  {
    label: 'Open candidates',
    value: '0',
    detail: 'MCP 已排除，不计入剩余任务'
  },
  {
    label: 'Latest pilot',
    value: latestTask?.id ?? 'N/A',
    detail: latestTask?.title ?? '暂无最近任务'
  }
];

type QualitySummaryKey = keyof typeof qualitySnapshot.summary;

const qualityMetricKeys: QualitySummaryKey[] = [
  'workflowAdoptionRate',
  'aiAssistedDiffShare',
  'aiCodeRetention30d',
  'firstPassCiRate',
  'evidenceCompletenessRate',
  'scopeDriftRate',
  'largeManualReworkRate',
  'postMergeDefectRate'
];

const statusClass = (status: string) => (status === 'N/A' ? 'na' : status.toLowerCase());

const statusLabel: Record<StageStatus, string> = {
  ready: 'Ready',
  active: 'Active',
  pending: 'Pending'
};

/**
 * 工作流数据看板主组件 (WorkflowWorkspace)
 * 
 * 负责在首页展示 AI Agent 的所有工作流数据、资产分类、Pilot 清单和 MVP 完成概览。
 * 该组件在前端基于预定义的数据进行统计和渲染，是项目的核心入口大盘。
 * 
 * @returns {JSX.Element} 数据大盘可视化页面
 */
export default function WorkflowWorkspace() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [draft, setDraft] = useState<RunDraft>(initialDraft);
  const [savedAt, setSavedAt] = useState('');

  useEffect(() => {
    const raw = window.localStorage.getItem('ai-workflow-run-draft');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<RunDraft>;
      setDraft({
        ...initialDraft,
        ...parsed,
        verificationSummary: parsed.verificationSummary ?? initialDraft.verificationSummary
      });
    } catch {
      window.localStorage.removeItem('ai-workflow-run-draft');
    }
  }, []);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        asset.title.toLowerCase().includes(normalizedQuery) ||
        asset.path.toLowerCase().includes(normalizedQuery) ||
        asset.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  const completion = Math.round((stages.filter((stage) => stage.status === 'ready').length / stages.length) * 100);

  const saveDraft = () => {
    window.localStorage.setItem('ai-workflow-run-draft', JSON.stringify(draft));
    setSavedAt(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
  };

  const resetDraft = () => {
    window.localStorage.removeItem('ai-workflow-run-draft');
    setDraft(initialDraft);
    setSavedAt('');
  };

  return (
    <main className="page-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Repository-native AI workflow</p>
          <h1>AI Workflow Harness</h1>
          <p className="hero-text">
            把仓库内的 Spec、Prompt、Skills、上下文索引和执行记录串成一个可审查、可复盘的研发工作流。
          </p>
        </div>
        <div className="hero-panel" aria-label="Workflow health">
          <span className="metric-label">MVP readiness</span>
          <strong>{completion}%</strong>
          <div className="progress-track">
            <span style={{ width: `${completion}%` }} />
          </div>
          <p>工作流资产、真实试点和验证记录已收口。</p>
        </div>
      </section>

      <section className="section-block" aria-labelledby="workflow-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Flow</p>
            <h2 id="workflow-title">工作流阶段</h2>
          </div>
          <span className="section-count">{stages.length} stages</span>
        </div>
        <div className="stage-grid">
          {stages.map((stage, index) => (
            <article className="stage-card" key={stage.id}>
              <div className="stage-topline">
                <span className="stage-index">{String(index + 1).padStart(2, '0')}</span>
                <span className={`status-pill ${stage.status}`}>{statusLabel[stage.status]}</span>
              </div>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
              <small>{stage.output}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block" aria-labelledby="mvp-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MVP Status</p>
            <h2 id="mvp-title">任务完成概览</h2>
          </div>
          <span className="section-count">all done</span>
        </div>
        <div className="mvp-grid">
          {mvpMetrics.map((metric) => (
            <article className="mvp-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block" aria-labelledby="quality-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">AI Quality Metrics</p>
            <h2 id="quality-title">质量指标看板</h2>
          </div>
          <span className="section-count">{qualitySnapshot.runs.length} runs</span>
        </div>
        <div className="quality-grid">
          {qualityMetricKeys.map((key) => {
            const metric = qualitySnapshot.summary[key];

            return (
              <article className="quality-card" key={key}>
                <div className="quality-card-top">
                  <span>{metric.label}</span>
                  <b className={`quality-state ${statusClass(metric.status)}`}>{metric.status}</b>
                </div>
                <strong>{metric.display}</strong>
                <p>{metric.reason || `${metric.numerator ?? 0}/${metric.denominator ?? 0} from ${metric.source}`}</p>
              </article>
            );
          })}
        </div>
        <p className="quality-note">
          Snapshot {qualitySnapshot.generatedAt.slice(0, 10)} · warnings {qualitySnapshot.warnings.length}
        </p>
      </section>

      <section className="workspace-grid">
        <div className="section-block" aria-labelledby="assets-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Assets</p>
              <h2 id="assets-title">仓库资产检索</h2>
            </div>
            <span className="section-count">{filteredAssets.length} files</span>
          </div>

          <div className="toolbar">
            <label className="search-box">
              <span>Search</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="输入 spec、prompt、context..."
              />
            </label>
            <div className="segments" aria-label="Asset category">
              {(['All', 'Workflow', 'Template', 'Context', 'Spec', 'Evaluation', 'Skill'] as const).map((category) => (
                <button
                  type="button"
                  key={category}
                  className={selectedCategory === category ? 'selected' : ''}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="asset-list">
            {filteredAssets.map((asset) => (
              <article className="asset-row" key={asset.path}>
                <div>
                  <span>{asset.category}</span>
                  <h3>{asset.title}</h3>
                  <p>{asset.description}</p>
                </div>
                <code>{asset.path}</code>
              </article>
            ))}
          </div>
        </div>

        <aside className="section-block record-panel" aria-labelledby="record-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Run Record</p>
              <h2 id="record-title">执行记录草稿</h2>
            </div>
          </div>

          <label>
            <span>需求名称</span>
            <input
              value={draft.featureName}
              onChange={(event) => setDraft({ ...draft, featureName: event.target.value })}
            />
          </label>
          <label>
            <span>负责人</span>
            <input value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value })} />
          </label>
          <label>
            <span>状态</span>
            <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
              <option>Success</option>
              <option>Partial</option>
              <option>Failed</option>
            </select>
          </label>
          <label>
            <span>执行摘要</span>
            <textarea
              value={draft.notes}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
              rows={5}
            />
          </label>
          <label>
            <span>验证摘要</span>
            <textarea
              value={draft.verificationSummary}
              onChange={(event) => setDraft({ ...draft, verificationSummary: event.target.value })}
              rows={4}
            />
          </label>

          <div className="button-row">
            <button type="button" className="primary-button" onClick={saveDraft}>
              保存草稿
            </button>
            <button type="button" className="secondary-button" onClick={resetDraft}>
              重置
            </button>
          </div>
          <p className="save-state">{savedAt ? `已保存于 ${savedAt}` : '草稿保存在当前浏览器。'}</p>
        </aside>
      </section>
    </main>
  );
}
