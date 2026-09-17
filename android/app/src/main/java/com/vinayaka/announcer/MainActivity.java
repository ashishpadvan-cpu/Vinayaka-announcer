package com.vinayaka.announcer;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.JavascriptInterface;
import android.webkit.DownloadListener;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Log;
import android.util.Base64;
import android.net.Uri;
import android.content.ContentValues;
import android.provider.MediaStore;
import android.os.Environment;
import android.app.DownloadManager;
import android.widget.Toast;
import android.media.MediaScannerConnection;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.Locale;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "VinayakaMainActivity";
    private TextToSpeech directTTS;
    private boolean directReady = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AndroidTTSPlugin.class);
        super.onCreate(savedInstanceState);

        // Initialize Direct Android TextToSpeech as dual redundant engine
        directTTS = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                Locale telugu = new Locale("te", "IN");
                int res = directTTS.setLanguage(telugu);
                if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                    directTTS.setLanguage(new Locale("te"));
                }
                directReady = true;
                Log.d(TAG, "Direct Native Telugu TTS ready!");
            }
        });

        directTTS.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) {}

            @Override
            public void onDone(String utteranceId) {
                runOnUiThread(() -> {
                    WebView wv = getBridge().getWebView();
                    if (wv != null) {
                        wv.evaluateJavascript("if (window.onAndroidTTSDone) { window.onAndroidTTSDone(); }", null);
                    }
                });
            }

            @Override
            public void onError(String utteranceId) {
                runOnUiThread(() -> {
                    WebView wv = getBridge().getWebView();
                    if (wv != null) {
                        wv.evaluateJavascript("if (window.onAndroidTTSDone) { window.onAndroidTTSDone(); }", null);
                    }
                });
            }
        });

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            // Aggressively clear cache, web storage, and prevent disk caching of bundled assets
            webView.clearCache(true);
            try {
                android.webkit.WebStorage.getInstance().deleteAllData();
            } catch (Exception ignored) {}
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                try {
                    android.webkit.ServiceWorkerController swc = android.webkit.ServiceWorkerController.getInstance();
                    if (swc != null && swc.getServiceWorkerWebSettings() != null) {
                        swc.getServiceWorkerWebSettings().setCacheMode(android.webkit.WebSettings.LOAD_NO_CACHE);
                    }
                } catch (Exception ignored) {}
            }
            android.webkit.WebSettings webSettings = webView.getSettings();
            if (webSettings != null) {
                webSettings.setCacheMode(android.webkit.WebSettings.LOAD_NO_CACHE);
                webSettings.setDomStorageEnabled(true);
            }
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public boolean isAvailable() {
                    return directReady;
                }

                @JavascriptInterface
                public void speak(String text, float rate, float pitch) {
                    if (directTTS != null) {
                        directTTS.setSpeechRate(rate);
                        directTTS.setPitch(pitch);
                        Bundle params = new Bundle();
                        String id = "direct_" + System.currentTimeMillis();
                        params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, id);
                        directTTS.speak(text, TextToSpeech.QUEUE_FLUSH, params, id);
                    }
                }

                @JavascriptInterface
                public void stop() {
                    if (directTTS != null) {
                        directTTS.stop();
                    }
                }
            }, "AndroidNativeTTS");

            // Native MP3 Downloader Interface: writes MP3 files directly to Android Downloads folder
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public boolean isAvailable() {
                    return true;
                }

                @JavascriptInterface
                public boolean saveMp3(String base64Data, String filename) {
                    try {
                        if (filename == null || filename.trim().isEmpty()) {
                            filename = "Vinayaka_Announcement.mp3";
                        }
                        if (!filename.toLowerCase().endsWith(".mp3")) {
                            filename += ".mp3";
                        }
                        if (base64Data != null && base64Data.contains(",")) {
                            base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
                        }
                        byte[] audioBytes = Base64.decode(base64Data, Base64.DEFAULT);
                        if (audioBytes == null || audioBytes.length == 0) {
                            return false;
                        }

                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                            ContentValues values = new ContentValues();
                            values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
                            values.put(MediaStore.Downloads.MIME_TYPE, "audio/mpeg");
                            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/VinayakaAnnouncer");
                            Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                            if (uri != null) {
                                try (OutputStream os = getContentResolver().openOutputStream(uri)) {
                                    if (os != null) {
                                        os.write(audioBytes);
                                        os.flush();
                                    }
                                }
                            }
                        } else {
                            File dir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "VinayakaAnnouncer");
                            if (!dir.exists()) dir.mkdirs();
                            File file = new File(dir, filename);
                            try (FileOutputStream fos = new FileOutputStream(file)) {
                                fos.write(audioBytes);
                                fos.flush();
                            }
                            MediaScannerConnection.scanFile(
                                getApplicationContext(),
                                new String[]{file.getAbsolutePath()},
                                new String[]{"audio/mpeg"},
                                null
                            );
                        }

                        final String finalName = filename;
                        runOnUiThread(() -> {
                            Toast.makeText(getApplicationContext(), "✅ MP3 డౌన్‌లోడ్ అయింది (Downloads): " + finalName, Toast.LENGTH_LONG).show();
                        });
                        return true;
                    } catch (Exception e) {
                        Log.e(TAG, "Save MP3 error: " + e.getMessage(), e);
                        return false;
                    }
                }
            }, "AndroidNativeDownloader");

            // Attach DownloadListener to automatically catch standard HTTP MP3 downloads
            webView.setDownloadListener(new DownloadListener() {
                @Override
                public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                    try {
                        DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                        request.setMimeType("audio/mpeg");
                        String cookies = CookieManager.getInstance().getCookie(url);
                        if (cookies != null) request.addRequestHeader("cookie", cookies);
                        if (userAgent != null) request.addRequestHeader("User-Agent", userAgent);
                        request.setDescription("వినాయక చవితి మైక్ ప్రకటన MP3 ఆడియో ఫైల్");
                        String fileName = URLUtil.guessFileName(url, contentDisposition, "audio/mpeg");
                        if (!fileName.toLowerCase().endsWith(".mp3")) {
                            fileName += ".mp3";
                        }
                        request.setTitle(fileName);
                        request.allowScanningByMediaScanner();
                        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
                        DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                        if (dm != null) {
                            dm.enqueue(request);
                            Toast.makeText(getApplicationContext(), "MP3 డౌన్‌లోడ్ ప్రారంభమైంది: " + fileName, Toast.LENGTH_SHORT).show();
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Download error: " + e.getMessage(), e);
                    }
                }
            });
        }
    }

    @Override
    public void onDestroy() {
        if (directTTS != null) {
            directTTS.stop();
            directTTS.shutdown();
        }
        super.onDestroy();
    }
}
