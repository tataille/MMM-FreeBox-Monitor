/* global Module */

/* Magic Mirror
 * Module: freebox
 *
 * By Jean-Marc Taillant
 * MIT Licensed.
 */

Module.register("MMM-FreeBox-Monitor",{

	// Default module config.
	defaults: {
		fade: true,
		fadePoint: 0.25,
		language: "fr",
		maxCallEntries: 3,
		displaySystemData: true,
		displayMissedCalls: true,
		displayConnectedDevices: true,
		displayDetailedConnectedDevices: false,
		displayDownloads: true,
		displayFirmware: false,
		mirrorName: "My Magic Mirror",
		requestRefresh: 30,
		freeboxStyle: false
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		this.errorMessage = "";
		this.callsTable = [];
		this.downloadsTable = "";
		this.connectedDevicesMap = "";
		this.systemInfo = "";
		this.needRefresh = true;
		this.wrapper = "";
		var self = this;
			setInterval(function() {
			self.updateDom(); // no speed defined, so it updates instantly.
		}, 5000);
		moment.locale(config.language);
		this.sendSocketNotification("CONNECT", {
				config: this.config
		});



	},
	// Define required scripts.
	getScripts: function() {
		return ["moment.js","progressbar.js"];
	},
	// Define required scripts.
	getStyles: function() {
		return ["freebox.css"];
	},
	// Override dom generator.
	getDom: function() {
		if (this.needRefresh){
			this.wrapper = document.createElement("div");
			var statusWrapper = document.createElement("span");
			statusWrapper.id = "status";
			var callsWrapper = document.createElement("div");
			callsWrapper.id = "calls";
			var callsHeaderWrapper = document.createElement("div");
			callsHeaderWrapper.id = "callsheader";
			var downloadsWrapper = document.createElement("div");
			downloadsWrapper.id = "downloads";
			var connectedDevicesWrapper = document.createElement("div");
			connectedDevicesWrapper.id = "connectedDevices";
			var statusHeaderWrapper = document.createElement("div");
			statusHeaderWrapper.id = "status";
			var downloadsHeaderWrapper = document.createElement("div");
			downloadsHeaderWrapper.id = "downloadsHeader";
			var connectedDevicesHeaderWrapper = document.createElement("div");
			connectedDevicesHeaderWrapper.id = "connectedDevicesHeader";
			// Style Wrappers
			statusWrapper.className = "date normal medium";
			callsWrapper.className = "date normal medium";
			downloadsWrapper.className = "time bright large light";
			statusWrapper.appendChild(statusHeaderWrapper);
			this.wrapper.appendChild(statusWrapper);
			callsWrapper.appendChild(callsHeaderWrapper);
			this.wrapper.appendChild(callsWrapper);
			this.wrapper.appendChild(downloadsWrapper);
			downloadsWrapper.appendChild(downloadsHeaderWrapper);
			this.wrapper.appendChild(connectedDevicesWrapper);
			connectedDevicesWrapper.appendChild(connectedDevicesHeaderWrapper);
			if (this.errorMessage != ""){
				statusWrapper.innerHTML = this.errorMessage;
			}else {
				console.log("Data to Display: "+this.connectionStatus);
				if (this.connectionStatus){
					if (this.connectionStatus!="" && this.config.displaySystemData){
						statusHeaderWrapper.innerHTML = "Status";
						statusHeaderWrapper.className = "tableheader align-left";
						var statusTable = document.createElement("table");
						statusTable.id= "statusTable";
						statusTable.className = "table small";
						if ( this.config.displayFirmware ) {
							var versionsRow= document.createElement("tr");
							statusTable.appendChild(versionsRow);
							var osVersionCell = document.createElement("td");
							osVersionCell.innerHTML =  "Firmware: "+this.systemInfo.firmware_version;
							osVersionCell.className = "firmware bright";
							osVersionCell.colSpan = 4;
							versionsRow.appendChild(osVersionCell);
						}
						var row = document.createElement("tr");
						statusTable.appendChild(row);
						var downRateLogoCell = document.createElement("td");
						downRateLogoCell.className = "fas fa-fw fa-cloud-download-alt align-right";
						row.appendChild(downRateLogoCell);
						var downRateCell = document.createElement("td");
						downRateCell.className = "align-right bright";
						downRateCell.innerHTML =this.formatBytes(this.connectionStatus.rate_down) +"/s";
						row.appendChild(downRateCell);
						var upRateLogoCell = document.createElement("td");
						upRateLogoCell.className = "fas fa-fw fa-cloud-upload-alt align-right";
						row.appendChild(upRateLogoCell);
						var upRateCell = document.createElement("td");
						upRateCell.className = "align-right bright";
						upRateCell.innerHTML =this.formatBytes(this.connectionStatus.rate_up) +"/s";
						row.appendChild(upRateCell);
						statusWrapper.appendChild(statusTable);
					}
					if (this.callsTable.length > 0 && this.config.displayMissedCalls){
						callsHeaderWrapper.innerHTML = "Appels Manqués";
						callsHeaderWrapper.className = "tableheader align-left";
						var table = document.createElement("table");
						table.id= "callsTable";
						table.className = "table small";
						if ( this.config.maxCallEntries> this.callsTable.length)
							this.config.maxCallEntries = this.callsTable.length;
						for (var mc in this.callsTable) {
							var missedCall = this.callsTable[mc];
							var row = document.createElement("tr");
							table.appendChild(row);
							var logoCell = document.createElement("td");
							logoCell.className = "fas fa-fw fa-phone-slash align-right";
							row.appendChild(logoCell);
							var callerCell = document.createElement("td");
							callerCell.innerHTML = missedCall.name;
							callerCell.className = "align-right bright callid";
							row.appendChild(callerCell);
							var dateCell = document.createElement("td");
							dateCell.className = "day";
							var date = moment(missedCall.datetime, "X").format("ddd DD HH:mm");
							dateCell.innerHTML = date;
							row.appendChild(dateCell);
							if (this.config.fade && this.config.fadePoint < 1) {
								if (this.config.fadePoint < 0) {
									this.config.fadePoint = 0;
								}
								var startingPoint = this.callsTable.length * this.config.fadePoint;
								var steps = this.callsTable.length - startingPoint;
								if (mc >= startingPoint) {
									var currentStep = mc - startingPoint;
									row.style.opacity = 1 - (1 / steps * currentStep);
								}
							}
						}
						callsWrapper.appendChild(table);
					}
					if ( this.downloadsTable != "" && this.config.displayDownloads){
						if (this.downloadsTable.done.length > 0 ||
							this.downloadsTable.seeding.length > 0 ||
							this.downloadsTable.downloading > 0) {
							var cpt=0;
							downloadsHeaderWrapper.innerHTML = "Téléchargements";
							downloadsHeaderWrapper.className = "tableheader align-left";
							var desc = document.createElement("table");
							desc.id= "downloadTable";
							desc.className = "table small";

							for (var d in this.downloadsTable.done) {
								var fileDone = this.downloadsTable.done[d];
								var row = document.createElement("tr");
								desc.appendChild(row);
								var pourcentCell = document.createElement("td");
								var pcontainer = document.createElement("div");
								pcontainer.id="container_"+(cpt++);
								pcontainer.className = "moviepercent";
								pourcentCell.appendChild(pcontainer);

								var bar = new ProgressBar.Circle(pcontainer, {
									color: '#D7DF01',
									// This has to be the same size as the maximum width to
									// prevent clipping
									strokeWidth: 4,
									trailWidth: 1,
									easing: 'easeInOut',
									duration: 2500,
									text: {
										autoStyleContainer: false
									},
									from: { color: '#D7DF01', width: 1 },
									to: { color: '#D7DF01', width: 4 },
									// Set default step function for all animate calls
									step: function(state, circle) {
									circle.path.setAttribute('stroke', state.color);
									circle.path.setAttribute('stroke-width', state.width);

									var value = Math.round(fileDone.rx_pct / 10000 * 100);
									if (value === 0) {
										circle.setText('');
									} else {
										circle.setText(value);
									}

									}
								});
								row.appendChild(pourcentCell);

								bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
								bar.text.style.fontSize = '10px';
								var movieCell = document.createElement("td");
								movieCell.className = "moviename";
								movieCell.innerHTML = fileDone.name;
								row.appendChild(movieCell);

								var yearCell = document.createElement("td");
								yearCell.className = "day";
								yearCell.innerHTML = fileDone.status;
								row.appendChild(yearCell);
							}
							for (var d in this.downloadsTable.seeding) {
								var fileDone = this.downloadsTable.seeding[d];
								var row = document.createElement("tr");
								desc.appendChild(row);
								var pourcentCell = document.createElement("td");

								var pcontainer = document.createElement("div");
								pcontainer.id="container_"+(cpt++);
								pcontainer.className = "moviepercent";
								pourcentCell.appendChild(pcontainer);

								var bar = new ProgressBar.Circle(pcontainer, {
									color: '#D7DF01',
									// This has to be the same size as the maximum width to
									// prevent clipping
									strokeWidth: 4,
									trailWidth: 1,
									easing: 'easeInOut',
									duration: 2500,
									text: {
										autoStyleContainer: true
									},
									from: { color: '#D7DF01', width: 1 },
									to: { color: '#D7DF01', width: 4 },
									// Set default step function for all animate download
									step: function(state, circle) {
									circle.path.setAttribute('stroke', state.color);
									circle.path.setAttribute('stroke-width', state.width);

									var value = Math.round(fileDone.rx_pct / 10000 * 100);
									if (value === 0) {
										circle.setText('');
									} else {
										circle.setText(value);
									}

									}
								});
								row.appendChild(pourcentCell);
								bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
								bar.text.style.fontSize = '10px';
								bar.text.style.color ='#D7DF01';

								var movieCell = document.createElement("td");
								movieCell.className = "moviename";
								movieCell.innerHTML = fileDone.name;
								row.appendChild(movieCell);

								var yearCell = document.createElement("td");
								yearCell.className = "day";
								yearCell.innerHTML = fileDone.status;
								row.appendChild(yearCell);
							}
							//
							for (var d in this.downloadsTable.downloading) {
								var fileDone = this.downloadsTable.downloading[d];
								var row = document.createElement("tr");
								desc.appendChild(row);
								var pourcentCell = document.createElement("td");

								var pcontainer = document.createElement("div");
								pcontainer.id="container";
								pcontainer.className = "moviepercent";
								pourcentCell.appendChild(pcontainer);

								var bar = new ProgressBar.Circle(pcontainer, {
									color: '#D7DF01',
									// This has to be the same size as the maximum width to
									// prevent clipping
									strokeWidth: 4,
									trailWidth: 1,
									easing: 'easeInOut',
									duration: 2500,
									text: {
										autoStyleContainer: false
									},
									from: { color: '#D7DF01', width: 1 },
									to: { color: '#D7DF01', width: 4 },
									// Set default step function for all animate download
									step: function(state, circle) {
									circle.path.setAttribute('stroke', state.color);
									circle.path.setAttribute('stroke-width', state.width);

									var value = Math.round(fileDone.rx_pct / 10000 * 100);
									if (value === 0) {
										circle.setText('');
									} else {
										circle.setText(value);
									}

									}
								});
								row.appendChild(pourcentCell);
								bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
								bar.text.style.fontSize = '10px';



								var movieCell = document.createElement("td");
								movieCell.className = "moviename";
								movieCell.innerHTML = fileDone.name;
								row.appendChild(movieCell);

								var yearCell = document.createElement("td");
								yearCell.className = "day";
								yearCell.innerHTML = fileDone.status;
								row.appendChild(yearCell);
							}

							//
							downloadsWrapper.appendChild(desc);
							this.needRefresh = false;
						}else {
							if (document.contains(document.getElementById("downloadTable"))) {
								document.getElementById("downloadTable").remove();
							}
							
						}
					}
					if ( this.connectedDevicesMap.entries.length && this.config.displayTotalConnectedDevices){
						connectedDevicesHeaderWrapper.innerHTML = "Appareils connectés";
						connectedDevicesHeaderWrapper.className = "tableheader align-left";
						var table = document.createElement("table");
						table.id= "devicesTable";
						table.className = "table small";
						this.connectedDevicesMap.forEach(function(count,id, ) {
							var row = document.createElement("tr");
							table.appendChild(row);
							var wifiCell = document.createElement("td");
							wifiCell.innerHTML = id;
							wifiCell.className = " align-left";
							row.appendChild(wifiCell);
							var devicesCountCell = document.createElement("td");
							devicesCountCell.innerHTML = count;
							devicesCountCell.className = "align-right bright callid";
							row.appendChild(devicesCountCell);
						});
						connectedDevicesWrapper.appendChild(table);
					}else if ( this.connectedDevicesMap.entries.length && this.config.displayDetailedConnectedDevices){
					}

			}
			}
		}
		return this.wrapper;

	},
	// Override socket notification handler.
	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === "FREEBOX_ERROR") {
			self.callsTable = [];
			self.downloadsTable = "";
			self.errorMessage = payload.error;
			self.connectionStatus = "";
			self.connectedDevicesMap = "";
			self.systemInfo = "--";
		}else if (notification == "FREEBOX_MSG"){
			self.errorMessage = "";
			if ( payload.type === "downloads"){
				self.downloadsTable ="";
				self.downloadsTable =JSON.parse(JSON.stringify(payload.value));
			}else if ( payload.type === "calls"){
				self.callsTable = [];
				var newArray = payload.value.slice(0, this.config.maxCallEntries);
				for (var mc in newArray) {
					self.callsTable.push(newArray[mc]);
				}
			}else if ( payload.type === "connectionStatus"){
				self.connectionStatus ="";
				self.connectionStatus =JSON.parse(JSON.stringify(payload.value));
			}else if ( payload.type === "systemInfo"){
				self.systemInfo ="";
				self.systemInfo =JSON.parse(JSON.stringify(payload.value));
			}else if ( payload.type === "connectedDevices"){
				self.connectedDevicesMap = [];
				self.connectedDevicesMap =new Map(Object.entries(JSON.parse(payload.value)));
			}else if ( payload.type === "connection"){
				if (payload.value === "Connected"){
					self.getConnectionStatus();
					self.getCalls();
					self.getDownloads();
					self.getConnectedDevices();
					self.getSystemInfo();
					setInterval(function() {self.getCalls();self.getDownloads();self.getConnectionStatus();self.getConnectedDevices();self.getSystemInfo()	}, (this.config.requestRefresh) * 1000);
				}

			}
		}
		self.needRefresh = true;
	},
	formatBytes: function(bytes, decimals = 2) {
		if (!+bytes) return '0 Bytes'
	
		const k = 1024
		const dm = decimals < 0 ? 0 : decimals
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
	
		const i = Math.floor(Math.log(bytes) / Math.log(k))
	
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
	},
	getCalls: function(){
		this.sendSocketNotification("GET_CALLS", {
				config: this.config
		});
	},
	getDownloads: function(){
		this.sendSocketNotification("GET_DOWNLOADS", {
				config: this.config
		});
	},
	getConnectedDevices: function(){
		this.sendSocketNotification("GET_CONNECTED_DEVICES", {
			config: this.config
	});
	},
	getConnectionStatus: function(){
		this.sendSocketNotification("GET_CONNECTIONSTATUS", {
				config: this.config
		});
	},
	getSystemInfo: function(){
		this.sendSocketNotification("GET_SYSTEMINFO", {
				config: this.config
		});
	}
});
