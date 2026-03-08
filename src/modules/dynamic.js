const dynamic = async () => {
	const pluginName = process.argv[process.argv.length - 1];
	if (!pluginName) {
		console.log('Plugin not found');
		process.exit(1);
	}

	let plugin;
	try {
		plugin = await import(`./plugins/${pluginName}.js`);
	} catch {
		console.log('Plugin not found');
		process.exit(1);
	}

	if (typeof plugin.run !== 'function') {
		console.log('Plugin not found');
		process.exit(1);
	}

	const result = plugin.run();
	console.log(result);
};

await dynamic();
