/* global $, module, forge, asyncTest, start, equal, ok, notEqual */

module("forge.request.ajax");

forge.tools.getFileFromSourceDirectory("fixtures/request/test.txt", function (file) {
    testsWithFixture(file);
});

var testsWithFixture = function (fixture) {
    asyncTest("HTTPS forge.request.get", 1, function() {
        forge.request.get("https://httpbin.org/get", function (data) {
            equal(data.url, "https://httpbin.org/get");
            start();
        }, apiError("request.get"));
    });

    asyncTest("HTTPS forge.request.ajax GET", 1, function() {
        forge.request.ajax({
            url: "https://httpbin.org/get",
            success: function (data) {
                data = JSON.parse(data);
                equal(data.url, "https://httpbin.org/get");
                start();
            },
            error: apiError("request.ajax")
        });
    });

    asyncTest("HTTP GET with BasicAuth", 2, function() {
        forge.request.ajax({
            url: "http://httpbin.org/basic-auth/username/password",
            username: "username",
            password: "password",
            success: function (data) {
                data = JSON.parse(data);
                equal(data.authenticated, true);
                equal(data.user, "username");
                start();
            },
            error: apiError("request.ajax")
        });
    });

    asyncTest("HTTPS GET with BasicAuth", 2, function() {
        forge.request.ajax({
            url: "https://httpbin.org/basic-auth/username/password",
            username: "username",
            password: "password",
            success: function (data) {
                data = JSON.parse(data);
                equal(data.authenticated, true);
                equal(data.user, "username");
                start();
            },
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
        });
    });

    asyncTest("HTTPS DELETE", 1, function() {
        forge.request.ajax({
            url: "https://httpbin.org/delete",
            type: "DELETE",
            success: function (data) {
                data = JSON.parse(data);
                equal(data.url, "https://httpbin.org/delete");
                start();
            },
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
        });
    });

    asyncTest("HTTP GET with header", 1, function() {
        forge.request.ajax({
            url: "http://httpbin.org/get",
            headers: {"X-Test": "hello"},
            success: function (data) {
                data = JSON.parse(data);
                equal(data.headers["X-Test"], "hello");
                start();
            },
            error: apiError("request.ajax")
        });
    });

    asyncTest("HTTPS GET with header", 1, function() {
        forge.request.ajax({
            url: "https://httpbin.org/get",
            headers: {"X-Test": "hello"},
            success: function (data) {
                data = JSON.parse(data);
                equal(data.headers["X-Test"], "hello");
                start();
            },
            error: apiError("request.ajax")
        });
    });

    asyncTest("HTTP Set cookie", 1, function() {
        forge.request.ajax({
            url: "http://httpbin.org/cookies/set?k1=v1&k2=v2&persisted=cookie",
            success: function () {
                ok(true, "Success");
                start();
            },
            error: apiError("request.ajax")
        });
    });

    asyncTest("Test cookie persisted across runs", 1, function () {
        forge.request.ajax({
            url: "https://httpbin.org/cookies",
            success: function (data) {
                forge.logging.log("GOT: " + data);
                data = JSON.parse(data);
                equal(data.cookies.persisted, "cookie");
                start();
            },
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
        });
    });

    asyncTest("HTTP Delete cookie", 1, function() {
        forge.request.ajax({
            url: "http://httpbin.org/cookies/delete?k1",
            success: function () {
                ok(true, "Success");
                start();
            },
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
        });
    });

    asyncTest("HTTPS Set cookie", 1, function() {
        forge.request.ajax({
            url: "https://httpbin.org/cookies/set?sk1=v1&sk2=v2",
            success: function () {
                ok(true, "Success");
                start();
            },
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
        });
    });

    asyncTest("HTTPS Delete cookie", 1, function() {
        forge.request.ajax({
            url: "https://httpbin.org/cookies/delete?sk1",
            success: function () {
                ok(true, "Success");
                start();
            },
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
        });
    });

    // disable cookie sharing tests until the cookie-pocalypse is over.
    /*asyncTest("Test sharing forge.request cookie with webview", 1, function () {
        forge.request.ajax({
            url: "https://httpbin.org/cookies/set?external=cookie1",
            success: function (data) {
                forge.logging.log("forge.request.ajax got: " + data);
                $.ajax({
                    url: "https://httpbin.org/cookies",
                    dataType: "text",
                    success: function (data) {
                        forge.logging.log("$.ajax got: " + data);
                        data = JSON.parse(data);
                        equal(data.cookies.external, "cookie1");
                        start();
                    },
                    error: apiError("$.ajax")
                });
            },
            error: apiError("request.ajax")
        });
    });

    asyncTest("Test sharing webview cookie with forge.request", 1, function () {
        $.ajax({
            url: "https://httpbin.org/cookies/set?external=cookie2",
            dataType: "text",
            success: function (data) {
                forge.logging.log("$.ajax got: " + data);
                forge.request.ajax({
                    url: "https://httpbin.org/cookies",
                    success: function (data) {
                        forge.logging.log("forge.request got: " + data);
                        data = JSON.parse(data);
                        equal(data.cookies.external, "cookie2");
                        start();
                    },
                    error: apiError("request.ajax")
                });
            },
            error: apiError("$.ajax")
            });
            });*/


    if ("inspector" in forge) {
        asyncTest("HTTP File upload", 1, function() {
            forge.request.ajax({
                url: "http://httpbin.org/post",
                files: [fixture],
                success: function (data) {
                    data = JSON.parse(data);
                    equal(data.files[0], "test", "Uploaded value");
                    start();
                },
                error: function () {
                    ok(false, "Ajax error callback");
                    start();
                }
            });
        });

        asyncTest("HTTP File upload with PUT", 1, function() {
            forge.request.ajax({
                type: "PUT",
                url: "http://httpbin.org/put",
                files: [fixture],
                success: function (data) {
                    data = JSON.parse(data);
                    equal(data.files[0], "test", "Uploaded value");
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
                files: [fixture],
                success: function (data) {
                    data = JSON.parse(data);
                    equal(data.files[0], "test", "Uploaded value");
                    start();
                },
                error: function () {
                    ok(false, "Ajax error callback");
                    start();
                }
            });
        });

        asyncTest("HTTPS File upload with PUT", 1, function() {
            forge.request.ajax({
                type: "PUT",
                url: "https://httpbin.org/put",
                files: [fixture],
                success: function (data) {
                    data = JSON.parse(data);
                    equal(data.files[0], "test", "Uploaded value");
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
                files: [fixture],
                fileUploadMethod: "raw",
                success: function (data) {
                    data = JSON.parse(data);
                    equal(data.data, "test", "Uploaded value");
                    start();
                },
                error: function () {
                    ok(false, "Ajax error callback");
                    start();
                }
            });
        });

        asyncTest("HTTP Raw file upload with PUT", 1, function() {
            forge.request.ajax({
                type: "PUT",
                url: "http://httpbin.org/put",
                files: [fixture],
                fileUploadMethod: "raw",
                success: function (data) {
                    data = JSON.parse(data);
                    equal(data.data, "test", "Uploaded value");
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
                files: [fixture],
                fileUploadMethod: "raw",
                success: function (data) {
                    data = JSON.parse(data);
                    equal(data.data, "test", "Uploaded value");
                    start();
                },
                error: function () {
                    ok(false, "Ajax error callback");
                    start();
                }
            });
        });

        asyncTest("HTTPS Raw file upload with PUT", 1, function() {
            forge.request.ajax({
                type: "PUT",
                url: "https://httpbin.org/put",
                files: [fixture],
                fileUploadMethod: "raw",
                success: function (data) {
                    data = JSON.parse(data);
                    equal(data.data, "test", "Uploaded value");
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
    var testRoot = "http://ops.trigger.io/75d92dce/tests/";
    var testData = testRoot + "data.php";
    var testJson = testRoot + "test.json";
    var testXml = testRoot + "test.xml";
    var test404 = testRoot + "notthere.html";
    var testSlow = testRoot + "slow.php";

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
            error: apiError("request.ajax")
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
                equal(data["HTTP_X_TEST"], "hello", "Check POST header");
                start();
            },
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
        });
    });

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
            error: apiError("request.ajax")
        });
    });

    asyncTest("DataType JSON as JSON", 1, function() {
        forge.request.ajax({
            url: testJson,
            dataType: "json",
            success: function (data) {
                equal(data.test, "data", "Check parsed value");
                start();
            },
            error: apiError("request.ajax")
        });
    });

    asyncTest("DataType JSON as text", 1, function() {
        forge.request.ajax({
            url: testJson,
            dataType: "text",
            success: function (data) {
                equal(data.replace(/\n/g,""), "{\"test\": \"data\"}", "Check parsed value");
                start();
            },
            error: apiError("request.ajax")
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
            error: apiError("request.ajax")
        });
    });

    asyncTest("DataType XML as text", 1, function() {
        forge.request.ajax({
            url: testXml,
            dataType: "text",
            success: function (data) {
                equal(data.replace(/\n/g,""), "<test>data</test>", "Check parsed value");
                start();
            },
            error: apiError("request.ajax")
        });
    });

    asyncTest("Simple 404", 2, function() {
        forge.request.ajax({
            url: test404,
            success: function () {
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
            success: function () {
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
            success: function () {
                ok(true, "Success");
                start();
            },
            error: apiError("request.ajax")
        });
    });

    asyncTest("Slow GET Timeout (1s)", 1, function() {
        forge.request.ajax({
            url: testSlow,
            timeout: 1000,
            success: function () {
                ok(false, "Page loaded, should have timed out.");
                start();
            },
            error: function () {
                ok(true, "Ajax error callback");
                start();
            }
        });
    });

    asyncTest("Data and no file: with array", 1, function() {
        var errorCallback = function (e) {
            ok(false, e.message);
            start();
        };

        forge.request.ajax({
            url: "http://httpbin.org/post",
            type: "POST",
            data: {
                a: [1, 2, 3]
            },
            success: function (resStr) {
                var res = JSON.parse(resStr);
                ok(res.form["a[0]"] === "1", "No array; with file: " + JSON.stringify(res.form));
                start();
            },
            error: errorCallback
        });
    });

    asyncTest("Data and file: no array", 1, function() {
        var file = fixture;
        var errorCallback = function (e) {
            ok(false, e.message);
            start();
        };

        forge.request.ajax({
            url: "http://httpbin.org/post",
            type: "POST",
            data: {
                a: 1
            },
            files: [file],
            success: function (resStr) {
                var res = JSON.parse(resStr);
                ok(res.form.a === "1", "No array; with file: " + JSON.stringify(res.form));
                start();
            },
            error: errorCallback
        });
    });

    asyncTest("Data and file: with array", 1, function() {
        var file = fixture;
        var errorCallback = function (e) {
            ok(false, e.message);
            start();
        };

        forge.request.ajax({
            url: "http://httpbin.org/post",
            type: "POST",
            data: {
                a: [1, 2, 3]
            },
            files: [file],
            success: function (resStr) {
                var res = JSON.parse(resStr);
                ok(res.form["a[0]"] === "1", "With array; with file: " + JSON.stringify(res.form));
                start();
            },
            error: errorCallback
        });
    });


    asyncTest("Response headers", 1, function() {
        var errorCallback = function (e) {
            ok(false, e.message);
            start();
        };

        forge.request.ajax({
            url: "http://httpbin.org/ip",
            type: "GET",
            success: function (resStr, resHeaders) {
                ok(resHeaders["Content-Type"] === "application/json", JSON.stringify(resHeaders));
                start();
            },
            error: errorCallback
        });
    });


    asyncTest("Error object", 4, function() {
        var errorCallback = function (e) {
            ok(e.hasOwnProperty("statusCode"), JSON.stringify(e));
            ok(e.hasOwnProperty("content"), JSON.stringify(e));
            ok(e.hasOwnProperty("type"), JSON.stringify(e));
            ok(e.statusCode === "418", JSON.stringify(e));
            start();
        };

        forge.request.ajax({
            url: "http://httpbin.org/status/418",
            type: "GET",
            success: function (resStr) {
                ok(false, "request was successful: " + resStr);
                start();
            },
            error: errorCallback
        });
    });

    asyncTest("Test SNI against badssl.com", 1, function() {
        forge.request.ajax({
            url: "https://badssl.com",
            type: "HEAD",
            success: function (data, headers) {
                forge.logging.log("GOT HEADERS: " + JSON.stringify(headers));
                equal(headers["Content-Type"].startsWith("text/html"), true);
                start();
            },
            error: apiError("request.ajax")
        });
    });

};
