import fs from 'node:fs/promises';
import path from 'node:path';

const merge = async () => {
	const targetExt = '.txt';
	const cliArgs = process.argv.slice(2);

	const partsRoot = path.resolve(process.cwd(), 'workspace', 'parts');
	const mergedPath = path.resolve(process.cwd(), 'workspace', 'merged.txt');

	const fileListOption = '--files';
	const filesIndex = cliArgs.lastIndexOf(fileListOption);
	let fileNames = null;
	if (filesIndex !== -1 && cliArgs[filesIndex + 1]) {
		fileNames = cliArgs[filesIndex + 1].split(',').map((s) => s.trim()).filter(Boolean);
	}

	const entries = [];

	const resolveFileName = (name) =>
		path.extname(name) === '' ? name + targetExt : name;

	const toPosix = (p) => p.split(path.sep).join('/');

  const walk = async (dir) => {
    const dirents = await fs.readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const absolutePath = path.join(dir, dirent.name);
      const relativePath = toPosix(path.relative(partsRoot, absolutePath));

			 if (dirent.isFile()) {
				const ext = path.extname(relativePath);
				if (ext === targetExt) {
					entries.push(
					 relativePath
					);
				}
				
      }
    }
  };

	try {
		const stats = await fs.stat(partsRoot);
		if (!stats.isDirectory()) {
			throw new Error('FS operation failed');
		}

		if (fileNames === null) {
			await walk(partsRoot);
			entries.sort();
			if (entries.length === 0) {
				throw new Error('FS operation failed');
			}
		} else {
			entries.push(...fileNames);
		}

		let content = '';
		for (const name of entries) {
			const resolvedName = resolveFileName(name);
			const filePath = path.join(partsRoot, resolvedName);
			content += await fs.readFile(filePath, 'utf8');
		}
		await fs.writeFile(mergedPath, content, 'utf8');
	} catch {
		throw new Error('FS operation failed');
	}
};

await merge();
