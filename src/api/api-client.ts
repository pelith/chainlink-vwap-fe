import { env } from '@/env';
import type { ApiError } from './api.types';

/**
 * Returns the API base URL (no trailing slash), or empty string if not set.
 * Uses VITE_API_URL for client-side requests; path will be appended with /v1 prefix in apiFetch.
 */
export function getBaseUrl(): string {
	const url = env.VITE_API_URL;
	if (!url || typeof url !== 'string') return '';
	return url.replace(/\/$/, '');
}

export class ApiClientError extends Error {
	constructor(
		message: string,
		public readonly status: number,
	) {
		super(message);
		this.name = 'ApiClientError';
	}
}

type RequestInitWithBody = Omit<RequestInit, 'body'> & {
	body?: unknown;
};

/**
 * Fetch helper for /v1 API. Prepends base URL, sets JSON headers, parses error body on non-ok.
 * @param path - Path starting with /v1 (e.g. /v1/orders)
 * @param init - fetch init; body can be object (will be JSON.stringify'd) or string
 */
export async function apiFetch<T>(
	path: string,
	init?: RequestInitWithBody,
): Promise<T> {
	const base = getBaseUrl();
	const url = base ? `${base}${path}` : path;

	const headers: HeadersInit = {
		'Content-Type': 'application/json; charset=utf-8',
		...init?.headers,
	};

	let body: BodyInit | undefined;
	if (
		init?.body !== undefined &&
		typeof init.body === 'object' &&
		!(init.body instanceof FormData)
	) {
		body = JSON.stringify(init.body);
	} else {
		body = init?.body as BodyInit | undefined;
	}

	const response = await fetch(url, {
		...init,
		headers,
		body,
	});

	if (!response.ok) {
		let message = response.statusText;
		try {
			const json = (await response.json()) as ApiError;
			if (typeof json?.error === 'string') message = json.error;
		} catch {
			// ignore parse error
		}
		throw new ApiClientError(message, response.status);
	}

	return response.json() as Promise<T>;
}
