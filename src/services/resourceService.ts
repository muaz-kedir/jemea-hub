import type { ClassifiedResource, ClassifiedResourceFilters } from '@/types/resources';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

export interface CreateResourcePayload {
  title: string;
  description?: string;
  placement: 'landing' | 'academic';
  college?: string;
  department?: string;
  year?: string;
  semester?: string;
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
