'use strict';

/* Magic Mirror
 * Module: MMM-AquareaSmartCloud
 *
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const panasonicApi = require('./node_modules/@hernas/homebridge-panasonic-heat-pump/dist/api/panasonicApi.js');
let panasonic;

module.exports = NodeHelper.create({

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'CONFIG') {
			self.config = payload;
			panasonic = new panasonicApi.PanasonicApi(this.config.email, this.config.password, console);
			self.getData();
			self.started = true;
			self.sendSocketNotification("STARTED", true);
		}
	},

	getData: function() {
		var self = this;

		let deviceId;
		let deviceGuid;
		let data;

		panasonic.loadDevice().then((devices) => {
			deviceId = devices.selectedDeviceId;
			deviceGuid = devices.deviceConf.deviceGuid;

			panasonic.loadDeviceDetails(deviceId).then((details) => {
				data = details;
				self.sendSocketNotification("DEVICE_DATA", data);
			});
		});
		
		setTimeout(function() { self.getData(); }, this.config.refreshInterval);
	},

});
