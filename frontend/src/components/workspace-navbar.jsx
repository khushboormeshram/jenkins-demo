import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DarkLightToggle } from "@/components/effects/darklight-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import {
    ChevronLeft,
    ChevronRight,
    Shuffle,
    Play,
    CloudUpload,
    Settings,
    Flame,
    PanelLeft,
    Menu,
    User,
    LogOut,
    LayoutDashboard,
    Clock3
} from "lucide-react";

function WorkspaceNavbar({
    contestName = "Biweekly Contest 135",
    timeRemaining = "1:29:45",
    currentProblem = 1,
    totalProblems = 4,
    onPrevProblem,
    onNextProblem,
    onShuffleProblem,
    onToggleSidebar,
    onRun,
    onSubmit,
    streakCount = 0,
    isRunning = false,
    isSubmitting = false,
    isPracticeMode = false,
    hideRunSubmit = false
}) {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { user, logout, isTeacher, isAdmin } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    // Simple countdown timer from provided HH:MM:SS string
    const parseTimeToSeconds = (value) => {
        if (!value) return 0;
        const parts = value.split(":").map(Number);
        if (parts.length === 3) {
            const [h, m, s] = parts;
            return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
        }
        if (parts.length === 2) {
            const [m, s] = parts;
            return (m || 0) * 60 + (s || 0);
        }
        return Number(parts[0]) || 0;
    };

    const [remainingSeconds, setRemainingSeconds] = useState(() => parseTimeToSeconds(timeRemaining));

    useEffect(() => {
        setRemainingSeconds(parseTimeToSeconds(timeRemaining));
    }, [timeRemaining]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatSeconds = (secs) => {
        const clamped = Math.max(0, Math.floor(secs));
        const h = Math.floor(clamped / 3600);
        const m = Math.floor((clamped % 3600) / 60);
        const s = clamped % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const formattedTimer = formatSeconds(remainingSeconds);
    const isExpired = remainingSeconds <= 0;

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isUserMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsUserMenuOpen(false);
    };

    const getUserInitial = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <nav className="h-11 sm:h-11 bg-background flex items-center justify-between px-2 sm:px-3 border-b border-border shrink-0 relative">
            {/* Left Section - Navigation & Context */}
            <div className="flex items-center gap-1 sm:gap-2 ml-0 sm:ml-2">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 sm:space-x-4">
                    <img
                        src="https://assets.aceternity.com/logo-dark.png"
                        alt="logo"
                        width={isMobile ? 20 : 24}
                        height={isMobile ? 20 : 24}
                    />
                    {!isMobile && (
                        <span className="font-medium text-foreground text-sm whitespace-nowrap">Code-E-Pariksha</span>
                    )}
                </Link>

                {/* Divider - hidden on mobile */}
                {!isMobile && <span className="text-muted-foreground/50 text-lg ml-2">|</span>}

                {/* Slider Icon with Contest Title */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 sm:px-4 text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1 sm:gap-2"
                    onClick={onToggleSidebar}
                >
                    <PanelLeft className="w-4 h-4" />
                    {!isMobile && (
                        <span className="text-foreground text-sm font-semibold">{contestName}</span>
                    )}
                </Button>

                {/* Navigation Controls */}
                <div className="flex items-center ml-0 sm:ml-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={onPrevProblem}
                    >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={onNextProblem}
                    >
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    {!isMobile && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={onShuffleProblem}
                        >
                            <Shuffle className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Center Section - Run & Submit Combined (Absolutely Centered) */}
            {!hideRunSubmit && (
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-muted rounded-md overflow-hidden">
                    {/* Run Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 sm:h-8 px-2 sm:px-3 text-foreground hover:bg-muted-foreground/20 rounded-none flex items-center gap-1 sm:gap-1.5"
                        onClick={onRun}
                        disabled={isRunning || isSubmitting}
                    >
                        <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="text-xs sm:text-sm">{isRunning ? 'Running...' : 'Run'}</span>
                    </Button>

                    {/* Thin Dark Separator */}
                    <div className="w-px h-4 sm:h-5 bg-border" />

                    {/* Submit Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 sm:h-8 px-2 sm:px-3 text-green-500 hover:bg-muted-foreground/20 rounded-none flex items-center gap-1 sm:gap-1.5"
                        onClick={onSubmit}
                        disabled={isRunning || isSubmitting}
                    >
                        <CloudUpload className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span className="text-xs sm:text-sm font-medium">{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                    </Button>
                </div>
            )}

            {/* Right Section - Timer, User & Settings */}
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Timer Display */}
                {!isPracticeMode && (
                    <Badge
                        variant="outline"
                        className={`h-8 px-2.5 sm:px-3 text-[11px] font-mono font-semibold flex items-center gap-1 rounded-full shadow-sm border ${isExpired ? 'bg-destructive/10 text-destructive border-destructive/40' : 'bg-primary/10 text-primary border-primary/40'}`}
                    >
                        <Clock3 className="w-3.5 h-3.5" />
                        <span className="tabular-nums leading-none">{isExpired ? 'Time up' : formattedTimer}</span>
                    </Badge>
                )}

                {/* Dark/Light Toggle */}
                <DarkLightToggle />

                {/* Divider - hidden on mobile */}
                {!isMobile && <span className="text-muted-foreground/50 text-lg">|</span>}

                {/* Settings */}
                {/* <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                    <Settings className="w-4 h-4" />
                </Button> */}

                {/* Streak */}
                {/* <div className="flex items-center gap-0.5 text-muted-foreground">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs">{streakCount}</span>
                </div> */}
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 p-0 hover:bg-muted-foreground/20 transition-colors"
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                        <span className="text-muted-foreground text-[10px] sm:text-xs font-medium">
                            {getUserInitial()}
                        </span>
                    </Button>

                    {isUserMenuOpen && (
                        <div className="absolute right-0 z-50 mt-1 bg-popover border rounded shadow min-w-[160px]">
                            <div className="px-3 py-2 text-xs text-muted-foreground border-b">
                                <div className="font-medium text-foreground">{user?.role || 'Student'}</div>
                                <div className="truncate">{user?.email}</div>
                            </div>

                            {(isTeacher || isAdmin) && (
                                <button
                                    onClick={() => {
                                        navigate('/teacher/dashboard');
                                        setIsUserMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-accent flex items-center gap-2"
                                >
                                    <LayoutDashboard className="w-3 h-3" />
                                    Dashboard
                                </button>
                            )}

                            {!isTeacher && !isAdmin && (
                                <button
                                    onClick={() => {
                                        navigate('/practice');
                                        setIsUserMenuOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-accent flex items-center gap-2"
                                >
                                    <LayoutDashboard className="w-3 h-3" />
                                    Practice
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    navigate('/profile');
                                    setIsUserMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-accent flex items-center gap-2"
                            >
                                <User className="w-3 h-3" />
                                Profile
                            </button>

                            <button
                                onClick={() => {
                                    navigate('/settings');
                                    setIsUserMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-accent flex items-center gap-2"
                            >
                                <Settings className="w-3 h-3" />
                                Settings
                            </button>

                            <div className="border-t">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-accent flex items-center gap-2 text-red-600"
                                >
                                    <LogOut className="w-3 h-3" />
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default WorkspaceNavbar;
