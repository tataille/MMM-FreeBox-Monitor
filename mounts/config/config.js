/* MagicMirror² Config
 *
 * By Jean Marc TAILLANT
 * MIT Licensed.
 *
 * For more information on how you can configure this file
 * see https://docs.magicmirror.builders/configuration/introduction.html
 * and https://docs.magicmirror.builders/modules/configuration.html
 *
 * You can use environment variables using a `config.js.template` file instead of `config.js`
 * which will be converted to `config.js` while starting. For more information
 * see https://docs.magicmirror.builders/configuration/introduction.html#enviromnent-variables
 */
let config = {
	address: "0.0.0.0",	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/",			// The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
					  		// you must set the sub path here. basePath must end with a /
	ipWhitelist: [],	// Set [] to allow all IP addresses
															// or add a specific IPv4 of 192.168.1.5 :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
															// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false, 		// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "", 	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "", 	// HTTPS Certificate path, only require when useHttps is true

	language: "fr",
	locale: "fr-FR",
	logLevel: ["INFO", "LOG", "WARN", "ERROR","DEBUG"],
	timeFormat: 24,
	units: "metric",

	modules: [
		{
			module: 'MMM-FreeBox-Monitor',
			header: "FREEBOX",
			position: 'top_right',	// This can be any of the regions. Best results in left or right regions.
			config: {
				mirrorName: "My Magic Mirror",
				ip: "http://mafreebox.freebox.fr",
				maxCallEntries: 7,
				requestRefresh: 10,
				// See 'Configuration options' for more information.
			}
		},
		{
			module: "clock",
			position: "top_left"
		},
		{
			module: "calendar",
			a: "US Holidays",
			position: "top_left",
			config: {
				calendars: [
					{
						symbol: "calendar-check",
						url: "https://www.data.gouv.fr/fr/datasets/r/15366b3e-70ec-4fe5-8ed4-2cd6cf28b38b"
					}
				]
			}
		},
		{
			module: "compliments",
			position: "lower_third",
			config: {
				compliments: {
					anytime: [
						"Bonjour!"
					],
				}
			}
		},
		{
			module: "helloworld",
			position: "bottom_bar", // This can be any of the regions.
			config: {
			  // See 'Configuration options' for more information.
			  text: "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit",
			},
		  },
	]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}
