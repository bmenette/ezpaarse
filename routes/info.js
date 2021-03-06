// ##EZPAARSE

/*jshint maxlen: 180*/
'use strict';

var fs     = require('graceful-fs');
var path   = require('path');
var uuid   = require('uuid');
var moment = require('moment');
var pp     = require('../lib/platform-parser.js');
var config = require('../lib/config.js');

module.exports = function (app) {

  /**
   * GET route on /info/platforms
   */
  app.get('/info/platforms', function (req, res) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.status(200);

    var status  = req.param('status', null);
    var sort    = req.param('sort', null);

    var delimiter       = '';
    var platformsFolder = path.join(__dirname, '/../platforms-parsers');
    var cfgFilename     = 'manifest.json';
    var folders         = fs.readdirSync(platformsFolder);

    if (sort) {
      folders.sort();
      if (sort == 'desc') {
        folders.reverse();
      }
    }
    res.write('[');

    for (var i in folders) {
      var folder      = folders[i];
      var configFile  = path.join(platformsFolder, folder, cfgFilename);
      var pFile  = pp.getParser(folder);
      var parserFile = pFile.path;

      var configExists = fs.existsSync(configFile) && fs.statSync(configFile).isFile();
      if (configExists && parserFile !== false) {
        var config = require(configFile);
        if (!status || config.status == status) {
          var platform       = {};
          platform.longname  = config.longname;
          platform.version   = config.version;
          platform.status    = config.status;
          platform.contact   = config.contact;
          platform.describe  = config.describe;
          platform.docurl    = config.docurl;
          platform.recognize = config.recognize;
          res.write(delimiter + JSON.stringify(platform, null, 2));
          if (delimiter === '') { delimiter = ','; }
        }
      }
    }

    res.write(']');
    res.end();
  });

  /**
   * GET route on /info/rtype
   */
  app.get('/info/rtype', function (req, res) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var file = path.join(__dirname, '/../platforms-parsers/rtype.json');
    if (fs.existsSync(file)) {
      var types = require(file);
      res.status(200);
      res.write(JSON.stringify(types, null, 2));
    } else {
      res.status(404);
    }
    res.end();
  });

  /**
   * GET route on /info/config
   */
  app.get('/info/config', function (req, res) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var cfg = {};
    var fieldsToReturn = [
      'EZPAARSE_REQUIRE_AUTH',
      'EZPAARSE_IGNORED_DOMAINS'
    ];
    fieldsToReturn.forEach(function (field) {
      cfg[field] = config[field];
    });
    res.send(200, JSON.stringify(cfg, null, 2));
  });

  /**
   * GET route on /info/mime
   */
  app.get('/info/mime', function (req, res) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var file = path.join(__dirname, '/../platforms-parsers/mime.json');
    if (fs.existsSync(file)) {
      var types = require(file);
      res.status(200);
      res.write(JSON.stringify(types, null, 2));
    } else {
      res.status(404);
    }
    res.end();
  });

  /**
   * GET route on /info/rid
   */
  app.get('/info/rid', function (req, res) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var file = path.join(__dirname, '/../platforms-parsers/rid.json');
    if (fs.existsSync(file)) {
      var types = require(file);
      res.status(200);
      res.write(JSON.stringify(types, null, 2));
    } else {
      res.status(404);
    }
    res.end();
  });

  /**
   * GET route on /info/codes
   */
  app.get('/info/codes', function (req, res) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var file = path.join(__dirname, '/../statuscodes.json');
    if (fs.existsSync(file)) {
      var statusCodes = require(file);
      res.status(200);
      res.write(JSON.stringify(statusCodes, null, 2));
    } else {
      res.status(404);
    }
    res.end();
  });

  /**
   * GET route on /info/codes/:number
   */
  app.get(/\/info\/codes\/([0-9]+)$/, function (req, res) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var code = req.params[0];
    var file = path.join(__dirname, '/../statuscodes.json');
    if (fs.existsSync(file)) {
      var statusCodes = require(file);
      var status      = statusCodes[code];
      if (status) {
        res.status(200);
        res.write(JSON.stringify(status, null, 2));
      } else {
        res.status(404);
      }
    } else {
      res.status(404);
    }
    res.end();
  });

  /**
   * GET a uuid
   */
  app.get('/info/uuid', function (req, res) {
    res.header('Content-Type', 'text/plain');
    res.send(uuid.v1());
  });

  /**
   * GET route on /info/form-predefined
   */
  app.get('/info/form-predefined', function (req, res) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    var file = path.join(__dirname, '/../form-predefined.json');
    if (fs.existsSync(file)) {
      var predefined = require(file);
      res.status(200);
      res.write(JSON.stringify(predefined, null, 2));
    } else {
      res.status(404);
    }
    res.end();
  });

  /**
   * GET route on /info/usage
   */
  app.get(/\/info\/usage(?:\.(html|json))?$/, function (req, res) {
    var format    = req.params[0] || 'json';
    var usageFile = path.join(__dirname, '/../usage.json');
    var usage;
    if (!fs.existsSync(usageFile)) {
      res.send(404);
      return;
    }
    usage = require(usageFile);

    switch (format) {
    case 'json':
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.status(200);
      res.write(JSON.stringify(usage, null, 2));
      res.end();
      break;
    case 'html':
      var title = "Utilisation d'ezPAARSE";
      if (usage.general && usage.general['Job-Date-end']) {
        title += " au " + moment(usage.general['Job-Date-end']).format('DD-MM-YYYY (hh[h]mm)');
      }
      title += ' - ezPAARSE';
      // Utilisation d'ezPAARSE au 5 juin 2013 (11h25) - ezPAARSE
      res.render('usage', { usage: usage, title: title, user: req.user });
      break;
    default:
      res.send(406);
    }
  });
};