export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://si-pendaftaran-delima-backend-production.up.railway.app';

if (typeof window !== 'undefined') {
  console.log('[Config] API_URL:', API_URL);
}
