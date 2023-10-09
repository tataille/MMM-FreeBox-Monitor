/**
 * Created by taillan2 on 24/06/2016.
*/

var reqjson = require('request-json');
var ptn = require('parse-torrent-name');
var imdb = require('imdb-api');
var omdb = require('omdb');
var CryptoJS = require("crypto-js");
var fs = require("fs");
var _ = require("underscore");

var Freeboxapi = function(ip) {
	var version = "";
	var mirrorName = "";
	var apsMap = new Map();
	var nameSize = 10;
	var apsWithDevices = new Map();
	var self = this;
	var config = {
		track_id: "",
		app_token: "",
		appId: "",
		challenge: "",
		session_token: ""
	};

    this.configure =  function(data){
        ip = data.ip;
		mirrorName = data.mirrorName;
    };

	this.readFreeboxVersion = function(){
		var client = reqjson.createClient(ip);
        client.get('/api_version', callbackVersion);
	}

	var callbackVersion = function(error, response, body){
		if (!error) {
            var info = JSON.parse(JSON.stringify(body));            
            config.version = info.api_version.split('.')[0];
			console.debug('API Version is: '+config.version);
			self.authorize("fr.freebox",'MM Freebox Monitor',"1.0.2",mirrorName);
        }
        else {
            console.error('VERSION - Error happened: ' + error);
        }
	}

	var callbackSystemInfo = function(error, response, body){
		if (!error) {
            var info = JSON.parse(JSON.stringify(body));    
			console.debug(info);                    
			if (info.success === true){				
				msg = {
					value:  info.result,
					type: "systemInfo"
				};
				fetchCallback(self, msg);
			}else{
				config.challenge = info.result.challenge;
                openSession(callbackOpenSession);
			}
        }
        else {
            console.error('System Info - Error happened: ' + error);
        }
	}

	var authCallback = function(error, response, body){
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));
			console.debug(info);            
            config.app_token = info.result.app_token;
            config.track_id = info.result.track_id;
			checkAuthorize(config.track_id, callbackCheckAuthorize);
        }
        else {
            console.error('Error happened: ' + error);
        }
    };

	var connectionStatusCallback = function(error, response, body){
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));
			console.debug(info);
        	if (info.success === true){				
				msg = {
					value:  info.result,
					type: "connectionStatus"
				};
				fetchCallback(self, msg);
			}else{
				console.info(info.result);
				config.challenge = info.result.challenge;
                openSession(callbackOpenSession);
			}
        }
        else {
            console.error('Error happened: ' + error);
        }
    };


    var callbackCalls = function(error, response, body){
        if (!error) {
			var info = JSON.parse(JSON.stringify(body));
			if (info.success === true){
            			var info = JSON.parse(JSON.stringify(body));				
            			var calls = info.result;
            			var today = new Date();
            			var start = new Date();
            			start.setDate(start.getDate() - 10);
            			start.setHours(0,0,0,0);
            			start = start.getTime()/1000;
				var end = new Date();
				end.setDate(end.getDate() - 30);
				end.setHours(23,59,59,00);
				end = end.getTime()/1000;            			
				var filtered = _.where(calls, {type: "missed"});
				value = "";
				if ( filtered.length > 1){
					value = filtered.length + " missed calls";
				}else
					value = filtered.length + " missed call";
				msg = {
					value:  filtered,
					type: "calls"
				};
				fetchCallback(self, msg);
			}else{
				config.challenge = info.result.challenge;
                		openSession(callbackOpenSession);
			}
        }
        else {
            console.error('Error happened: ' + error);
        }
    };

	var callbackDownloads = function(error, response, body){
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));	
			console.debug(info);		
            var downloads = info.result;
            var done = _.where(downloads, {status: "done"});
			var seeding = _.where(downloads, {status: "seeding"});
			var downloading = _.where(downloads, {status: "downloading"});
			done.forEach( function( item ) {
				var mov = ptn(item.name);
				item.name = trunckName(mov.title, nameSize);
			});
			seeding.forEach( function( item ) {
				var mov = ptn(item.name);
				item.name = trunckName(mov.title, nameSize);
			});
			downloading.forEach( function( item ) {
				var mov = ptn(item.name);
				item.name = trunckName(mov.title, nameSize);
			});
			files = {
				done: done,
				seeding: seeding,
				downloading: downloading
			};
			msg = {
				value:  files,
				type: "downloads"
			};
			fetchCallback(self, msg);            
            
        }
        else {
            console.error('Error happened: ' + error);
        }
    };

	var trunckName = function (name, maxSize) {
		if (name.length > maxSize) {
		  return name.slice(0, maxSize) + "...";
		} else {
		  return name;
		}
	  }

    var callbackCheckAuthorize = function(error, response, body){		
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));			
			if (info.success === false){
				error = info.msg;
				fetchFailedCallback(self, error);
			}else if (info.result.status =='pending'){
                		setTimeout( function(){checkAuthorize(config.track_id, callbackCheckAuthorize)}, 5000);
            		}else if (info.result.status =='granted'){
				getChallenge(callbackGetChallenge);
            		}else{
				error = "Timeout";
				fetchFailedCallback(self, error);
			}
        }
        else {
            console.error('Error happened: ' + error);
        }
    };

	var callbackGetChallenge = function(error, response, body){
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));
			console.debug("CallbackGetChallenge -> "+ info);            
            if (info.success == true){
                config.challenge = info.result.challenge;
                setTimeout( function(){openSession(callbackOpenSession)}, 2000);
            }

        }
        else {
            console.error('Error happened: ' + error);
        }
    };

	var apListCallback = function(error, response, body){
		if (!error) {
            var info = JSON.parse(JSON.stringify(body));	
			console.debug(info);		
            var apList = info.result;
			for(var i = 0; i < apList.length; i++)
			{
				apsMap.set(apList[i].id, apList[i]);
				apsMap.get(apList[i].id).status = "unknow";

			}
			apsWithDevices = new Map();
			apsMap.forEach(function(ap,ap_id, ) {
				console.debug("Retrieving connected devices for ap "+ap_id+ " "+ ap.name);
				getApDevices(ap_id);
			});
		}
        else {
            console.error('Error happened: ' + error);
        }
	};

	var getApDevices = function(ap_id){
		var client = reqjson.createClient(ip);
        client.headers['X-Fbx-App-Auth'] = config.session_token;
		//retrieve ap list
        client.get('/api/v'+config.version+'/wifi/ap/'+ap_id+'/stations', (error, response, body) => {
			if (!error) {
				var info = JSON.parse(JSON.stringify(body));	
				console.debug(info);		
				var devicesMap = info.result;
				if (devicesMap) {
					apsWithDevices.set(apsMap.get(ap_id).name,  devicesMap.length);
					apsMap.get(ap_id).number = devicesMap.length;
					console.debug( devicesMap.length +" devices connected on ap "+apsMap.get(ap_id).name);
				}
				apsMap.get(ap_id).status = "done";
				var send = true;
				apsMap.forEach(function(ap,id, ) {
					console.log("Checking status for "+id+" "+ap.status);
					if ( ap.status === "unknow"){
						send = false;
					}
				});
				
				if ( send === true) {
					//var devices  = _.where(downloads, {status: "done"});
					 msg = {
						value: JSON.stringify(Object.fromEntries(apsWithDevices))
						,
						type: "connectedDevices"
					};
					console.debug(msg	);
					fetchCallback(self, msg);
				}
			}
			else {
				console.error('Error happened: ' + error);
			}
		});
	};

	
	
	var callbackOpenSession = function(error, response, body){
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));    
			console.debug(info);        
            if (info.success == true){
                config.session_token = info.result.session_token;
                var outputFilename = 'freebox.txt';
		fs.writeFile(outputFilename, JSON.stringify(config, null, 4), function(err) {
		if(err) {
			console.error(err);
		} else {
			msg = {
				value: "Connected",
				type: "connection"
			};
			fetchCallback(self, msg);
		}
		});
            }
        }
        else {
            console.error('Error happened: ' + error);
        }
    };

    this.authorize = function( app_id ,app_name, app_version, device_name){
        config.appId = app_id
        var data = {
            app_id: app_id,
            app_name: app_name,
            app_version: app_version,
            device_name: device_name
        };
        var client = reqjson.createClient(ip);
		try {
			fs.accessSync("freebox.txt", fs.F_OK);			
			config = JSON.parse(fs.readFileSync('freebox.txt', 'utf8'));
			console.debug(config);
			getChallenge(callbackGetChallenge);
		} catch (e) {
			// It isn't accessible
			client.post('/api/v'+config.version+'/login/authorize/', data, authCallback);
		}
    };

    var checkAuthorize = function(track_id, callback){
        var client = reqjson.createClient(ip);
        client.get('/api/v'+config.version+'/login/authorize/'+config.track_id, callback);
    };

    var getChallenge = function(callback){
        var client = reqjson.createClient(ip);
        client.get('/api/v'+config.version+'/login/', callback);
    };


    var openSession = function(callback){        
        var client = reqjson.createClient(ip);
        var message = config.challenge;
        var passphrase = config.app_token;
        var signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA1( message, passphrase));
        var data = {
            app_id: config.appId,
            password: signature
        };
        client.post('/api/v'+config.version+'/login/session/', data, callbackOpenSession);
    };

	this.getConnectedDevices = function(){
		var client = reqjson.createClient(ip);
        client.headers['X-Fbx-App-Auth'] = config.session_token;
		//retrieve ap list
        client.get('/api/v'+config.version+'/wifi/ap/', apListCallback	);
	};

	this.getConnectionStatus = function(){
		var client = reqjson.createClient(ip);
        client.headers['X-Fbx-App-Auth'] = config.session_token;
        client.get('/api/v'+config.version+'/connection/', connectionStatusCallback	);
	};

    this.getCalls = function(){
        var client = reqjson.createClient(ip);
        client.headers['X-Fbx-App-Auth'] = config.session_token;
        client.get('/api/v'+config.version+'/call/log/', callbackCalls);
    };

	this.getDownloads = function(){
		var client = reqjson.createClient(ip);
        client.headers['X-Fbx-App-Auth'] = config.session_token;
        client.get('/api/v'+config.version+'/downloads/', callbackDownloads);
	};

	this.getSystemInfo = function(){
		var client = reqjson.createClient(ip);
        client.headers['X-Fbx-App-Auth'] = config.session_token;
        client.get('/api/v'+config.version+'/system/', callbackSystemInfo);
	};

	this.onError = function(callback) {
		fetchFailedCallback = callback;
	};

	this.onMsg = function(callback) {
		fetchCallback = callback;
	};
};

module.exports = Freeboxapi;
