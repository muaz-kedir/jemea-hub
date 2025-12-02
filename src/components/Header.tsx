import { Search, User } from "lucide-react";
import { Button } from "./ui/button";
import { NotificationBell } from "./notifications";

export const Header = () => {
  return (
    <header className="flex items-center justify-between mb-8 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Student</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-2xl">
          <Search className="w-5 h-5" />
        </Button>
        <NotificationBell />
      </div>
    </header>
  );
};
