var zetta = require('zetta');
var HoneywellAlarmNet = require('../index');

zetta()
  .use(HoneywellAlarmNet)
  .listen(1337);