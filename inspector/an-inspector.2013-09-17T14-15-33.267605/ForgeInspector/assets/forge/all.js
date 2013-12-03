/*! Copyright 2011 Trigger Corp. All rights reserved. */
(function(){var k={};var g={};k.config=window.forge.config;g.listeners={};var c={};var f=[];var e=null;var j=false;var l=function(){if(f.length>0){if(!g.debug||window.catalystConnected){j=true;while(f.length>0){var m=f.shift();if(m[0]=="logging.log"){console.log(m[1].message)}g.priv.call.apply(g.priv,m)}j=false}else{e=setTimeout(l,500)}}};g.priv={call:function(t,s,r,n){if((!g.debug||window.catalystConnected||t==="internal.showDebugWarning")&&(f.length==0||j)){var m=k.tools.UUID();var p=true;if(t==="button.onClicked.addListener"||t==="message.toFocussed"){p=false}if(r||n){c[m]={success:r,error:n,onetime:p}}var o={callid:m,method:t,params:s};g.priv.send(o);if(window._forgeDebug){try{o.start=(new Date().getTime())/1000;window._forgeDebug.forge.APICall.apiRequest(o)}catch(q){}}}else{f.push(arguments);if(!e){e=setTimeout(l,500)}}},send:function(m){throw new Error("Forge error: missing bridge to privileged code")},receive:function(m){if(m.callid){if(typeof c[m.callid]===undefined){k.log("Nothing stored for call ID: "+m.callid)}var o=c[m.callid];var n=(typeof m.content==="undefined"?null:m.content);if(o&&o[m.status]){o[m.status](m.content)}if(o&&o.onetime){delete c[m.callid]}if(window._forgeDebug){try{m.end=(new Date().getTime())/1000;window._forgeDebug.forge.APICall.apiResponse(m)}catch(p){}}}else{if(m.event){if(g.listeners[m.event]){g.listeners[m.event].forEach(function(q){if(m.params){q(m.params)}else{q()}})}if(g.listeners["*"]){g.listeners["*"].forEach(function(q){if(m.params){q(m.event,m.params)}else{q(m.event)}})}if(window._forgeDebug){try{m.start=(new Date().getTime())/1000;window._forgeDebug.forge.APICall.apiEvent(m)}catch(p){}}}}}};g.addEventListener=function(m,n){if(g.listeners[m]){g.listeners[m].push(n)}else{g.listeners[m]=[n]}};g.generateQueryString=function(n){if(!n){return""}if(!(n instanceof Object)){return new String(n).toString()}var o=[];var m=function(t,s){if(t===null){return}else{if(t instanceof Array){var q=0;for(var p in t){var r=(s?s:"")+"["+q+"]";q+=1;if(!t.hasOwnProperty(p)){continue}m(t[p],r)}}else{if(t instanceof Object){for(var p in t){if(!t.hasOwnProperty(p)){continue}var r=p;if(s){r=s+"["+p+"]"}m(t[p],r)}}else{o.push(encodeURIComponent(s)+"="+encodeURIComponent(t))}}}};m(n);return o.join("&").replace("%20","+")};g.generateMultipartString=function(n,p){if(typeof n==="string"){return""}var o="";for(var m in n){if(!n.hasOwnProperty(m)){continue}if(n[m]===null){continue}o+="--"+p+"\r\n";o+='Content-Disposition: form-data; name="'+m.replace('"','\\"')+'"\r\n\r\n';o+=n[m].toString()+"\r\n"}return o};g.generateURI=function(n,m){var o="";if(n.indexOf("?")!==-1){o+=n.split("?")[1]+"&";n=n.split("?")[0]}o+=this.generateQueryString(m)+"&";o=o.substring(0,o.length-1);return n+(o?"?"+o:"")};g.disabledModule=function(m,n){var o="The '"+n+"' module is disabled for this app, enable it in your app config and rebuild in order to use this function";k.logging.error(o);m&&m({message:o,type:"UNAVAILABLE",subtype:"DISABLED_MODULE"})};k.enableDebug=function(){g.debug=true;g.priv.call("internal.showDebugWarning",{},null,null);g.priv.call("internal.hideDebugWarning",{},null,null)};setTimeout(function(){if(window.forge&&window.forge.debug){alert("Warning!\n\n'forge.debug = true;' is no longer supported\n\nUse 'forge.enableDebug();' instead.")}},3000);k.is={mobile:function(){return false},desktop:function(){return false},android:function(){return false},ios:function(){return false},chrome:function(){return false},firefox:function(){return false},safari:function(){return false},ie:function(){return false},web:function(){return false},orientation:{portrait:function(){return false},landscape:function(){return false}},connection:{connected:function(){return true},wifi:function(){return true}}};k.is["mobile"]=function(){return true};k.is["android"]=function(){return true};k.is["orientation"]["portrait"]=function(){return g.currentOrientation=="portrait"};k.is["orientation"]["landscape"]=function(){return g.currentOrientation=="landscape"};k.is["connection"]["connected"]=function(){return g.currentConnectionState.connected};k.is["connection"]["wifi"]=function(){return g.currentConnectionState.wifi};var d=function(s,q,t){var o=[];stylize=function(v,u){return v};function m(u){return u instanceof RegExp||(typeof u==="object"&&Object.prototype.toString.call(u)==="[object RegExp]")}function n(u){return u instanceof Array||Array.isArray(u)||(u&&u!==Object.prototype&&n(u.__proto__))}function p(w){if(w instanceof Date){return true}if(typeof w!=="object"){return false}var u=Date.prototype&&Object.getOwnPropertyNames(Date.prototype);var v=w.__proto__&&Object.getOwnPropertyNames(w.__proto__);return JSON.stringify(v)===JSON.stringify(u)}function r(G,D){try{if(G&&typeof G.inspect==="function"&&!(G.constructor&&G.constructor.prototype===G)){return G.inspect(D)}switch(typeof G){case"undefined":return stylize("undefined","undefined");case"string":var u="'"+JSON.stringify(G).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return stylize(u,"string");case"number":return stylize(""+G,"number");case"boolean":return stylize(""+G,"boolean")}if(G===null){return stylize("null","null")}if(G instanceof Document){return(new XMLSerializer()).serializeToString(G)}var A=Object.keys(G);var H=q?Object.getOwnPropertyNames(G):A;if(typeof G==="function"&&H.length===0){var v=G.name?": "+G.name:"";return stylize("[Function"+v+"]","special")}if(m(G)&&H.length===0){return stylize(""+G,"regexp")}if(p(G)&&H.length===0){return stylize(G.toUTCString(),"date")}var w,E,B;if(n(G)){E="Array";B=["[","]"]}else{E="Object";B=["{","}"]}if(typeof G==="function"){var z=G.name?": "+G.name:"";w=" [Function"+z+"]"}else{w=""}if(m(G)){w=" "+G}if(p(G)){w=" "+G.toUTCString()}if(H.length===0){return B[0]+w+B[1]}if(D<0){if(m(G)){return stylize(""+G,"regexp")}else{return stylize("[Object]","special")}}o.push(G);var y=H.map(function(J){var I,K;if(G.__lookupGetter__){if(G.__lookupGetter__(J)){if(G.__lookupSetter__(J)){K=stylize("[Getter/Setter]","special")}else{K=stylize("[Getter]","special")}}else{if(G.__lookupSetter__(J)){K=stylize("[Setter]","special")}}}if(A.indexOf(J)<0){I="["+J+"]"}if(!K){if(o.indexOf(G[J])<0){if(D===null){K=r(G[J])}else{K=r(G[J],D-1)}if(K.indexOf("\n")>-1){if(n(G)){K=K.split("\n").map(function(L){return"  "+L}).join("\n").substr(2)}else{K="\n"+K.split("\n").map(function(L){return"   "+L}).join("\n")}}}else{K=stylize("[Circular]","special")}}if(typeof I==="undefined"){if(E==="Array"&&J.match(/^\d+$/)){return K}I=JSON.stringify(""+J);if(I.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)){I=I.substr(1,I.length-2);I=stylize(I,"name")}else{I=I.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'");I=stylize(I,"string")}}return I+": "+K});o.pop();var F=0;var x=y.reduce(function(I,J){F++;if(J.indexOf("\n")>=0){F++}return I+J.length+1},0);if(x>50){y=B[0]+(w===""?"":w+"\n ")+" "+y.join(",\n  ")+" "+B[1]}else{y=B[0]+w+" "+y.join(", ")+" "+B[1]}return y}catch(C){return"[No string representation]"}}return r(s,(typeof t==="undefined"?2:t))};var h=function(n,o){if("logging" in k.config){var m=k.config.logging.marker||"FORGE"}else{var m="FORGE"}n="["+m+"] "+(n.indexOf("\n")===-1?"":"\n")+n;g.priv.call("logging.log",{message:n,level:o});if(typeof console!=="undefined"){switch(o){case 10:if(console.debug!==undefined&&!(console.debug.toString&&console.debug.toString().match("alert"))){console.debug(n)}break;case 30:if(console.warn!==undefined&&!(console.warn.toString&&console.warn.toString().match("alert"))){console.warn(n)}break;case 40:case 50:if(console.error!==undefined&&!(console.error.toString&&console.error.toString().match("alert"))){console.error(n)}break;default:case 20:if(console.info!==undefined&&!(console.info.toString&&console.info.toString().match("alert"))){console.info(n)}break}}};var a=function(m,n){if(m in k.logging.LEVELS){return k.logging.LEVELS[m]}else{k.logging.__logMessage("Unknown configured logging level: "+m);return n}};var b=function(n){var q=function(r){if(r.message){return r.message}else{if(r.description){return r.description}else{return""+r}}};if(n){var p="\nError: "+q(n);try{if(n.lineNumber){p+=" on line number "+n.lineNumber}if(n.fileName){var m=n.fileName;p+=" in file "+m.substr(m.lastIndexOf("/")+1)}}catch(o){}if(n.stack){p+="\r\nStack trace:\r\n"+n.stack}return p}return""};k.logging={LEVELS:{ALL:0,DEBUG:10,INFO:20,WARNING:30,ERROR:40,CRITICAL:50},debug:function(n,m){k.logging.log(n,m,k.logging.LEVELS.DEBUG)},info:function(n,m){k.logging.log(n,m,k.logging.LEVELS.INFO)},warning:function(n,m){k.logging.log(n,m,k.logging.LEVELS.WARNING)},error:function(n,m){k.logging.log(n,m,k.logging.LEVELS.ERROR)},critical:function(n,m){k.logging.log(n,m,k.logging.LEVELS.CRITICAL)},log:function(n,m,q){if(typeof(q)==="undefined"){var q=k.logging.LEVELS.INFO}try{var o=a(k.config.logging.level,k.logging.LEVELS.ALL)}catch(p){var o=k.logging.LEVELS.ALL}if(q>=o){h(d(n,false,10)+b(m),q)}}};k.internal={ping:function(n,o,m){g.priv.call("internal.ping",{data:[n]},o,m)},call:g.priv.call,addEventListener:g.addEventListener,listeners:g.listeners};var i={};g.currentOrientation=i;g.currentConnectionState=i;g.addEventListener("internal.orientationChange",function(m){if(g.currentOrientation!=m.orientation){g.currentOrientation=m.orientation;g.priv.receive({event:"event.orientationChange"})}});g.addEventListener("internal.connectionStateChange",function(m){if(m.connected!=g.currentConnectionState.connected||m.wifi!=g.currentConnectionState.wifi){g.currentConnectionState=m;g.priv.receive({event:"event.connectionStateChange"})}});k.event={menuPressed:{addListener:function(n,m){g.addEventListener("event.menuPressed",n)}},backPressed:{addListener:function(n,m){g.addEventListener("event.backPressed",function(){n(function(){g.priv.call("event.backPressed_closeApplication",{})})})},preventDefault:function(n,m){g.priv.call("event.backPressed_preventDefault",{},n,m)},restoreDefault:function(n,m){g.priv.call("event.backPressed_restoreDefault",{},n,m)}},messagePushed:{addListener:function(n,m){g.addEventListener("event.messagePushed",n)}},orientationChange:{addListener:function(n,m){g.addEventListener("event.orientationChange",n);if(i&&g.currentOrientation!==i){g.priv.receive({event:"event.orientationChange"})}}},connectionStateChange:{addListener:function(n,m){g.addEventListener("event.connectionStateChange",n);if(i&&g.currentConnectionState!==i){g.priv.receive({event:"event.connectionStateChange"})}}},appPaused:{addListener:function(n,m){g.addEventListener("event.appPaused",n)}},appResumed:{addListener:function(n,m){g.addEventListener("event.appResumed",n)}}};k.reload={updateAvailable:function(n,m){g.priv.call("reload.updateAvailable",{},n,m)},update:function(n,m){g.priv.call("reload.update",{},n,m)},pauseUpdate:function(n,m){g.priv.call("reload.pauseUpdate",{},n,m)},applyNow:function(n,m){k.logging.error("reload.applyNow has been disabled, please see docs.trigger.io for more information.");m({message:"reload.applyNow has been disabled, please see docs.trigger.io for more information.",type:"UNAVAILABLE"})},applyAndRestartApp:function(n,m){g.priv.call("reload.applyAndRestartApp",{},n,m)},switchStream:function(n,o,m){g.priv.call("reload.switchStream",{streamid:n},o,m)},updateReady:{addListener:function(n,m){g.addEventListener("reload.updateReady",n)}},updateProgress:{addListener:function(n,m){g.addEventListener("reload.updateProgress",n)}}};k.tools={UUID:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(o){var n=Math.random()*16|0;var m=o=="x"?n:(n&3|8);return m.toString(16)}).toUpperCase()},getURL:function(n,o,m){g.priv.call("tools.getURL",{name:n.toString()},o,m)}};g.priv.send=function(n){if(window.__forge["callJavaFromJavaScript"]===undefined){return}var m=((n.params!==undefined)?JSON.stringify(n.params):"");window.__forge["callJavaFromJavaScript"](n.callid,n.method,m)};g.priv.send({callid:"ready",method:""});k._receive=g.priv.receive;window.forge=k})();(function () {
forge['request'] = {
	/**
	 * Get the response data from a URL. Imposes no cross-domain restrictions.
	 *
	 * See "ajax()" for more advanced options like setting headers, etc.
	 *
	 * @param {string} url
	 * @param {function(*)=} success Response data
	 * @param {function({message: string}=} error
	 */
	'get': function(url, success, error) {
		forge.request.ajax({
			url: url,
			dataType: "text",
			success: success && function () {
				try {
					arguments[0] = JSON.parse(arguments[0]);
				} catch (e) {}
				success.apply(this, arguments);
			},
			error: error
		});
	}
};


/**
 * Generate query string
 */
var generateQueryString = function (obj) {
	if (!obj) {
		return "";
	}
	if (!(obj instanceof Object)) {
		return new String(obj).toString();
	}
	
	var params = [];
	var processObj = function (obj, scope) {
		if (obj === null) {
			return;
		} else if (obj instanceof Array) {
			var index = 0;
			for (var x in obj) {
				var key = (scope ? scope : '') + '[' + index + ']';
				index += 1;
				if (!obj.hasOwnProperty(x)) continue;
				processObj(obj[x], key);
			}
		} else if (obj instanceof Object) {
			for (var x2 in obj) {
				if (!obj.hasOwnProperty(x2)) continue;
				var key2 = x2;
				if (scope) {
					key2 = scope + '[' + x2 + ']';
				}
				processObj(obj[x2], key2);
			}
		} else {
			params.push(encodeURIComponent(scope)+'='+encodeURIComponent(obj));
		}
	};
	processObj(obj);
	return params.join('&').replace('%20', '+');
};


/**
 * Generate a URI from an existing url and additional query data
 */
var generateURI = function (uri, queryData) {
	var newQuery = '';
	if (uri.indexOf('?') !== -1) {
		newQuery += uri.split('?')[1]+'&';
		uri = uri.split('?')[0];
	}
	newQuery += generateQueryString(queryData)+'&';
	// Remove trailing &
	newQuery = newQuery.substring(0,newQuery.length-1);
	return uri+(newQuery ? '?'+newQuery : '');
};

var generateMultipartString = function (obj, boundary) {
	if (typeof obj === "string") {
		return '';
	}
	var partQuery = '';
	for (var key in obj) {
		if (!obj.hasOwnProperty(key)) continue;
		if (obj[key] === null) continue;
		// TODO: recursive flatten

		var value = obj[key];
		if (Object.prototype.toString.call(value) === '[object Array]') {
			// value is an array
			for (var i = 0; i < value.length; i++) {
				var subPart = {};
				subPart[key + '[' + i + ']'] = value[i];
				partQuery += generateMultipartString(subPart, boundary);
			}
		} else {
			partQuery += '--'+boundary+'\r\n';
			partQuery += 'Content-Disposition: form-data; name="'+key.replace('"', '\\"')+'"\r\n\r\n';
			partQuery += obj[key].toString()+'\r\n';
		}
	}
	return partQuery;
};


forge['request']['ajax'] = function (options, success, error) {
	/**
	 * Perform ajax request.
	 *
	 * See jQuery.ajax for further details, not all jQuery options are supported.
	 *
	 * @param {Object} options Contains all relevant options
	 */

	var files = (options.files ? options.files : null);
	var fileUploadMethod = (options.fileUploadMethod ? options.fileUploadMethod : 'multipart');
	var url = (options.url ? options.url : null);
	success = success ? success : (options.success ? options.success : undefined);
	error = error ? error : (options.error ? options.error : undefined);
	var username = (options.username ? options.username : null);
	var password = (options.password ? options.password : null);
	var accepts = (options.accepts ? options.accepts : ["*/*"]);
	var cache = (options.cache ? options.cache : false);
	var contentType = (options.contentType ? options.contentType : null);
	var data = (options.data ? options.data : null);
	var dataType = (options.dataType ? options.dataType : null);
	var headers = (options.headers ? options.headers : {});
	var timeout = (options.timeout ? options.timeout : 60000);
	var type = (options.type ? options.type : 'GET');
	var progress = options.progress ? options.progress : null;

	if (typeof accepts === "string") {
		// Given "text/html" instead of ["text/html"].
		accepts = [accepts];
	}
	var boundary = null;
	if (files) {
		type = 'POST';
		if (fileUploadMethod == 'multipart') {
			boundary = forge.tools.UUID().replace(/-/g,"");
			data = generateMultipartString(data, boundary);
			contentType = "multipart/form-data; boundary="+boundary;
		} else if (fileUploadMethod == 'raw') {
			// Limit to one file
			if (files.length > 1) {
				forge.logging.warning("Only one file can be uploaded at once with type 'raw'");
				files = [files[0]];
			}
			data = null;
			// XXX: This should probably be set in native code.
			contentType = "image/jpg";
		}
	} else {
		if (type == 'GET') {
			url = generateURI(url, data);
			data = null;
		} else if (data) {
			data = generateQueryString(data);
			if (!contentType) {
				contentType = "application/x-www-form-urlencoded";
			}
		}
	}

	if (cache) {
		cache = {};
		cache['wm'+Math.random()] = Math.random();
		url = generateURI(url, cache);
	}
	if (accepts) {
		headers['Accept'] = accepts.join(',');
	}
	if (contentType) {
		headers['Content-Type'] = contentType;
	}
	
	// Catalyst output
	var debug = {};
	if (window._forgeDebug) {
		try {
			debug.id = forge.tools.UUID();
			debug.fromUrl = window.location.href;
			debug.reqTime = (new Date()).getTime() / 1000.0;
			debug.method = type;
			debug.data = data;
			debug.url = url;
			
			_forgeDebug.wi.NetworkNotify.identifierForInitialRequest(debug.id, debug.url, {
				url: debug.fromUrl,
				frameId: 0,
				loaderId: 0
			}, []);
			
			_forgeDebug.wi.NetworkNotify.willSendRequest(debug.id, debug.reqTime, {
				url: debug.url,
				httpMethod: debug.method,
				httpHeaderFields: {},
				requestFormData: debug.data
			}, {isNull: true});
		} catch (e) {}
	}

	var complete = false;
	var timer = setTimeout(function () {
		if (complete) return;
		complete = true;
		if (window._forgeDebug) {
			try {
				debug.respTime = (new Date()).getTime() / 1000.0;
				debug.respText = data;
				_forgeDebug.wi.NetworkNotify.didReceiveResponse(debug.id, debug.reqTime, "XHR", {
					mimeType: "Unknown",
					textEncodingName: "",
					httpStatusCode: 1,
					httpStatusText: "Failure",
					httpHeaderFields: {},
					connectionReused: false,
					connectionID: 0,
					wasCached: false
				});
				
				_forgeDebug.wi.NetworkNotify.setInitialContent(debug.id, debug.respText, "XHR");
				
				_forgeDebug.wi.NetworkNotify.didFinishLoading(debug.id, debug.respTime);
			} catch (e) {}
		}
		error && error({
			message: 'Request timed out',
			type: 'EXPECTED_FAILURE'
		});
	}, timeout);

	var progressId = null;
	if (progress !== null) {
		progressId = forge.tools.UUID();
		forge.internal.addEventListener('request.progress.'+progressId, progress);
	}

	forge.internal.call("request.ajax", {
		url: url,
		username: username,
		password: password,
		data: data,
		headers: headers,
		timeout: timeout,
		type: type,
		boundary: boundary,
		files: files,
		fileUploadMethod: fileUploadMethod,
		progress: progressId
	}, function (args) {
		var data = args.response, headers = args.headers;
		clearTimeout(timer);
		if (complete) return;
		complete = true;
		if (window._forgeDebug) {
			try {
				debug.respTime = (new Date()).getTime() / 1000.0;
				debug.respText = data;
				_forgeDebug.wi.NetworkNotify.didReceiveResponse(debug.id, debug.reqTime, "XHR", {
					mimeType: "Unknown",
					textEncodingName: "",
					httpStatusCode: 1,
					httpStatusText: "Success",
					httpHeaderFields: {},
					connectionReused: false,
					connectionID: 0,
					wasCached: false
				});
				
				_forgeDebug.wi.NetworkNotify.setInitialContent(debug.id, debug.respText, "XHR");
				
				_forgeDebug.wi.NetworkNotify.didFinishLoading(debug.id, debug.respTime);
			} catch (e) {}
		}
		try {
			if (dataType == 'xml') {
				// Borrowed from jQuery.
				var tmp, xml;
				if ( window.DOMParser ) { // Standard
					tmp = new DOMParser();
					xml = tmp.parseFromString(data , "text/xml");
				} else { // IE
					xml = new ActiveXObject( "Microsoft.XMLDOM" );
					xml.async = "false";
					xml.loadXML(data);
				}

				data = xml;
			} else if (dataType == 'json') {
				data = JSON.parse(data);
			}
		} catch (e) {
		}
		success && success(data, headers);
	}, function () {
		clearTimeout(timer);
		if (complete) return;
		complete = true;
		if (window._forgeDebug) {
			try {
				debug.respTime = (new Date()).getTime() / 1000.0;
				debug.respText = data;
				_forgeDebug.wi.NetworkNotify.didReceiveResponse(debug.id, debug.reqTime, "XHR", {
					mimeType: "Unknown",
					textEncodingName: "",
					httpStatusCode: 1,
					httpStatusText: "Failure",
					httpHeaderFields: {},
					connectionReused: false,
					connectionID: 0,
					wasCached: false
				});
				
				_forgeDebug.wi.NetworkNotify.setInitialContent(debug.id, debug.respText, "XHR");
				
				_forgeDebug.wi.NetworkNotify.didFinishLoading(debug.id, debug.respTime);
			} catch (e) {}
		}
		error && error.apply(this, arguments);
	});
};

})();