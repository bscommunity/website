import { AngularAppEngine, createRequestHandler } from "@angular/ssr";

const angularAppEngine = new AngularAppEngine();

export async function netlifyAppEngineHandler(
	request: Request,
): Promise<Response> {
	const pathname = new URL(request.url).pathname;

	if (pathname === "/download") {
		return Response.redirect(
			"https://github.com/bscommunity/android/releases/latest/download/app-release.apk",
			302,
		);
	}

	const result = await angularAppEngine.handle(request);

	return result ?? new Response("Not found", {
		status: 404,
	});
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createRequestHandler(netlifyAppEngineHandler);
