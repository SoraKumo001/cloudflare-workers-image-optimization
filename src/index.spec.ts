import { beforeAllAsync } from 'jest-async';
import { unstable_dev } from 'wrangler';

const images = ['test01.png', 'test02.jpg', 'test03.avif', 'test04.gif'];
const imageUrl = (image: string) =>
	`https://raw.githubusercontent.com/SoraKumo001/cloudflare-workers-image-optimization/master/images/${image}`;

describe('Wrangler', () => {
	const property = beforeAllAsync(async () => {
		const worker = await unstable_dev('./src/index.ts', {
			experimental: { disableExperimentalWarning: true },
			ip: '127.0.0.1',
		});
		const time = Date.now();
		return { worker, time };
	});

	afterAll(async () => {
		const { worker } = await property;
		await worker.stop();
	});

	test('GET /', async () => {
		const { worker } = await property;
		const res = await worker.fetch('/');
		expect(res.status).toBe(400);
		expect(await res.text()).toBe('url is required');
	});
	test('not found', async () => {
		const { worker, time } = await property;
		for (let i = 0; i < images.length; i++) {
			const url = imageUrl('_' + images[i]);
			const res = await worker.fetch(`/?url=${encodeURI(url)}&t=${time}`, { headers: { accept: 'image/webp,image/jpeg,image/png' } });
			expect(res.status).toBe(404);
		}
	});
	test('webp', async () => {
		const { worker, time } = await property;
		const types = ['webp', 'webp', 'webp', 'gif'];
		for (let i = 0; i < images.length; i++) {
			const url = imageUrl(images[i]);
			const res = await worker.fetch(`/?url=${encodeURI(url)}&t=${time}`, { headers: { accept: 'image/webp,image/jpeg,image/png' } });
			expect(res.status).toBe(200);
			expect(Object.fromEntries(res.headers.entries())).toMatchObject({ 'content-type': `image/${types[i]}` });
			expect(res.headers.get('cf-cache-status')).toBeNull();
		}
	});
	test('webp(cache)', async () => {
		const { worker, time } = await property;
		const types = ['webp', 'webp', 'webp', 'gif'];
		for (let i = 0; i < images.length; i++) {
			const url = imageUrl(images[i]);
			const res = await worker.fetch(`/?url=${encodeURI(url)}&t=${time}`, { headers: { accept: 'image/webp,image/jpeg,image/png' } });
			expect(res.status).toBe(200);
			expect(Object.fromEntries(res.headers.entries())).toMatchObject({ 'content-type': `image/${types[i]}`, 'cf-cache-status': 'HIT' });
		}
	});
	test('not webp', async () => {
		const { worker, time } = await property;
		const types = ['png', 'jpeg', 'png', 'gif'];
		for (let i = 0; i < images.length; i++) {
			const url = imageUrl(images[i]);
			const res = await worker.fetch(`/?url=${encodeURI(url)}&t=${time}`, { headers: { accept: 'image/jpeg,image/png' } });
			expect(res.status).toBe(200);
			expect(Object.fromEntries(res.headers.entries())).toMatchObject({ 'content-type': `image/${types[i]}` });
			expect(res.headers.get('cf-cache-status')).toBeNull();
		}
	});
	test('not webp(cache)', async () => {
		const { worker, time } = await property;
		await new Promise((resolve) => setTimeout(resolve, 100));
		const types = ['png', 'jpeg', 'png', 'gif'];
		for (let i = 0; i < images.length; i++) {
			const url = imageUrl(images[i]);
			const res = await worker.fetch(`/?url=${encodeURI(url)}&t=${time}`, { headers: { accept: 'image/jpeg,image/png' } });
			expect(res.status).toBe(200);
			expect(Object.fromEntries(res.headers.entries())).toMatchObject({
				'content-type': `image/${types[i]}`,
				'cf-cache-status': 'HIT',
			});
		}
	});
});
