const progress = () => {
  const cliArgs = process.argv.slice(2);

  const getOptionValue = (optionName, defaultValue) => {
    const optionIndex = cliArgs.indexOf(optionName);
    if (optionIndex === -1 || !cliArgs[optionIndex + 1]) return defaultValue;

    const value = cliArgs[optionIndex + 1];

    if (optionName === "--duration" || optionName === "--interval")
      return Number(value) || defaultValue;
    if (optionName === "--length")
      return Math.max(1, Math.floor(Number(value)) || defaultValue);
    if (optionName === "--color") return value;

    return defaultValue;
  };

  const duration = Math.max(1, getOptionValue("--duration", 5000));
  const interval = Math.max(1, getOptionValue("--interval", 100));
  const barLength = getOptionValue("--length", 30);
  const colorHex = getOptionValue("--color", null);

  const isColorValid = /^#[0-9A-Fa-f]{6}$/.test(colorHex);
  const colorEscape =
    isColorValid && colorHex
      ? `\x1b[38;2;${parseInt(colorHex.slice(1, 3), 16)};${parseInt(colorHex.slice(3, 5), 16)};${parseInt(colorHex.slice(5, 7), 16)}m`
      : "";
  const styleReset = "\x1b[0m";

  const startTime = Date.now();
  const timerId = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const percent = Math.min(100, (elapsed / duration) * 100);
    const filledCount = Math.round((percent / 100) * barLength);
    const emptyCount = barLength - filledCount;
    const filledSegment = "█".repeat(filledCount);
    const filledDisplay = colorEscape
      ? colorEscape + filledSegment + styleReset
      : filledSegment;
    const bar = `[${filledDisplay}${" ".repeat(emptyCount)}] ${Math.round(percent)}%`;
    process.stdout.write("\r" + bar);
    if (percent >= 100) {
      clearInterval(timerId);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
