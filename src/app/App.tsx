import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CommerceProvider } from "./contexts/CommerceContext";

export default function App() {
  return (
    <CommerceProvider>
      <RouterProvider router={router} />
    </CommerceProvider>
  );
}
