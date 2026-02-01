import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu, Home, BookOpen, Trophy, Code } from "lucide-react";
import { Link } from "react-router-dom";

const mobileNavItems = [
  { name: "Home", link: "/", icon: Home },
  { name: "Practice", link: "/practice", icon: BookOpen },
  { name: "Compete", link: "/contest", icon: Trophy },
  { name: "Compiler", link: "/compiler", icon: Code },
];

export const NavigationSheet = () => {
  return (
    <Sheet>
      <VisuallyHidden>
        <SheetTitle>Navigation Menu</SheetTitle>
      </VisuallyHidden>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="px-4 py-6 w-[260px]" side="right">
        {/* Mobile Navigation Links */}
        <nav className="flex flex-col gap-1 mt-4">
          {mobileNavItems.map((item) => (
            <Link
              key={item.link}
              to={item.link}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Auth Links */}
        <div className="mt-6 pt-6 border-t flex flex-col gap-2">
          <Button variant="outline" asChild className="w-full justify-center">
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild className="w-full justify-center">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
