import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { unsubscribeFromNewsletter } from "../services/api";
import { useSeo } from "../hooks/useSeo";

export function NewsletterUnsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing your unsubscribe request...");
  useSeo({
    title: "Newsletter Preferences | Revive Roots Essential",
    description: "Manage your newsletter preferences for Revive Roots Essential.",
    canonicalPath: "/newsletter/unsubscribe",
    noindex: true,
  });

  useEffect(() => {
    const token = (searchParams.get("token") || "").trim();
    if (!token) {
      setStatus("error");
      setMessage("Missing unsubscribe token. Please use the link from your email.");
      return;
    }

    const run = async () => {
      try {
        const response = await unsubscribeFromNewsletter(token);
        setStatus("success");
        setMessage(response.message || "You have been unsubscribed successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Unable to process unsubscribe request.");
      }
    };

    void run();
  }, [searchParams]);

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Newsletter Preferences</h1>
          <p className="opacity-80 mb-8">{message}</p>
          {status === "loading" && (
            <p className="text-sm opacity-70">Please wait...</p>
          )}
          {status !== "loading" && (
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
