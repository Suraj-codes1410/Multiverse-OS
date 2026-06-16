import { Command } from './types';

class CommandRegistry {
  private commands = new Map<string, Command>();
  private aliases = new Map<string, string>();

  register(command: Command): void {
    const name = command.name.toLowerCase();
    if (this.commands.has(name)) {
      throw new Error(`Command "${command.name}" is already registered.`);
    }
    
    this.commands.set(name, command);

    if (command.aliases) {
      for (const alias of command.aliases) {
        const aliasLower = alias.toLowerCase();
        if (this.commands.has(aliasLower)) {
          console.warn(`Alias "${alias}" conflicts with an existing command name.`);
          continue;
        }
        if (this.aliases.has(aliasLower)) {
          console.warn(
            `Alias "${alias}" is already registered to "${this.aliases.get(aliasLower)}". Overwriting with "${command.name}".`
          );
        }
        this.aliases.set(aliasLower, name);
      }
    }
  }

  get(nameOrAlias: string): Command | undefined {
    const key = nameOrAlias.toLowerCase();
    
    // Direct command match
    if (this.commands.has(key)) {
      return this.commands.get(key);
    }
    
    // Alias match
    const commandName = this.aliases.get(key);
    if (commandName) {
      return this.commands.get(commandName);
    }
    
    return undefined;
  }

  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  clear(): void {
    this.commands.clear();
    this.aliases.clear();
  }
}

export const registry = new CommandRegistry();
export type { CommandRegistry };
