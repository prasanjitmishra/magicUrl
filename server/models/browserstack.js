'use strict';
var open = require("open");


module.exports = function(Browserstack) {
    Browserstack.startBrowser = function(browsername, url, cb){
        
        if (browsername == "chrome") {
            const ch = require('child_process');
            const open = ch.exec('/usr/bin/google-chrome '+url, (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  cb(null, error);
                } else if (stderr){
                  cb(null, stderr);
                } else {
                    cb(null, stdout)
                }
              });
        } else if (browsername == "firefox") {
            const ch = require('child_process');
            const open = ch.exec('/usr/bin/firefox '+url,(error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  cb(null, error);
                } else if (stderr){
                  cb(null, stderr);
                } else {
                    cb(null, stdout)
                }
              });
        } else {
            cb (null, "unknown browser");
        }
    }

    Browserstack.stopBrowser = function(browsername, cb){
        
        if (browsername == "chrome") {
            const ch = require('child_process');
            const open = ch.exec('ps -ef | grep chrome', (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  cb(null, error);
                } else if (stderr){
                  cb(null, stderr);
                } else {
                    var data = stdout;

                    data = data.split("\n");
                    for(var i=0;i<data.length;i++) {
                        var pid = data[i].split(" ")[3];
                        console.log(pid);
                        const close = ch.exec('kill -9 '+pid);
                    }
                    
                    cb (null, "closed all processes.");
                    // cb(null, stdout)
                }
              });
        } else if (browsername == "firefox") {
            const ch = require('child_process');
            const open = ch.exec('ps -ef | grep firefox', (error, stdout, stderr) => {
                if (error) {
                  console.error(`exec error: ${error}`);
                  cb(null, error);
                } else if (stderr){
                  cb(null, stderr);
                } else {
                    var data = stdout;

                    data = data.split("\n");
                    for(var i=0;i<data.length;i++) {
                        var pid = data[i].split(" ")[3];
                        console.log(pid);
                        const close = ch.exec('kill -9 '+pid);
                    }
                    
                    cb (null, "closed all processes.");
                    // cb(null, stdout)
                }
              });
            
            // open.stdout.on('data', (data) => {
            //     data = data.split("\n");

            //     for(var i=0;i<data.length;i++) {
            //         var pid = data[1].split(" ")[3];
            //         const close = ch.exec('kill -9 '+pid);
            //     }
                
            //     cb (null, "closed all processes.");
                
            // });
        } else {
            cb (null, "unknown browser");
        }
    }

    Browserstack.remoteMethod(
    	'startBrowser',
    	{
	    	accepts: [
	    				{arg: 'browsername', type: 'string', required: true},
	    				{arg: 'url', type: 'string', http: { source: 'query' }}
	    			],
	        http: {path: '/start/:browsername', verb: 'get'},
	        returns: {arg: 'result', type: 'string', root:true}
    	}
    );


    Browserstack.remoteMethod(
    	'stopBrowser',
    	{
	    	accepts: [
	    				{arg: 'browsername', type: 'string', required: true}
	    			],
	        http: {path: '/stop/:browsername', verb: 'get'},
	        returns: {arg: 'result', type: 'string', root:true}
    	}
    );
};
