package io.trigger.forge.android.modules.request;

import android.content.res.AssetFileDescriptor;
import android.net.Uri;

import com.google.common.base.Throwables;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.CookiePolicy;
import java.util.List;
import java.util.Locale;
import java.util.Map.Entry;
import java.util.Vector;
import java.util.concurrent.TimeUnit;

import io.trigger.forge.android.core.ForgeStorage;
import okhttp3.Authenticator;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Credentials;
import okhttp3.Headers;
import okhttp3.OkHttpClient;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.Route;

import io.trigger.forge.android.core.ForgeApp;
import io.trigger.forge.android.core.ForgeFile;
import io.trigger.forge.android.core.ForgeLog;
import io.trigger.forge.android.core.ForgeParam;
import io.trigger.forge.android.core.ForgeTask;


public class API {

    public static void httpx(final ForgeTask task, @ForgeParam("url") String url) {
        Uri uri = Uri.parse(url);
        if (uri == null || (!uri.getScheme().equals("https") && !uri.getScheme().equals("http"))) {
            task.error("Bad URL", "BAD_INPUT", null);
            return;
        }

        // Builders
        OkHttpClient.Builder clientBuilder = new OkHttpClient.Builder();
        okhttp3.Request.Builder requestBuilder = new okhttp3.Request.Builder();
        requestBuilder = requestBuilder.url(url);

        // Timeout
        final int timeout = task.params.has("timeout") && !task.params.get("timeout").isJsonNull() ? task.params.get("timeout").getAsInt() : 60000;
        clientBuilder = clientBuilder.connectTimeout(timeout, TimeUnit.MILLISECONDS)
                         .writeTimeout(timeout, TimeUnit.MILLISECONDS)
                         .readTimeout(timeout, TimeUnit.MILLISECONDS);

        // Authentication
        final String username = task.params.has("username") && !task.params.get("username").isJsonNull() ? task.params.get("username").getAsString() : null;
        final String password = task.params.has("password") && !task.params.get("password").isJsonNull() ? task.params.get("password").getAsString() : null;
        if (username != null && password != null) {
            clientBuilder = clientBuilder.authenticator(new Authenticator() {
                @Override
                public okhttp3.Request authenticate(Route route, Response response) throws IOException {
                    String credential = Credentials.basic(username, password);
                    return response.request().newBuilder()
                            .header("Authorization", credential)
                            .build();
                }
            });
        }

        // Headers
        JsonObject headers = task.params.has("headers") && !task.params.get("headers").isJsonNull() ? task.params.getAsJsonObject("headers") : null;
        for (Entry<String, JsonElement> header : headers.entrySet()) {
            requestBuilder = requestBuilder.addHeader(header.getKey(), header.getValue().getAsString());
        }

        // Link WebView cookie store
        WebkitCookieManagerProxy cookieManagerProxy = new WebkitCookieManagerProxy(null, CookiePolicy.ACCEPT_ALL);
        clientBuilder.cookieJar(cookieManagerProxy);

        // Response handling
        Callback callback = new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                StringWriter sw = new StringWriter();
                PrintWriter pw = new PrintWriter(sw);
                e.printStackTrace(pw);
                JsonObject error = new JsonObject();
                error.addProperty("message", e.getLocalizedMessage());
                error.addProperty("content", sw.toString());
                error.addProperty("type", "UNEXPECTED_FAILURE");
                error.add("subtype", JsonNull.INSTANCE);
                error.addProperty("statusCode", 520);
                task.error(error);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    String status = String.valueOf(response.code());
                    JsonObject error = new JsonObject();
                    error.addProperty("message", "HTTP response code indicates failed request: " + status);
                    error.addProperty("type", "EXPECTED_FAILURE");
                    error.add("subtype", JsonNull.INSTANCE);
                    error.addProperty("statusCode", status);
                    error.addProperty("content", response.body().string());
                    task.error(error);
                    return;
                }

                JsonObject headers = new JsonObject();
                Headers responseHeaders = response.headers();
                for (int i = 0, size = responseHeaders.size(); i < size; i++) {
                    // standardize header capitalization
                    final char[] delim = {' ', '-'};
                    String header = WordUtils.capitalize(responseHeaders.name(i), delim);
                    headers.addProperty(header, responseHeaders.value(i));
                }
                String content = response.body().string();

