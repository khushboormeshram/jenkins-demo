import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    LayoutDashboard, Trophy, FileQuestion, Users, BarChart3, MessageSquare, FileEdit,
    Settings, HelpCircle, ChevronRight, Bell
} from "lucide-react";
import ContestManagement from "@/components/teacher/ContestManagement";
import QuestionBank from "@/components/teacher/QuestionBank";
import SubmissionsView from "@/components/teacher/SubmissionsView";
import ClassManagement from "@/components/teacher/ClassManagement";
import PerformanceInsights from "@/components/teacher/PerformanceInsights";
import Communications from "@/components/teacher/Communications";
import DashboardOverview from "@/components/teacher/DashboardOverview";
import DashboardHeader from "@/components/teacher/DashboardHeader";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Reusable MenuItem Component
function MenuItem({ icon: Icon, label, isActive, badge, hasSubmenu, onClick, isCollapsed }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 text-sm transition-colors duration-200",
                isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground",
                isCollapsed ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2.5"
            )}
            title={isCollapsed ? label : undefined}
        >
            {/* Left side - Icon and Label */}
            <div className="flex items-center gap-3">
                <div className={cn(
                    "flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out",
                    isActive ? "w-8 h-8 rounded-full bg-primary text-primary-foreground" : "w-8 h-8 hover:bg-accent rounded-lg"
                )}>
                    <Icon className="w-5 h-5 transition-transform duration-200" />
                </div>
                {!isCollapsed && <span className="transition-opacity duration-200">{label}</span>}
            </div>

            {/* Right side - Badge and Submenu indicator (only when not collapsed) */}
            {!isCollapsed && (badge || hasSubmenu) && (
                <div className="flex items-center gap-2 flex-shrink-0">
                    {badge && (
                        <Badge variant="secondary" className="h-5 min-w-5 px-1.5 flex items-center justify-center text-xs">
                            {badge}
                        </Badge>
                    )}
                    {hasSubmenu && <ChevronRight className="w-4 h-4 transition-transform duration-200" />}
                </div>
            )}
        </button>
    );
}

function TeacherDashboard() {
    const location = useLocation();
    const [activeView, setActiveView] = useState("overview");
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Handle URL parameters for navigation from Contest page
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tab = urlParams.get('tab');
        const action = urlParams.get('action');

        if (tab) {
            setActiveView(tab);
        }

        // If action=create, we'll handle this in ContestManagement component
        if (action === 'create' && tab === 'contests') {
            // This will be handled by ContestManagement component
            // by checking URL parameters
        }
    }, [location.search]);

    // Navigation groups
    const navigationGroups = [
        {
            title: "General",
            items: [
                { id: "overview", label: "Dashboard", icon: LayoutDashboard, badge: null, hasSubmenu: false },
                { id: "contests", label: "Contests", icon: Trophy, badge: null, hasSubmenu: false },
                { id: "questions", label: "Questions", icon: FileQuestion, badge: null, hasSubmenu: false },
                { id: "submissions", label: "Submissions", icon: FileEdit, badge: null, hasSubmenu: false },
            ]
        },
        {
            title: "Management",
            items: [
                { id: "classes", label: "Classes", icon: Users, badge: null, hasSubmenu: true },
                { id: "communication", label: "Communication", icon: MessageSquare, badge: "3", hasSubmenu: false },
            ]
        },
        {
            title: "Other",
            items: [
                { id: "insights", label: "Insights", icon: BarChart3, badge: null, hasSubmenu: true },
                { id: "settings", label: "Settings", icon: Settings, badge: null, hasSubmenu: true },
                { id: "help", label: "Help Center", icon: HelpCircle, badge: null, hasSubmenu: false },
            ]
        }
    ];

    const renderContent = () => {
        switch (activeView) {
            case "overview":
                return <DashboardOverview />;
            case "contests":
                return <ContestManagement />;
            case "questions":
                return <QuestionBank />;
            case "submissions":
                return <SubmissionsView />;
            case "classes":
                return <ClassManagement />;
            case "insights":
                return <PerformanceInsights />;
            case "communication":
                return <Communications />;
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={cn(
                "min-h-screen border-r bg-card fixed top-0 left-0 z-40 hidden md:block transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}>
                <div className="p-4 space-y-6 h-full overflow-y-auto">
                    {!isCollapsed && (
                        <div className="px-2 py-2">
                            <h2 className="text-lg font-bold tracking-tight">
                                Teacher Portal
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">
                                Manage your classes
                            </p>
                        </div>
                    )}

                    <nav className="space-y-6">
                        {navigationGroups.map((group, groupIndex) => (
                            <div key={groupIndex} className="space-y-2">
                                {!isCollapsed && (
                                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {group.title}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => (
                                        <MenuItem
                                            key={item.id}
                                            icon={item.icon}
                                            label={item.label}
                                            isActive={activeView === item.id}
                                            badge={item.badge}
                                            hasSubmenu={item.hasSubmenu}
                                            onClick={() => setActiveView(item.id)}
                                            isCollapsed={isCollapsed}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Mobile Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
                <nav className="flex justify-around p-2">
                    {navigationGroups[0].items.slice(0, 5).map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={cn(
                                    "flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors relative",
                                    activeView === item.id
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs">{item.label}</span>
                                {item.badge && (
                                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                                        {item.badge}
                                    </Badge>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content Area */}
            <div className={cn(
                "flex-1 flex flex-col transition-all duration-300",
                isCollapsed ? "md:ml-16" : "md:ml-64"
            )}>
                <DashboardHeader
                    activeView={activeView}
                    onNavigate={setActiveView}
                    onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
                />
                <main className="flex-1 p-8 pb-24 md:pb-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

export default TeacherDashboard;
