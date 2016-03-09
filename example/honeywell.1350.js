var zetta = require('zetta');
var HoneywellAlarmNet = require('../index');
var style = require('./apps/style');

var soapURL = process.env.HONEYWELL_ALARMNET_SOAP_URL;
var userName = process.env.HONEYWELL_ALARMNET_USERNAME;
var password = process.env.HONEYWELL_ALARMNET_PASSWORD;
var applicationID = process.env.HONEYWELL_ALARMNET_APPLICATION_ID;
var applicationVersion = process.env.HONEYWELL_ALARMNET_APPLICATION_VERSION;

zetta()
  .use(style)
  .use(HoneywellAlarmNet, soapURL, userName, password, applicationID, applicationVersion)
  .link('http://honeywell.zettaapi.org')
  .listen(1350);