import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { newsletterAPI } from '../services/api';
import { SEO } from '../components/SEO';

export default function NewsletterUnsubscribe() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your unsubscribe request...');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing unsubscribe token.');
      return;
    }

    newsletterAPI.unsubscribe(token)
      .then((response) => {
        setStatus('success');
        setMessage(response?.message || 'You have been unsubscribed successfully.');
      })
      .catch((error: any) => {
        setStatus('error');
        setMessage(error.message || 'Unable to unsubscribe with this link.');
      });
  }, [params]);

  return (
    <div className="min-h-screen page-section flex items-center justify-center px-4">
      <SEO
        title="Newsletter Unsubscribe"
        description="Manage your newsletter subscription preferences."
        canonicalPath="/newsletter/unsubscribe"
      />
      <div className="max-w-xl w-full border border-border rounded-lg bg-card p-8 text-center space-y-4">
        <h1 className="text-3xl">Newsletter Preferences</h1>
        <p className="text-muted-foreground">{message}</p>
        {status !== 'loading' && (
          <div className="pt-2">
            <Link to="/" className="underline underline-offset-4 hover:text-primary">
              Return to homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
