const ALIAS_KEY = '@@aliases';

class AliasSystem {
  constructor() {
    this.aliases = JSON.parse(localStorage.getItem(ALIAS_KEY)) || {};
  }

  find(alias) {
    const key = Object.keys(this.aliases).find(a => a === alias);

    return key ? this.aliases[key] : undefined;
  }

  all() {
    return Object.keys(this.aliases);
  }

  register(alias, realCommand) {
    if (this.aliases[alias] === undefined) {
      this.aliases[alias] = realCommand;
      this.persist();
      return true;
    }

    return false;
  }

  unregister(alias) {
    delete this.aliases[alias];
    this.persist();
  }

  persist() {
    localStorage.setItem(ALIAS_KEY, JSON.stringify(this.aliases));
  }
}

export default robot => {

  const aliases = new AliasSystem();

  robot.listen(/^(.*)$/, {
    description: 'Alias system',
    usage: '<alias>',
    args: {
      alias() {
        return aliases.all();
      }
    }
  }, (res) => {
    const alias = aliases.find(res.matches[1]);

    if (alias) {
      robot.execute(alias);
    }
  });

  robot.listen(/^alias ([a-zA-Z0-9_]*) (.*)$/, {
    description: 'Register an alias',
    usage: 'alias <alias> <command>'
  }, (res) => {
    const alias = res.matches[1];
    const command = res.matches[2];

    const persisted = aliases.register(alias, command);

    if (persisted) {
      robot.notify(`created alias '${alias}' for '${command}'`);
    } else {
      robot.notify(`alias '${alias}' already taken, remove it first to overwrite`);
    }
  });

  robot.listen(/^remove alias ([a-zA-Z0-9_]*)$/, {
    description: 'Unregisters an alias',
    usage: 'remove alias <alias>',
    args: {
      alias() {
        return aliases.all();
      }
    }
  }, (res) => {
    const alias = res.matches[1];

    aliases.unregister(alias);
    robot.notify(`unregistered alias '${alias}'`);
  });

}
