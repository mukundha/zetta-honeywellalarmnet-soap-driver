var Scout = require('zetta-scout');
var util = require('util');
var HoneywellAlarmNet = require('./honeywell_alarmnet');

var HoneywellAlarmNetScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(HoneywellAlarmNetScout, Scout);

HoneywellAlarmNetScout.prototype.init = function(next) {
  next();
};
