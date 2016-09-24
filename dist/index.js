'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ALIAS_KEY = '@@aliases';

var AliasSystem = function () {
  function AliasSystem() {
    _classCallCheck(this, AliasSystem);

    this.aliases = JSON.parse(localStorage.getItem(ALIAS_KEY)) || {};
  }

  _createClass(AliasSystem, [{
    key: 'find',
    value: function find(alias) {
      var key = Object.keys(this.aliases).find(function (a) {
        return a === alias;
      });

      return key ? this.aliases[key] : undefined;
    }
  }, {
    key: 'all',
    value: function all() {
      return Object.keys(this.aliases);
    }
  }, {
    key: 'register',
    value: function register(alias, realCommand) {
      if (this.aliases[alias] === undefined) {
        this.aliases[alias] = realCommand;
        this.persist();
        return true;
      }

      return false;
    }
  }, {
    key: 'unregister',
    value: function unregister(alias) {
      delete this.aliases[alias];
      this.persist();
    }
  }, {
    key: 'persist',
    value: function persist() {
      localStorage.setItem(ALIAS_KEY, JSON.stringify(this.aliases));
    }
  }]);

  return AliasSystem;
}();

exports.default = function (robot) {

  var aliases = new AliasSystem();

  robot.listen(/^(.*)$/, {
    description: 'Alias system',
    usage: '<alias>',
    args: {
      alias: function alias() {
        return aliases.all();
      }
    }
  }, function (_ref) {
    var matches = _ref.matches;
    var alias = matches.alias;

    var result = /([a-zA-Z0-9_]*) ?(.*)?/.exec(alias);

    var command = result[1];
    var args = result[2];

    alias = aliases.find(command);

    if (alias) {
      robot.execute([alias, args].filter(function (x) {
        return !!x;
      }).join(' '));
    }
  });

  robot.listen(/^alias ([a-zA-Z0-9_]*) (.*)$/, {
    description: 'Register an alias',
    usage: 'alias <alias> <command>'
  }, function (_ref2) {
    var matches = _ref2.matches;
    var alias = matches.alias;
    var command = matches.command;


    var persisted = aliases.register(alias, command);

    if (persisted) {
      robot.notify('created alias \'' + alias + '\' for \'' + command + '\'');
    } else {
      robot.notify('alias \'' + alias + '\' already taken, remove it first to overwrite');
    }
  });

  robot.listen(/^remove alias ([a-zA-Z0-9_]*)$/, {
    description: 'Unregisters an alias',
    usage: 'remove alias <alias>',
    args: {
      alias: function alias() {
        return aliases.all();
      }
    }
  }, function (_ref3) {
    var matches = _ref3.matches;
    var alias = matches.alias;


    aliases.unregister(alias);
    robot.notify('unregistered alias \'' + alias + '\'');
  });
};