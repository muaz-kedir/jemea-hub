import type { ClassifiedResource, ClassifiedResourceFilters } from '@/types/resources';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

const toQueryString = (filters: ClassifiedResourceFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, String(value));
    }
  });

  return params.toString();
};

const parseResource = (raw: any): ClassifiedResource => {
  const parseTimestamp = (timestamp: any): string | null => {
    if (!timestamp) return null;

    if (typeof timestamp === 'string') return timestamp;

    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toISOString();
    }

    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toISOString();
    }

    return null;
  };

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    placement: raw.placement,
    college: raw.college || null,
    department: raw.department || null,
    year: raw.year || null,
    semester: raw.semester || null,
    course: raw.course || null,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    postedBy: raw.postedBy || null,
    file: raw.file,
    createdAt: parseTimestamp(raw.createdAt),
    updatedAt: parseTimestamp(raw.updatedAt),
  };
};

export const fetchResources = async (filters: ClassifiedResourceFilters = {}): Promise<ClassifiedResource[]> => {
  const query = toQueryString(filters);
  const response = await fetch(`${API_URL}/api/resources${query ? `?${query}` : ''}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch resources');
  }

  const data = await response.json();
  return Array.isArray(data.data) ? data.data.map(parseResource) : [];
};

export const getResourceById = async (id: string): Promise<ClassifiedResource> => {
  const response = await fetch(`${API_URL}/api/resources/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch resource');
  }

  const data = await response.json();
  return parseResource(data.data);
};

export interface ResourceAIData {
  resourceId: string;
  placement: string | null;
  college: string | null;
  department: string | null;
  year: string | null;
  semester: string | null;
  course: string | null;
  summaryShort?: string;
  summaryLong?: string;
  flashcards?: Flashcard[];
  mindmapJson?: unknown;
  mindmapSvgUrl?: string | null;
  quiz?: unknown;
  audioUrl?: string | null;
  audioStatus?: string | null;
  videoUrl?: string | null;
  videoStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const parseTimestamp = (timestamp: any): string | null => {
  if (!timestamp) return null;

  if (typeof timestamp === 'string') return timestamp;

  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }

  if (timestamp._seconds) {
    return new Date(timestamp._seconds * 1000).toISOString();
  }

  return null;
};

export const getResourceAIData = async (id: string): Promise<ResourceAIData | null> => {
  const response = await fetch(`${API_URL}/api/resources/${id}/ai`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch AI data');
  }

  const data = await response.json();
  if (!data?.data) return null;

  return {
    ...data.data,
    resourceId: data.data.resourceId ?? id,
    createdAt: parseTimestamp(data.data.createdAt),
    updatedAt: parseTimestamp(data.data.updatedAt),
    flashcards: Array.isArray(data.data.flashcards)
      ? (data.data.flashcards as Array<{ id?: string; front?: string; back?: string }> )
          .map((card, index) => {
            const front = card?.front?.trim?.() ?? '';
            const back = card?.back?.trim?.() ?? '';
            if (!front || !back) return null;
            return {
              id: card?.id ? String(card.id) : `fc-${index + 1}`,
              front,
              back,
            } as Flashcard;
          })
          .filter(Boolean) as Flashcard[]
      : undefined,
  } as ResourceAIData;
};

export const generateResourceSummary = async (id: string) => {
  const response = await fetch(`${API_URL}/api/resources/${id}/ai/summary`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate summary');
  }

  const data = await response.json();
  return data.data as { summaryShort: string; summaryLong: string };
};

export const generateResourceFlashcards = async (id: string) => {
  const response = await fetch(`${API_URL}/api/resources/${id}/ai/flashcards`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to generate flashcards');
  }

  const data = await response.json();
  return (data.data?.flashcards ?? []) as Flashcard[];
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatWithResource = async (
  id: string,
  question: string,
  chatHistory: ChatMessage[] = []
): Promise<{ answer: string; resourceTitle: string }> => {
  const response = await fetch(`${API_URL}/api/resources/${id}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, chatHistory }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to get response');
  }

  const data = await response.json();
  return data.data as { answer: string; resourceTitle: string };
};

export interface CreateResourcePayload {
  title: string;
  description?: string;
  placement: 'landing' | 'academic';
  college?: string;
  department?: string;
  year?: string;
  semester?: string;
  course?: string;
  tags?: string[];
  file: File;
  postedBy?: string | null;
}

export const createResource = async (payload: CreateResourcePayload): Promise<ClassifiedResource> => {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('placement', payload.placement);
  formData.append('file', payload.file);

  if (payload.description) formData.append('description', payload.description);
  if (payload.postedBy) formData.append('postedBy', payload.postedBy);

  if (payload.placement === 'academic') {
    if (payload.college) formData.append('college', payload.college);
    if (payload.department) formData.append('department', payload.department);
    if (payload.year) formData.append('year', payload.year);
    if (payload.semester) formData.append('semester', payload.semester);
    if (payload.course) formData.append('course', payload.course);
  }

  if (payload.tags?.length) {
    payload.tags.forEach((tag) => formData.append('tags', tag));
  }

  const response = await fetch(`${API_URL}/api/resources`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create resource');
  }

  const data = await response.json();
  return parseResource(data.data);
};

export const deleteResource = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/resources/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to delete resource');
  }
};
