var zetta = require('zetta');
var HoneywellAlarmNet = require('../index');

var soapURL = process.env.HONEYWELL_ALARMNET_SOAP_URL;
var userName = process.env.HONEYWELL_ALARMNET_USERNAME;
var password = process.env.HONEYWELL_ALARMNET_PASSWORD;

zetta()
  .use(HoneywellAlarmNet, soapURL, userName, password)
  .link('http://honeywell.zettaapi.org')
  .listen(1350);