'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { fileItems, type AssetCategory, type FileItem } from './file-data';

const STORAGE_KEY = 'ai-workflow-pinned-files';

const categories = ['All', 'Workflow', 'Template', 'Context', 'Spec', 'Evaluation', 'Skill'] as const;

function loadPinned(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function PinnedCard({ file, onUnpin }: { file: FileItem; onUnpin: () => void }) {
  return (
    <article className="pinned-card">
      <div className="pinned-card-header">
        <span className="pinned-card-icon">{file.icon}</span>
        <button
          type="button"
          className="pin-button pinned"
          onClick={onUnpin}
          aria-label={`取消置顶 ${file.title}`}
          title="取消置顶"
        >
          ★
        </button>
      </div>
      <h3 className="pinned-card-title">{file.title}</h3>
      <span className="category-badge">{file.category}</span>
      <p className="pinned-card-path">{file.path}</p>
    </article>
  );
}

function FileRow({
  file,
  isPinned,
  onTogglePin
}: {
  file: FileItem;
  isPinned: boolean;
  onTogglePin: () => void;
}) {
  return (
    <div className="file-row">
      <div className="file-row-name">
        <span className="file-row-icon">{file.icon}</span>
        <div>
          <h3>{file.title}</h3>
          <p>{file.description}</p>
        </div>
      </div>
      <span className="category-badge">{file.category}</span>
      <code className="file-row-path">{file.path}</code>
      <button
        type="button"
        className={`pin-button ${isPinned ? 'pinned' : ''}`}
        onClick={onTogglePin}
        aria-label={isPinned ? `取消置顶 ${file.title}` : `置顶 ${file.title}`}
        title={isPinned ? '取消置顶' : '置顶'}
      >
        {isPinned ? '★' : '☆'}
      </button>
    </div>
  );
}

export default function FileWorkspace() {
  const [pinnedPaths, setPinnedPaths] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPinnedPaths(loadPinned());
    setHydrated(true);
  }, []);

  const togglePin = useCallback((path: string) => {
    setPinnedPaths((prev) => {
      const next = prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const pinnedFiles = useMemo(
    () => fileItems.filter((file) => pinnedPaths.includes(file.path)),
    [pinnedPaths]
  );

  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return fileItems.filter((file) => {
      const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        file.title.toLowerCase().includes(normalizedQuery) ||
        file.path.toLowerCase().includes(normalizedQuery) ||
        file.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  return (
    <main className="page-shell">
      {/* 页面标题 */}
      <section className="files-hero">
        <div>
          <p className="eyebrow">Files</p>
          <h1>文件列表</h1>
          <p className="files-hero-sub">
            纵览代码库中的所有工作流资产文件，支持置顶高频使用的文件。
          </p>
        </div>
        <div className="files-hero-stats">
          <div className="files-stat">
            <strong>{fileItems.length}</strong>
            <span>总文件</span>
          </div>
          <div className="files-stat">
            <strong>{hydrated ? pinnedPaths.length : '–'}</strong>
            <span>已置顶</span>
          </div>
        </div>
      </section>

      {/* 置顶卡片区 */}
      {hydrated && pinnedFiles.length > 0 && (
        <section className="section-block pinned-section" aria-labelledby="pinned-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Pinned</p>
              <h2 id="pinned-title">置顶文件</h2>
            </div>
            <span className="section-count">{pinnedFiles.length} pinned</span>
          </div>
          <div className="pinned-grid">
            {pinnedFiles.map((file) => (
              <PinnedCard key={file.path} file={file} onUnpin={() => togglePin(file.path)} />
            ))}
          </div>
        </section>
      )}

      {/* 文件列表区 */}
      <section className="section-block" aria-labelledby="all-files-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">All Files</p>
            <h2 id="all-files-title">所有文件</h2>
          </div>
          <span className="section-count">{filteredFiles.length} files</span>
        </div>

        {/* 工具栏 */}
        <div className="toolbar">
          <label className="search-box">
            <span>Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索文件名、路径或描述..."
            />
          </label>
          <div className="segments" aria-label="File category">
            {categories.map((category) => (
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

        {/* 表头 */}
        <div className="file-table-header">
          <span className="file-col-name">名称</span>
          <span className="file-col-category">分类</span>
          <span className="file-col-path">路径</span>
          <span className="file-col-pin">置顶</span>
        </div>

        {/* 文件行 */}
        <div className="file-list">
          {filteredFiles.map((file) => (
            <FileRow
              key={file.path}
              file={file}
              isPinned={pinnedPaths.includes(file.path)}
              onTogglePin={() => togglePin(file.path)}
            />
          ))}
          {filteredFiles.length === 0 && (
            <p className="file-empty">没有匹配的文件。</p>
          )}
        </div>
      </section>
    </main>
  );
}
