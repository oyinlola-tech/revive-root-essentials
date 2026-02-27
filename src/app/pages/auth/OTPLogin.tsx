import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp';
import { authAPI } from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { SEO } from '../../components/SEO';

export default function OTPLogin() {
  const [step, setStep] = useState<'identifier' | 'verify'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otpType, setOtpType] = useState<'email' | 'phone'>('email');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // API Call: POST /auth/send-otp
      await authAPI.sendOTP({ identifier, type: otpType });
      toast.success('OTP sent successfully!');
      setStep('verify');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      // API Call: POST /auth/verify-otp
      const response = await authAPI.verifyOTP({ identifier, otp });
      localStorage.setItem('authToken', response.token);
      updateUser(response.user);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await authAPI.sendOTP({ identifier, type: otpType });
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f1ed] to-white px-4">
      <SEO
        title="OTP Login"
        description="Sign in securely with one-time password verification."
        canonicalPath="/login/otp"
        noIndex
      />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign in with OTP</CardTitle>
          <CardDescription className="text-center">
            {step === 'identifier'
              ? 'Choose where to receive your OTP'
              : 'Enter the 6-digit code we sent you'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'identifier' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label>OTP Delivery Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={otpType === 'email' ? 'default' : 'outline'}
                    onClick={() => setOtpType('email')}
                  >
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={otpType === 'phone' ? 'default' : 'outline'}
                    onClick={() => setOtpType('phone')}
                  >
                    SMS
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="identifier">{otpType === 'email' ? 'Email' : 'Phone Number'}</Label>
                <Input
                  id="identifier"
                  type={otpType === 'email' ? 'email' : 'tel'}
                  placeholder={otpType === 'email' ? 'your@email.com' : '+15551234567'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {otpType === 'email'
                    ? 'Use the email address linked to your account.'
                    : 'Use international format, e.g. +15551234567.'}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-center block">
                  OTP sent to {identifier} via {otpType === 'email' ? 'email' : 'SMS'}
                </Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep('identifier')}
                >
                  Change Email
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="underline underline-offset-4 hover:text-primary">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
