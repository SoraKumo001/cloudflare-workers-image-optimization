import { unstable_dev } from 'wrangler';
import { beforeAllAsync } from 'jest-async';

describe('Wrangler', () => {
	const property = beforeAllAsync(async () => {
		const worker = await unstable_dev('./src/index.ts', {
			experimental: { disableExperimentalWarning: true },
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

	test('webp', async () => {
		const { worker, time } = await property;
		const url = 'https://raw.githubusercontent.com/node-libraries/wasm-image-optimization/master/images/test01.jpg';
		const res = await worker.fetch(`/?url=${encodeURI(url)}&t=${time}`, { headers: { accept: 'image/webp,image/jpeg,image/png' } });
		expect(res.status).toBe(200);
		expect(Object.fromEntries(res.headers.entries())).toMatchObject({ 'content-type': 'image/webp' });
		expect(res.headers.get('cf-cache-status')).toBeNull();
		console.log(Array.from(res.headers.entries()));
	});
	test('webp(cache)', async () => {
		const { worker, time } = await property;
		const url = 'https://raw.githubusercontent.com/node-libraries/wasm-image-optimization/master/images/test01.jpg';
		const res = await worker.fetch(`/?url=${encodeURI(url)}&t=${time}`, { headers: { accept: 'image/webp,image/jpeg,image/png' } });
		expect(res.status).toBe(200);
		expect(Object.fromEntries(res.headers.entries())).toMatchObject({ 'content-type': 'image/webp', 'cf-cache-status': 'HIT' });
		console.log(Array.from(res.headers.entries()));
	});
	test('jpeg', async () => {
		const { worker, time } = await property;
		const url = 'https://raw.githubusercontent.com/node-libraries/wasm-image-optimization/master/images/test01.jpg';
		const res = await worker.fetch(`/?url=${encodeURI(url)}&t=${time}`, { headers: { accept: 'image/jpeg,image/png' } });
		expect(res.status).toBe(200);
		expect(Object.fromEntries(res.headers.entries())).toMatchObject({ 'content-type': 'image/jpeg' });
		expect(res.headers.get('cf-cache-status')).toBeNull();
		console.log(Array.from(res.headers.entries()));
	});
	test('jpeg(cache)', async () => {
		const { worker, time } = await property;
		const url = 'https://raw.githubusercontent.com/node-libraries/wasm-image-optimization/master/images/test01.jpg';
		const res = await worker.fetch(`/?url=${encodeURI(url)}&t=${time}`, { headers: { accept: 'image/jpeg,image/png' } });
		expect(res.status).toBe(200);
		expect(Object.fromEntries(res.headers.entries())).toMatchObject({ 'content-type': 'image/jpeg', 'cf-cache-status': 'HIT' });
		console.log(Array.from(res.headers.entries()));
	});
});
