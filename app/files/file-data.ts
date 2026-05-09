import { assets, type Asset, type AssetCategory } from '../workflow-data';

export type { AssetCategory };

export type FileItem = Asset & {
  icon: string;
};

const categoryIcons: Record<AssetCategory, string> = {
  Workflow: '⚙️',
  Template: '📋',
  Context: '🗂️',
  Spec: '📄',
  Evaluation: '📊',
  Skill: '🧩'
};

export const fileItems: FileItem[] = assets.map((asset) => ({
  ...asset,
  icon: categoryIcons[asset.category]
}));
