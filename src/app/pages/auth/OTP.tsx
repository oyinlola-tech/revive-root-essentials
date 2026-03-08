import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "../../components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../components/ui/input-otp";
import { resendOtp, verifyOtp } from "../../services/api";
import { getOtpResendErrorMessage, getOtpVerificationErrorMessage } from "../../utils/authErrorMessages";

export function OTP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const identifier = searchParams.get("identifier") || "";
  const redirect = searchParams.get("redirect");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!identifier) {
      setError("Missing account identifier. Start signup again.");
      return;
    }

    setLoading(true);
    try {
      const session = await verifyOtp({ identifier, otp });
      if (redirect && session.user.role === "user") {
        navigate(redirect);
        return;
      }
      if (session.user.role === "superadmin") {
        navigate("/super-admin");
        return;
      }
      if (session.user.role === "admin") {
        navigate("/admin");
        return;
      }
      navigate("/");
    } catch (err) {
      setError(getOtpVerificationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    if (!identifier) {
      setError("Missing account identifier. Start signup again.");
      return;
    }

    try {
      await resendOtp(identifier);
      setInfo("OTP sent again. Check your inbox.");
    } catch (err) {
      setError(getOtpResendErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Verify Your Account</h1>
        <p className="opacity-70">
          We&apos;ve sent a 6-digit code to your email address. Please enter it below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
              <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        {info && <p className="text-sm text-green-700 text-center">{info}</p>}

        <Button type="submit" className="w-full" disabled={otp.length !== 6 || loading}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>

        <div className="text-center text-sm">
          <p className="opacity-70 mb-2">Didn&apos;t receive the code?</p>
          <button type="button" className="font-semibold hover:opacity-70" onClick={handleResend}>
            Resend Code
          </button>
        </div>
      </form>
    </div>
  );
}
