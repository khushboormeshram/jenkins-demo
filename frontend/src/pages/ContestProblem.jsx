import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Trophy, AlertCircle, CheckCircle2, XCircle, BarChart2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { contestService } from "@/services/contest.service";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

function ContestProblem() {
    const { id } = useParams();
    const { user, isTeacher, isAdmin } = useAuth();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        fetchContestDetails();
    }, [id]);

    const fetchContestDetails = async () => {
        try {
            setLoading(true);
            const response = await contestService.getContest(id);
            if (response.success) {
                setContest(response.data);
                // Check registration status
                if (typeof response.data.isRegistered === 'boolean') {
                    setIsRegistered(response.data.isRegistered);
                } else if (user && response.data.participants) {
                    const isUserRegistered = response.data.participants.some(
                        p => p.user === user.id || p.user._id === user.id
                    );
                    setIsRegistered(isUserRegistered);
                }
            } else {
                toast.error('Failed to load contest');
            }
        } catch (error) {
            console.error('Failed to fetch contest:', error);
            toast.error('Failed to load contest details');
        } finally {
            setLoading(false);
        }
    };

    const rules = [
        { icon: <AlertCircle className="w-5 h-5" />, title: "Penalty System", description: "5-minute time penalty for every wrong submission (Wrong Answer, TLE, etc.)" },
        { icon: <XCircle className="w-5 h-5" />, title: "Hidden Test Cases", description: "Some test cases are hidden during the contest to prevent hard-coding answers" },
        { icon: <Trophy className="w-5 h-5" />, title: "Rated Contest", description: "Your global rating will be updated based on performance (within 5 days)" },
        { icon: <AlertCircle className="w-5 h-5" />, title: "Zero Tolerance Policy", description: "Strict rules against plagiarism, multiple accounts, or sharing solutions. Violations result in bans and score resets." }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading contest...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold mb-2">Contest Not Found</h2>
                        <p className="text-muted-foreground mb-4">The contest you're looking for doesn't exist.</p>
                        <Button onClick={() => window.location.href = '/contest'}>Back to Contests</Button>
                    </div>
                </div>
            </div>
        );
    }

    const getDifficultyColor = (difficulty) => {
        const diffLower = difficulty?.toLowerCase();
        const colors = {
            easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        };
        return colors[diffLower] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    };

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase();
        const colors = {
            active: "bg-green-500",
            ended: "bg-gray-500",
            upcoming: "bg-blue-500"
        };
        return colors[statusLower] || "bg-gray-500";
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumb */}
                <nav className="text-sm mb-6 text-muted-foreground">
                    <Link to="/contest" className="hover:text-primary transition-colors">Contests</Link>
                    <span className="mx-2">/</span>
                    <Link to={`/contest/${contest._id}`} className="hover:text-primary transition-colors">{contest.title}</Link>
                    <span className="mx-2">/</span>
                    <span className="text-foreground">Problems</span>
                </nav>

                {/* Overview Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap mb-2">
                                        <CardTitle className="text-2xl md:text-3xl">{contest.title}</CardTitle>
                                        <Badge className={`${getStatusColor(contest.status)} text-white`}>{contest.status?.toUpperCase()}</Badge>
                                    </div>
                                    <CardDescription className="text-base">{contest.description}</CardDescription>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-medium">{new Date(contest.startTime).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-medium">{new Date(contest.startTime).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-medium">{contest.duration} mins</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-medium">Competitive</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <h2 className="text-xl sm:text-2xl font-bold mb-4">Problem Set</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
                    <div className="lg:col-span-2">
                        {!isRegistered && user && !isTeacher && !isAdmin ? (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="mb-4">You must register for this contest to view the problems</p>
                                    <Button asChild>
                                        <Link to={`/contest/${contest._id}`}>
                                            Go to Contest Page to Register
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : contest.problems && contest.problems.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {contest.problems.map((problem, index) => (
                                    <Card key={problem._id} className="border bg-card hover:bg-accent/40 transition-colors cursor-pointer">
                                        <CardHeader>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <CardTitle className="text-lg font-semibold">Problem {index + 1}: {problem.title}</CardTitle>
                                                        <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
                                                    </div>
                                                    <CardDescription className="mt-2">
                                                        {problem.description
                                                            ? `${problem.description.substring(0, 100)}${problem.description.length > 100 ? '...' : ''}`
                                                            : 'Click "Solve Problem" to view full details'}
                                                    </CardDescription>
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full sm:w-auto"
                                                    asChild
                                                >
                                                    <Link to={`/contest/${contest._id}/problems/${problem._id}/workspace`}>
                                                        Solve Problem
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    No problems added to this contest yet.
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    <div className="self-start">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2"><Trophy className="w-5 h-5" /> Contest Rules</CardTitle>
                                <CardDescription>Important guidelines</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {rules.map((rule, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 rounded-md border">
                                            <div className="text-muted-foreground">{rule.icon}</div>
                                            <div>
                                                <p className="text-sm font-medium mb-1">{rule.title}</p>
                                                <p className="text-xs text-muted-foreground">{rule.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContestProblem;