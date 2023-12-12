# cloudflare-workers-image-optimization

Deploy the following code to Cloudflare Workers to receive requests for next/image in Next.js

```ts
import { optimizeImage } from 'wasm-image-optimization';
export interface Env {}

const handleRequest = async (request: Request, _env: Env, ctx: ExecutionContext): Promise<Response> => {
	const cache = caches.default;
	const cachedResponse = await cache.match(request);
	if (cachedResponse) {
		return cachedResponse;
	}

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
	const response = new Response(image, {
		headers: {
			'Content-Type': 'image/webp',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
	ctx.waitUntil(cache.put(request, response.clone()));
	return response;
};

export default {
	fetch: handleRequest,
};
```

## Deploy

```sh
wrangler deploy
```

## Setting of Next.js

To direct Next.js image optimization requests to Cloudflare Workers, set the following

- next.config.js

```js
/**
 * @type { import("next").NextConfig}
 */
const config = {
	images: {
		path: 'https://xxx.yyy.workers.dev/',
	},
};
export default config;
```
