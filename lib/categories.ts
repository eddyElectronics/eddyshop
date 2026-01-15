import fs from 'fs';
import path from 'path';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const dataFilePath = path.join(process.cwd(), 'data', 'categories.json');

export function getCategories(): Category[] {
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch {
    return [];
  }
}

export function getCategoryById(id: string): Category | undefined {
  const categories = getCategories();
  return categories.find(cat => cat.id === id);
}

export function getCategoryByName(name: string): Category | undefined {
  const categories = getCategories();
  return categories.find(cat => cat.name === name);
}

export function getCategoryNames(): string[] {
  const categories = getCategories();
  return categories.map(cat => cat.name);
}
