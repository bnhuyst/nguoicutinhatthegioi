import { Question } from '../types';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

const STORAGE_KEY = 'contra_trivia_questions_v2';

export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('contra_trivia_questions_v1');
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUESTIONS));
      return DEFAULT_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Smart merge: ensure all new DEFAULT_QUESTIONS are present
      const existingIds = new Set(parsed.map((q: Question) => q.id));
      const missingDefaults = DEFAULT_QUESTIONS.filter(dq => !existingIds.has(dq.id));
      if (missingDefaults.length > 0) {
        const merged = [...parsed, ...missingDefaults];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Lỗi đọc localStorage:', err);
  }
  return DEFAULT_QUESTIONS;
}

export function saveStoredQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Lỗi ghi localStorage:', err);
  }
}

export function getCategories(questions: Question[]): string[] {
  const catSet = new Set<string>();
  questions.forEach(q => {
    if (q.category && q.category.trim()) {
      catSet.add(q.category.trim());
    }
  });
  return Array.from(catSet);
}

export function resetDefaultQuestions(): Question[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUESTIONS));
  return DEFAULT_QUESTIONS;
}

export function createQuestion(newQ: Omit<Question, 'id'>): Question[] {
  const list = getStoredQuestions();
  const id = 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const created: Question = { ...newQ, id };
  const updated = [created, ...list];
  saveStoredQuestions(updated);
  return updated;
}

export function updateQuestion(id: string, updatedData: Partial<Question>): Question[] {
  const list = getStoredQuestions();
  const updated = list.map(q => (q.id === id ? { ...q, ...updatedData } : q));
  saveStoredQuestions(updated);
  return updated;
}

export function deleteQuestion(id: string): Question[] {
  const list = getStoredQuestions();
  const updated = list.filter(q => q.id !== id);
  saveStoredQuestions(updated);
  return updated;
}
