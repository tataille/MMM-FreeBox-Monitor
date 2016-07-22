/**
 * Created by taillan2 on 24/06/2016.
 */
    //session token : KZlgIo12ozwAtemTvtbR1pOPEMN4tgwKVjUPpIry/feMGk1pJ7zqHWhOlU2sz3js
//track_id 53
//app_token S0K4OcD3qh9YLu02X8uagFEJAjLkTweA6y2OKgevN9jQGSgstJLbSyJFd4CY1EHq
/*var track_id;
var app_token = "S0K4OcD3qh9YLu02X8uagFEJAjLkTweA6y2OKgevN9jQGSgstJLbSyJFd4CY1EHq";
var appId = "fr.testapp";
var challenge;
var session_token;
var _ = require("underscore");
*/

var request = require('request-json');
var ptn = require('parse-torrent-name');
var imdb = require('imdb-api');
var omdb = require('omdb');
var CryptoJS = require("crypto-js");
var fs = require("fs");
var _ = require("underscore");

var Freeboxapi = function(ip) {
	var self = this;	
	var config = {
		track_id: "",
		app_token: "",
		appId: "",
		challenge: "",
		session_token: ""
	};
	
    this.configure =  function(data){
        ip = data;
    };
    
	var authCallback = function(error, response, body){
        if (!error) {		
            var info = JSON.parse(JSON.stringify(body));
            console.log("AuthCallback -> "+ JSON.stringify(body)    );
            config.app_token = info.result.app_token;
            config.track_id = info.result.track_id;
            console.log("APP_TOKEN: "+config.app_token);
			checkAuthorize(config.track_id, callbackCheckAuthorize);
        }
        else {
            console.log('Error happened: ' + error);
        }
    };
	
	var connectionStatusCallback = function(error, response, body){
        if (!error) {		
            var info = JSON.parse(JSON.stringify(body));
        	if (info.success === true){
				console.log("ConnectionStatusCallback -> "+ JSON.stringify(body));
				msg = {
					value:  info.result,
					type: "connectionStatus"
				};
				fetchCallback(self, msg);
			}else{				
				config.challenge = info.result.challenge;
                openSession(callbackOpenSession);
			}
        }
        else {
            console.log('Error happened: ' + error);
        }
    };
	
	
    var callbackCalls = function(error, response, body){
        if (!error) {
			var info = JSON.parse(JSON.stringify(body));
			if (info.success === true){
            var info = JSON.parse(JSON.stringify(body));
			console.log("CallbackCalls -> "+ JSON.stringify(body));
            var calls = info.result;
            var today = new Date();
            var start = new Date();
            start.setDate(start.getDate() - 10);
            start.setHours(0,0,0,0);
            start = start.getTime()/1000;

            var end = new Date();
            end.setDate(end.getDate() - 10);
            end.setHours(23,59,59,000);
            end = end.getTime()/1000;
            console.log("date: "+start +" "+end);
            var filtered = _.where(calls, {type: "missed"});
            console.log(filtered);
            // filtered = _.where(filtered, {datetime: 1466341001});
            console.log("////////////////////////:");
            //var filtered = _.filter(filtered, function(v) { return  (end >= v.datetime && start <= v.datetime)});
            console.log(filtered);
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
            console.log('Error happened: ' + error);
        }
    };
	
	var callbackDownloads = function(error, response, body){
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));
			console.log("CallbackDownloads -> "+ info);	
            var downloads = info.result;
            var done = _.where(downloads, {status: "done"});
			done.forEach( function( item ) {
				var mov = ptn(item.name);
				var Re = new RegExp("\\.","g");
				item.name = mov.title.replace(Re," ");
				item.year = mov.year;
			});
		
			var seeding = _.where(downloads, {status: "seeding"});
			seeding.forEach( function( item ) {
				var mov = ptn(item.name);
				var Re = new RegExp("\\.","g");
				item.name = mov.title.replace(Re," ");
				item.year = mov.year;
			});
			var downloading = _.where(downloads, {status: "downloading"});			
			downloading.forEach( function( item ) {
				var mov = ptn(item.name);
				var Re = new RegExp("\\.","g");
				item.name = mov.title.replace(Re," ");
				item.year = mov.year;
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
            console.log(done);
            // filtered = _.where(filtered, {datetime: 1466341001});
            console.log("////////////////////////:");
            done.forEach( function( item ) {	
				var mov = ptn(item.name);
				var Re = new RegExp("\\.","g");
				mov.title = mov.title.replace(Re," ");
				console.log(mov.title +" "+mov.year);
				omdb.get({ title: mov.title, year: mov.year }, true, function(err, movie) {
					if(err) {
						return console.error(err);
					}
				});;			
			});		
        }
        else {
            console.log('Error happened: ' + error);
        }
    };
	
    var callbackCheckAuthorize = function(error, response, body){
		console.log("--> "+error);
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));
			console.log("CallbackCheckAuthorize -> "+ JSON.stringify(info));	            
			if (info.success === false){
				error = info.msg;
				fetchFailedCallback(self, error);
			}else if (info.result.status =='pending'){
                setTimeout( function(){checkAuthorize(config.track_id, callbackCheckAuthorize)}, 5000);
            }else if (info.result.status =='granted'){
				console.log("GRANTED");
                getChallenge(callbackGetChallenge);
            }else{
				error = "Timeout";
				fetchFailedCallback(self, error);
			}

        }
        else {
            console.log('Error happened: ' + error);
        }
    };
    
	var callbackGetChallenge = function(error, response, body){
        console.log("CALLBACK GET CHALLENGE");
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));
			console.log("CallbackGetChallenge -> "+ info);	            
            console.log(info);
            if (info.success == true){
                config.challenge = info.result.challenge;
                setTimeout( function(){openSession(callbackOpenSession)}, 2000);
            }

        }
        else {
            console.log('Error happened: ' + error);
        }
    };
    
	var callbackOpenSession = function(error, response, body){
        if (!error) {
            var info = JSON.parse(JSON.stringify(body));
            console.log("CallbackOpenSession -> "+ JSON.stringify(info));	            
            if (info.success == true){
                config.session_token = info.result.session_token;
                console.log("SESSION_TOKEN: "+config.session_token);
				var outputFilename = 'freebox.txt';
				fs.writeFile(outputFilename, JSON.stringify(config, null, 4), function(err) {
					if(err) {
						console.log(err);
					} else {	
						console.log("JSON saved to " + outputFilename);
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
            console.log('Error happened: ' + error);
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
        var client = request.createClient(ip);
		try {
			fs.accessSync("freebox.txt", fs.F_OK);
			console.log("here");
			config = JSON.parse(fs.readFileSync('freebox.txt', 'utf8'));
			console.log(config);
			//checkAuthorize(config.track_id, callbackCheckAuthorize)
			getChallenge(callbackGetChallenge);
			// Do something
		} catch (e) {
			// It isn't accessible
			//not exists
			client.post('/api/v3/login/authorize/', data, authCallback);
		}
    };

    var checkAuthorize = function(track_id, callback){
        var client = request.createClient(ip);
        client.get('/api/v3/login/authorize/'+config.track_id, callback);
    };

    var getChallenge = function(callback){
        var client = request.createClient(ip);
        client.get('/api/v3/login/', callback);
    };
		
	
    var openSession = function(callback){
        console.log("OPEN SESSION");
        var client = request.createClient(ip);
        //calculate password
        var message = config.challenge;
        var passphrase = config.app_token;
        var signature = CryptoJS.enc.Hex.stringify(CryptoJS.HmacSHA1( message, passphrase));

		
        console.log(signature);
        var data = {
            app_id: config.appId,
            password: signature
        };
        console.log(data);
        client.post('/api/v3/login/session/', data, callbackOpenSession);
    };
	
	this.getConnectionStatus = function(){
		  var client = request.createClient(ip);
        client.headers['X-Fbx-App-Auth'] = config.session_token;
        client.get('/api/v3/connection/xdsl/', connectionStatusCallback	);
	};
	
    this.getCalls = function(){
        var client = request.createClient(ip);
        client.headers['X-Fbx-App-Auth'] = config.session_token;
        client.get('/api/v3/call/log/', callbackCalls);
    };
	
	this.getDownloads = function(){
		var client = request.createClient(ip);
        client.headers['X-Fbx-App-Auth'] = config.session_token;
        client.get('/api/v3/downloads/', callbackDownloads);
	};
	
	this.onError = function(callback) {
		fetchFailedCallback = callback;
	};
	
	this.onMsg = function(callback) {
		fetchCallback = callback;
	};
};

module.exports = Freeboxapi;
