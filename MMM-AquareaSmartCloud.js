/* global Module */

/* Magic Mirror
 * Module: MMM-AquareaSmartCloud
 *
 * By Martin Burheim Tingstad
 * MIT Licensed.
 */

Module.register("MMM-AquareaSmartCloud", {

	defaults: {
		refreshInterval: 1000 * 60 * 15, // refresh every 15 minutes
		updateInterval: 1000 * 60 * 15, // update every 15 minutes
		timeFormat: config.timeFormat,
		lang: config.language,
		initialLoadDelay: 0,
		retryDelay: 2500
	},

	start: function() {
		console.log('Starting module: ' + this.name);
		this.deviceData = null;
		this.loaded = false;

		// Send config to node_helper
		this.sendSocketNotification("CONFIG", this.config);
		console.log('Sending socket notification: CONFIG');
	},

	getScripts: function() {
		return [];
	},

	getStyles: function() {
		return ['MMM-AquareaSmartCloud.css'];
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "aquarea-cell";

		if (!this.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			return wrapper;
		}

		if (!this.deviceData) {
			wrapper.innerHTML = "No data available";
			return wrapper;
		}

		try {
			var operationIcon = document.createElement('img');
			operationIcon.src = "https://aquarea-smart.panasonic.com/remote/images/heat_pump.png";
			operationIcon.className = "aquarea-cell";
			operationIcon.style = "width: 50px; height: 50px; filter: brightness(0) invert(1);";

			// Outdoor section
			var outdoorDiv = document.createElement("div");
			outdoorDiv.classList.add("aquarea-cell");

			var outdoorIcon = document.createElement('img');
			outdoorIcon.src = 'https://aquarea-smart.panasonic.com/remote/images/outdoors.png';
			outdoorIcon.style = "width: 100px; height: 100px;";
			
			var outdoorTemperature = document.createElement("div");
			outdoorTemperature.classList.add("large");
			outdoorTemperature.classList.add("light");
			outdoorTemperature.innerHTML = (this.deviceData.outdoorNow || '--') + '&deg;';

			outdoorDiv.appendChild(outdoorIcon);
			outdoorDiv.appendChild(outdoorTemperature);

			// Tank section
			var tankDiv = document.createElement("div");
			tankDiv.className = "aquarea-cell";

			var tankIcon = document.createElement('img');
			tankIcon.src = 'https://aquarea-smart.panasonic.com/remote/images/icon_tank.png';
			tankIcon.width = 100;
			tankIcon.height = 100;
			tankIcon.style = "filter: grayscale(50%)";
			
			var tankTemperature = document.createElement("div");
			tankTemperature.classList.add("large");
			tankTemperature.classList.add("light");
			
			// Fixed typo: temperatureNow instead of temparatureNow
			var tankTemp = '--';
			if (this.deviceData.tankStatus && 
			    this.deviceData.tankStatus[0] && 
			    this.deviceData.tankStatus[0].temperatureNow !== undefined) {
				tankTemp = this.deviceData.tankStatus[0].temperatureNow;
			}
			tankTemperature.innerHTML = tankTemp + '&deg;';

			tankDiv.appendChild(tankIcon);
			if (this.deviceData.direction === 2) {
				tankDiv.appendChild(operationIcon.cloneNode(true));
			}
			tankDiv.appendChild(tankTemperature);

			// Zone section
			var zoneDiv = document.createElement("div");
			zoneDiv.className = "aquarea-cell";

			var zoneIcon = document.createElement('img');
			zoneIcon.src = 'https://aquarea-smart.panasonic.com/remote/images/icon_sun.png';
			zoneIcon.width = 100;
			zoneIcon.height = 100;
			zoneIcon.style = "filter: grayscale(50%)";

			if (this.deviceData.direction === 1) {
				zoneDiv.appendChild(operationIcon.cloneNode(true));
			}

			var zoneTemperature = document.createElement("div");
			zoneTemperature.classList.add("large");
			zoneTemperature.classList.add("light");

			// Fixed typo: temperatureNow instead of temparatureNow
			var zoneTemp = '--';
			if (this.deviceData.zoneStatus && 
			    this.deviceData.zoneStatus[0] && 
			    this.deviceData.zoneStatus[0].temperatureNow !== undefined) {
				zoneTemp = this.deviceData.zoneStatus[0].temperatureNow;
			}
			zoneTemperature.innerHTML = zoneTemp + '&deg;';
			
			zoneDiv.appendChild(zoneIcon);
			zoneDiv.appendChild(zoneTemperature);

			wrapper.appendChild(outdoorDiv);
			wrapper.appendChild(tankDiv);
			wrapper.appendChild(zoneDiv);

		} catch (error) {
			console.error('MMM-AquareaSmartCloud: Error rendering DOM', error);
			wrapper.innerHTML = "Error displaying data";
		}

		return wrapper;
	},

	processData: function(data) {
		this.deviceData = data;
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	socketNotificationReceived: function(notification, payload) {
		if (notification === "STARTED") {
			this.updateDom();
		} else if (notification === "DEVICE_DATA") {
			this.processData(payload);
		}
	}

});
