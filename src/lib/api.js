export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Non-JSON response from', url, ':', text.substring(0, 200));
    throw new Error(`Server mengembalikan respons non-JSON (status: ${response.status}). Pastikan backend berjalan dengan benar.`);
  }

  return response;
}
