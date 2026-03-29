export async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  return res.arrayBuffer();
}

export async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json() as Promise<T>;
}

export async function sendFile<T>(url: string, file: File): Promise<T> {
  const res = await fetch(url, {
    body: file,
    headers: {
      "Content-Type": "application/octet-stream",
    },
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { responseJSON: body };
  }
  return res.json() as Promise<T>;
}

export async function sendJSON<T>(url: string, data: object): Promise<T> {
  const res = await fetch(url, {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw { responseJSON: body };
  }
  return res.json() as Promise<T>;
}
