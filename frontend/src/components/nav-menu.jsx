import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DarkLightToggle } from "@/components/effects/darklight-toggle";

const primaryItems = [
  { name: "Home", link: "/" },
  { name: "Practice", link: "/practice" },
  { name: "Compete", link: "/contest" },
  { name: "Compiler", link: "/compiler" },
];

export const NavMenu = (props) => (
  <div className="flex items-center gap-6" {...props}>
    <NavigationMenu>
      <NavigationMenuList className="flex items-center gap-2">
        {primaryItems.map((item) => (
          <NavigationMenuItem key={item.link}>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link to={item.link}>{item.name}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  </div>
);
