import { optimizeImage } from 'wasm-image-optimization';
export interface Env {}

const handleRequest = async (request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> => {
	const params = new URL(request.url).searchParams;
	const url = params.get('url');
	if (!url) {
		return new Response('url is required', { status: 400 });
	}
	const width = params.get('w');
	const quality = params.get('q');
	const srcImage = await fetch(url).then((res) => res.arrayBuffer());
	const image = await optimizeImage({
		image: srcImage,
		width: width ? parseInt(width) : undefined,
		quality: quality ? parseInt(quality) : undefined,
	});
	return new Response(image, {
		headers: {
			'Content-Type': 'image/webp',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
};

export default {
	fetch: handleRequest,
};