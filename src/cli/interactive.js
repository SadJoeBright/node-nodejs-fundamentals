import readline from "node:readline";

const interactive = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const goodbye = () => {
    console.log("Goodbye!");
    process.exit(0);
  };

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", (line) => {
    const cmd = line.trim().toLowerCase();

    switch (cmd) {
      case "uptime":
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        break;
      case "cwd":
        console.log(process.cwd());
        break;
      case "date":
        console.log(new Date().toISOString());
        break;
      case "exit":
        goodbye();
        return;
      case "":
        break;
      default:
        console.log("Unknown command");
    }

    rl.prompt();
  });

  rl.on("close", goodbye);
  rl.on("SIGINT", goodbye);
};

interactive();
