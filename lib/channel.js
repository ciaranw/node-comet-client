var events = require('events'),
	util = require('util');
	
var Channel = function(name, client) {
	this.emitter = new events.EventEmitter();
	this.client = client;
	this.name = name;
};

Channel.prototype.subscribe = function(onMessage, onSubscribeSuccess) {
	var me = this;
	this.client.subscribe(this, function(err) {
		if(!err) {
			me.emitter.on('message', onMessage);
		} 
		onSubscribeSuccess.call(me, err);
	});
};

Channel.prototype.publish = function(message) {
	this.client.publish(this, message);
};

Channel.prototype.onMessage = function(message) {
	this.emitter.emit('message', message);
};

exports.Channel = Channel;

var ServiceChannel = function(name, client) {
	Channel.call(this, name, client);
};
util.inherits(ServiceChannel, Channel);

ServiceChannel.prototype.subscribe = function() {
	throw new Error("cannot subscribe to service channels");
};

ServiceChannel.prototype.publish = function(message, onReply) {
	var me = this;
	this.client.subscribe(this, function(err) {
		if(err) {
			reply.call(me, err);
		} else {
			me.emitter.once('message', function(reply) {
				onReply.call(me, null, reply);
			});
			me.client.publish(me, message);
		}
	});
};

exports.ServiceChannel = ServiceChannel; 

var MetaChannel = function(name, client) {
	Channel.call(this, name, client);
};
util.inherits(MetaChannel, Channel);

MetaChannel.prototype.subscribe = function() {
	throw new Error("cannot subscribe to meta channels");
};

MetaChannel.prototype.publish = ServiceChannel.prototype.publish;

exports.MetaChannel = MetaChannel;

exports.create = function(channelName, client) {
	var channelType;
	if(channelName.match(/^\/service\//)) {
		channelType = ServiceChannel;
	} else if(channelName.match(/^\/meta\//)) {
		channelType = MetaChannel;
	} else {
		channelType = Channel;
	}
	
	return new channelType(channelName, client);
};