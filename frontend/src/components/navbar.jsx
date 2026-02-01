import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { DarkLightToggle } from "@/components/effects/darklight-toggle";
import { NavbarLogo } from "@/components/ui/resizable-navbar";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const { user, isAuthenticated, isTeacher, isAdmin, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="h-14 sm:h-16 bg-background border-b sticky top-0 z-50">
      <div className="h-full flex items-center justify-between max-w-(--breakpoint-xl) mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:gap-12">
          <NavbarLogo />

          {/* Desktop Menu */}
          <NavMenu className="hidden md:block" />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {isAuthenticated ? (
            /* Authenticated User Menu */
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full flex-shrink-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(user?.role === 'teacher' || user?.role === 'admin') && (
                    <DropdownMenuItem onClick={() => window.location.href = '/teacher/dashboard'} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Guest User Links */
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex px-3 py-1 rounded-md text-sm text-neutral-800 dark:text-neutral-300 hover:text-black dark:hover:text-white"
              >
                Log in
              </Link>
              <Button
                asChild
                size="sm"
                className="hidden sm:inline-flex bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}

          <DarkLightToggle />

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
