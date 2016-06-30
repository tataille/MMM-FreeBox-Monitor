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
		displayDownloads: true,
		mirrorName: "My Magic Mirror",
		requestRefresh: 30
	},
	
	start: function() {
		Log.info("Starting module: " + this.name);
		this.errorMessage = "";
		this.callsTable = [];
		this.downloadsTable = "";
		this.systemData ="";
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
			var statusWrapper = document.createElement("div");
			statusWrapper.id = "status";
			var systemWrapper = document.createElement("div");
			systemWrapper.id = "systemWrapper";
			var callsWrapper = document.createElement("div");
			callsWrapper.id = "calls";
			var callsHeaderWrapper = document.createElement("div");
			callsHeaderWrapper.id = "callsheader";		
			var downloadsWrapper = document.createElement("div");
			downloadsWrapper.id = "downloads";
			var downloadsHeaderWrapper = document.createElement("div");
			downloadsHeaderWrapper.id = "downloadsHeader";			
			// Style Wrappers
			statusWrapper.className = "date normal medium";
			callsWrapper.className = "date normal medium";
			downloadsWrapper.className = "time bright large light";
			this.wrapper.appendChild(statusWrapper);
			callsWrapper.appendChild(callsHeaderWrapper);
			this.wrapper.appendChild(callsWrapper);
			this.wrapper.appendChild(downloadsWrapper);
			downloadsWrapper.appendChild(downloadsHeaderWrapper);
			this.wrapper.appendChild(systemWrapper);
			//Where the magic happends
			if (this.errorMessage != ""){
				statusWrapper.innerHTML = this.errorMessage;
			}else {
				if (this.connectionStatus!="" && this.config.displaySystemData){
					text = "&#8657 "+this.connectionStatus.up.maxrate+ " Kb/s &#8659 "+ this.connectionStatus.down.maxrate +" Kb/s";
				statusWrapper.innerHTML = text;
				statusWrapper.className = "align-right bright max-temp";
				}
				if (this.callsTable.length > 0 && this.config.displayMissedCalls){
					callsHeaderWrapper.innerHTML = "Appels Manqués";
					callsHeaderWrapper.className = "tableheader align-left";
					/*var calls = document.getElementById("calls");				
					var child = document.getElementById("callTable"); 
					if ( child !== null)
						calls.removeChild(child);*/
					var table = document.createElement("table");
					table.id= "callsTable";
					table.className = "small";
					if ( this.config.maxCallEntries> this.callsTable.length)
						 this.config.maxCallEntries = this.callsTable.length;				
					for (var mc in this.callsTable) {					
						var missedCall = this.callsTable[mc];
						var row = document.createElement("tr");
						table.appendChild(row);
						var dateCell = document.createElement("td");
						dateCell.className = "day";
						var date = moment(missedCall.datetime, "X").format("ddd DD HH:mm");
						dateCell.innerHTML = date;
						row.appendChild(dateCell);
						
						var callerCell = document.createElement("td");
						callerCell.innerHTML = missedCall.name;
						callerCell.className = "align-right bright max-temp";
						row.appendChild(callerCell);

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
					var cpt=0;
					downloadsHeaderWrapper.innerHTML = "Téléchargements";
					downloadsHeaderWrapper.className = "tableheader align-left";
					var desc = document.createElement("table");
					desc.id= "downloadTable";
					desc.className = "small";
			
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
							color: '#aaa',
							// This has to be the same size as the maximum width to
							// prevent clipping
							strokeWidth: 4,
							trailWidth: 1,
							easing: 'easeInOut',
							duration: 2500,
							text: {
								autoStyleContainer: false
							},
							from: { color: '#aaa', width: 1 },
							to: { color: '#333', width: 4 },
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
						//bar.animate(Math.round(fileDone.rx_pct / 10000));
						//pourcentCell.innerHTML = Math.round(fileDone.rx_pct / 100);
						//pourcentCell.className = "align-right bright max-temp";
						
						var movieCell = document.createElement("td");
						movieCell.className = "moviename";					
						movieCell.innerHTML = fileDone.name;
						row.appendChild(movieCell);	

						var yearCell = document.createElement("td");
						yearCell.className = "day";					
						yearCell.innerHTML = fileDone.year;
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
							color: '#aaa',
							// This has to be the same size as the maximum width to
							// prevent clipping
							strokeWidth: 4,
							trailWidth: 1,
							easing: 'easeInOut',
							duration: 2500,
							text: {
								autoStyleContainer: false
							},
							from: { color: '#aaa', width: 1 },
							to: { color: '#333', width: 4 },
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
						//bar.animate(Math.round(fileDone.rx_pct / 10000));

						
						
						var movieCell = document.createElement("td");
						movieCell.className = "moviename";					
						movieCell.innerHTML = fileDone.name;
						row.appendChild(movieCell);	

						var yearCell = document.createElement("td");
						yearCell.className = "day";					
						yearCell.innerHTML = fileDone.year;
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
							color: '#aaa',
							// This has to be the same size as the maximum width to
							// prevent clipping
							strokeWidth: 4,
							trailWidth: 1,
							easing: 'easeInOut',
							duration: 2500,
							text: {
								autoStyleContainer: false
							},
							from: { color: '#aaa', width: 1 },
							to: { color: '#333', width: 4 },
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
						bar.animate(Math.round(fileDone.rx_pct / 10000));
						
						
						
						var movieCell = document.createElement("td");
						movieCell.className = "moviename";					
						movieCell.innerHTML = fileDone.name;
						row.appendChild(movieCell);	

						var yearCell = document.createElement("td");
						yearCell.className = "day";					
						yearCell.innerHTML = fileDone.year;
						row.appendChild(yearCell);								
					}
					
					//
					downloadsWrapper.appendChild(desc);
					this.needRefresh = false;
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
			self.downloadsTable ="";
			self.errorMessage = payload.error;
			self.connectionStatus ="";
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
			}else if ( payload.type === "connection"){				
				if (payload.value === "Connected"){
					self.getCalls();
					self.getDownloads();
					self.getConnectionStatus();
					setInterval(function() {self.getCalls();self.getDownloads();self.getConnectionStatus();	}, (this.config.requestRefresh) * 1000);					
				}
				
			}		
		}
		self.needRefresh = true;
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
	getConnectionStatus: function(){
		this.sendSocketNotification("GET_CONNECTIONSTATUS", {
				config: this.config
		});		
	}
});
