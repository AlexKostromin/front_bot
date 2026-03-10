import createClient from 'openapi-fetch';
import type { paths } from './schema';

const baseUrl = import.meta.env.VITE_API_URL || '';

export const apiClient = createClient<paths>({
  baseUrl,
});

// JWT Interceptor
apiClient.use({
  onRequest({ request }) {
    const token = localStorage.getItem('admin_token');
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
  onResponse({ response }) {
    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return response;
  },
});
