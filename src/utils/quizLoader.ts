import { parseMarkdown } from './markdownParser';
import type { QuizBank } from '../types/quiz';

export async function loadQuizBanks(): Promise<QuizBank[]> {
  try {
    const quizBanks: QuizBank[] = [];
    
    // 使用 Vite 的 import.meta.glob 动态导入所有题库文件，包括子文件夹
    const quizFiles = import.meta.glob('/quizbanks/**/*.md', { as: 'raw', eager: true });
    
    for (const [path, content] of Object.entries(quizFiles)) {
      // 从路径中提取分类和文件名
      const pathParts = path.split('/');
      const fileName = pathParts.pop()?.replace('.md', '') || '';
      const category = pathParts.length > 2 ? pathParts[2] : '未分类';  // quizbanks/category/file.md
      
      const quizBank = parseMarkdown(content as string);
      quizBank.title = fileName;
      quizBank.category = category;
      quizBanks.push(quizBank);
    }
    
    return quizBanks;
  } catch (error) {
    console.error('Failed to load quiz banks:', error);
    return [];
  }
}