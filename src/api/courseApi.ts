import useAuthStore from '../store/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';

async function getAuthHeaders(isJson = true) {
  const token = useAuthStore.getState().token;
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (isJson) headers['Content-Type'] = 'application/json';
  return headers;
}

async function handleApiResponse(response: Response) {
  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    return { error: 'Invalid response from server' };
  }

  if (!response.ok) {
    return { error: data?.message || `Request failed with status ${response.status}` };
  }

  return data;
}

export async function getAllCourses() {
  const res = await fetch(`${API_BASE_URL}/api/v1/courses`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getCourseById(courseId: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function getCourseProgress(courseId: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/progress`, {
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export async function updateVideoProgress(courseId: string, lessonId: string, watchedSeconds: number) {
  const res = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/lessons/${lessonId}/progress`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ watchedSeconds }),
  });
  return handleApiResponse(res as Response);
}

export async function markLessonAsComplete(courseId: string, lessonId: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/lessons/${lessonId}/complete`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  });
  return handleApiResponse(res as Response);
}

export default {
  getAllCourses,
  getCourseById,
  getCourseProgress,
  updateVideoProgress,
  markLessonAsComplete,
};
