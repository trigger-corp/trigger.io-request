package com.loopj.android.http;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

import org.apache.http.entity.AbstractHttpEntity;

public class InputStreamListEntity extends AbstractHttpEntity {
	private List<InputStream> streams;
	private int length = 0;
	private int written = 0;
	private int sent = 0;
	private AsyncHttpResponseHandler progressHandler;

	public InputStreamListEntity(AsyncHttpResponseHandler progressHandler, List<InputStream> streams) {
		for (InputStream in : streams) {
			try {
				length += in.available();
			} catch (IOException e) {
			}
		}
		this.streams = streams;
		this.progressHandler = progressHandler;
	}

	private void updateProgress(int count) {
		written += count;
		if (written - sent > 100000 || written == length) {
			sent = written;
			progressHandler.sendProgressMessage(written, length);
		}
	}

	@Override
	public InputStream getContent() throws IOException, IllegalStateException {
		throw new UnsupportedOperationException("getContent() is not supported. Use writeTo() instead.");
	}

	@Override
	public long getContentLength() {
		return this.length;
	}

	@Override
	public boolean isRepeatable() {
		return false;
	}

	@Override
	public boolean isStreaming() {
		return true;
	}

	@Override
	public void writeTo(OutputStream out) throws IOException {
		final byte[] tmp = new byte[4096];
		int l = 0;
		for (InputStream in : this.streams) {
			while ((l = in.read(tmp)) != -1) {
				out.write(tmp, 0, l);
				updateProgress(l);
			}
		}
	}
}
