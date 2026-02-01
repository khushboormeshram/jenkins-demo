import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, FileQuestion, Users, TrendingUp, Calendar, Clock } from "lucide-react";
import { contestService } from "@/services/contest.service";
import { problemService } from "@/services/problem.service";

function DashboardOverview() {
    const [stats, setStats] = useState({
        activeContests: 0,
        totalQuestions: 0,
        totalStudents: 0,
        submissionsToday: 0
    });
    const [upcomingContests, setUpcomingContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch contests
            const contestsResponse = await contestService.getContests();
            if (contestsResponse.success) {
                const contests = contestsResponse.data.contests || [];

                // Count active contests
                const activeCount = contests.filter(c => c.status === 'active').length;

                // Get upcoming contests
                const upcoming = contests
                    .filter(c => c.status === 'upcoming')
                    .slice(0, 3)
                    .map(c => ({
                        name: c.title,
                        date: new Date(c.startTime).toLocaleDateString(),
                        time: new Date(c.startTime).toLocaleTimeString(),
                        participants: c.participants?.length || 0
                    }));

                setUpcomingContests(upcoming);
                setStats(prev => ({ ...prev, activeContests: activeCount }));
            }

            // Fetch problems
            const problemsResponse = await problemService.getProblems();
            if (problemsResponse.success) {
                const totalProblems = problemsResponse.data.total || problemsResponse.data.problems?.length || 0;
                setStats(prev => ({ ...prev, totalQuestions: totalProblems }));
            }

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const statsDisplay = [
        {
            title: "Active Contests",
            value: loading ? "..." : stats.activeContests.toString(),
            description: "Currently running",
            icon: Trophy,
        },
        {
            title: "Total Questions",
            value: loading ? "..." : stats.totalQuestions.toString(),
            description: "In question bank",
            icon: FileQuestion,
        },
        {
            title: "Total Students",
            value: loading ? "..." : stats.totalStudents.toString(),
            description: "Across all classes",
            icon: Users,
        },
        {
            title: "Submissions Today",
            value: loading ? "..." : stats.submissionsToday.toString(),
            description: "Pending evaluation",
            icon: TrendingUp,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsDisplay.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-semibold">{stat.title}</CardTitle>
                                <Icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className="text-sm text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Upcoming Contests */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Contests</CardTitle>
                        <CardDescription>Scheduled assessments and practice tests</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="text-center py-4 text-muted-foreground">Loading...</div>
                        ) : upcomingContests.length === 0 ? (
                            <div className="text-center py-4 text-muted-foreground">No upcoming contests</div>
                        ) : (
                            upcomingContests.map((contest, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="space-y-1">
                                        <p className="font-medium">{contest.name}</p>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {contest.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {contest.time}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {contest.participants} participants
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                            <p className="text-sm font-medium">Create New Contest</p>
                            <p className="text-xs text-muted-foreground">Set up a new coding competition</p>
                        </div>
                        <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                            <p className="text-sm font-medium">Add Question</p>
                            <p className="text-xs text-muted-foreground">Add problem to question bank</p>
                        </div>
                        <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                            <p className="text-sm font-medium">View Submissions</p>
                            <p className="text-xs text-muted-foreground">Review student submissions</p>
                        </div>
                        <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                            <p className="text-sm font-medium">Manage Classes</p>
                            <p className="text-xs text-muted-foreground">Organize student groups</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default DashboardOverview;