                JsonObject ret = new JsonObject();
                ret.addProperty("response", content);
                ret.add("headers", headers);
                task.success(ret);
            }
        };


        // - Handle GET, DELETE, HEAD requests --

        String type = task.params.has("type") && !task.params.get("type").isJsonNull() ? task.params.get("type").getAsString().toUpperCase(Locale.ENGLISH) : "GET";
        if (type.equals("GET") || type.equals("DELETE") || type.equals("HEAD")) {
            requestBuilder.method(type, null);
            clientBuilder.build().newCall(requestBuilder.build()).enqueue(callback);
            return;
        }


        // - Handle POST, PUT requests --

        // Create Upload Streams
        List<InputStream> uploadStreams = null;
        try {
            uploadStreams = createUploadStreams(task.params);
        } catch (UnsupportedEncodingException e) {
            ForgeLog.w(Throwables.getStackTraceAsString(e));
            task.error("Failed uploading data");
            return;
        } catch (IOException e) {
            ForgeLog.w(Throwables.getStackTraceAsString(e));
            task.error("Failed to read file in order to upload it");
            return;
        }

        // Set Content type
        String contentType = task.params.has("contentType") && !task.params.get("contentType").isJsonNull() ? task.params.get("contentType").getAsString() : null;
        if (contentType == null) {
            ForgeLog.d("Try to get content type from headers");
            contentType = headers.has("Content-Type") ? headers.get("Content-Type").getAsString() : null;
        }
        if (contentType == null && task.params.has("files") && task.params.has("fileUploadMethod") && task.params.get("fileUploadMethod").getAsString().equals("raw")) {
            JsonArray files = task.params.getAsJsonArray("files");
            if (files.size() > 0) {
                ForgeFile file = new ForgeFile(files.get(0).getAsJsonObject());
                contentType = file.getMimeType();
            }
        }
        ForgeLog.d("Content type is: " + contentType);

        // Hook up progress callback
        final String progress = task.params.has("progress") && !task.params.get("progress").isJsonNull() ? task.params.get("progress").getAsString() : null;
        final ProgressDelegate.Listener uploadListener = new ProgressDelegate.Listener() {
            @Override public void update(long bytesRead, long contentLength, boolean done) {
                if (progress != null) {
                    JsonObject evt = new JsonObject();
                    evt.addProperty("total", contentLength);
                    evt.addProperty("done", bytesRead);
                    ForgeApp.event("request.progress." + progress, evt);
                }
            }
        };

        // Make Request
        RequestBody requestBody = new ProgressDelegate.Request(contentType, uploadStreams, uploadListener);
        if (type.equals("POST") || type.equals("PUT")) {
            requestBuilder.method(type, requestBody);
            clientBuilder.build().newCall(requestBuilder.build()).enqueue(callback);
            return;
        }

        task.error(new Exception("Unsupported http method."));
    }


    private static List<InputStream> createUploadStreams(JsonObject params) throws UnsupportedEncodingException, IOException {
        List<InputStream> uploadStreams = new Vector<>();

        String fileUploadMethod = params.has("fileUploadMethod") && !params.get("fileUploadMethod").isJsonNull() ? params.get("fileUploadMethod").getAsString() : "";
        if (fileUploadMethod.equals("raw") && params.has("files") && !params.get("files").isJsonNull()) {
            JsonArray files = params.getAsJsonArray("files");
            for (int i = 0; i < files.size(); i++) {
                JsonObject scriptObject = files.get(i).getAsJsonObject();
                ForgeFile forgeFile = new ForgeFile(scriptObject);
                AssetFileDescriptor fileDescriptor = ForgeStorage.getFileDescriptor(forgeFile);
                uploadStreams.add(fileDescriptor.createInputStream());
            }
            return uploadStreams;
        }

        String data = params.has("data") && !params.get("data").isJsonNull() ? params.get("data").getAsString() : null;
        if (data == null) {
            return uploadStreams;
        }

        uploadStreams.add(new ByteArrayInputStream(data.getBytes("UTF-8")));

        // multi-part
        if (params.has("boundary") && !params.get("boundary").isJsonNull()) {
            if (params.has("files") && !params.get("files").isJsonNull()) {
                JsonArray files = params.getAsJsonArray("files");
                for (int i = 0; i < files.size(); i++) {
                    JsonObject scriptObject = files.get(i).getAsJsonObject();
                    ForgeFile forgeFile = new ForgeFile(scriptObject);
                    AssetFileDescriptor fileDescriptor = ForgeStorage.getFileDescriptor(forgeFile);

                    String multipart_field_name = scriptObject.has("name")
                                                ? scriptObject.get("name").getAsString()
                                                : "" + i;
                    String multipart_filename = ForgeStorage.getScriptPath(forgeFile).getFileName().toString();

                    StringBuilder sb = new StringBuilder();
                    sb.append("--").append(params.get("boundary").getAsString()).append("\r\n");
                    sb.append("Content-Disposition: form-data; ");
                    sb.append("name=\"" + multipart_field_name + "\"; ");
                    sb.append("filename=\"" + multipart_filename + "\"\r\n");
                    sb.append("Content-Type: ").append(forgeFile.getMimeType()).append("\r\n\r\n");
                    uploadStreams.add(new ByteArrayInputStream(sb.toString().getBytes("UTF-8")));
                    uploadStreams.add(fileDescriptor.createInputStream());
                    uploadStreams.add(new ByteArrayInputStream("\r\n".getBytes("UTF-8")));
                }
            }
            uploadStreams.add(new ByteArrayInputStream(("--" + params.get("boundary").getAsString() + "--\r\n").getBytes("UTF-8")));
        }

        return uploadStreams;
    }
}
