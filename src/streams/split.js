import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const split = async () => {
	const cliArgs = process.argv.slice(2);
	const linesOption = '--lines';
	const linesIndex = cliArgs.lastIndexOf(linesOption);
	const maxLinesPerChunk =
		linesIndex !== -1 && cliArgs[linesIndex + 1]
			? Math.max(1, parseInt(cliArgs[linesIndex + 1], 10) || 10)
			: 10;

	const baseDir = process.cwd();
	const sourcePath = path.join(baseDir, 'source.txt');

	const readStream = fs.createReadStream(sourcePath);
	const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });

	let chunkIndex = 1;
	let lineBuffer = [];

	const flushChunk = () => {
		if (lineBuffer.length === 0) return Promise.resolve();
		const chunkPath = path.join(baseDir, `chunk_${chunkIndex}.txt`);
		const out = fs.createWriteStream(chunkPath);
		for (const line of lineBuffer) {
			out.write(line + '\n');
		}
		out.end();
		chunkIndex += 1;
		lineBuffer = [];
		return new Promise((resolve, reject) => {
			out.once('finish', resolve);
			out.once('error', reject);
		});
	};

	for await (const line of rl) {
		lineBuffer.push(line);
		if (lineBuffer.length >= maxLinesPerChunk) {
			await flushChunk();
		}
	}
	await flushChunk();
};

await split();
