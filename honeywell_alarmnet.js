var Device = require('zetta-device');
var util = require('util');

var HoneywellAlarmNet = module.exports = function() {
  Device.call(this);
};
util.inherits(HoneywellAlarmNet, Device);

HoneywellAlarmNet.prototype.init = function(config) {

  config
    .name('HoneywellAlarmNet')
    .type('security')
    .state('disarmed')
    .when('disarmed', {allow: ['arm-stay', 'arm-away']})
    .when('armed-stay', {allow: ['disarm']})
    .when('armed-away', {allow: ['disarm']})
    .map('arm-stay', this.armStay)
    .map('arm-away', this.armAway)
    .map('disarm', this.disarm);
};

HoneywellAlarmNet.prototype.armStay = function(cb) {
  this.state = 'armed-stay';
  cb();
}

HoneywellAlarmNet.prototype.armAway = function(cb) {
  this.state = 'armed-away';
  cb();
}

HoneywellAlarmNet.prototype.disarm = function(cb) {
  this.state = 'disarmed';
  cb();
}