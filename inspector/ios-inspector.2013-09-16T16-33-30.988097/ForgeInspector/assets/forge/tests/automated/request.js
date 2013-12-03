/* global module, forge, asyncTest, start, equal, ok, notEqual */

module("forge.request.ajax");

asyncTest("HTTP GET", 1, function() {
	forge.request.ajax({
		url: "http://httpbin.org/get",
		success: function (data) {
			data = JSON.parse(data);
			equal(data.url, "http://httpbin.org/get");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTPS GET", 1, function() {
	forge.request.ajax({
		url: "https://httpbin.org/get",
		success: function (data) {
			data = JSON.parse(data);
			equal(data.url, "http://httpbin.org/get");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTP DELETE", 1, function() {
	forge.request.ajax({
		url: "http://httpbin.org/delete",
		type: "DELETE",
		success: function (data) {
			data = JSON.parse(data);
			equal(data.url, "http://httpbin.org/delete");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTPS DELETE", 1, function() {
	forge.request.ajax({
		url: "https://httpbin.org/delete",
		type: "DELETE",
		success: function (data) {
			data = JSON.parse(data);
			equal(data.url, "http://httpbin.org/delete");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTP GET with data", 1, function() {
	forge.request.ajax({
		url: "http://httpbin.org/get",
		data: {
			test: "Hello"
		},
		success: function (data) {
			data = JSON.parse(data);
			equal(data.args.test, "Hello");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTPS GET with data", 1, function() {
	forge.request.ajax({
		url: "https://httpbin.org/get",
		data: {
			test: "Hello"
		},
		success: function (data) {
			data = JSON.parse(data);
			equal(data.args.test, "Hello");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTP GET with merged data", 2, function() {
	forge.request.ajax({
		url: "http://httpbin.org/get?abc=data",
		data: {
			test: "Hello"
		},
		success: function (data) {
			data = JSON.parse(data);
			equal(data.args.test, "Hello");
			equal(data.args.abc, "data");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTPS GET with merged data", 2, function() {
	forge.request.ajax({
		url: "https://httpbin.org/get?abc=data",
		data: {
			test: "Hello"
		},
		success: function (data) {
			data = JSON.parse(data);
			equal(data.args.test, "Hello");
			equal(data.args.abc, "data");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTP GET with header", 1, function() {
	forge.request.ajax({
		url: "http://httpbin.org/get",
		headers: {"X-Test": "hello"},
		success: function (data) {
			data = JSON.parse(data);
			equal(data.headers['X-Test'], "hello");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTPS GET with header", 1, function() {
	forge.request.ajax({
		url: "https://httpbin.org/get",
		headers: {"X-Test": "hello"},
		success: function (data) {
			data = JSON.parse(data);
			equal(data.headers['X-Test'], "hello");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTP Set cookie", 1, function() {
	forge.request.ajax({
		url: "http://httpbin.org/cookies/set?k1=v1&k2=v2",
		success: function () {
			ok(true, "Success");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTP Check cookie data", 2, function() {
	forge.request.ajax({
		url: "http://httpbin.org/cookies",
		success: function (data) {
			data = JSON.parse(data);
			equal(data.cookies.k1, "v1");
			equal(data.cookies.k2, "v2");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTP Delete cookie", 1, function() {
	forge.request.ajax({
		url: "http://httpbin.org/cookies/delete?k1",
		success: function () {
			ok(true, "Success");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTP Check cookie data", 2, function() {
	forge.request.ajax({
		url: "http://httpbin.org/cookies",
		success: function (data) {
			data = JSON.parse(data);
			notEqual(data.cookies.k1, "v1");
			equal(data.cookies.k2, "v2");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTPS Set cookie", 1, function() {
	forge.request.ajax({
		url: "https://httpbin.org/cookies/set?sk1=v1&sk2=v2",
		success: function () {
			ok(true, "Success");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTPS Check cookie data", 2, function() {
	forge.request.ajax({
		url: "https://httpbin.org/cookies",
		success: function (data) {
			data = JSON.parse(data);
			equal(data.cookies.sk1, "v1");
			equal(data.cookies.sk2, "v2");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTPS Delete cookie", 1, function() {
	forge.request.ajax({
		url: "https://httpbin.org/cookies/delete?sk1",
		success: function () {
			ok(true, "Success");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("HTTPS Check cookie data", 2, function() {
	forge.request.ajax({
		url: "https://httpbin.org/cookies",
		success: function (data) {
			data = JSON.parse(data);
			notEqual(data.cookies.sk1, "v1");
			equal(data.cookies.sk2, "v2");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

if ("inspector" in forge) {
	asyncTest("HTTP File upload", 1, function() {
		forge.request.ajax({
			url: "http://httpbin.org/post",
			files: [forge.inspector.getFixture("request", "test.txt")],
			success: function (data) {
				data = JSON.parse(data);
				equal(data.files[0], 'test', "Uploaded value");
				start();
			},
			error: function () {
				ok(false, "Ajax error callback");
				start();
			}
		});
	});

	asyncTest("HTTPS File upload", 1, function() {
		forge.request.ajax({
			url: "https://httpbin.org/post",
			files: [forge.inspector.getFixture("request", "test.txt")],
			success: function (data) {
				data = JSON.parse(data);
				equal(data.files[0], 'test', "Uploaded value");
				start();
			},
			error: function () {
				ok(false, "Ajax error callback");
				start();
			}
		});
	});

	asyncTest("HTTP Raw file upload", 1, function() {
		forge.request.ajax({
			url: "http://httpbin.org/post",
			files: [forge.inspector.getFixture("request", "test.txt")],
			fileUploadMethod: "raw",
			success: function (data) {
				data = JSON.parse(data);
				equal(data.data, 'test', "Uploaded value");
				start();
			},
			error: function () {
				ok(false, "Ajax error callback");
				start();
			}
		});
	});

	asyncTest("HTTPS Raw file upload", 1, function() {
		forge.request.ajax({
			url: "https://httpbin.org/post",
			files: [forge.inspector.getFixture("request", "test.txt")],
			fileUploadMethod: "raw",
			success: function (data) {
				data = JSON.parse(data);
				equal(data.data, 'test', "Uploaded value");
				start();
			},
			error: function () {
				ok(false, "Ajax error callback");
				start();
			}
		});
	});
}


// URL to a page which returns REQUEST_METHOD, HTTP headers, COOKIE, GET and POST data as a JSON object.
var testRoot = 'http://ops.trigger.io/75d92dce/tests/';
var testData = testRoot + 'data.php';
var testJson = testRoot + 'test.json';
var testXml = testRoot + 'test.xml';
var test404 = testRoot + 'notthere.html';
var testSlow = testRoot + 'slow.php';

// TODO: Port the rest of these to httpbin

asyncTest("POST with data", 2, function() {
	forge.request.ajax({
		url: testData,
		data: {test: "hello"},
		type: "POST",
		success: function (data) {
			data = JSON.parse(data);
			equal(data.REQUEST_METHOD, "POST", "Check request method");
			equal(data.POST_test, "hello", "Check POST data");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("POST with header", 2, function() {
	forge.request.ajax({
		url: testData,
		headers: {"X-Test": "hello"},
		data: {test: "Test"},
		type: "POST",
		success: function (data) {
			data = JSON.parse(data);
			equal(data.REQUEST_METHOD, "POST", "Check request method");
			equal(data['HTTP_X_TEST'], "hello", "Check POST header");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("POST with data string", 2, function() {
	forge.request.ajax({
		url: testData,
		data: JSON.stringify({test: "hello"}),
		type: "POST",
		success: function (data) {
			data = JSON.parse(data);
			equal(data.REQUEST_METHOD, "POST", "Check request method");
			equal(data.RAW_POST, JSON.stringify({test: "hello"}), "Check raw POST data");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

if (!forge.is.firefox()) { // Not supported by jetpack currently
	asyncTest("PUT with data string", 2, function() {
		forge.request.ajax({
			url: testData,
			data: JSON.stringify({test: "hello"}),
			type: "PUT",
			success: function (data) {
				data = JSON.parse(data);
				equal(data.REQUEST_METHOD, "PUT", "Check request method");
				equal(data.RAW_POST, JSON.stringify({test: "hello"}), "Check raw POST data");
				start();
			},
			error: function () {
				ok(false, "Ajax error callback");
				start();
			}
		});
	});
}

asyncTest("DataType JSON as JSON", 1, function() {
	forge.request.ajax({
		url: testJson,
		dataType: "json",
		success: function (data) {
			equal(data.test, "data", "Check parsed value");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("DataType JSON as text", 1, function() {
	forge.request.ajax({
		url: testJson,
		dataType: "text",
		success: function (data) {
			equal(data.replace(/\n/g,''), '{"test": "data"}', "Check parsed value");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("DataType XML as XML", 1, function() {
	forge.request.ajax({
		url: testXml,
		dataType: "xml",
		success: function (data) {
			equal($(data.firstChild).text(), "data", "Check parsed value");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("DataType XML as text", 1, function() {
	forge.request.ajax({
		url: testXml,
		dataType: "text",
		success: function (data) {
			equal(data.replace(/\n/g,''), '<test>data</test>', "Check parsed value");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("Simple 404", 2, function() {
	forge.request.ajax({
		url: test404,
		success: function (data) {
			ok(false, "Success");
			start();
		},
		error: function (data) {
			ok(true, "Ajax error callback -> " + JSON.stringify(data));
			equal(data.statusCode, "404", "Correct status code");
			start();
		}
	});
});

asyncTest("Bad URL", 1, function() {
	forge.request.ajax({
		url: "badsdfgsdf:///url",
		success: function (data) {
			ok(false, "Success");
			start();
		},
		error: function () {
			ok(true, "Ajax error callback");
			start();
		}
	});
});

asyncTest("Slow GET (2s)", 1, function() {
	forge.request.ajax({
		url: testSlow,
		success: function (data) {
			ok(true, "Success");
			start();
		},
		error: function () {
			ok(false, "Ajax error callback");
			start();
		}
	});
});

asyncTest("Slow GET Timeout (1s)", 1, function() {
	forge.request.ajax({
		url: testSlow,
		timeout: 1000,
		success: function (data) {
			ok(false, "Page loaded, should have timed out.");
			start();
		},
		error: function () {
			ok(true, "Ajax error callback");
			start();
		}
	});
});

// asyncTest("Data and file: no array", 1, function() {
// 	var file = forge.inspector.getFixture("request", "test.txt");
// 	var errorCallback = function (e) {
// 		ok(false, e.message);
// 	};

// 	forge.request.ajax({
// 		url: 'http://httpbin.org/post',
// 		type: 'POST',
// 		data: {
// 			a: 1
// 		},
// 		files: [file],
// 		success: function (resStr) {
// 			var res = JSON.parse(resStr);
// 			ok(res.form.a === '1', 'No array; with file: ' + JSON.stringify(res.form));
// 		},
// 		error: errorCallback
// 	});
// });

// asyncTest("Data and file: with array", 1, function() {
// 	var file = forge.inspector.getFixture("request", "test.txt");
// 	var errorCallback = function (e) {
// 		ok(false, e.message);
// 	};

// 	forge.request.ajax({
// 		url: 'http://httpbin.org/post',
// 		type: 'POST',
// 		data: {
// 			a: [1, 2, 3]
// 		},
// 		files: [file],
// 		success: function (resStr) {
// 			var res = JSON.parse(resStr);
// 			ok(res.form['a[0]'] === '1', 'With array; with file: ' + JSON.stringify(res.form));
// 		},
// 		error: errorCallback
// 	});
// });