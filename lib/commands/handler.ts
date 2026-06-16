import { registry } from './registry';
import { parseCommand } from './parser';
import { CommandContext, CommandResult } from './types';

export class CommandHandler {
  async handle(input: string, context: CommandContext): Promise<CommandResult> {
    const { commandName, args } = parseCommand(input);

    if (!commandName) {
      return { output: '', success: true };
    }

    const command = registry.get(commandName);
    if (!command) {
      return {
        output: `Command not found: "${commandName}". Type "help" for a list of available commands.`,
        success: false,
      };
    }

    try {
      return await command.execute(args, context);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        output: `Error executing command "${commandName}": ${errorMessage}`,
        success: false,
      };
    }
  }
}

export const commandHandler = new CommandHandler();
