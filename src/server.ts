import { AngularAppEngine, createRequestHandler } from '@angular/ssr'
import { getContext } from '@netlify/angular-runtime/context.mjs'

const angularAppEngine = new AngularAppEngine()

export async function netlifyAppEngineHandler(request: Request): Promise<Response> {
	const context = getContext()

	// Example API endpoints can be defined here.
	// Uncomment and define endpoints as necessary.
	// const pathname = new URL(request.url).pathname;
	// if (pathname === '/api/hello') {
	//   return Response.json({ message: 'Hello from the API' });
	// }

	const pathname = new URL(request.url).pathname;

	// Proxy para Songlink
	if (pathname === '/api/songlink') {
		const urlObj = new URL(request.url);
		const search = urlObj.searchParams.get('url');
		if (!search) {
			return Response.json({ error: 'Missing url parameter' }, { status: 400 });
		}
		try {
			const apiUrl = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(search)}`;
			const apiRes = await fetch(apiUrl);
			const data = await apiRes.json();
			return Response.json(data);
		} catch (err) {
			return Response.json({ error: 'Failed to fetch from Songlink' }, { status: 500 });
		}
	}

	if (pathname === '/download') {
		return Response.redirect("https://github.com/bscommunity/android/releases/latest/download/app-release.apk");
	}

	const result = await angularAppEngine.handle(request, context)
	return result || new Response('Not found', { status: 404 })
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler)