/* global module, forge, asyncTest, start, equal, ok, askQuestion */

module("forge.request.ajax");
// forge.flags.promises(true);

var testRoot = 'http://ops.trigger.io/75d92dce/tests/';

if (forge.file) {
    asyncTest("File upload - image", 1, function() {
        forge.file.getImage({
            source: "gallery"
        }, function (file) {
            forge.request.ajax({
                url: testRoot + "upload_silent.php",
                files: [file],
                fileUploadMethod: "raw",
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
    });


    asyncTest("File upload - video", 1, function() {
        forge.file.getVideo({
            source: "gallery",
            videoQuality: "low"
        }, function (file) {
            forge.request.ajax({
                url: testRoot + "upload_silent.php",
                files: [file],
                fileUploadMethod: "raw",
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
    });
}

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


asyncTest("Test cookie persisted across runs", 1, function () {
    forge.request.ajax({
        url: "http://httpbin.org/cookies",
        success: function (data) {
            forge.logging.log("GOT: " + data);
            data = JSON.parse(data);
            equal(data.cookies.persisted, "cookie");
            start();
        },
        error: function () {
            ok(false, "Ajax error callback");
            start();
        }
    });
});


asyncTest("Background file download", 1, function() {
    askQuestion("Close the app once the transfer has started to test background download", {
        Ok: function () {
            forge.internal.call("request.httpx_background", {
                url: "https://s3.amazonaws.com/trigger-android-sdk/android-sdk-macosx.zip",
                error: function () {
                    ok(false, "Ajax error callback");
                    start();
                },
                progress: function (progress) {
                    askQuestion("Progress: "+Math.round(100*progress.done/progress.total)+"%");
                }
            }, function (data) {
                forge.logging.log("TODO: " + JSON.stringify(data));
                ok(true, "Success");
                start();
            }, function () {
                ok(false, "Ajax error callback");
                start();
            });
        }
    });
});
