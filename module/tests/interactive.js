/* global module, forge, asyncTest, start, equal, ok, askQuestion */

module("forge.request.ajax");
// forge.flags.promises(true);

if (forge.file) {

    asyncTest("raw image upload", 1, function() {
        forge.file.getImage({
            width: 128,
            height: 128
        }, function (file) {
            forge.request.ajax({
                url: "https://ops.trigger.io/75d92dce/tests/upload_silent.php",
                files: [file],
                fileUploadMethod: "raw",
                success: function (data) {
                    equal(data, "OK", "Success");
                    start();
                },
                error: function (e) {
                    ok(false, "forge.request.ajax failed: " + JSON.stringify(e));
                    start();
                },
                progress: function (progress) {
                    askQuestion("Progress: " + Math.round(100 * progress.done / progress.total) + "%");
                }
            });
        });
    });


    asyncTest("form-encoded images upload", 1, function() {
        forge.file.getImages({
            width: 128,
            height: 128
        }, function (files) {
            forge.request.ajax({
                url: "https://ops.trigger.io/75d92dce/tests/upload_silent.php",
                files: files,
                success: function (data) {
                    forge.logging.log("RESPONSE: " + data);
                    equal(data, "OK", "Success");
                    start();
                },
                error: function (e) {
                    ok(false, "forge.request.ajax failed: " + JSON.stringify(e));
                    start();
                }
            });
        });
    });


    asyncTest("pause", 1, function () {
        askQuestion("Press ok to continue", {
            Ok: function () {
                ok(true, "Success");
                start();
            }
        });
    });
}


asyncTest("File upload - progress", 1, function() {
    forge.tools.getLocal("fixtures/request/test.zip", function (file) {
        forge.request.ajax({
            url: "https://ops.trigger.io/75d92dce/tests/upload_silent.php",
            files: [file],
            success: function (data) {
                equal(data, "OK", "Success");
                start();
            },
            error: function (e) {
                ok(false, "forge.request.ajax failed: " + JSON.stringify(e));
                start();
            },
            progress: function (progress) {
                askQuestion("Progress: " + Math.round(100 * progress.done / progress.total) + "%");
            }
        });
    }, function (e) {
        ok(false, JSON.stringify(e));
        start();
    });
});




/*
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
                    askQuestion("Progress: " + Math.round(100 * progress.done / progress.total) + "%");
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
*/
