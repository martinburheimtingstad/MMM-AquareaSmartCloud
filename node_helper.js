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

	start: function() {
		this.started = false;
		this.config = null;
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === 'CONFIG' && !this.started) {
			this.config = payload;
			
			try {
				panasonic = new panasonicApi.PanasonicApi(
					this.config.email, 
					this.config.password, 
					console
				);
				this.getData();
				this.started = true;
				this.sendSocketNotification("STARTED", true);
			} catch (error) {
				console.error('MMM-AquareaSmartCloud: Error initializing API', error);
				this.sendSocketNotification("ERROR", error.message);
			}
		}
	},

	getData: function() {
		if (!this.config || !panasonic) {
			console.error('MMM-AquareaSmartCloud: Not properly initialized');
			return;
		}

		panasonic.loadDevice()
			.then((devices) => {
				const deviceId = devices.selectedDeviceId;
				const deviceGuid = devices.deviceConf.deviceGuid;

				return panasonic.loadDeviceDetails(deviceId);
			})
			.then((data) => {
				this.sendSocketNotification("DEVICE_DATA", data);
				
				// Schedule next update
				setTimeout(() => {
					this.getData();
				}, this.config.refreshInterval);
			})
			.catch((error) => {
				console.error('MMM-AquareaSmartCloud: Error fetching data', error);
				this.sendSocketNotification("ERROR", error.message);
				
				// Retry after delay on error
				setTimeout(() => {
					this.getData();
				}, this.config.retryDelay || 60000);
			});
	}

});
