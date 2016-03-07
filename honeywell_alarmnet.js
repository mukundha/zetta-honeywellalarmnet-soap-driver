var Device = require('zetta-device');
var util = require('util');
var soap = require('soap');

var HoneywellAlarmNet = module.exports = function(soapURL, userName, password, applicationId, applicationVersion) {
  Device.call(this);
  this.panelFullStatusByDeviceIDResult = null;
  
  this._soapURL = soapURL;
  this._soapClient = null;
  this._userName = userName;
  this._password = password;
  this._applicationId = applicationId;
  this._applicationVersion = applicationVersion;
  
  this._validSession = false;
  this._sessionID = null;
};
util.inherits(HoneywellAlarmNet, Device);

HoneywellAlarmNet.prototype.init = function(config) {
  config
    .name('HoneywellAlarmNet')
    .type('security')
    .state('disarmed')
    .monitor('panelFullStatusByDeviceIDResult')
    .when('disarmed', {allow: ['arm-stay', 'arm-away', 'get-status']})
    .when('armed-stay', {allow: ['disarm', 'get-status']})
    .when('armed-away', {allow: ['disarm', 'get-status']})
    .map('arm-stay', this.armStay)
    .map('arm-away', this.armAway)
    .map('disarm', this.disarm)
    .map('get-status', this.getStatus);
    
  var self = this;
  soap.createClient(this._soapURL, function(err, client) {
    if (err) {
      self._soapClient = null;
      return;
    }
    self._soapClient = client;
    console.log('client.describe: ' + util.inspect(client.describe()));
    self._authenticateUser()
  });
};

HoneywellAlarmNet.prototype._authenticateUser = function() {
  var self = this;
  this._soapClient.AuthenticateUserLoginEx({
    userName: self._userName,
    password: self._password,
    ApplicationID: self._applicationId,
    ApplicationVersion: self._applicationVersion
  }, function(err, result, raw, soapHeader){
    console.log('client.AuthenticateUserLoginEx: ' + util.inspect(result));
    if (result.AuthenticateUserLoginExResult.ResultCode >=0) {
      self._validSession = true;
      self._sessionID = result.AuthenticateUserLoginExResult.SessionID;
    } else {
      self._validSession = false;
      self._sessionID = null;
    }
    console.log('self._validSession: ' + self._validSession);
    console.log('self._sessionID: ' + self._sessionID);
  });
}
  
HoneywellAlarmNet.prototype.armStay = function(cb) {
  var self = this;
  
  this._soapClient.ArmSecuritySystem({
    SessionID: this._sessionID,
    LocationID: 594619,
    DeviceID: 771327,
    ArmType: 1,
    UserCode: -1
  }, function(err, result, raw, soapHeader) {
    console.log(util.inspect(result))
  });
  
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

HoneywellAlarmNet.prototype.getStatus = function(cb) {
  var self = this;
  this._soapClient.GetPanelFullStatusByDeviceID({
    SessionID: this._sessionID,
    DeviceID: 771327,
    LastUpdatedTimestampTicks: 671000848,
    PartitionID: 1
  }, function(err, result, raw, soapHeader) {
    self.panelFullStatusByDeviceIDResult = result.GetPanelFullStatusByDeviceIDResult;
    console.log(util.inspect(result))
    cb();
  });
}