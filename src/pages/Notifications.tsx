import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Bell, WifiOff } from "lucide-react";
import { useFirebaseNotifications } from "@/hooks/useFirebaseNotifications";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const { supported, status, state, token, error, messages, retry } = useFirebaseNotifications();

  useEffect(() => {
    if (!supported && supported !== null) {
      console.warn("Notifications are not supported in this browser.");
    }
  }, [supported]);

  const showEnableButton = supported && Notification.permission !== "granted";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-2 text-muted-foreground">
            Stay up to date with the latest announcements, alerts, and updates from HUMSJ.
          </p>
        </div>

        {supported === false && (
          <Alert variant="destructive" className="border-destructive/40">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Notifications unavailable</AlertTitle>
            <AlertDescription>
              Your browser does not support push notifications. Please try a different device or browser.
            </AlertDescription>
          </Alert>
        )}

        {state === "error" && error && (
          <Alert variant="destructive" className="border-destructive/40">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Could not enable notifications</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {navigator && !navigator.onLine && (
          <Alert className="bg-amber-500/10 text-amber-900 border-amber-500/30">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Offline</AlertTitle>
            <AlertDescription>
              Reconnect to the internet to resume receiving real-time updates.
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="uppercase tracking-wide">
                Status: {status}
              </Badge>
              {token && (
                <Badge variant="outline" className="font-mono text-xs">
                  Token saved
                </Badge>
              )}
            </div>
            {showEnableButton && (
              <Button onClick={retry} disabled={state === "requesting"}>
                <Bell className="mr-2 h-4 w-4" />
                {state === "requesting" ? "Requesting..." : "Enable notifications"}
              </Button>
            )}
          </div>

          {messages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-muted-foreground/20 p-8 text-center text-muted-foreground">
              <p>No notifications yet. As soon as admins post, updates will appear here instantly.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="rounded-lg border border-muted-foreground/10 bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{message.title}</h2>
                      {message.body && <p className="text-sm text-muted-foreground mt-1">{message.body}</p>}
                    </div>
                    <Badge variant="outline">
                      {formatDistanceToNow(message.receivedAt, { addSuffix: true })}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
};

export default Notifications;
