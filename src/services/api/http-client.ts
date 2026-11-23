const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://dummyjson.com";

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) { super(message); this.name = "ApiError"; }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try { response = await fetch(`${API_BASE_URL}${path}`, { signal, headers: { Accept: "application/json" } }); }
  catch { throw new ApiError("We couldn't connect. Check your connection and try again."); }
  if (!response.ok) throw new ApiError("Something went wrong while loading products.", response.status);
  try { return await response.json() as T; }
  catch { throw new ApiError("The product service returned an unexpected response.", response.status); }
}
