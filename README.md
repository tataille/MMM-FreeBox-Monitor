
![MMM-FreeBox-Monitor: The module for MagicMirror. ](2016-06-30_14-34-46.png)

# Module: MMM-FreeBox-Monitor

This module is intended to be used in [MagicMirror²!](https://github.com/MichMich/MagicMirror).

The `MMM-FreeBox-Monitor` displays data from your FreeBox v6 server (Revolution) from the french ISP free. It can combine multiple data

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: 'MMM-FreeBox-Monitor',
		position: 'top_left',	// This can be any of the regions. Best results in left or right regions.
		config: {
			mirrorName: "My Magic Mirror",
			ip: "http://XXX.XXX.XXX.XXX"
			// See 'Configuration options' for more information.
		}
	}
]
````

## Configuration options

The following properties can be configured:

| **Option**| **Description** |
| --- | --- |
| `ip` | The IP address of the FreeBox Server. You can use the internal or external IP address of the FreeBox Server, you can use [http://www.myipaddress.com/](http://www.myipaddress.com/) service to get it. Default FreeBox Server ip is [http://192.168.0.254](http://192.168.0.254).<br><br>**Possible values:** any IP address prefixed by _http://_ |
| `maxCallEntries` | The maximum number of missed calls shown.<br><br>**Possible values:** ``0`` - ``100`` <br>**Default value:** ``3`` |
| `displaySystemData` | Display missed calls table.<br/><br/> **Possible values:** ``true`` or ``false``<br/>**Default value:** ``true`` |
| `displayDownloads` | Display downloaded files table.<br/><br/> **Possible values:** ``true`` or ``false``<br/>**Default value:** ``true`` |
| `mirrorName` | The mirror name used to identify the mirror on Freebox Server. Useful in case of multiple mirrors. <br/><br/> **Possible values:** ``string``<br/>**Default value:** ``My Magic Mirror`` |
| `requestRefresh` | The refresh interval in seconds to request refrest on Freebox Server. <br/><br/> **Possible values:** ``30`` \- ``300``<br/>**Default value:** ``30`` |

#### FreeBox Monitor registration:

Before starting the Magic Mirror. Open your Freebox admin page at [http://mafreebox.freebox.fr](http://mafreebox.freebox.fr) -> _Paramètres de la Freebox_ -> _Gestion des accès_. Check that _Permettre les nouvelles demandes d'association_ is checked.

![MMM-FreeBox-Monitor: Application association ](2016-11-23_21-43-40.png)

The first time the Magic Mirror starts, a request is sent to Freebox Server to register the application. Select ``Oui`` on LCD display to register the mirror.

![MMM-FreeBox-Monitor: Registration ](20160630_234117.png)

Once session is opened, a file ``freebox.txt`` is created at the root of Magic Mirror installation directory. If you change the configuration for ``mirrorName`` or ``ip``, you must delete this file.

## Dependencies
- installed via `npm install`
