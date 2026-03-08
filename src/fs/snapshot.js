import fs from 'node:fs/promises';
import path from 'node:path';

const snapshot = async () => {
  const workspaceRoot = path.resolve(process.cwd(), 'workspace');
  const snapshotPath = path.resolve(process.cwd(), 'snapshot.json');

  const entries = [];

  const toPosix = (p) => p.split(path.sep).join('/');

  const walk = async (dir) => {
    const dirents = await fs.readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const absolutePath = path.join(dir, dirent.name);
      const relativePath = toPosix(path.relative(workspaceRoot, absolutePath));

      if (dirent.isDirectory()) {
        entries.push({
          path: relativePath,
          type: 'directory',
        });

        await walk(absolutePath);
      } else if (dirent.isFile()) {
        const data = await fs.readFile(absolutePath);
				
        entries.push({
          path: relativePath,
          type: 'file',
          size: data.length,
          content: data.toString('base64'),
        });
      }
    }
  };

  try {
    const stats = await fs.stat(workspaceRoot);

    if (!stats.isDirectory()) {
      throw new Error('FS operation failed');
    }

    await walk(workspaceRoot);

		

    const snapshotData = {
      rootPath: workspaceRoot,
      entries,
    };

    await fs.writeFile(
      snapshotPath,
      JSON.stringify(snapshotData, null, 2),
      'utf8',
    );
  } catch {
    throw new Error('FS operation failed');
  }
};

await snapshot();
