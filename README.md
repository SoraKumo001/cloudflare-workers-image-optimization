# cloudflare-workers-image-optimization

Deploy the following code to Cloudflare Workers to receive requests for next/image in Next.js

```ts
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
```

## Deploy

````sh
```sh
wrangler deploy
````

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