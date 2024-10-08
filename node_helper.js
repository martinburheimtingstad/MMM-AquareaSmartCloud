'use strict';

/* Magic Mirror
 * Module: MMM-AquareaSmartCloud
 *
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'CONFIG') {
			self.config = payload;
			self.getData();
			self.started = true;
			self.sendSocketNotification("STARTED", true);
		}
	},

	getData: function() {
		var self = this;

		const deviceId = this.config.device_id;
		const baseUrl = 'https://aquarea-smart.panasonic.com/remote/v1/api/devices/' + deviceId;	

		function getDeviceData(token) {
			var request = require('request');
		
			var retry = true;
			if(typeof token !== "undefined") {
				request.get({
					uri: baseUrl,
					headers: {
						'Cookie': 'accessToken='+token,
						'Cache-Control': 'no-cache',
						'Host': 'aquarea-smart.panasonic.com',
						'Accept': '*/*',
						'User-Agent': 'MMM'
					}
				}, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						self.sendSocketNotification("DEVICE_DATA", JSON.parse(body));
					}
					else if(response.statusCode === 401) {
						retry = false;
					}
		
				})
			}
			else {
				console.log("Undefined token passed to getDeviceData")
			}
		}
		
		function getToken(config) {
			console.log("Getting token for Aquarea");
			var request = require('request').defaults({
				followRedirect: false,
				followAllRedirects: false
			});

			try {
				return new Promise((resolve, reject) => {
					request.get({
						url: 'https://authglb.digital.panasonic.com/authorize?response_type=code&client_id=vf2i6hW5hA2BB2BQGfTHXM4YFyW4I06K'
					}, (error, response, body) => {
						if (response) {
							console.log(response.headers['location']);
						}
					})
				})
			}
			catch (error) {
				console.log(error);
			}

			try {

				return new Promise((resolve, reject) => {
					request.post({
						url: 'https://aquarea-smart.panasonic.com/remote/v1/api/auth/login',
						headers: {
							'Content-type': "application/x-www-form-urlencoded; charset=utf-8",
							'Referer': 'https://aquarea-smart.panasonic.com/'
						},
						body: 'var.loginId='+config.email+'&var.password='+config.password
					}, (error, response, body) => {
						if (response) {
							console.log(response);
						}
						if (!error && response.statusCode == 200) {
                                                        let tokens = response.headers['set-cookie'];
                                                        let token = tokens[2].substring(12, 48);
							resolve(token);
						} else if (error) {
							console.log(error);
						}
					})
				})
			}
			catch(error) {
				console.log(error);
			}
		}
	

		getToken(this.config).then(getDeviceData);

		setTimeout(function() { self.getData(); }, this.config.refreshInterval);
	},

});
