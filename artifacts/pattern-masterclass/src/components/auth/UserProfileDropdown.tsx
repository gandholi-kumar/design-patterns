import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import { Cloud, Download, LogOut, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

interface UserProfileDropdownProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    persona?: string | null;
    image?: string | null;
  };
  bookmarksCount: number;
  onExportBackup: () => void;
}

export function UserProfileDropdown({
  user,
  bookmarksCount,
  onExportBackup,
}: UserProfileDropdownProps) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully. Switching to offline guest mode.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign out";
      toast.error(msg);
    }
  };

  const personaLabel =
    user.persona === "architect"
      ? "System Architect"
      : user.persona === "student"
      ? "CS Student"
      : "Software Engineer";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-border bg-background hover:bg-muted/40 transition-all text-xs font-medium cursor-pointer"
          aria-label="User account profile menu"
          data-testid="user-profile-trigger"
        >
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-6 h-6 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center border border-primary/30">
              {initials}
            </div>
          )}
          <span className="max-w-[100px] truncate text-foreground font-semibold">{user.name}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Cloud Synced" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-2 bg-background border border-border shadow-xl rounded-xl">
        <DropdownMenuLabel className="p-2 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-foreground leading-none">{user.name}</p>
            {user.role === "admin" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <ShieldCheck size={11} /> Admin
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          <div className="pt-1 flex items-center gap-1.5">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {personaLabel}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-[11px] text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-foreground/80">
              <Cloud size={13} className="text-emerald-500" /> Cloud Sync
            </span>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Connected</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span>Bookmarked patterns</span>
            <span className="font-semibold text-foreground">{bookmarksCount}</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onExportBackup}
          className="flex items-center gap-2 text-xs py-2 px-2 cursor-pointer text-foreground hover:bg-muted/50 rounded-lg"
        >
          <Download size={14} />
          <span>Export offline backup bundle</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs py-2 px-2 cursor-pointer text-destructive hover:bg-destructive/10 rounded-lg focus:bg-destructive/10"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
