/* global Module */

/* Magic Mirror
 * Module: MMM-AquareaSmartCloud
 *
 * By Martin Burheim Tingstad
 * MIT Licensed.
 */

Module.register("MMM-AquareaSmartCloud",{

	defaults: {
		refreshInterval: 1000 * 60 * 15, // refresh every 15 minutes
		updateInterval: 1000 * 60 * 15, // update every 15 minutes
		timeFormat: config.timeFormat,
		lang: config.language,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500
	},

	start: function() {
		console.log('Starting module: ' + this.name);
		var self = this;
		var deviceData = null;
		var dataNotification = null;

		// Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.sendSocketNotification("CONFIG", this.config);
		console.log('Sending socket notification: CONFIG');

		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},

	// Define required scripts.
	getScripts: function() {
		return [];
	},

	getStyles: function() {
        	return [
            	'MMM-AquareaSmartCloud.css'
        	];
    	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "aquarea-cell";

		if (!this.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			return wrapper;
		}

		var operationIcon = document.createElement('img');
		operationIcon.src = "https://aquarea-smart.panasonic.com/remote/images/heat_pump.png";
                operationIcon.className = "aquarea-cell";
		operationIcon.style = "width: 50px; height: 50px; filter: brightness(0) invert(1);"

		var outdoorDiv = document.createElement("div");
		outdoorDiv.classList.add("aquarea-cell");

		var outdoorIcon = document.createElement('img');
		outdoorIcon.src = 'https://aquarea-smart.panasonic.com/remote/images/outdoors.png';
                outdoorIcon.style = "width: 100px; height: 100px;"
		var outdoorTemperature = document.createElement("div");
		outdoorTemperature.classList.add("large");
		outdoorTemperature.classList.add("light");
		outdoorTemperature.innerHTML = this.deviceData.outdoorNow+'&deg;';

		outdoorDiv.appendChild(outdoorIcon);
		outdoorDiv.appendChild(outdoorTemperature);

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
		tankTemperature.innerHTML = this.deviceData.tankStatus[0].temparatureNow+'&deg;';

		tankDiv.appendChild(tankIcon);
		if(this.deviceData.direction === 2) {
			tankDiv.appendChild(operationIcon);
		}
		tankDiv.appendChild(tankTemperature);

		var zoneDiv = document.createElement("div");
		zoneDiv.className = "aquarea-cell";

		var zoneIcon = document.createElement('img');
		zoneIcon.src = 'https://aquarea-smart.panasonic.com/remote/images/icon_sun.png';
		zoneIcon.width = 100;
		zoneIcon.height = 100;
		zoneIcon.style = "filter: grayscale(50%)";

		if(this.deviceData.direction === 1) {
			zoneDiv.appendChild(operationIcon);
		}

		var zoneTemperature = document.createElement("div");
		zoneTemperature.classList.add("large");
		zoneTemperature.classList.add("light");

		zoneTemperature.innerHTML = this.deviceData.zoneStatus[0].temparatureNow+'&deg;';
		
		zoneDiv.appendChild(zoneIcon);
		zoneDiv.appendChild(zoneTemperature);

		wrapper.appendChild(outdoorDiv);
		wrapper.appendChild(tankDiv);
		wrapper.appendChild(zoneDiv);

		return wrapper;
	},

	processData: function(data) {
		var self = this;
		this.deviceData = data;
		if (this.loaded === false) {
			 self.updateDom(self.config.animationSpeed);
		}
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("DEVICE_DATA", data);
	},

 	socketNotificationReceived: function(notification, payload) {
		if (notification === "STARTED") {
			this.updateDom();
		}
		else if(notification === "DEVICE_DATA") {
			// set dataNotification
			this.dataNotification = payload;
			this.processData(payload);
			this.updateDom();
		}
	},

});
