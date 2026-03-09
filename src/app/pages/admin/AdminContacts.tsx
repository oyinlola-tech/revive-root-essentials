import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { getAuthSession, getContactSubmissions } from "../../services/api";
import { getDisplayErrorMessage } from "../../utils/uiErrorMessages";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export default function AdminContacts() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadMessages = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await getContactSubmissions();
      setMessages(data);
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to load contact messages."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      navigate("/auth/login");
      return;
    }

    if (!["admin", "superadmin"].includes(session.user.role)) {
      navigate("/");
      return;
    }

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMessages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return messages;

    return messages.filter((item) =>
      item.name.toLowerCase().includes(query)
      || item.email.toLowerCase().includes(query)
      || item.subject.toLowerCase().includes(query)
      || item.message.toLowerCase().includes(query),
    );
  }, [messages, searchTerm]);

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Contact Messages</h1>
            </div>
            <Button variant="outline" size="sm" onClick={loadMessages}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          {errorMessage && <p className="text-sm text-red-600 mt-3">{errorMessage}</p>}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>All Messages ({filteredMessages.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search by name, email, subject, or message..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {filteredMessages.length === 0 ? (
              <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
                No contact messages found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((item) => (
                  <article key={item.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{item.subject}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.name} ({item.email})
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{item.message}</p>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
