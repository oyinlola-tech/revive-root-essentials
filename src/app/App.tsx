import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CommerceProvider } from "./contexts/CommerceContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { WhatsAppFloatingButton } from "./components/WhatsAppFloatingButton";

export default function App() {
  return (
    <ErrorBoundary>
      <CommerceProvider>
        <>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-sm opacity-70">Loading page...</p>
              </div>
            }
          >
            <RouterProvider router={router} />
          </Suspense>
          <WhatsAppFloatingButton />
        </>
      </CommerceProvider>
    </ErrorBoundary>
  );
}
