import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CommerceProvider } from "./contexts/CommerceContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <CommerceProvider>
        <RouterProvider router={router} />
      </CommerceProvider>
    </ErrorBoundary>
  );
}
