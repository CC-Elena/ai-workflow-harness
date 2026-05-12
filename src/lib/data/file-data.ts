import { assets, type Asset, type AssetCategory } from './workflow-data';

export type { AssetCategory };

export type FileItem = Asset & {
  icon: string;
};

export type FileTreeNode = {
  id: string;
  name: string;
  path: string;
  type: 'folder' | 'file';
  file?: FileItem;
  children: FileTreeNode[];
};

const categoryIcons: Record<AssetCategory, string> = {
  Workflow: '⚙️',
  Template: '📋',
  Context: '🗂️',
  Spec: '📄',
  Evaluation: '📊',
  Skill: '🧩'
};

/**
 * 文件资源集合，基于 workflow-data 注入图标信息
 */
export const fileItems: FileItem[] = assets.map((asset) => ({
  ...asset,
  icon: categoryIcons[asset.category]
}));

function sortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes
    .map((node) => ({
      ...node,
      children: sortTree(node.children)
    }))
    .sort((first, second) => {
      if (first.type !== second.type) return first.type === 'folder' ? -1 : 1;
      return first.name.localeCompare(second.name);
    });
}

/**
 * 将平铺的文件资产列表转换成层级结构的目录树
 * 
 * @param {FileItem[]} files - 平铺的文件资产集合
 * @returns {FileTreeNode[]} 生成的目录树节点
 */
export function buildFileTree(files: FileItem[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split('/');
    let level = root;
    let currentPath = '';

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isFile = index === parts.length - 1;
      let node = level.find((item) => item.name === part && item.type === (isFile ? 'file' : 'folder'));

      if (!node) {
        node = {
          id: currentPath,
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          file: isFile ? file : undefined,
          children: []
        };
        level.push(node);
      }

      level = node.children;
    });
  });

  return sortTree(root);
}
