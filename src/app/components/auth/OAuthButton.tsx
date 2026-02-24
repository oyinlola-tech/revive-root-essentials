import { ButtonHTMLAttributes } from 'react';
import { cn } from '../ui/utils';

type Provider = 'google' | 'apple';

type OAuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  provider: Provider;
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2582h2.9086c1.7018-1.5668 2.6837-3.8741 2.6837-6.6155z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.4673-.806 5.9564-2.1791l-2.9086-2.2582c-.806.54-1.8368.8591-3.0478.8591-2.3432 0-4.3282-1.5827-5.0368-3.7091H.9573v2.3305C2.4382 15.9832 5.4818 18 9 18z" />
    <path fill="#FBBC05" d="M3.9632 10.7127C3.7832 10.1727 3.6818 9.5959 3.6818 9s.1014-1.1727.2814-1.7127V4.9568H.9573C.3477 6.1718 0 7.5464 0 9s.3477 2.8282.9573 4.0432l3.0059-2.3305z" />
    <path fill="#EA4335" d="M9 3.5782c1.3214 0 2.5078.4541 3.4405 1.3459l2.58-2.58C13.4632.8918 11.43 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9568l3.0059 2.3305C4.6718 5.1609 6.6568 3.5782 9 3.5782z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.37 1.43c0 1.14-.41 2.19-1.09 2.95-.74.84-1.95 1.49-3.02 1.4-.14-1.09.41-2.26 1.08-2.99.74-.81 2-1.39 3.03-1.36zM20.64 17.07c-.45 1.03-.99 1.98-1.66 2.91-.9 1.23-1.63 2.78-3.1 2.79-1.31.01-1.65-.84-3.43-.83-1.78.01-2.15.84-3.46.83-1.46-.01-2.15-1.42-3.05-2.65-2.52-3.46-2.78-7.52-1.23-9.91 1.1-1.7 2.85-2.69 4.5-2.69 1.69 0 2.75.88 4.14.88 1.34 0 2.16-.88 4.13-.88 1.47 0 3.03.8 4.13 2.18-3.63 1.98-3.04 7.13.03 9.37z" />
  </svg>
);

export function OAuthButton({ provider, className, children, ...props }: OAuthButtonProps) {
  const isGoogle = provider === 'google';
  return (
    <button
      {...props}
      className={cn(
        'w-full h-11 rounded-md border flex items-center justify-center gap-3 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
        isGoogle
          ? 'bg-white text-[#3c4043] border-[#dadce0] hover:bg-[#f8f9fa]'
          : 'bg-black text-white border-black hover:bg-[#1a1a1a]',
        className,
      )}
    >
      {isGoogle ? <GoogleIcon /> : <AppleIcon />}
      <span>{children || (isGoogle ? 'Continue with Google' : 'Continue with Apple')}</span>
    </button>
  );
}
