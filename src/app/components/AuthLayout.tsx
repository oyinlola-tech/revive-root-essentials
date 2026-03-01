import { Outlet } from "react-router";
import { Link } from "react-router";
import { BRAND_LOGO_SRC, BRAND_NAME } from "../constants/branding";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img
              src={BRAND_LOGO_SRC}
              alt={BRAND_NAME}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-bold text-lg">{BRAND_NAME}</span>
          </Link>
          <Outlet />
        </div>
      </div>

      {/* Right side - Image (Desktop only) */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1736236560164-bc741c70bca5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBzdG9yZSUyMGludGVyaW9yfGVufDF8fHx8MTc3MjM1OTgzMXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Revive Roots Essential Store"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20" />
      </div>
    </div>
  );
}
