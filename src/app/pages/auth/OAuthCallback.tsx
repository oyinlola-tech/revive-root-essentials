import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { parseOAuthCallbackPayload } from '../../services/socialAuth';
import { SEO } from '../../components/SEO';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithApple } = useAuth();

  useEffect(() => {
    const run = async () => {
      const { idToken, state, error, errorDescription } = parseOAuthCallbackPayload();

      if (error) {
        toast.error(errorDescription || error || 'OAuth sign-in failed.');
        navigate('/login');
        return;
      }

      if (!idToken || !state?.provider) {
        toast.error('Invalid OAuth callback response.');
        navigate('/login');
        return;
      }

      try {
        if (state.provider === 'google') {
          await loginWithGoogle({
            idToken,
            acceptedTerms: state.acceptedTerms,
            acceptedMarketing: state.acceptedMarketing,
            acceptedNewsletter: state.acceptedNewsletter,
          });
        } else {
          await loginWithApple({
            idToken,
            acceptedTerms: state.acceptedTerms,
            acceptedMarketing: state.acceptedMarketing,
            acceptedNewsletter: state.acceptedNewsletter,
          });
        }

        toast.success('Authentication successful.');
        navigate('/');
      } catch (err: any) {
        toast.error(err.message || 'OAuth sign-in failed.');
        navigate('/login');
      }
    };

    void run();
  }, [loginWithApple, loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <SEO
        title="Authenticating"
        description="Completing social sign-in."
        canonicalPath="/auth/oauth-callback"
      />
      <div className="text-center">
        <h1 className="text-2xl mb-2">Completing sign in...</h1>
        <p className="text-muted-foreground">Please wait while we verify your account.</p>
      </div>
    </div>
  );
}
