``request``: Cross-domain requests
==================================

The ``forge.request`` namespace allows you to make cross-domain HTTP requests from your app.

Normally, in-page JavaScript is only able to make XMLHttpRequests (XHRs) to the same server as one hosting the current web page. With Forge, we recommend that your HTML / CSS / JS is local to the app for performance and off-line access. So you will need to use these methods to make calls to your server-side APIs.

##Config options

Permissions
:   This option is here for legacy support, as it is only used by forge apps built as browser extensions which require explicitly whitelisting domains requests can be made to.

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
