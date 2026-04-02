export class HttpError extends Error {
  responseJSON: unknown;
  status: number;

  constructor(status: number, responseJSON: unknown) {
    super(`HTTP Error ${status}`);
    this.status = status;
    this.responseJSON = responseJSON;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let responseJSON: unknown;
    try {
      responseJSON = await response.json();
    } catch {
      responseJSON = null;
    }
    throw new HttpError(response.status, responseJSON);
  }
  return response.json() as Promise<T>;
}

export async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new HttpError(response.status, null);
  }
  return response.arrayBuffer();
}

export async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return handleResponse<T>(response);
}

export async function sendFile<T>(url: string, file: File): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: file,
  });
  return handleResponse<T>(response);
}

export async function sendJSON<T>(url: string, data: object): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
}
