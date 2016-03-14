var Scout = require('zetta-scout');
var util = require('util');
var HoneywellAlarmNet = require('./honeywell_alarmnet');

var HoneywellAlarmNetScout = module.exports = function() {
  Scout.call(this);
  this.soapURL = arguments[0];  
};
util.inherits(HoneywellAlarmNetScout, Scout);

HoneywellAlarmNetScout.prototype.init = function(next) {

  var self = this;  
  var query = this.server.where({type: 'security-system'});
  this.server.find(query, function(err, results) {
    if (results[0]) {
      self.provision(results[0], HoneywellAlarmNet, self.soapURL);
    } else {
      self.discover(HoneywellAlarmNet, self.soapURL);
    }
  });

  next();

};
