/* global module, forge, asyncTest, start, equal, ok, notEqual */

module("forge.request.ajax");

asyncTest("Data and file: no array", 1, function() {
	var file = forge.inspector.getFixture("request", "test.txt");
	var errorCallback = function (e) {
		ok(false, e.message);
	};

	forge.request.ajax({
		url: 'http://httpbin.org/post',
		type: 'POST',
		data: {
			a: 1
		},
		files: [file],
		success: function (resStr) {
			var res = JSON.parse(resStr);
			ok(res.form.a === '1', 'No array; with file: ' + JSON.stringify(res.form));
		},
		error: errorCallback
	});
});

asyncTest("Data and file: with array", 1, function() {
	var file = forge.inspector.getFixture("request", "test.txt");
	var errorCallback = function (e) {
		ok(false, e.message);
	};

	forge.request.ajax({
		url: 'http://httpbin.org/post',
		type: 'POST',
		data: {
			a: [1, 2, 3]
		},
		files: [file],
		success: function (resStr) {
			var res = JSON.parse(resStr);
			ok(res.form['a[0]'] === '1', 'With array; with file: ' + JSON.stringify(res.form));
		},
		error: errorCallback
	});
});