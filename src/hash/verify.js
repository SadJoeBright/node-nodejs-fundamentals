import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const verify = async () => {
	const checksumsPath = path.resolve(process.cwd(), 'checksums.json');

	let checksums;
	try {
		const data = await fs.promises.readFile(checksumsPath, 'utf8');
		checksums = JSON.parse(data);
		console.log(checksums)
	} catch {
		throw new Error('FS operation failed');
	}

	const baseDir = process.cwd();

	const getFileHash = (filePath) =>
		new Promise((resolve, reject) => {
			const hash = crypto.createHash('sha256');
			const stream = fs.createReadStream(filePath);
			stream.on('data', (chunk) => hash.update(chunk));
			stream.on('end', () => resolve(hash.digest('hex')));
			stream.on('error', reject);
		});

	for (const [filename, expectedHex] of Object.entries(checksums)) {
		const filePath = path.join(baseDir, filename);
		let actualHex;
		try {
			actualHex = await getFileHash(filePath);
		} catch {
			console.log(`${filename} — FAIL`);
			continue;
		}
		const result = actualHex === expectedHex ? 'OK' : 'FAIL';
		console.log(`${filename} — ${result}`);
	}
};

await verify();
