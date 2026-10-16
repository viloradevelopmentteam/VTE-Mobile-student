import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

type TurnstileWebViewProps = {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
};

const SITE_KEY = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;

export function TurnstileWebView({
  onVerify,
  onError,
}: TurnstileWebViewProps) {
  const webViewRef = useRef<WebView>(null);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
  />

  <script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
    async
    defer
  ></script>

  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: hidden;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 70px;
    }
  </style>
</head>

<body>

<div
  class="cf-turnstile"
  data-sitekey="${SITE_KEY}"
  data-callback="onTurnstileSuccess"
  data-error-callback="onTurnstileError"
  data-expired-callback="onTurnstileExpired"
></div>

<script>
  function sendMessage(type, value) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: type,
        value: value || null
      })
    );
  }

  function onTurnstileSuccess(token) {
    sendMessage('success', token);
  }

  function onTurnstileError(error) {
    sendMessage('error', error);
  }

  function onTurnstileExpired() {
    sendMessage('expired', null);
  }
</script>

</body>
</html>
`;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'success':
          if (message.value) {
            onVerify(message.value);
          }
          break;

        case 'error':
          onError?.(message.value ?? 'Turnstile verification failed');
          break;

        case 'expired':
          onError?.('Turnstile token expired');
          break;
      }
    } catch (error) {
      console.warn('Invalid Turnstile WebView message', error);
    }
  };

  if (!SITE_KEY) {
    console.warn(
      'EXPO_PUBLIC_TURNSTILE_SITE_KEY is not configured'
    );

    return null;
  }


  
  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{
          html,
          baseUrl: `${process.env.EXPO_PUBLIC_BASE_URL}`,
        }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        scrollEnabled={false}
        automaticallyAdjustContentInsets={false}
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 80,
    marginTop: 20,
  },

  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});