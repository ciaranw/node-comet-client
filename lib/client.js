var request = require('request'),
	channels = require('./channel.js');

var Client = function(options) {
	this.options = options || {};
	this.request = request.defaults({
		method: 'POST'
	});
	this.channels = {};
};

Client.prototype.getChannel = function(channelName) {
	var me = this;
	return this.channels[channelName] || channels.create(channelName, {
		publish: _publish.bind(this),
		subscribe: _subscribe.bind(this);
	});
};

Client.prototype.connect = function(cb) {
	var me = this;
	var handshake = this.getChannel('/meta/handshake');
	handshake.publish({
	     channel: "/meta/handshake",
	     version: "1.0",
	     supportedConnectionTypes: ["long-polling"],
		 advice: {
		 	timeout: 60000,
		    interval: 0
		 }
	}, function(err, reply) {
		if(err) {
			cb(err);
		} else {
			me.clientId = reply.clientId;
			var connect = me.getChannel('/meta/connect');
			connect.publish({
				channel: "/meta/connect",
				clientId: clientId,
				connectionType: "long-polling",
				advice: {
					timeout: 0
				}
			}, function(err, reply) {
				cb(err);
			}); 
		}
	});
};

function _subscribe(channel, cb) {
	this.channels[channel.name] = channel;
	this.request({
		url: this.options.baseUrl
	});
};

function _publish(channel, message) {
	
};