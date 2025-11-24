export interface ClassifiedResourceFile {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  originalName: string;
  mimeType: string;
}

export interface ClassifiedResource {
  id: string;
  title: string;
  description: string;
  placement: 'landing' | 'academic';
  college: string | null;
  department: string | null;
  semester: string | null;
  course: string | null;
  tags: string[];
  postedBy: string | null;
  file: ClassifiedResourceFile;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ClassifiedResourceFilters {
  placement?: 'landing' | 'academic';
  college?: string;
  department?: string;
  semester?: string;
  course?: string;
}
