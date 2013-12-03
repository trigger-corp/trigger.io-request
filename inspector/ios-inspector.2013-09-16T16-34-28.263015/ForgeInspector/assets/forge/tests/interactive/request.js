module("forge.request.ajax");

var testRoot = 'http://ops.trigger.io/75d92dce/tests/';

if ("inspector" in forge) {
	asyncTest("File upload - progress", 1, function() {
		forge.request.ajax({
			url: testRoot + "upload_silent.php",
			files: [forge.inspector.getFixture("request", "test.zip")],
			success: function (data) {
				equal(data, 'OK', "Success");
				start();
			},
			error: function () {
				ok(false, "Ajax error callback");
				start();
			},
			progress: function (progress) {
				askQuestion("Progress: "+Math.round(100*progress.done/progress.total)+"%");
			}
		});
	});
}

