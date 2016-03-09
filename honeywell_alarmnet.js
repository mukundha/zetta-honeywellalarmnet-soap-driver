var Device = require('zetta-device');
var util = require('util');
var soap = require('soap');

var HoneywellAlarmNet = module.exports = function(soapURL, userName, password, applicationId, applicationVersion) {
  Device.call(this);
  this._panelFullStatusByDeviceIDResult = {};
  
  this._soapURL = soapURL;
  this._soapClient = null;
  this._userName = userName;
  this._password = password;
  this._applicationId = applicationId;
  this._applicationVersion = applicationVersion;
  
  this._validSession = false;
  this._sessionID = null;
  this._lastUpdatedTimestampTicks = this._ticks(); //GMT Timestamp represented in ticks
};
util.inherits(HoneywellAlarmNet, Device);

// TODO: check the actual status of the panel then set current state
HoneywellAlarmNet.prototype.init = function(config) {
  config
    .name('HoneywellAlarmNet')
    .type('security-system')
    .state('disarmed')
    .when('disarmed', {allow: ['arm-stay', 'arm-away']})
    .when('armed-stay', {allow: ['disarm']})
    .when('armed-away', {allow: ['disarm']})
    .when('arming', {allow: []})
    .map('arm-stay', this.armStay)
    .map('arm-away', this.armAway)
    .map('disarm', this.disarm);
    
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
  
HoneywellAlarmNet.prototype.armStay = function(cb) {
  var self = this;

  this.state = 'arming';
  cb();

  this._soapClient.ArmSecuritySystem({
    SessionID: this._sessionID,
    LocationID: 594619,
    DeviceID: 771327,
    ArmType: 1,
    UserCode: -1
  }, function(err, result, raw, soapHeader) {
    // TODO: handle err
    self._checkSecurityPanelLastCommandState({nextState: 'armed-stay', callback: cb});
  });
  
}

HoneywellAlarmNet.prototype.armAway = function(cb) {
  var self = this;

  this.state = 'arming';
  cb();

  this._soapClient.ArmSecuritySystem({
    SessionID: this._sessionID,
    LocationID: 594619,
    DeviceID: 771327,
    ArmType: 0,
    UserCode: -1
  }, function(err, result, raw, soapHeader) {
    // TODO: handle err
    self._checkSecurityPanelLastCommandState({nextState: 'armed-away', callback: cb});
  });
  
}

HoneywellAlarmNet.prototype.disarm = function(cb) {
  var self = this;
  
  this.state = 'disarming';
  cb();
  
  this._soapClient.DisarmSecuritySystem({
    SessionID: this._sessionID,
    LocationID: 594619,
    DeviceID: 771327,
    UserCode: -1
  }, function(err, result, raw, soapHeader) {
    // TODO: handle err
    self._checkSecurityPanelLastCommandState({nextState: 'disarmed', callback: cb});
  });

}

HoneywellAlarmNet.prototype._checkSecurityPanelLastCommandState = function(arg) {
  var self = this;
  this._soapClient.CheckSecurityPanelLastCommandState({
    SessionID: this._sessionID,
    LocationID: 594619,
    DeviceID: 771327,
    CommandCode: -1
  }, function(err, result, raw, soapHeader) {
    console.log('_checkSecurityPanelLastCommandState: ' + util.inspect(result))
    var resultCode = result.CheckSecurityPanelLastCommandStateResult.ResultCode;
    console.log('_checkSecurityPanelLastCommandState resultCode: ' + resultCode);
    if (resultCode == 0) {
      self.state = arg.nextState;
      arg.callback();
      // success
    } else {
      // TODO: handle err state and setting Zetta state
      setTimeout(self._checkSecurityPanelLastCommandState.bind(self), 250, arg);
    }
  });
}


HoneywellAlarmNet.prototype._authenticateUser = function() {
  var self = this;
  this._soapClient.AuthenticateUserLoginEx({
    userName: self._userName,
    password: self._password,
    ApplicationID: self._applicationId,
    ApplicationVersion: self._applicationVersion
  }, function(err, result, raw, soapHeader){
    // TODO: handle err
    console.log('_authenticateUser: ' + util.inspect(result));
    if (result.AuthenticateUserLoginExResult.ResultCode >=0) {
      self._validSession = true;
      self._sessionID = result.AuthenticateUserLoginExResult.SessionID;
      // setInterval(function(){self._getStatus()}, 250);
    } else {
      self._validSession = false;
      self._sessionID = null;
    }
    console.log('self._validSession: ' + self._validSession);
    console.log('self._sessionID: ' + self._sessionID);
  });
}

HoneywellAlarmNet.prototype._getStatus = function() {
  var self = this;
  this._soapClient.GetPanelFullStatusByDeviceID({
    SessionID: this._sessionID,
    DeviceID: 771327,
    LastUpdatedTimestampTicks: self._lastUpdatedTimestampTicks,
    PartitionID: 1
  }, function(err, result, raw, soapHeader) {
    console.log('client._getStatus: ' + util.inspect(result));
    self._panelFullStatusByDeviceIDResult = result.GetPanelFullStatusByDeviceIDResult;
    console.log('self._panelFullStatusByDeviceIDResult: ' + util.inspect(self._panelFullStatusByDeviceIDResult))
  });
  this._lastUpdatedTimestampTicks = this._ticks();
}

HoneywellAlarmNet.prototype._ticks = function() {
  var currentTime = new Date().getTime();

  // 10,000 ticks in 1 millisecond
  // jsTicks is number of ticks from midnight Jan 1, 1970
  var jsTicks = currentTime * 10000;

  // add 621355968000000000 to jsTicks
  // netTicks is number of ticks from midnight Jan 1, 01 CE
  return jsTicks + 621355968000000000;
}