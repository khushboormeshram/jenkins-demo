"use client";
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { DarkLightToggle } from "@/components/effects/darklight-toggle.jsx";

import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, LayoutDashboard } from "lucide-react";

export function NavbarDemo() {
    const { user, isAuthenticated, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const navItems = [
        {
            name: "Home",
            link: "/",
        },
        {
            name: "Practice",
            link: "/practice",
        },
        {
            name: "Compete",
            link: "/contest",
        },
        {
            name: "Compiler",
            link: "/compiler",
        },
    ];

    return (
        <div className="relative w-full pt-4">
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo />
                    <NavItems items={navItems} />
                    <div className="flex items-center gap-4 ml-auto">
                        <DarkLightToggle />
                        {isAuthenticated ? (
                            /* Authenticated User Menu */
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
                                            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                            <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role}</p>
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
                        ) : (
                            /* Guest User Links */
                            <>
                                <Link to="/login" className="px-3 py-1 rounded-md text-sm text-black hover:text-black dark:text-neutral-300 dark:hover:text-white">Log in</Link>
                                <Link to="/signup" className="px-3 py-1 rounded-md text-sm bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">Sign up</Link>
                            </>
                        )}
                    </div>
                </NavBody>
                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
                    </MobileNavHeader>

                    <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
                        {navItems.map((item, idx) => {
                            const isRoute = item.link?.startsWith('/');
                            const Tag = isRoute ? Link : 'a';
                            const linkProps = isRoute ? { to: item.link } : { href: item.link };

                            return (
                                <Tag
                                    key={`mobile-link-${idx}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="relative text-neutral-600 dark:text-neutral-300"
                                    {...linkProps}>
                                    <span className="block">{item.name}</span>
                                </Tag>
                            );
                        })}
                        <div className="flex w-full flex-col gap-4">
                            <DarkLightToggle />
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center gap-2 p-2 border rounded-md">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={user?.avatar} alt={user?.name} />
                                            <AvatarFallback className="text-xs">{getInitials(user?.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user?.name}</span>
                                            <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                                        </div>
                                    </div>
                                    {(user?.role === 'teacher' || user?.role === 'admin') && (
                                        <Link to="/teacher/dashboard" className="relative text-neutral-600 dark:text-neutral-300" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                                    )}
                                    <Link to="/profile" className="relative text-neutral-600 dark:text-neutral-300" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                                    <Link to="/settings" className="relative text-neutral-600 dark:text-neutral-300" onClick={() => setIsMobileMenuOpen(false)}>Settings</Link>
                                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="relative text-red-600 text-left">Log out</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="relative text-neutral-600 dark:text-neutral-300">Log in</Link>
                                    <Link to="/signup" className="relative inline-flex px-3 py-1 rounded-md text-sm bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">Sign up</Link>
                                </>
                            )}
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
        </div>
    );
};
