import { Outlet } from "react-router";
import { Link } from "react-router";
import { BRAND_LOGO_SRC, BRAND_NAME } from "../constants/branding";
import { SITE_IMAGES } from "../constants/siteImages";

export function AuthLayout() {
  return (
    <div className="min-h-[100svh] flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full min-h-[100svh] md:min-h-0 md:w-1/2 flex items-center justify-center p-6 md:p-12">
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
          src={SITE_IMAGES.authHairAndSkin}
          alt="Revive Roots Essential Store"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/20" />
      </div>
    </div>
  );
}
