'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { buildFileTree, fileItems, type AssetCategory, type FileItem, type FileTreeNode } from './file-data';

const STORAGE_KEY = 'ai-workflow-pinned-files';

const categories = ['All', 'Workflow', 'Template', 'Context', 'Spec', 'Evaluation', 'Skill'] as const;

type FileContentState =
  | { status: 'idle'; content: ''; size: 0; error: '' }
  | { status: 'loading'; content: ''; size: 0; error: '' }
  | { status: 'success'; content: string; size: number; error: '' }
  | { status: 'error'; content: ''; size: 0; error: string };

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

function PinnedCard({
  file,
  isSelected,
  onSelect,
  onUnpin
}: {
  file: FileItem;
  isSelected: boolean;
  onSelect: () => void;
  onUnpin: () => void;
}) {
  return (
    <article className={`pinned-card ${isSelected ? 'selected' : ''}`}>
      <div className="pinned-card-header">
        <button type="button" className="pinned-card-select" onClick={onSelect}>
          <span className="pinned-card-icon">{file.icon}</span>
          <span>{file.title}</span>
        </button>
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
      <span className="category-badge">{file.category}</span>
      <p className="pinned-card-path">{file.path}</p>
    </article>
  );
}

function TreeNode({
  node,
  selectedPath,
  pinnedPaths,
  onSelectFile,
  onTogglePin
}: {
  node: FileTreeNode;
  selectedPath: string;
  pinnedPaths: string[];
  onSelectFile: (file: FileItem) => void;
  onTogglePin: (path: string) => void;
}) {
  if (node.type === 'folder') {
    return (
      <li>
        <details open className="tree-folder">
          <summary>
            <span className="tree-folder-icon">▾</span>
            <span>{node.name}</span>
          </summary>
          <ul className="tree-children">
            {node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                selectedPath={selectedPath}
                pinnedPaths={pinnedPaths}
                onSelectFile={onSelectFile}
                onTogglePin={onTogglePin}
              />
            ))}
          </ul>
        </details>
      </li>
    );
  }

  if (!node.file) return null;

  const isSelected = selectedPath === node.file.path;
  const isPinned = pinnedPaths.includes(node.file.path);

  return (
    <li>
      <div className={`tree-file ${isSelected ? 'selected' : ''}`}>
        <button type="button" onClick={() => onSelectFile(node.file as FileItem)}>
          <span>{node.file.icon}</span>
          <span>{node.name}</span>
        </button>
        <button
          type="button"
          className={`tree-pin ${isPinned ? 'pinned' : ''}`}
          onClick={() => onTogglePin(node.file?.path ?? '')}
          aria-label={isPinned ? `取消置顶 ${node.file.title}` : `置顶 ${node.file.title}`}
          title={isPinned ? '取消置顶' : '置顶'}
        >
          {isPinned ? '★' : '☆'}
        </button>
      </div>
    </li>
  );
}

function ContentPreview({ file, state }: { file?: FileItem; state: FileContentState }) {
  if (!file) {
    return (
      <section className="file-preview empty" aria-label="文件内容">
        <p>没有匹配的文件。</p>
      </section>
    );
  }

  return (
    <section className="file-preview" aria-label="文件内容">
      <div className="file-preview-header">
        <div>
          <p className="eyebrow">Preview</p>
          <h2>{file.title}</h2>
          <p>{file.description}</p>
        </div>
        <span className="category-badge">{file.category}</span>
      </div>
      <code className="file-preview-path">{file.path}</code>
      {state.status === 'loading' && <p className="file-preview-state">正在读取文件内容...</p>}
      {state.status === 'error' && <p className="file-preview-state error">{state.error}</p>}
      {state.status === 'success' && (
        <>
          <div className="file-preview-meta">{state.size.toLocaleString()} bytes</div>
          <pre className="file-content">
            <code>{state.content}</code>
          </pre>
        </>
      )}
    </section>
  );
}

export default function FileWorkspace() {
  const [pinnedPaths, setPinnedPaths] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'All'>('All');
  const [selectedPath, setSelectedPath] = useState(fileItems[0]?.path ?? '');
  const [contentState, setContentState] = useState<FileContentState>({
    status: 'idle',
    content: '',
    size: 0,
    error: ''
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPinnedPaths(loadPinned());
    setHydrated(true);
  }, []);

  const togglePin = useCallback((path: string) => {
    if (!path) return;
    setPinnedPaths((prev) => {
      const next = prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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

  const tree = useMemo(() => buildFileTree(filteredFiles), [filteredFiles]);

  const pinnedFiles = useMemo(
    () => fileItems.filter((file) => pinnedPaths.includes(file.path)),
    [pinnedPaths]
  );

  const selectedFile = useMemo(
    () => fileItems.find((file) => file.path === selectedPath),
    [selectedPath]
  );

  useEffect(() => {
    if (filteredFiles.length === 0) {
      setSelectedPath('');
      return;
    }

    if (!filteredFiles.some((file) => file.path === selectedPath)) {
      setSelectedPath(filteredFiles[0].path);
    }
  }, [filteredFiles, selectedPath]);

  useEffect(() => {
    if (!selectedPath) {
      setContentState({ status: 'idle', content: '', size: 0, error: '' });
      return;
    }

    const controller = new AbortController();
    setContentState({ status: 'loading', content: '', size: 0, error: '' });

    fetch(`/api/files/content?path=${encodeURIComponent(selectedPath)}`, {
      signal: controller.signal
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error ?? '读取文件失败');
        }
        setContentState({
          status: 'success',
          content: payload.content,
          size: payload.size,
          error: ''
        });
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setContentState({
          status: 'error',
          content: '',
          size: 0,
          error: error.message
        });
      });

    return () => controller.abort();
  }, [selectedPath]);

  return (
    <main className="page-shell">
      <section className="files-hero">
        <div>
          <p className="eyebrow">Files</p>
          <h1>文件浏览器</h1>
          <p className="files-hero-sub">
            按目录结构浏览工作流资产文件，并在右侧查看当前文件内容。
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
              <PinnedCard
                key={file.path}
                file={file}
                isSelected={selectedPath === file.path}
                onSelect={() => setSelectedPath(file.path)}
                onUnpin={() => togglePin(file.path)}
              />
            ))}
          </div>
        </section>
      )}

      <section className="section-block" aria-labelledby="all-files-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Repository Tree</p>
            <h2 id="all-files-title">文件目录</h2>
          </div>
          <span className="section-count">{filteredFiles.length} files</span>
        </div>

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

        <div className="files-browser">
          <aside className="file-tree-panel" aria-label="文件目录树">
            {tree.length > 0 ? (
              <ul className="file-tree">
                {tree.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    selectedPath={selectedPath}
                    pinnedPaths={pinnedPaths}
                    onSelectFile={(file) => setSelectedPath(file.path)}
                    onTogglePin={togglePin}
                  />
                ))}
              </ul>
            ) : (
              <p className="file-empty">没有匹配的文件。</p>
            )}
          </aside>
          <ContentPreview file={selectedFile} state={contentState} />
        </div>
      </section>
    </main>
  );
}
