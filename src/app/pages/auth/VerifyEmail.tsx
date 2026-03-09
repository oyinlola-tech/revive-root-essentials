import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { verifyEmailLink } from "../../services/api";
import { getDisplayErrorMessage } from "../../utils/uiErrorMessages";

export function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const redirect = searchParams.get("redirect");
  const [status, setStatus] = useState<"verifying" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const runVerification = async () => {
      if (!token) {
        if (!active) return;
        setStatus("error");
        setError("This verification link is incomplete. Start signup again.");
        return;
      }

      try {
        const session = await verifyEmailLink(token);
        if (!active) return;

        if (redirect && session.user.role === "user") {
          navigate(redirect, { replace: true });
          return;
        }
        if (session.user.role === "superadmin") {
          navigate("/super-admin", { replace: true });
          return;
        }
        if (session.user.role === "admin") {
          navigate("/admin", { replace: true });
          return;
        }
        navigate("/", { replace: true });
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setError(getDisplayErrorMessage(err, "Unable to verify this email right now."));
      }
    };

    void runVerification();

    return () => {
      active = false;
    };
  }, [navigate, redirect, token]);

  if (status === "verifying") {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Verifying Your Email</h1>
          <p className="opacity-70">Please wait while we confirm your account.</p>
        </div>
        <p className="text-sm opacity-70">You will be redirected automatically when verification finishes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Verification Failed</h1>
        <p className="opacity-70">This email link could not complete your signup.</p>
      </div>
      <p className="text-sm text-red-600">{error}</p>
      <div className="text-sm">
        <Link
          to="/auth/signup"
          className="font-semibold hover:opacity-70"
        >
          Start signup again
        </Link>
      </div>
    </div>
  );
}
