#!/usr/bin/env node
const csvtojson = require('csvtojson');
const fs = require('fs');
const urllib = require('urllib');
const prettyjson = require('prettyjson');
const conf = require('./configManager.js');

const app = {
  teisUrl: conf.getConf().api.baseUrl + '/events',
  fixedProps: ['program', 'orgUnit', 'eventDate', 'status', 'storedBy']
}

/**
* Post events.
*/
app.postEvents = function(events) {
  var data = app.getEvents(events);
  console.log(JSON.stringify(data));
}

/**
* Returns an array of events.
*/
app.getEvents = function(events) {
  var payload = {
    events: []
  };

  for (var i=0; i<events.length; i++) {
    var evt = events[i];

    var obj = {
      coordinate: {},
      dataValues: []
    };

    Object.keys(evt).forEach(function(key,inx) {

      if (!evt[key] || evt[key] == '') {
        return;
      }

      if (app.fixedProps.indexOf(key) != -1) {
        obj[key] = evt[key];
      }
      else if ('longitude' == key) {
        obj.coordinate.longitude = evt[key];
      }
      else if ('latitude' == key) {
        obj.coordinate.latitude = evt[key];
      }
      else if (conf.isUid(key)) {
        var dv = {
          dataElement: key,
          value: evt[key]
        };

        obj.dataValues.push(dv);
      }
    });

    payload.events.push(obj);
  }

  return payload;
}

/**
* Runs command.
*/
app.run = function() {
  if (!conf.isArg('file')) {
    return console.log('Usage: node post_events --file <name-of-input-csv-file>');
  }

    console.log('Using file: ' + conf.getArgs()['file']);
    console.log('Parsing CSV file..');

  conf.convertCsvToJson(app.postEvents);
}

app.run();
