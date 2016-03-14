var Device = require('zetta-device');
var util = require('util');
var soap = require('soap');

var HoneywellAlarmNet = module.exports = function(soapURL) {
  Device.call(this);
  this._panelFullStatusByDeviceIDResult = {};
  
  this._soapURL = soapURL;
  this._soapClient = null;
    
  this._validSession = false;
  this._sessionID = null;
  this._lastUpdatedTimestampTicks = this._ticks(); //GMT Timestamp represented in ticks
};
util.inherits(HoneywellAlarmNet, Device);

// TODO: check the actual status of the panel then set current state
HoneywellAlarmNet.prototype.init = function(config) {
  var params = [{name:'params',type:'object'}]
  //{session_id:,application_id,location_id,device_id,application_version:}
  config
    .name('HoneywellAlarmNet')
    .type('security-system')
    .state('disarmed')
    .when('disarmed', {allow: ['arm-stay', 'arm-away']})
    .when('armed-stay', {allow: ['disarm']})
    .when('armed-away', {allow: ['disarm']})
    .when('arming', {allow: []})
    .map('arm-stay', this.armStay,params)
    .map('arm-away', this.armAway,params)
    .map('disarm', this.disarm,params);
    
  var self = this;
  soap.createClient(this._soapURL, function(err, client) {
    if (err) {
      self._soapClient = null;
      return;
    }
    self._soapClient = client;
    console.log('client.describe: ' + util.inspect(client.describe()));
    //self._authenticateUser()
  });
};
  
HoneywellAlarmNet.prototype.armStay = function(params,cb) {
  var input = JSON.parse(params)
  var self = this;
  this.state = 'arming';
  cb();
  this._soapClient.ArmSecuritySystem({
    SessionID: input.session_id,
    LocationID: input.location_id,
    DeviceID: input.device_id,
    ArmType: input.arm_type,
    UserCode: input.user_code
  }, function(err, result, raw, soapHeader) {
    // TODO: handle err
    self._checkSecurityPanelLastCommandState({nextState: 'armed-stay', callback: cb, params:input});
  });
  
}

HoneywellAlarmNet.prototype.armAway = function(params,cb) {
  var self = this;
  var input = JSON.parse(params)
  console.log(params)
  this.state = 'arming';
  cb();

  this._soapClient.ArmSecuritySystem({
    SessionID: input.session_id,
    LocationID: input.location_id,
    DeviceID: input.device_id,
    ArmType: input.arm_type,
    UserCode: input.user_code
  }, function(err, result, raw, soapHeader) {
    // TODO: handle err
      self._checkSecurityPanelLastCommandState({nextState: 'armed-away', callback: cb, params:input});
  });
  
}

HoneywellAlarmNet.prototype.disarm = function(params,cb) {
  var self = this;
  var input = JSON.parse(params)
  this.state = 'disarming';
  cb();
  
  this._soapClient.DisarmSecuritySystem({
    SessionID: input.session_id,
    LocationID: input.location_id,
    DeviceID: input.device_id,    
    UserCode: input.user_code
  }, function(err, result, raw, soapHeader) {
    // TODO: handle err
    self._checkSecurityPanelLastCommandState({nextState: 'disarmed', callback: cb, params:input});
  });

}

HoneywellAlarmNet.prototype._checkSecurityPanelLastCommandState = function(arg) {
  var self = this;    
  this._soapClient.CheckSecurityPanelLastCommandState({
    SessionID: arg.params.session_id,
    LocationID: arg.params.location_id,
    DeviceID: arg.params.device_id,
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


HoneywellAlarmNet.prototype._ticks = function() {
  var currentTime = new Date().getTime();

  // 10,000 ticks in 1 millisecond
  // jsTicks is number of ticks from midnight Jan 1, 1970
  var jsTicks = currentTime * 10000;

  // add 621355968000000000 to jsTicks
  // netTicks is number of ticks from midnight Jan 1, 01 CE
  return jsTicks + 621355968000000000;
}