/*! Copyright 2011 Trigger Corp. All rights reserved. */
(function(){var m={};var n={};m.config=window.forge.config;n.listeners={};var p={};var i=[];var h=null;var a=false;var s=function(){if(i.length>0){if(!n.debug||window.catalystConnected){a=true;while(i.length>0){var t=i.shift();if(t[0]=="logging.log"){console.log(t[1].message)}n.priv.call.apply(n.priv,t)}a=false}else{h=setTimeout(s,500)}}};n.priv={call:function(A,z,y,u){if((!n.debug||window.catalystConnected||A==="internal.showDebugWarning")&&(i.length==0||a)){var t=m.tools.UUID();var w=true;if(A==="button.onClicked.addListener"||A==="message.toFocussed"){w=false}if(y||u){p[t]={success:y,error:u,onetime:w}}var v={callid:t,method:A,params:z};n.priv.send(v);if(window._forgeDebug){try{v.start=(new Date().getTime())/1000;window._forgeDebug.forge.APICall.apiRequest(v)}catch(x){}}}else{i.push(arguments);if(!h){h=setTimeout(s,500)}}},send:function(t){throw new Error("Forge error: missing bridge to privileged code")},receive:function(t){if(t.callid){if(typeof p[t.callid]===undefined){m.log("Nothing stored for call ID: "+t.callid)}var v=p[t.callid];var u=(typeof t.content==="undefined"?null:t.content);if(v&&v[t.status]){v[t.status](t.content)}if(v&&v.onetime){delete p[t.callid]}if(window._forgeDebug){try{t.end=(new Date().getTime())/1000;window._forgeDebug.forge.APICall.apiResponse(t)}catch(w){}}}else{if(t.event){if(n.listeners[t.event]){n.listeners[t.event].forEach(function(x){if(t.params){x(t.params)}else{x()}})}if(n.listeners["*"]){n.listeners["*"].forEach(function(x){if(t.params){x(t.event,t.params)}else{x(t.event)}})}if(window._forgeDebug){try{t.start=(new Date().getTime())/1000;window._forgeDebug.forge.APICall.apiEvent(t)}catch(w){}}}}}};n.addEventListener=function(t,u){if(n.listeners[t]){n.listeners[t].push(u)}else{n.listeners[t]=[u]}};n.generateQueryString=function(u){if(!u){return""}if(!(u instanceof Object)){return new String(u).toString()}var v=[];var t=function(B,A){if(B===null){return}else{if(B instanceof Array){var y=0;for(var w in B){var z=(A?A:"")+"["+y+"]";y+=1;if(!B.hasOwnProperty(w)){continue}t(B[w],z)}}else{if(B instanceof Object){for(var w in B){if(!B.hasOwnProperty(w)){continue}var z=w;if(A){z=A+"["+w+"]"}t(B[w],z)}}else{v.push(encodeURIComponent(A)+"="+encodeURIComponent(B))}}}};t(u);return v.join("&").replace("%20","+")};n.generateMultipartString=function(u,w){if(typeof u==="string"){return""}var v="";for(var t in u){if(!u.hasOwnProperty(t)){continue}if(u[t]===null){continue}v+="--"+w+"\r\n";v+='Content-Disposition: form-data; name="'+t.replace('"','\\"')+'"\r\n\r\n';v+=u[t].toString()+"\r\n"}return v};n.generateURI=function(u,t){var v="";if(u.indexOf("?")!==-1){v+=u.split("?")[1]+"&";u=u.split("?")[0]}v+=this.generateQueryString(t)+"&";v=v.substring(0,v.length-1);return u+(v?"?"+v:"")};n.disabledModule=function(t,u){var v="The '"+u+"' module is disabled for this app, enable it in your app config and rebuild in order to use this function";m.logging.error(v);t&&t({message:v,type:"UNAVAILABLE",subtype:"DISABLED_MODULE"})};m.enableDebug=function(){n.debug=true;n.priv.call("internal.showDebugWarning",{},null,null);n.priv.call("internal.hideDebugWarning",{},null,null)};setTimeout(function(){if(window.forge&&window.forge.debug){alert("Warning!\n\n'forge.debug = true;' is no longer supported\n\nUse 'forge.enableDebug();' instead.")}},3000);m.is={mobile:function(){return false},desktop:function(){return false},android:function(){return false},ios:function(){return false},chrome:function(){return false},firefox:function(){return false},safari:function(){return false},ie:function(){return false},web:function(){return false},orientation:{portrait:function(){return false},landscape:function(){return false}},connection:{connected:function(){return true},wifi:function(){return true}}};m.is["mobile"]=function(){return true};m.is["ios"]=function(){return true};m.is["orientation"]["portrait"]=function(){return n.currentOrientation=="portrait"};m.is["orientation"]["landscape"]=function(){return n.currentOrientation=="landscape"};m.is["connection"]["connected"]=function(){return n.currentConnectionState.connected};m.is["connection"]["wifi"]=function(){return n.currentConnectionState.wifi};var j=function(z,x,A){var v=[];stylize=function(C,B){return C};function t(B){return B instanceof RegExp||(typeof B==="object"&&Object.prototype.toString.call(B)==="[object RegExp]")}function u(B){return B instanceof Array||Array.isArray(B)||(B&&B!==Object.prototype&&u(B.__proto__))}function w(D){if(D instanceof Date){return true}if(typeof D!=="object"){return false}var B=Date.prototype&&Object.getOwnPropertyNames(Date.prototype);var C=D.__proto__&&Object.getOwnPropertyNames(D.__proto__);return JSON.stringify(C)===JSON.stringify(B)}function y(N,K){try{if(N&&typeof N.inspect==="function"&&!(N.constructor&&N.constructor.prototype===N)){return N.inspect(K)}switch(typeof N){case"undefined":return stylize("undefined","undefined");case"string":var B="'"+JSON.stringify(N).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return stylize(B,"string");case"number":return stylize(""+N,"number");case"boolean":return stylize(""+N,"boolean")}if(N===null){return stylize("null","null")}if(N instanceof Document){return(new XMLSerializer()).serializeToString(N)}var H=Object.keys(N);var O=x?Object.getOwnPropertyNames(N):H;if(typeof N==="function"&&O.length===0){var C=N.name?": "+N.name:"";return stylize("[Function"+C+"]","special")}if(t(N)&&O.length===0){return stylize(""+N,"regexp")}if(w(N)&&O.length===0){return stylize(N.toUTCString(),"date")}var D,L,I;if(u(N)){L="Array";I=["[","]"]}else{L="Object";I=["{","}"]}if(typeof N==="function"){var G=N.name?": "+N.name:"";D=" [Function"+G+"]"}else{D=""}if(t(N)){D=" "+N}if(w(N)){D=" "+N.toUTCString()}if(O.length===0){return I[0]+D+I[1]}if(K<0){if(t(N)){return stylize(""+N,"regexp")}else{return stylize("[Object]","special")}}v.push(N);var F=O.map(function(Q){var P,R;if(N.__lookupGetter__){if(N.__lookupGetter__(Q)){if(N.__lookupSetter__(Q)){R=stylize("[Getter/Setter]","special")}else{R=stylize("[Getter]","special")}}else{if(N.__lookupSetter__(Q)){R=stylize("[Setter]","special")}}}if(H.indexOf(Q)<0){P="["+Q+"]"}if(!R){if(v.indexOf(N[Q])<0){if(K===null){R=y(N[Q])}else{R=y(N[Q],K-1)}if(R.indexOf("\n")>-1){if(u(N)){R=R.split("\n").map(function(S){return"  "+S}).join("\n").substr(2)}else{R="\n"+R.split("\n").map(function(S){return"   "+S}).join("\n")}}}else{R=stylize("[Circular]","special")}}if(typeof P==="undefined"){if(L==="Array"&&Q.match(/^\d+$/)){return R}P=JSON.stringify(""+Q);if(P.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)){P=P.substr(1,P.length-2);P=stylize(P,"name")}else{P=P.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'");P=stylize(P,"string")}}return P+": "+R});v.pop();var M=0;var E=F.reduce(function(P,Q){M++;if(Q.indexOf("\n")>=0){M++}return P+Q.length+1},0);if(E>50){F=I[0]+(D===""?"":D+"\n ")+" "+F.join(",\n  ")+" "+I[1]}else{F=I[0]+D+" "+F.join(", ")+" "+I[1]}return F}catch(J){return"[No string representation]"}}return y(z,(typeof A==="undefined"?2:A))};var b=function(u,v){if("logging" in m.config){var t=m.config.logging.marker||"FORGE"}else{var t="FORGE"}u="["+t+"] "+(u.indexOf("\n")===-1?"":"\n")+u;n.priv.call("logging.log",{message:u,level:v});if(typeof console!=="undefined"){switch(v){case 10:if(console.debug!==undefined&&!(console.debug.toString&&console.debug.toString().match("alert"))){console.debug(u)}break;case 30:if(console.warn!==undefined&&!(console.warn.toString&&console.warn.toString().match("alert"))){console.warn(u)}break;case 40:case 50:if(console.error!==undefined&&!(console.error.toString&&console.error.toString().match("alert"))){console.error(u)}break;default:case 20:if(console.info!==undefined&&!(console.info.toString&&console.info.toString().match("alert"))){console.info(u)}break}}};var l=function(t,u){if(t in m.logging.LEVELS){return m.logging.LEVELS[t]}else{m.logging.__logMessage("Unknown configured logging level: "+t);return u}};var q=function(u){var x=function(y){if(y.message){return y.message}else{if(y.description){return y.description}else{return""+y}}};if(u){var w="\nError: "+x(u);try{if(u.lineNumber){w+=" on line number "+u.lineNumber}if(u.fileName){var t=u.fileName;w+=" in file "+t.substr(t.lastIndexOf("/")+1)}}catch(v){}if(u.stack){w+="\r\nStack trace:\r\n"+u.stack}return w}return""};m.logging={LEVELS:{ALL:0,DEBUG:10,INFO:20,WARNING:30,ERROR:40,CRITICAL:50},debug:function(u,t){m.logging.log(u,t,m.logging.LEVELS.DEBUG)},info:function(u,t){m.logging.log(u,t,m.logging.LEVELS.INFO)},warning:function(u,t){m.logging.log(u,t,m.logging.LEVELS.WARNING)},error:function(u,t){m.logging.log(u,t,m.logging.LEVELS.ERROR)},critical:function(u,t){m.logging.log(u,t,m.logging.LEVELS.CRITICAL)},log:function(u,t,x){if(typeof(x)==="undefined"){var x=m.logging.LEVELS.INFO}try{var v=l(m.config.logging.level,m.logging.LEVELS.ALL)}catch(w){var v=m.logging.LEVELS.ALL}if(x>=v){b(j(u,false,10)+q(t),x)}}};m.internal={ping:function(u,v,t){n.priv.call("internal.ping",{data:[u]},v,t)},call:n.priv.call,addEventListener:n.addEventListener,listeners:n.listeners};var r={};n.currentOrientation=r;n.currentConnectionState=r;n.addEventListener("internal.orientationChange",function(t){if(n.currentOrientation!=t.orientation){n.currentOrientation=t.orientation;n.priv.receive({event:"event.orientationChange"})}});n.addEventListener("internal.connectionStateChange",function(t){if(t.connected!=n.currentConnectionState.connected||t.wifi!=n.currentConnectionState.wifi){n.currentConnectionState=t;n.priv.receive({event:"event.connectionStateChange"})}});m.event={menuPressed:{addListener:function(u,t){n.addEventListener("event.menuPressed",u)}},backPressed:{addListener:function(u,t){n.addEventListener("event.backPressed",function(){u(function(){n.priv.call("event.backPressed_closeApplication",{})})})},preventDefault:function(u,t){n.priv.call("event.backPressed_preventDefault",{},u,t)},restoreDefault:function(u,t){n.priv.call("event.backPressed_restoreDefault",{},u,t)}},messagePushed:{addListener:function(u,t){n.addEventListener("event.messagePushed",u)}},orientationChange:{addListener:function(u,t){n.addEventListener("event.orientationChange",u);if(r&&n.currentOrientation!==r){n.priv.receive({event:"event.orientationChange"})}}},connectionStateChange:{addListener:function(u,t){n.addEventListener("event.connectionStateChange",u);if(r&&n.currentConnectionState!==r){n.priv.receive({event:"event.connectionStateChange"})}}},appPaused:{addListener:function(u,t){n.addEventListener("event.appPaused",u)}},appResumed:{addListener:function(u,t){n.addEventListener("event.appResumed",u)}}};m.reload={updateAvailable:function(u,t){n.priv.call("reload.updateAvailable",{},u,t)},update:function(u,t){n.priv.call("reload.update",{},u,t)},pauseUpdate:function(u,t){n.priv.call("reload.pauseUpdate",{},u,t)},applyNow:function(u,t){m.logging.error("reload.applyNow has been disabled, please see docs.trigger.io for more information.");t({message:"reload.applyNow has been disabled, please see docs.trigger.io for more information.",type:"UNAVAILABLE"})},applyAndRestartApp:function(u,t){n.priv.call("reload.applyAndRestartApp",{},u,t)},switchStream:function(u,v,t){n.priv.call("reload.switchStream",{streamid:u},v,t)},updateReady:{addListener:function(u,t){n.addEventListener("reload.updateReady",u)}},updateProgress:{addListener:function(u,t){n.addEventListener("reload.updateProgress",u)}}};m.tools={UUID:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(w){var u=Math.random()*16|0;var t=w=="x"?u:(u&3|8);return t.toString(16)}).toUpperCase()},getURL:function(u,v,t){n.priv.call("tools.getURL",{name:u.toString()},v,t)}};var o=[];var g=false;n.priv.get=function(){var t=JSON.stringify(o);o=[];return t};var f=[],k="zero-timeout-message";function d(t){f.push(t);window.postMessage(k,"*")}function c(t){setTimeout(t,0)}function e(t){if(t.source==window&&t.data==k){if(t.stopPropagation){t.stopPropagation()}if(f.length){f.shift()()}}}if(window.postMessage){if(window.addEventListener){window.addEventListener("message",e,true)}else{if(window.attachEvent){window.attachEvent("onmessage",e)}}window.setZeroTimeout=d}else{window.setZeroTimeout=c}n.priv.send=function(t){o.push(t);if(g&&!window.forge._flushing){window.forge._flushing=true;c(function(){window.location.href="forge://go"})}};document.addEventListener("DOMContentLoaded",function(){g=true;window.forge._flushing=true;c(function(){window.location.href="forge://go"})},false);m._get=n.priv.get;m._receive=function(){var t=arguments;if(typeof window.setZeroTimeout==="undefined"){setTimeout(function(){n.priv.receive.apply(this,t)},0)}else{c(function(){n.priv.receive.apply(this,t)})}};window.forge=m})();(function () {
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
	}, function (data, headers) {
		alert(headers);
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