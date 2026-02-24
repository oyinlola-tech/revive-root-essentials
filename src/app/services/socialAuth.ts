type ConsentPayload = {
  acceptedTerms?: boolean;
  acceptedMarketing?: boolean;
  acceptedNewsletter?: boolean;
};

type OAuthState = ConsentPayload & {
  provider: 'google' | 'apple';
};

const GOOGLE_SCOPE = 'openid email profile';

const loadScript = (id: string, src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === 'true') return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

declare global {
  interface Window {
    google?: any;
    AppleID?: any;
  }
}

const safeBase64 = (value: string) => btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromSafeBase64 = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
};

const getOAuthCallbackUri = () => {
  const configured = (import.meta.env.VITE_OAUTH_CALLBACK_URI as string | undefined)?.trim();
  return configured || `${window.location.origin}/auth/oauth-callback`;
};

const encodeState = (state: OAuthState) => safeBase64(JSON.stringify(state));

export const decodeState = (state: string | null): OAuthState | null => {
  if (!state) return null;
  try {
    return JSON.parse(fromSafeBase64(state));
  } catch {
    return null;
  }
};

const createGoogleRedirectUrl = (consent: ConsentPayload) => {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();
  if (!clientId) throw new Error('Google login is not configured. Set VITE_GOOGLE_CLIENT_ID.');

  const callbackUri = getOAuthCallbackUri();
  const nonce = crypto.randomUUID();
  const state = encodeState({ provider: 'google', ...consent });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUri,
    response_type: 'id_token',
    scope: GOOGLE_SCOPE,
    nonce,
    state,
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const redirectToGoogleOAuth = (consent: ConsentPayload = {}) => {
  window.location.assign(createGoogleRedirectUrl(consent));
};

export const getGoogleIdToken = async (): Promise<string> => {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();
  if (!clientId) {
    throw new Error('Google login is not configured. Set VITE_GOOGLE_CLIENT_ID.');
  }

  await loadScript('google-identity-script', 'https://accounts.google.com/gsi/client');

  return new Promise<string>((resolve, reject) => {
    if (!window.google?.accounts?.id) {
      reject(new Error('Google Identity SDK unavailable.'));
      return;
    }

    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        finish(() => {
          if (!response?.credential) {
            reject(new Error('Google sign-in did not return a credential.'));
            return;
          }
          resolve(response.credential);
        });
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        finish(() => reject(new Error('Google popup was blocked or unavailable.')));
      }
    });
  });
};

export const redirectToAppleOAuth = async (consent: ConsentPayload = {}) => {
  const clientId = (import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined)?.trim();
  const redirectURI = (import.meta.env.VITE_APPLE_REDIRECT_URI as string | undefined)?.trim() || getOAuthCallbackUri();

  if (!clientId || !redirectURI) {
    throw new Error('Apple login is not configured. Set VITE_APPLE_CLIENT_ID and VITE_APPLE_REDIRECT_URI.');
  }

  await loadScript('apple-signin-script', 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');

  if (!window.AppleID?.auth) {
    throw new Error('Apple Sign-In SDK unavailable.');
  }

  window.AppleID.auth.init({
    clientId,
    scope: 'name email',
    redirectURI,
    usePopup: false,
    state: encodeState({ provider: 'apple', ...consent }),
    nonce: crypto.randomUUID(),
  });

  await window.AppleID.auth.signIn();
};

export const getAppleIdToken = async (): Promise<{ idToken: string; name?: string }> => {
  const clientId = (import.meta.env.VITE_APPLE_CLIENT_ID as string | undefined)?.trim();
  const redirectURI = (import.meta.env.VITE_APPLE_REDIRECT_URI as string | undefined)?.trim() || getOAuthCallbackUri();

  if (!clientId || !redirectURI) {
    throw new Error('Apple login is not configured. Set VITE_APPLE_CLIENT_ID and VITE_APPLE_REDIRECT_URI.');
  }

  await loadScript('apple-signin-script', 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js');

  if (!window.AppleID?.auth) {
    throw new Error('Apple Sign-In SDK unavailable.');
  }

  window.AppleID.auth.init({
    clientId,
    scope: 'name email',
    redirectURI,
    usePopup: true,
  });

  const result = await window.AppleID.auth.signIn();
  const idToken = result?.authorization?.id_token;
  if (!idToken) {
    throw new Error('Apple sign-in did not return an identity token.');
  }

  const firstName = result?.user?.name?.firstName || '';
  const lastName = result?.user?.name?.lastName || '';
  const name = `${firstName} ${lastName}`.trim() || undefined;

  return { idToken, name };
};

export const isPopupBlockedError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || '');
  return /popup|blocked|not displayed|cancelled|unavailable/i.test(message);
};

export const parseOAuthCallbackPayload = () => {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(window.location.search);

  const idToken = hashParams.get('id_token')
    || queryParams.get('id_token')
    || hashParams.get('identity_token')
    || queryParams.get('identity_token');
  const stateRaw = hashParams.get('state') || queryParams.get('state');
  const error = hashParams.get('error') || queryParams.get('error');
  const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

  return {
    idToken,
    state: decodeState(stateRaw),
    error,
    errorDescription,
  };
};
