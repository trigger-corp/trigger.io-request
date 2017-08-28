package io.trigger.forge.android.modules.request;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.ResponseBody;

import okio.Buffer;
import okio.BufferedSink;
import okio.BufferedSource;
import okio.ForwardingSource;
import okio.Okio;
import okio.Source;

import io.trigger.forge.android.core.ForgeLog;

public class ProgressDelegate {

    interface Listener {
        void update(long bytesRead, long contentLength, boolean done);
    }


    public static class Request extends RequestBody {

        MediaType mediaType;
        List<InputStream> inputStreams;
        Listener listener;

        private int length = 0;
        private int written = 0;
        private int sent = 0;

        Request(String contentType, List<InputStream> inputStreams, Listener listener) {
            try {
                this.mediaType = MediaType.parse(contentType);
            } catch (Exception ex) {
                ForgeLog.w("Unknown content type: " + contentType);
                this.mediaType = MediaType.parse("text/plain");
            }
            this.inputStreams = inputStreams;
            this.listener = listener;

            for (InputStream in : inputStreams) {
                try {
                    length += in.available();
                } catch (IOException e) {
                }
            }
        }

        @Override public long contentLength() {
            return this.length;
        }

        @Override
        public MediaType contentType() {
            return mediaType;
        }

        @Override
        public void writeTo(BufferedSink sink) throws IOException {
            final byte[] tmp = new byte[4096];
            int l = 0;
            for (InputStream in : this.inputStreams) {
                while ((l = in.read(tmp)) != -1) {
                    sink.write(tmp, 0, l);
                    updateProgress(l);
                }
            }
        }

        private void updateProgress(int count) {
            written += count;
            if (written - sent > 100000 || written == length) {
                sent = written;
                listener.update(written, length, written == length);
            }
        }
    }


    public static class Response extends ResponseBody {
        private final ResponseBody responseBody;
        private final Listener listener;
        private BufferedSource bufferedSource;

        Response(ResponseBody responseBody, Listener listener) {
            this.responseBody = responseBody;
            this.listener = listener;
        }

        @Override public MediaType contentType() {
            return responseBody.contentType();
        }

        @Override public long contentLength() {
            return responseBody.contentLength();
        }

        @Override public BufferedSource source() {
            if (bufferedSource == null) {
                bufferedSource = Okio.buffer(source(responseBody.source()));
            }
            return bufferedSource;
        }

        private Source source(Source source) {
            return new ForwardingSource(source) {
                long totalBytesRead = 0L;

                @Override public long read(Buffer sink, long byteCount) throws IOException {
                    long bytesRead = super.read(sink, byteCount);
                    // read() returns the number of bytes read, or -1 if this source is exhausted.
                    totalBytesRead += bytesRead != -1 ? bytesRead : 0;
                    listener.update(totalBytesRead, responseBody.contentLength(), bytesRead == -1);
                    return bytesRead;
                }
            };
        }
    }

}
