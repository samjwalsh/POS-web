import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return new Response("POS-web Online");
};