import { Search, Settings, PanelLeft, LogOut, User, Home, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { DarkLightToggle } from "@/components/effects/darklight-toggle";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";

function DashboardHeader({ activeView, onNavigate, onToggleSidebar }) {
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // All available teacher options for search
    const allTeacherOptions = [
        { id: "overview", label: "Overview", type: "dashboard" },
        { id: "contests", label: "Contests", type: "dashboard" },
        { id: "questions", label: "Questions", type: "dashboard" },
        { id: "submissions", label: "Submissions", type: "dashboard" },
        { id: "classes", label: "Classes", type: "dashboard" },
        { id: "insights", label: "Insights", type: "dashboard" },
        { id: "communication", label: "Communication", type: "dashboard" },
        { id: "settings", label: "Settings", type: "dashboard" },
        { path: "/", label: "Home", type: "external" },
        { path: "/compiler", label: "Compiler", type: "external" },
        { path: "/contest", label: "All Contests", type: "external" },
        { path: "/practice", label: "Practice", type: "external" },
    ];

    const navItems = [
        { id: "overview", label: "Overview" },
    ];

    const externalNavItems = [
        { path: "/", label: "Home" },
        { path: "/compiler", label: "Compiler" },
        { path: "/contest", label: "All Contests" },
        { path: "/practice", label: "Practice" },
    ];

    // Filter search results
    const searchResults = searchQuery.trim()
        ? allTeacherOptions.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 6)
        : [];

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setShowSearchResults(value.trim().length > 0);
    };

    const handleSearchSelect = (item) => {
        if (item.type === "dashboard") {
            onNavigate(item.id);
        } else {
            window.location.href = item.path;
        }
        setSearchQuery("");
        setShowSearchResults(false);
    };

    return (
        <header className="flex items-center justify-between h-16 px-4 border-b bg-background sticky top-0 z-40">
            {/* Left Side */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="hidden md:flex">
                    <PanelLeft className="w-4 h-4" />
                </Button>

                <div className="h-6 w-px bg-border hidden md:block" />

                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={
                                activeView === item.id
                                    ? "text-sm font-medium text-foreground"
                                    : "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            }
                        >
                            {item.label}
                        </button>
                    ))}
                    <div className="h-4 w-px bg-border" />
                    {externalNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            {item.icon && <item.icon className="w-4 h-4" />}
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Search Input */}
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search teacher options..."
                        className="pl-8 pr-14 w-64 h-9"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery && setShowSearchResults(true)}
                        onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
                        <Kbd>Ctrl + K</Kbd>

                    </div>

                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            {searchResults.map((item, index) => (
                                <button
                                    key={item.id || item.path}
                                    className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                                    onClick={() => handleSearchSelect(item)}
                                >
                                    {item.type === "external" && item.path === "/" && <Home className="w-4 h-4" />}
                                    {item.type === "external" && item.path === "/compiler" && <Code className="w-4 h-4" />}
                                    <span>{item.label}</span>
                                    <span className="text-xs text-muted-foreground ml-auto">
                                        {item.type === "dashboard" ? "Dashboard" : "Page"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Icons */}
                <DarkLightToggle />
                {/* <Button variant="ghost" size="icon" className="hidden sm:flex"> */}
                {/* <Settings className="w-4 h-4" /> */}
                {/* </Button> */}

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0">
                                {getInitials(user?.name)}
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

export default DashboardHeader;
