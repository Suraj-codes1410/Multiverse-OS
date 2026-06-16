export interface ParsedCommand {
  commandName: string;
  args: string[];
}

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  if (!trimmed) {
    return { commandName: '', args: [] };
  }

  // Parse arguments, supporting double quotes, single quotes, and space separator.
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  const matches: string[] = [];
  let match;

  while ((match = regex.exec(trimmed)) !== null) {
    if (match[1] !== undefined) {
      matches.push(match[1]);
    } else if (match[2] !== undefined) {
      matches.push(match[2]);
    } else {
      matches.push(match[0]);
    }
  }

  if (matches.length === 0) {
    return { commandName: '', args: [] };
  }

  const commandName = matches[0];
  const args = matches.slice(1);

  return { commandName, args };
}
