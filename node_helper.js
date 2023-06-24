/* Magic Mirror
 * Node Helper: Newsfeed
 *
 * By Michael Teeuw http://michaelteeuw.nl
 * MIT Licensed.
 */

var NodeHelper = require("node_helper")
var fs = require("fs");
var Freeboxapi = require("./freeboxapi.js");
var fapi;


module.exports = NodeHelper.create({
	// Subclass start method.
	start: function() {
		var self = this;
		self.fapi = new Freeboxapi("..");
		self.fapi.onError(function(fapi, error) {
				self.sendSocketNotification("FREEBOX_ERROR", {
					error: error
				});
			});
		self.fapi.onMsg(function(fapi, msg) {
				self.sendSocketNotification("FREEBOX_MSG", {
					value: msg.value,
					type: msg.type
				});
			});
		console.log("Starting module: " + this.name);
		
	},

	// Subclass socketNotificationReceived received.
	socketNotificationReceived: function(notification, payload) {
		var self = this;
		console.log("FREEBOX: "+JSON.stringify(notification)+ " " +payload);
		if (notification === "GET_CALLS") {
			self.fapi.getCalls();
			return;
		}else if (notification === "GET_DOWNLOADS") {
			self.fapi.getDownloads();
			return;
		}else if (notification === "GET_CONNECTIONSTATUS") {
			self.fapi.getConnectionStatus();
			return;
		}else if (notification === "CONNECT"){
				self.fapi.configure(payload.config.ip);
				self.fapi.readFreeboxVersion();
				return;
		} 
			
	}
});
