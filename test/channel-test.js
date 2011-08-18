var vows = require('vows'),
	assert = require('assert'),
	EventEmitter = require('events').EventEmitter,
	StubClient = require('./stub-client.js');
	
var channels = require('../lib/channel.js');

var client = new StubClient();

exports.channel = vows.describe('Comet Channels').addBatch({
	'A Channel': {
		topic: channels.create("/test/channel", client),
		'is a Channel': function(channel) {
			assert.instanceOf(channel, channels.Channel);
		},
		'has a name': function(channel) {
			assert.equal('/test/channel', channel.name);
		},
		'publishing': {
			topic: function(channel) {
				client.on('publish-/test/channel', this.callback);
				channel.publish({test: 'message'});
			},
			'should ask the client to publish a message on that channel': function(err, message) {
				assert.isNull(err);
				assert.equal('message', message.test)
			}
		},
		'subscribing': {
			topic: function(channel) {
				var promise = new EventEmitter();
				channel.subscribe(
					function(message) {
						promise.emit('success', message);
					},
					function(err) {
						if(err) {
							promise.emit('failure', err);
						} else {
							channel.onMessage({test: 'subscribe'});
						} 
					}
				);
				
				return promise;
			},
			'should be successful': function(err, message) {
				assert.isNull(err);
			},
			'should call callback when messages received': function(err, message) {
				assert.equal('subscribe', message.test);
			}
		}
	}
});

exports.serviceChannel = vows.describe('Comet Service Channels').addBatch({
	'A Service Channel': {
		topic: channels.create('/service/channel', client),
		'is a ServiceChannel': function(channel) {
			assert.instanceOf(channel, channels.ServiceChannel);
		},
		'is a Channel': function(channel) {
			assert.instanceOf(channel, channels.Channel);
		},
		'cannot be subscribed to': function(channel) {
			assert.throws(function() {channel.subscribe()}, Error);
		},
		'publishing': {
			topic: function(channel) {
				channel.publish({test: 'service'}, this.callback);
				client.on('publish-/service/channel', function() {
					channel.onMessage({test: 'reply'});
				});
			},
			'receives a reply': function(err, message) {
				assert.equal('reply', message.test);
			}
		}
	}
});

exports.metaChannel = vows.describe('Comet Meta Channels').addBatch({
	'A Meta Channel': {
		topic: channels.create('/meta/xxx', client),
		'is a MetaChannel': function(channel) {
			assert.instanceOf(channel, channels.MetaChannel);
		},
		'is a Channel': function(channel) {
			assert.instanceOf(channel, channels.Channel);
		}, 
		'cannot be subscribed to': function(channel) {
			assert.throws(function() {channel.subscribe()}, Error);
		}, 
		'publishing': {
			topic: function(channel) {
				client.on('publish-/meta/xxx', this.callback);
				channel.publish({test: 'meta'}, function(){});
			},
			'should ask the client to publish a message on that channel': function(err, message) {
				assert.isNull(err);
				assert.equal('meta', message.test);
			}
		},
		'responds when publishing': {
			topic: function(channel) {
				client.on('publish-/meta/xxx', function() {
					channel.onMessage({test: 'response'});
				});
				channel.publish({test: 'request'}, this.callback);
			},
			'without errors': function(err, response) {
				assert.isNull(err);
			},
			'with a reply': function(err, response) {
				assert.equal('response', response.test);
			}
		}
	}
});