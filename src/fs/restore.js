import fs from 'node:fs/promises';
import path from 'node:path';

const restore = async () => {
	const snapshotPath = path.resolve(process.cwd(), 'snapshot.json');
	const restoreRoot = path.resolve(process.cwd(), 'workspace_restored');

	try {
		await fs.stat(restoreRoot);
		throw new Error('FS operation failed');
	} catch (err) {
		if (err.message === 'FS operation failed') throw err;
	}

	let snapshot;
	try {
		const data = await fs.readFile(snapshotPath, 'utf8');
		snapshot = JSON.parse(data);
	} catch {
		throw new Error('FS operation failed');
	}

	const { entries = [] } = snapshot;

	await fs.mkdir(restoreRoot, { recursive: true });

	for (const entry of entries) {
		const targetPath = path.join(restoreRoot, entry.path);

		if (entry.type === 'directory') {
			await fs.mkdir(targetPath, { recursive: true });
		} else if (entry.type === 'file' && entry.content != null) {
			const parentDir = path.dirname(targetPath);
			await fs.mkdir(parentDir, { recursive: true });
			const buffer = Buffer.from(entry.content, 'base64');
			await fs.writeFile(targetPath, buffer);
		}
	}
};

await restore();
