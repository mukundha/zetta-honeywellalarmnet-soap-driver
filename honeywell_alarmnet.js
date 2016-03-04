var Device = require('zetta-device');
var util = require('util');

var HoneywellAlarmNet = module.exports = function() {
  Device.call(this);
};
util.inherits(HoneywellAlarmNet, Device);

HoneywellAlarmNet.prototype.init = function(config) {

  config
    .name('HoneywellAlarmNet')
    .type('honeywellAlarmNet')
    .state('ready');
}