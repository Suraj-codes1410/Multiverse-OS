import { Command } from './types';
import { registry } from './registry';

export const helpCommand: Command = {
  name: 'help',
  aliases: ['h', '?', 'man'],
  description: 'Displays a list of available commands or help for a specific command.',
  execute: (args) => {
    if (args.length > 0) {
      const targetName = args[0];
      const command = registry.get(targetName);
      if (!command) {
        return {
          output: `No help entry found for: "${targetName}"`,
          success: false,
        };
      }

      const aliasesInfo = command.aliases.length > 0 
        ? ` (Aliases: ${command.aliases.join(', ')})` 
        : '';
        
      return {
        output: [
          `Command: ${command.name}${aliasesInfo}`,
          `Description: ${command.description}`
        ],
        success: true,
      };
    }

    const allCommands = registry.getAll();
    const output: string[] = [
      'Multiverse OS - Available Commands:',
      '--------------------------------------------------',
    ];

    allCommands.forEach((cmd) => {
      const aliasStr = cmd.aliases.length > 0 ? ` [${cmd.aliases.join(', ')}]` : '';
      const commandCol = `${cmd.name}${aliasStr}`.padEnd(20);
      output.push(`${commandCol} - ${cmd.description}`);
    });

    output.push('--------------------------------------------------');
    output.push('Type "help <command>" for detailed information on a specific command.');

    return {
      output,
      success: true,
    };
  },
};
