/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_BACKEND_ORIGIN?: string;
  readonly VITE_SITE_NAME?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_DEFAULT_OG_IMAGE?: string;
  readonly VITE_TWITTER_HANDLE?: string;
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_WHATSAPP_MESSAGE?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_APPLE_CLIENT_ID?: string;
  readonly VITE_OAUTH_CALLBACK_URI?: string;
  readonly VITE_APPLE_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
