var Scout = require('zetta-scout');
var util = require('util');
var HoneywellAlarmNet = require('./honeywell_alarmnet');

var HoneywellAlarmNetScout = module.exports = function() {
  Scout.call(this);
  this.soapURL = arguments[0];
  this.userName = arguments[1];
  this.password = arguments[2];
  this.applicationId = arguments[3];
  this.applicationVersion = arguments[4]
};
util.inherits(HoneywellAlarmNetScout, Scout);

HoneywellAlarmNetScout.prototype.init = function(next) {

  var self = this;
  
  var query = this.server.where({type: 'security'});
  this.server.find(query, function(err, results) {
    if (results[0]) {
      self.provision(results[0], HoneywellAlarmNet, self.soapURL, self.userName, self.password, self.applicationId, self.applicationVersion);
    } else {
      self.discover(HoneywellAlarmNet, self.soapURL, self.userName, self.password, self.applicationId, self.applicationVersion);
    }
  });

  next();

};
