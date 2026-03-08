import fs from 'node:fs/promises';
import path from 'node:path';

const findByExt = async () => {
	let targetExt = '.txt';
	const optionName = '--ext';
	const cliArgs = process.argv.slice(2);
	const optionIndex = cliArgs.lastIndexOf(optionName);
	if (optionIndex !== -1 && cliArgs[optionIndex + 1]) {
		targetExt = cliArgs[optionIndex + 1];
	}
	const normalizedExt = targetExt.startsWith('.') ? targetExt : `.${targetExt}`;

	const workspaceRoot = path.resolve(process.cwd(), 'workspace');

  const entries = [];

  const toPosix = (p) => p.split(path.sep).join('/');

  const walk = async (dir) => {
    const dirents = await fs.readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const absolutePath = path.join(dir, dirent.name);
      const relativePath = toPosix(path.relative(workspaceRoot, absolutePath));

      if (dirent.isDirectory()) {
  
        await walk(absolutePath);
      } else if (dirent.isFile()) {
				const ext = path.extname(relativePath);
				if (ext === normalizedExt) {
					entries.push(
					 relativePath
					);
				}
				
      }
    }
  };

  try {
    const stats = await fs.stat(workspaceRoot);

    if (!stats.isDirectory()) {
      throw new Error('FS operation failed');
    }

    await walk(workspaceRoot);

		entries.sort().forEach((entry) => console.log(entry));

  } catch {
    throw new Error('FS operation failed');
  }
};

await findByExt();
