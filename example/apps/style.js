var extend = require('node.extend');
var util = require('util');

var IMAGE_URL_ROOT = 'http://www.zettaapi.org/icons/';
var IMAGE_EXTENSION = '.png';

var foo = function(f) {console.log(f);}

var imageForTypeState = function(type, state) {
  return IMAGE_URL_ROOT + type + '-' + state + IMAGE_EXTENSION;
}

module.exports = function(server) {
  var securitySystemType = 'security-system'
  var securitySystemQuery = server.where({ type: securitySystemType });
  server.observe([securitySystemQuery], function(securitySystem){
    var stateStream = securitySystem.createReadStream('state'); 

    // add property to track style
    securitySystem.style = {};
    stateStream.on('data', function(newState) {
      if (newState.data != 'arming' || newState.data != 'disarming' ) {
        securitySystem.style = extend(
          securitySystem.style, 
          {stateImage: imageForTypeState(securitySystemType, newState.data)}
        );
      }
    });
  });
};
