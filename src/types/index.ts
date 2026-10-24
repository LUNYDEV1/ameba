export interface Message {
  id: string;
  chatId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  model: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessagePreview?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  updatedAt?: string;
  providerId?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  contextWindow: string;
  speed: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'ameba-1.2-flash',
    name: 'AMEBA 1.2 FLASH',
    tagline: 'Быстрый и универсальный',
    description: 'Основная скоростная модель AMEBA для анализа, кода и текстовых задач',
    badge: 'Основная',
    contextWindow: '1M токенов',
    speed: 'Сверхбыстрый',
  },
];

export interface StarterPrompt {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  category: 'code' | 'analysis' | 'writing' | 'creative';
}

export const STARTER_PROMPTS: StarterPrompt[] = [
  {
    id: '1',
    title: 'Написать алгоритм поиска',
    subtitle: 'TypeScript с типизацией и тестами',
    prompt: 'Напиши эффективный алгоритм поиска кратчайшего пути на TypeScript (алгоритм Дейкстры или A*), с чистой типизацией и объяснением временной сложности O(V + E log V).',
    category: 'code',
  },
  {
    id: '2',
    title: 'Проанализировать архитектуру данных',
    subtitle: 'Плюсы и минусы Firestore vs SQL',
    prompt: 'Сравни архитектуру документов Firebase Firestore с реляционной базой данных PostgreSQL для высоконагруженного чат-приложения. Разбери ограничения по чтению/записи и структуру коллекций.',
    category: 'analysis',
  },
  {
    id: '3',
    title: 'Отредактировать текст письма',
    subtitle: 'Деловой тон, сжатый стиль',
    prompt: 'Помоги составить лаконичное деловое письмо партнёрам о запуске новой версии ИИ сервиса AMEBA. Сфокусируйся на минимализме, надежности и конфиденциальности данных.',
    category: 'writing',
  },
  {
    id: '4',
    title: 'Разработать системный промпт',
    subtitle: 'Для точного следования инструкциям',
    prompt: 'Создай качественный системный промпт для ИИ-ассистента техподдержки, который строго соблюдает правила безопасности, никогда не выходит из роли и форматирует код в читаемые блоки.',
    category: 'creative',
  },
];
