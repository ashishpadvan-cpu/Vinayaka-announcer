package com.vinayaka.announcer;

import android.content.Intent;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Locale;

@CapacitorPlugin(name = "AndroidTTS")
public class AndroidTTSPlugin extends Plugin {
    private static final String TAG = "AndroidTTSPlugin";
    private TextToSpeech tts;
    private boolean isReady = false;
    private PluginCall activeCall = null;

    @Override
    public void load() {
        super.load();
        initTTS();
    }

    private void initTTS() {
        if (tts != null) {
            try {
                tts.stop();
                tts.shutdown();
            } catch (Exception ignored) {}
        }

        tts = new TextToSpeech(getContext(), status -> {
            if (status == TextToSpeech.SUCCESS) {
                Locale telugu = new Locale("te", "IN");
                int res = tts.setLanguage(telugu);
                if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts.setLanguage(new Locale("te"));
                }
                isReady = true;
                Log.d(TAG, "TextToSpeech initialized successfully for Telugu.");
            } else {
                Log.e(TAG, "TextToSpeech initialization failed, code=" + status);
            }
        });

        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) {
                JSObject ret = new JSObject();
                ret.put("event", "start");
                ret.put("utteranceId", utteranceId);
                notifyListeners("ttsStart", ret);
            }

            @Override
            public void onDone(String utteranceId) {
                if (activeCall != null) {
                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    activeCall.resolve(ret);
                    activeCall = null;
                }
                JSObject ret = new JSObject();
                ret.put("event", "done");
                ret.put("utteranceId", utteranceId);
                notifyListeners("ttsDone", ret);
            }

            @Override
            public void onError(String utteranceId) {
                if (activeCall != null) {
                    // Do not hard-crash the call, resolve so queue continues
                    JSObject ret = new JSObject();
                    ret.put("success", false);
                    activeCall.resolve(ret);
                    activeCall = null;
                }
                JSObject ret = new JSObject();
                ret.put("event", "error");
                ret.put("utteranceId", utteranceId);
                notifyListeners("ttsError", ret);
            }
        });
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", isReady);
        call.resolve(ret);
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text", "");
        float rate = call.getFloat("rate", 1.0f);
        float pitch = call.getFloat("pitch", 1.0f);

        if (text == null || text.trim().isEmpty()) {
            call.reject("Text is empty");
            return;
        }

        if (tts == null || !isReady) {
            initTTS();
        }

        activeCall = call;
        if (tts != null) {
            tts.setSpeechRate(rate);
            tts.setPitch(pitch);
            Bundle params = new Bundle();
            String utteranceId = "utterance_" + System.currentTimeMillis();
            params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId);
        } else {
            call.reject("TTS engine unavailable");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        if (tts != null) {
            tts.stop();
        }
        if (activeCall != null) {
            activeCall.resolve();
            activeCall = null;
        }
        call.resolve();
    }

    @PluginMethod
    public void openTTSSettings(PluginCall call) {
        try {
            Intent intent = new Intent();
            intent.setAction("com.android.settings.TTS_SETTINGS");
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.handleOnDestroy();
    }
}
