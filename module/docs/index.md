``request``: Cross-domain requests
==================================

The ``forge.request`` namespace allows you to make cross-domain HTTP requests from your app.

Normally, in-page JavaScript is only able to make XMLHttpRequests (XHRs) to the same server as one hosting the current web page. With Forge, we recommend that your HTML / CSS / JS is local to the app for performance and off-line access. So you will need to use these methods to make calls to your server-side APIs.

##Config options


Disable iOS ATS
:    Disable iOS App Transport Security (ATS) for your app.

Configure iOS ATS
:    Configure exceptions to iOS App Transport Security (ATS) for specific comains.

iOS App Transport Security improves the privacy and data integrity of connections between iOS apps and web services by enforcing minimum security requirements for HTTP-based networking requests.

---

::Important:: As of 01 January 2017 iOS Application Transport Security (ATS) will be mandatory for all apps submitted to the App Store. This means that the HTTP protocol **will no longer be supported on iOS** and all network communication between your app and remote services will need to conform to the following requirements:

* Encrypted using AES-128 or better.
* SHA-2 for certificates with either a 2048 bit or greater RSA key, or a 256 bit or greater Elliptic-Curve (ECC) key.
* Tansport Layer Security (TLS) protocol must be v1.2 or greater.
* All connection ciphers must be using forward secrecy. The following ciphers will be accepted:

For more information about the new requirements we highly recommend that you watch the [What's New In Security](https://developer.apple.com/videos/play/wwdc2016/706) session from WWDC 2016.

Apple will allow _some_ temporary exceptions to smooth the transition, but the rules moving forward are strict:

- Most exceptions will now need to be justified to Apple. _This will likely lead to delays during the approval process and may end with your app being rejected._
- `NSExceptionAllowsInsecureHTTPLoads` and `NSExceptionMinimumTLSVersion` will all require a reasonable justification for use.
- `NSExceptionRequiresForwardSecrecy` will _not_ require a justification for now. If used, this exception will be granted automatic approval. This is likely to change in future as forward secrecy becomes more widely spread.
- Content loaded inside of the WebView itself does not need to be encrypted.

---

Exceptions to ATS can be configured by adding a new entry and setting the following values:

* **Domain** The domain you would like to configure ATS exceptions for. e.g. `httpbin.org`
* **NSIncludesSubdomains** Override ATS for all subdomains of a domain you control.
* **NSExceptionAllowsInsecureHTTPLoads** Override ATS for HTTP requests to a domain you control.
* **NSExceptionRequiresForwardSecrecy** Override the requirement that a server supports perfect Forward Secrecy on a domain you control.
* **NSExceptionMinimumTLSVersion** Specify the minimum Transport Layer Security (TLS) version for a domain you control. Valid values are: `TLSv1.0` `TLSv1.1` `TLSv1.2`
* **NSThirdPartyExceptionAllowsInsecureHTTPLoads** Override ATS for HTTP requests to a domain you do not control.
* **NSThirdPartyExceptionRequiresForwardSecrecy** Override the requirement that a server supports perfect Forward Secrecy on a domain you do not control.
* **NSThirdPartyExceptionMinimumTLSVersion** Specify the minimum Transport Layer Security (TLS) version for a domain you do not control. Valid values are: `TLSv1.2` `TLSv1.1` `TLSv1.0`

For full documentation on the individual keys see the NSAppTransportSecurity section in [Apple's documentation.](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html#//apple_ref/doc/uid/TP40009251-SW33)

> ::ProTip:: Our heartfelt advice to Trigger.io customers is to make use of the exceptions during the grace period but, at the same time, start moving your HTTP infrastructure over to HTTPS sooner rather than later.
>
> If the cost or difficulty of getting set up with SSL certificates is a major barrier for your project, do check out [Let’s Encrypt](https://letsencrypt.org/).
> Let's Encrypt is a free, automated Certificate Authority that operates with support from a large number of sponsors such as Mozilla, the EFF, Chrome, and Cisco.




##API

!method: forge.request.get(url, callback, error)
!param: url `string` the URL to GET
!param: callback `function(content)` called with the retrieved content body as the only argument
!description: The callback function is invoked with the content body of the requested URL. JSON-encoded content will automatically be parsed into a JavaScript object.
!platforms: iOS, Android, Web
!param: error `function(content)` called with details of any error which may occur

> ::Note:: As this method is limited to ``GET`` requests and lacks the more advanced options
of [forge.request.ajax](index.html#forgerequestajaxoptions), it's recommended that ``forge.request.get`` is
only used in very simple scenarios.

!method: forge.request.ajax(options)
!param: options `object` jQuery-style parameters to control the request
!description: This function is closer to the [jQuery.ajax method](http://api.jquery.com/jQuery.ajax/) than [forge.request.get](index.html#forgerequestgeturl-callback-error). However, the full range of jQuery options are **not supported** for this method.
!platforms: iOS, Android, Web

> ::Note:: Unlike jQuery, we expect the URL for the the request to be passed
into the options hash, *not* as a positional parameter. Also, note that the
``error`` and ``success`` callbacks are *not* passed a jQuery XHR object.

Currently supported options:

-  accepts
-  cache
-  contentType
-  data
-  dataType
-  error
-  password
-  success
-  timeout
-  type
-  url
-  username
-  files (Mobile only, see forge.file <modules-file>)
-  fileUploadMethod
-  headers

Additional options:

- ``progress``: A callback that is called with a progress object while file uploads are happening, the progress object contains a ``total`` property for the total upload size and a ``done`` property for the amount uploaded so far.

### The ``success`` callback

The ``success`` callback is invoked if there were no problems in completing the request. It is invoked with two parameters:

- `data`: the data returned from the server, formatted according to the `dataType` parameter
- `headers`: a hash of response headers received from the server

### The ``error`` callback

The ``error`` callback is invoked with an object containing:

-  ``statusCode``: Status code returned from the server.
-  ``content``: Content returned from the server (if available).
-  ``type`` and ``subtype``: see the docs on error callbacks in [Using API Methods](/docs/current/getting_started/api.html) for
more detail

### Examples

    forge.request.ajax({
      type: 'POST',
      url: 'http://my.server.com/update/',
      data: {x: 1, y: "2"},
      dataType: 'json',
      headers: {
        'X-Header-Name': 'header value',
      },
      success: function(data, headers) {
        alert('Updated x to '+data.x);
        alert('Response headers: ' + JSON.stringify(headers));
      },
      error: function(error) {
        alert('Failed to update x: '+error.message);
      }
    });

You can control the name of uploaded files by setting the ``name``
attribute, e.g.:

    myFile.name = 'name_of_input';
    forge.request.ajax({
      type: 'POST',
      url: 'http://my.server.com/upload/',
      files: [myFile],
      success: function(data) {
        alert('Uploaded file as '+myFile.name);
      },
      error: function(error) {
        alert('Failed to upload file: '+error.message);
      }
    });

If you need to POST an image as the whole request body, use
``fileUploadMethod``. E.g.:

    forge.request.ajax({
      type: 'POST',
      url: 'http://my.server.com/upload_image/',
      fileUploadMethod: "raw",
      success: function(data) {
        alert('Uploaded image');
      }
    });

In this example, the ``Content-Type`` header will be set to
``image/jpeg`` and the POST body will consist of just the image data
with no extra encoding. This is useful in conjunction with services like
[Parse](https://www.parse.com/tutorials/saving-images).
