package com.vinayaka.announcer;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.JavascriptInterface;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

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
