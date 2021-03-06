'use strict';

var fs          = require('graceful-fs');
var path        = require('path');
var express     = require('express');
var nodemailer  = require('nodemailer');
var portscanner = require('portscanner');
var request     = require('request');
var config      = require('../lib/config.js');

module.exports = function (app) {

  if (config.EZPAARSE_HTTP_PROXY) {
    request.defaults({ proxy: config.EZPAARSE_HTTP_PROXY });
  }

  var canSendMail = config.EZPAARSE_ADMIN_MAIL &&
                    config.EZPAARSE_FEEDBACK_RECIPIENTS &&
                    config.EZPAARSE_SMTP_SERVER &&
                    config.EZPAARSE_SMTP_SERVER.port &&
                    config.EZPAARSE_SMTP_SERVER.host;
  var smtpTransport;
  if (canSendMail) {
    smtpTransport = nodemailer.createTransport('SMTP', {
      host: config.EZPAARSE_SMTP_SERVER.host,
      port: config.EZPAARSE_SMTP_SERVER.port
    });
  }

  /**
   * Send a mail using mail settings
   * Require sender, receiver(s), and a smtp server
   */
  function sendFeedback(req, res) {
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    var feedback = req.body;

    if (!feedback || !feedback.note) {
      res.send(400);
      return;
    }

    var username;
    if (feedback.username) {
      username = feedback.username;
    } else if (req.user) {
      username = req.user.username;
    }

    var subject = '[ezPAARSE] Feedback ';
    subject += username ? 'de ' + username : 'anonyme';
    var text = "Utilisateur : " + (username ? username : "non connecté");
    if (feedback.browser) {
      if (feedback.browser.userAgent) { text += '\nNavigateur : ' + feedback.browser.userAgent; }
      if (feedback.browser.platform)  { text += '\nPlateforme : ' + feedback.browser.platform; }
    }
    text += "\n===============================\n\n";
    text += feedback.note;


    var mailOptions = {
      from: config.EZPAARSE_ADMIN_MAIL,
      to: config.EZPAARSE_FEEDBACK_RECIPIENTS,
      subject: subject,
      text: text,
      attachments: []
    };

    if (feedback.img) {
      mailOptions.attachments.push({
        fileName: "screenshot.png",
        contents: new Buffer(feedback.img.replace(/^data:image\/png;base64,/, ""), "Base64")
      });
    }

    if (feedback.report) {
      mailOptions.attachments.push({
        fileName: "report.json",
        contents: feedback.report
      });
    } else if (req.cookies && req.cookies.lastJob) {
      var jobID      = req.cookies.lastJob;
      var reportFile = path.join(__dirname, '/../tmp/jobs/',
        jobID.charAt(0),
        jobID.charAt(1),
        jobID,
        'report.json');
      if (fs.existsSync(reportFile)) {
        mailOptions.attachments.push({
          fileName: "report.json",
          contents: fs.readFileSync(reportFile)
        });
      }
    }

    // send mail with defined transport object
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
        res.send(500);
      } else {
        console.log("Message sent: " + response.message);
        res.send(201, {});
      }
    });
  }

  /**
   * Forward feedback request to the main ezpaarse instance
   */
  function forwardFeedback(req, res) {
    if (req.cookies && req.cookies.lastJob) {
      var jobID      = req.cookies.lastJob;
      var reportFile = path.join(__dirname, '/../tmp/jobs/',
        jobID.charAt(0),
        jobID.charAt(1),
        jobID,
        'report.json');
      if (fs.existsSync(reportFile)) {
        req.body.report = fs.readFileSync(reportFile).toString();
      }
    }

    if (config.EZPAARSE_PARENT_URL) {
      if (req.user) {
        req.body.username = req.user.username;
      }

      request({
        uri: config.EZPAARSE_PARENT_URL + '/feedback',
        method: 'POST',
        json: req.body
      }).on('error', function () {
        res.send(500);
      }).pipe(res);
    } else {
      res.send(500);
    }
  }

  /**
   * POST route on /feedback
   * To submit a feedback
   */
  app.post('/feedback', express.bodyParser(), canSendMail ? sendFeedback : forwardFeedback);

  /**
   * GET route on /feedback/status
   * To know if sending a feedback is possible
   */
  app.get('/feedback/status', function (req, res) {
    if (canSendMail) {
      var port = config.EZPAARSE_SMTP_SERVER.port;
      var host = config.EZPAARSE_SMTP_SERVER.host;

      portscanner.checkPortStatus(port, host, function (err, status) {
        res.send((!err && status == 'open') ? 200 : 501);
      });
    } else if (config.EZPAARSE_PARENT_URL) {
      request.get(config.EZPAARSE_PARENT_URL + '/feedback/status', function (err, response) {
        if (err || !response || response.statusCode != 200) {
          res.send(501);
        } else {
          res.send(200);
        }
      });
    } else {
      res.send(501);
    }
  });
};
