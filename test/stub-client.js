var EventEmitter = require('events').EventEmitter,
	util = require('util');
	
var StubClient = function() {
	EventEmitter.call(this);
};
util.inherits(StubClient, EventEmitter);

StubClient.prototype.subscribe = function(channel, cb) {
	process.nextTick(function() {
		cb(null);
	});
};

StubClient.prototype.publish = function(channel, message) {
	var me = this;
	process.nextTick(function() {
		var event = 'publish-' + channel.name;
		me.emit(event, null, message);
	});
};

module.exports = StubClient;