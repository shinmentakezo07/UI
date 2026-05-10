const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function proxyToBackend(request: Request, path: string): Promise<Response> {
  const url = new URL(path, BACKEND_URL);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host") {
      headers.set(key, value);
    }
  });

  // Explicitly forward cookies if present
  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  const body = request.method !== "GET" && request.method !== "HEAD"
    ? await request.arrayBuffer()
    : undefined;

  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
      credentials: "include",
      // @ts-ignore
      duplex: "half",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Backend unreachable";
    return Response.json(
      { success: false, error: `Backend error: ${message}` },
      { status: 503 }
    );
  }
}
