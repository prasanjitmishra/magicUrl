'use strict';

module.exports = function(Url) {
	
	/**
	 * [getUrl it check for burn limit, and redirects a short link to the original link ]
	 * @param  {[string]}   shortName [the short url to be redirected]
	 * @param  {[object]}   res       [request object]
	 * @param  {Function} 	cb        [callback function]
	 * @return {[object]}             [object containing original url and id of record]
	 */
	Url.getUrl = function(shortName,res,cb){
		Url.app.models.Url.findOne({where:
	        {
	            "shortName": shortName,
	            "isActive" : true
	        }})
	        .then(function(url, err){
	            if (err || url == null) {
	                return cb(null,{url:null});
	            }

	            return cb(null, {url:url.original,id:url.id});
		});
	};

	/**
	 * the format of the remote function getUrl
	 * @accepts : what does this function accepts
	 * @http : what is the end point and http verb
	 * @returns : what it returns
	 */
	Url.remoteMethod(
    	'getUrl',
    	{
	    	accepts: [
	    				{arg: 'shortName', type: 'string', required: true},
	    				{arg: 'res', type: 'object', http: { source: 'res' }}
	    			],
	        http: {path: '/custom/:shortName', verb: 'get'},
	        returns: {arg: 'result', type: 'string', root:true}
    	}
    );

	/**
	 * the format of the remote function
	 * @accepts : what does this function accepts
	 * @http : what is the end point and http verb
	 * @returns : what it returns
	 */
	Url.remoteMethod(
	    'createCustom', {
	      http: {
	        path: '/create',
	        verb: 'post'
	      },
	      accepts: [
	      	{
                    "arg": 'data',
                    "type": 'object',
                    "http": {source: 'body'}
            },
	        {arg: 'res', type: 'object', http: { source: 'res' }}
	      ],
	      returns: {
	        arg: 'result',
	        type: 'string'
	      }
	    }
	);
	/**
	 * this is the format of delete method
	 */
	Url.remoteMethod(
    	'deleteUrl',
    	{
	    	accepts: [
	        			{arg: 'shortName', type: 'string'}
	    			],
	        http: {path: '/delete/:shortName', verb: 'delete'},
	        returns: {arg: 'result', type: 'string'}
    	}
    );
	/**
	 * [createShortUrl this ccreate the short url for each original URL]
	 * @param  {[string]}   url    [original url]
	 * @param  {[string]}   active [to make a burnt lonk or active link, send false to make burnt link]
	 * @param  {[object]}   res    [request object]
	 * @param  {Function} 	cb     [call back function]
	 * @return {[string]}          [newly generated short url]
	 */
	Url.createCustom = function(data,res,cb){
		var time = new Date().getTime()
		var shortName = Url.toRadix(time, 36);
		
		if (data.url == undefined) {
			return cb(null, "Please send valid URL in query params.");
		}
		
		Url.app.models.Url.create({original:data.url,shortName: shortName,isActive:true})
	        .then(function(url, err){
	            if (err) {
	                return cb(null,"not able to fetch company service :"+err);
	            }
	            return cb(null, "http://"+res.req.headers.host+"/api/urls/custom/"+url.shortName);
	        });
	};
	/**
	 * [this is the remte hook, executes after getUrl function]
	 * @param  {[string]} 'getUrl'              [remote function name]
	 * @param  {[function]} (context,remoteMethodOutput, next)  [argumaents the callback function takes]
	 * @return {[object]}                       [returns string or redirect to new page]
	 */
	Url.afterRemote('getUrl', (context, remoteMethodOutput, next) => {
	  	let res = context.res;
	  	console.log(remoteMethodOutput);
	  	
	  	if (remoteMethodOutput.url == null) {
	  		res.send("Burn limit exceeded.");
	  		res.end('ok');
	  	} else {
		 	Url.app.models.Url.updateAll(
	                        {"id": remoteMethodOutput.id},
	                        {isActive:false})
		  	.then((responce,err) => {
		  		if(err) {
	  				res.send("requested url not found.");	
		  		}

			  	if (!(remoteMethodOutput.url.indexOf("http://") > -1 || remoteMethodOutput.url.indexOf("https://") > -1)) {
	            	remoteMethodOutput.url = "http://"+remoteMethodOutput.url;
	            }

	  			res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
				res.writeHead(301, { 'Location': remoteMethodOutput.url});
				res.end('ok');
		  	});
	  	}
	});

	/**
	 * [deleteUrl delete a short link]
	 * @param  {[string]}   shortName [short name of url]
	 * @param  {Function} 	cb        [callback fun]
	 * @return {[string]}             [responce]
	 */
	Url.deleteUrl = function(shortName,cb) {
		Url.app.models.Url.updateAll(
	                        {"shortName": shortName},
	                        {isActive:false})
	        .then(function(url, err){
	            if (err) {
	                return cb(null, err);
	            }

	            if (url.count == 0) {
	            	return cb(null, "No such short link found.");
	            }

	            return cb(null, "Successfully deleted.");
		});
	}
	
	/**
	 * [toRadix converts current time in milli-seconds to base 36]
	 * @param  {[integer]} N     [the numbwr u want to convert]
	 * @param  {[integer]} radix [radix]
	 * @return {[string]}       [base 36 encoded string]
	 */
	Url.toRadix = function(N,radix) {
		var HexN="", Q=Math.floor(Math.abs(N)), R;
		while (true) {
			R=Q%radix;
			HexN = "0123456789abcdefghijklmnopqrstuvwxyz".charAt(R) + HexN;
			Q = (Q-R)/radix; 
			if (Q==0) break;
		}
		
		return ((N<0) ? "-"+HexN : HexN);
	}
};
