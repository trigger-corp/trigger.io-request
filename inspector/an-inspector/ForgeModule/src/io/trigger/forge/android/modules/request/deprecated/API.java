package io.trigger.forge.android.modules.request.deprecated;


import android.net.Uri;

import com.google.common.base.Throwables;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.loopj.android.http.AsyncHttpClient;
import com.loopj.android.http.AsyncHttpResponseHandler;
import com.loopj.android.http.InputStreamListEntity;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.CookieStore;
import org.apache.http.client.HttpResponseException;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Constructor;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Vector;

import io.trigger.forge.android.core.ForgeApp;
import io.trigger.forge.android.core.ForgeFile;
import io.trigger.forge.android.core.ForgeLog;
import io.trigger.forge.android.core.ForgeParam;
import io.trigger.forge.android.core.ForgeTask;

public class API {
    public static void ajax(final ForgeTask task, @ForgeParam("url") String url) {
        AsyncHttpClient client = new AsyncHttpClient();

        Uri uri = Uri.parse(url);

        if (uri == null || (!uri.getScheme().equals("https") && !uri.getScheme().equals("http"))) {
            task.error("Bad URL", "BAD_INPUT", null);
            return;
        }

        // Timeout
        int timeout = task.params.has("timeout") && !task.params.get("timeout").isJsonNull() ? task.params.get("timeout").getAsInt() : 60000;
        client.setTimeout(timeout);

        // Authentication
        String user = task.params.has("username") && !task.params.get("username").isJsonNull() ? task.params.get("username").getAsString() : null;
        String pass = task.params.has("password") && !task.params.get("password").isJsonNull() ? task.params.get("password").getAsString() : null;
        if (user != null && pass != null) {
            client.setBasicAuth(user, pass);
        }

        // Headers
        JsonObject headers = task.params.has("headers") && !task.params.get("headers").isJsonNull() ? task.params.getAsJsonObject("headers") : null;
        for (Map.Entry<String, JsonElement> header : headers.entrySet()) {
            client.addHeader(header.getKey(), header.getValue().getAsString());
        }

        // Link with webkit cookies
        CookieStore cookieStore = null;
        try {
            // Only available on ForgeCore >= 2.4.1
            Class forName = Class.forName("io.trigger.forge.android.core.ForgeCookieStore");
            Constructor<CookieStore> constructor = forName.getConstructor(new Class[] { String.class });
            cookieStore = constructor.newInstance(new Object[] { url });
        } catch (ClassNotFoundException e) {
            ForgeLog.d(e.toString());
            ForgeLog.d("Could not find ForgeCookieStore, falling back to WebkitCookieStore");
            cookieStore = new WebkitCookieStore(url);
        } catch (Exception e) {
            e.printStackTrace();
            ForgeLog.d(e.toString());
            ForgeLog.d("Could not instantiate ForgeCookieStore, falling back to WebkitCookieStore");
            cookieStore = new WebkitCookieStore(url);
        }
        client.setCookieStore(cookieStore);

        final String progress = task.params.has("progress") && !task.params.get("progress").isJsonNull() ? task.params.get("progress").getAsString() : null;

        AsyncHttpResponseHandler handler = new AsyncHttpResponseHandler() {
            @Override
            public void onSuccess(int statusCode, Header[] headers, String content) {
                JsonObject respObj = new JsonObject();
                JsonObject headersObj = new JsonObject();

                for (Header header : headers) {
                    headersObj.addProperty(header.getName(), header.getValue());
                }

                respObj.addProperty("response", content);
                respObj.add("headers", headersObj);
                task.success(respObj);
            }

            @Override
            public void onFailure(Throwable error, String content) {
                JsonObject errorObj = new JsonObject();
                String status = String.valueOf(((HttpResponseException) error).getStatusCode());
                errorObj.addProperty("message", "HTTP response code indicates failed request: " + status);
                errorObj.addProperty("type", "EXPECTED_FAILURE");
                errorObj.add("subtype", JsonNull.INSTANCE);
                errorObj.addProperty("statusCode", status);
                errorObj.addProperty("content", content);

                task.error(errorObj);
            }

            @Override
            public void onProgress(int position, int length) {
                if (progress != null) {
                    JsonObject evt = new JsonObject();
                    evt.addProperty("total", length);
                    evt.addProperty("done", position);
                    ForgeApp.event("request.progress."+progress, evt);
                }
            }

        };

        String type = "GET";
        if (task.params.has("type") && !task.params.get("type").isJsonNull()) {
            type = task.params.get("type").getAsString().toUpperCase(Locale.ENGLISH);
        }

        if (type.equals("GET")) {
            client.get(url, handler);
            return;
        } else if (type.equals("DELETE")) {
            client.delete(url, handler);
            return;
        }

        // Upload data
        List<InputStream> uploadStreams = new Vector<InputStream>();

        String data = task.params.has("data") && !task.params.get("data").isJsonNull() ? task.params.get("data").getAsString() : null;
        String fileUploadMethod = task.params.has("fileUploadMethod") && !task.params.get("fileUploadMethod").isJsonNull() ? task.params.get("fileUploadMethod").getAsString() : null;

        try {
            if (data != null) {
                uploadStreams.add(new ByteArrayInputStream(data.getBytes("UTF-8")));

                if (task.params.has("boundary") && !task.params.get("boundary").isJsonNull()) {
                    if (task.params.has("files") && !task.params.get("files").isJsonNull()) {
                        JsonArray files = task.params.getAsJsonArray("files");
                        for (int i = 0; i < files.size(); i++) {
                            JsonObject file = files.get(i).getAsJsonObject();

                            String filename; // multipart filename
                            String name = "" + i; // multipart field name
                            Boolean videoUpload = file.has("type") && file.get("type").getAsString().equals("video");

                            if (file.has("filename")) {
                                filename = file.get("filename").getAsString();
                            } else {
                                filename = videoUpload ? "file.mp4" : "file.jpg";
                            }

                            if (file.has("name") && !(!videoUpload && file.get("name").getAsString().equals("Image")) && !(videoUpload && file.get("name").getAsString().equals("Video"))) {
                                // name has been set by user
                                name = file.get("name").getAsString();
                            }

                            StringBuilder sb = new StringBuilder();
                            sb.append("--").append(task.params.get("boundary").getAsString()).append("\r\n");
                            sb.append("Content-Disposition: form-data; ");
                            sb.append("name=\"" + name + "\"; ");
                            sb.append("filename=\"" + filename + "\"\r\n");
                            sb.append("Content-Type: ").append(ForgeApp.getActivity().getContentResolver().getType(Uri.parse(file.get("uri").getAsString()))).append("\r\n\r\n");
                            uploadStreams.add(new ByteArrayInputStream(sb.toString().getBytes("UTF-8")));
                            try {
                                uploadStreams.add(new ForgeFile(ForgeApp.getActivity(), file).fd().createInputStream());
                            } catch (Exception e) {
                                ForgeLog.w(Throwables.getStackTraceAsString(e));
                                task.error("Failed to read file in order to upload it", "UNEXPECTED_FAILURE", null);
                                return;
                            }
                            uploadStreams.add(new ByteArrayInputStream("\r\n".getBytes("UTF-8")));
                        }
                    }
                    uploadStreams.add(new ByteArrayInputStream(("--" + task.params.get("boundary").getAsString() + "--\r\n").getBytes("UTF-8")));
                }
            } else if (fileUploadMethod.equals("raw")) {
                if (task.params.has("files") && !task.params.get("files").isJsonNull()) {
                    JsonArray files = task.params.getAsJsonArray("files");
                    for (int i = 0; i < files.size(); i++) {
                        JsonObject file = files.get(i).getAsJsonObject();
                        try {
                            uploadStreams.add(new ForgeFile(ForgeApp.getActivity(), file).fd().createInputStream());
                        } catch (Exception e) {
                            ForgeLog.w(Throwables.getStackTraceAsString(e));
                            task.error("Failed to read file in order to upload it");
                            return;
                        }
                    }
                }

            }
        } catch (UnsupportedEncodingException e) {
            ForgeLog.w(Throwables.getStackTraceAsString(e));
            task.error("Failed uploading data");
            return;
        }

        HttpEntity entity = null;

        entity = new InputStreamListEntity(handler, uploadStreams);

        if (type.equals("POST")) {
            client.post(ForgeApp.getActivity(), url, entity, null, handler);
        } else if (type.equals("PUT")) {
            client.put(ForgeApp.getActivity(), url, entity, null, handler);
        } else {
            task.error(new Exception("Unsupported http method."));
        }
    }
}
