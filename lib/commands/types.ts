export interface CommandContext {
  clearTerminal: () => void;
  navigate?: (path: string) => void;
}

export interface CommandResult {
  output: string | string[];
  success: boolean;
}

export interface Command {
  name: string;
  aliases: string[];
  description: string;
  execute(args: string[], context: CommandContext): Promise<CommandResult> | CommandResult;
}
