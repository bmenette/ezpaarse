'use strict';

/**
 * Log file cleaner
 * Takes a log file and and makes its critical data (hosts, logins) anonymous
 * @param1 log file to clean
 * @param2 destination of the clean log file
 */

exports.logAnonymizer = function () {

  var Lazy      = require('lazy');
  var Faker     = require('Faker');
  var fs        = require('graceful-fs');
  var LogParser = require('../logparser.js');

  // logger
  var logger    = require('winston');
  logger.add(logger.transports.File, { filename: __dirname + '/../../logs/loganonymizer.log' })
        .remove(logger.transports.Console); // important because it could output things on stdout !

  var brown = '\u001b[33m';   // Color brown
  var reset = '\u001b[0m';    // Color reset

  Faker.Internet.ip = function () {
    var randNum = function () {
      return (Math.random() * 254 + 1).toFixed(0);
    };

    var result = [];
    for (var i = 0; i < 4; i++) {
      result[i] = randNum();
    }

    return result.join(".");
  };

  // get the command line arguments
  var optimist = require('optimist')
      .usage('Anonymize critical data in a log file' +
        '\nUsage: $0 --input=[string] --output=[string] --proxy=[string] --format[string]')
      .alias('help', 'h')
      .alias('input', 'i')
      .alias('output', 'o')
      .alias('proxy', 'p')
      .alias('format', 'f')
      .describe('input', 'the input data to clean')
      .describe('output', 'the destination where to send the result to')
      .describe('proxy', 'the proxy which generated the log file')
      .describe('format', 'the format of log lines (ex: %h %u %t "%r")');
  var argv = optimist.argv;

  // show usage if --help option is used
  if (argv.help) {
    optimist.showHelp();
    process.exit(0);
  }

  var logParser = new LogParser(logger, argv.format, argv.proxy);

  var resultStream;
  var logStream;

  if (argv.output) {
    resultStream = fs.createWriteStream(argv.output);
  } else {
    resultStream = process.stdout;
  }
  if (argv.input) {
    logStream = fs.createReadStream(argv.input);
  } else {
    logStream = process.stdin;
  }

  var hosts          = {};
  var logins         = {};
  var fakeHostsList  = {};
  var fakeLoginsList = {};

  var lazy = new Lazy(logStream);

  lazy.lines
  .map(String)
  .forEach(function (line) {

    line = '' + line; // buffer -> string
    var ec = logParser.parse(line);
    if (ec) {
      if (ec.host) {
        var fakeHost = hosts[ec.host];
        if (!fakeHost) {
          fakeHost = Faker.Internet.ip();
          while (fakeHostsList[fakeHost]) {
            fakeHost = Faker.Internet.ip();
          }
          fakeHostsList[fakeHost] = ec.host;
          hosts[ec.host]          = fakeHost;
        }
        line = line.replace(ec.host, fakeHost);
      }
      if (ec.login) {
        var fakeLogin = logins[ec.login];
        if (!fakeLogin) {
          fakeLogin = Faker.Internet.userName().replace('\'', '').toUpperCase();
          while (fakeLoginsList[fakeLogin]) {
            fakeLogin = Faker.Internet.userName().replace('\'', '').toUpperCase();
          }
          fakeLoginsList[fakeLogin] = ec.login;
          logins[ec.login]          = fakeLogin;
        }
        line = line.replace(ec.login, fakeLogin);
      }
      resultStream.write(line + '\n');
    } else {
      console.error(brown + 'One line couldn\'t be parsed and was removed' + reset);
    }
  });
};