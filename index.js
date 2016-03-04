var Scout = require('zetta-scout');
var util = require('util');
var HoneywellAlarmNet = require('./honeywell_alarmnet');

var HoneywellAlarmNetScout = module.exports = function() {
  Scout.call(this);
};
util.inherits(HoneywellAlarmNetScout, Scout);

HoneywellAlarmNetScout.prototype.init = function(next) {

  var self = this;

  var query = this.server.where({type: 'security'});

  this.server.find(query, function(err, results) {
    if (results[0]) {
      self.provision(results[0], HoneywellAlarmNet);
    } else {
      self.discover(HoneywellAlarmNet);
    }
  });

  next();

};