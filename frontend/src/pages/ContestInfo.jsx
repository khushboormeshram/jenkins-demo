import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Clock,
    Calendar,
    Trophy,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Play,
    Users,
    Award,
    Target,
    Timer,
    BookOpen,
    Code,
    Download,
    UserCheck
} from "lucide-react";
import { contestService } from "@/services/contest.service";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

function ContestInfo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isTeacher, isAdmin } = useAuth();

    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        fetchContestDetails();
    }, [id]);

    const fetchContestDetails = async () => {
        try {
            setLoading(true);
            const response = await contestService.getContest(id);
            if (response.success) {
                setContest(response.data);
                // Use backend's registration status if available, otherwise fall back to client-side check
                if (typeof response.data.isRegistered === 'boolean') {
                    setIsRegistered(response.data.isRegistered);
                } else if (user && response.data.participants) {
                    // Fallback for when user is not authenticated or backend doesn't provide isRegistered
                    const isUserRegistered = response.data.participants.some(
                        p => p.user === user.id || p.user._id === user.id
                    );
                    setIsRegistered(isUserRegistered);
                }
            }
        } catch (error) {
            console.error('Failed to fetch contest:', error);
            toast.error('Failed to load contest details');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to register for contest');
            navigate('/login');
            return;
        }

        try {
            setRegistering(true);
            const response = await contestService.registerForContest(id);
            if (response.success) {
                toast.success('Successfully registered for contest!');
                setIsRegistered(true);
                fetchContestDetails(); // Refresh to update participant count
            } else {
                toast.error(response.message || 'Failed to register');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Failed to register for contest');
        } finally {
            setRegistering(false);
        }
    };

    const handleDownloadReport = async () => {
        if (contest.status !== 'ended') {
            toast.info('Contest report will be available for download after the contest ends');
            return;
        }

        try {
            toast.info('Generating report...');
            const response = await contestService.downloadContestReport(id);
            
            if (response.success) {
                toast.success('Report downloaded successfully!');
            } else {
                toast.error('Failed to download report');
            }
        } catch (error) {
            console.error('Error downloading report:', error);
            toast.error('Failed to download report');
        }
    };

    const handleViewStudentSubmissions = () => {
        navigate(`/teacher/contest/${id}/submissions`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading contest details...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container max-w-6xl mx-auto px-4 py-8">
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-bold mb-2">Contest Not Found</h2>
                        <p className="text-muted-foreground mb-4">The contest you're looking for doesn't exist.</p>
                        <Button onClick={() => navigate('/contest')}>Back to Contests</Button>
                    </div>
                </div>
            </div>
        );
    }

    // Mock data for prizes and rules (can be added to backend later)
    const mockData = {
        prizes: [
            {
                position: "1st Place",
                prize: "₹10,000 + Certificate",
                icon: <Trophy className="w-6 h-6" />
            },
            {
                position: "2nd Place",
                prize: "₹5,000 + Certificate",
                icon: <Trophy className="w-6 h-6" />
            },
            {
                position: "3rd Place",
                prize: "₹2,500 + Certificate",
                icon: <Trophy className="w-6 h-6" />
            },
            {
                position: "Top 10",
                prize: "Certificate of Achievement",
                icon: <Award className="w-6 h-6" />
            }
        ],
        markingSystem: [
            {
                title: "Problem Points",
                description: "Each problem has assigned points based on difficulty (3-8 points)",
                icon: <Target className="w-5 h-5" />
            },
            {
                title: "Time Penalty",
                description: "5 minutes penalty for each wrong submission",
                icon: <Timer className="w-5 h-5" />
            },
            {
                title: "Completion Time",
                description: "Faster solutions rank higher among equal scores",
                icon: <Clock className="w-5 h-5" />
            },
            {
                title: "Final Score",
                description: "Total points - (Wrong submissions × 5 minutes)",
                icon: <CheckCircle2 className="w-5 h-5" />
            }
        ],
        rules: [
            {
                title: "Contest Duration",
                description: "You have exactly 90 minutes to solve all problems once you start the contest.",
                icon: <Clock className="w-5 h-5" />
            },
            {
                title: "Problem Submission",
                description: "You can submit solutions multiple times. Each wrong submission adds a 5-minute penalty.",
                icon: <BookOpen className="w-5 h-5" />
            },
            {
                title: "Hidden Test Cases",
                description: "Some test cases are hidden during the contest to prevent hard-coding solutions.",
                icon: <XCircle className="w-5 h-5" />
            },
            {
                title: "Fair Play Policy",
                description: "Plagiarism, multiple accounts, or sharing solutions during the contest is strictly prohibited.",
                icon: <AlertCircle className="w-5 h-5" />
            },
            {
                title: "Rating Updates",
                description: "Contest is rated. Your global rating will be updated within 5 days based on your performance.",
                icon: <Trophy className="w-5 h-5" />
            },
            {
                title: "Language Support",
                description: "Solutions can be submitted in C++, Java, Python, JavaScript, and other supported languages.",
                icon: <CheckCircle2 className="w-5 h-5" />
            }
        ]
    };

    const handleStartContest = () => {
        if (!isRegistered) {
            toast.error('Please register for the contest first');
            return;
        }
        if (contest.status !== 'active') {
            toast.error('Contest is not active yet');
            return;
        }
        navigate(`/contest/${id}/problems`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-500";
            case "ended":
                return "bg-gray-500";
            case "upcoming":
                return "bg-blue-500";
            default:
                return "bg-gray-500";
        }
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: "bg-green-500/10 text-green-600 border-green-500/20",
            medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
            hard: "bg-red-500/10 text-red-600 border-red-500/20",
        };
        return colors[difficulty] || "";
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="text-sm mb-8 text-muted-foreground">
                    <Link to="/contest" className="hover:text-primary transition-colors">
                        Contests
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-foreground">{contest.title}</span>
                </nav>

                {/* Contest Header Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <CardTitle className="text-3xl sm:text-4xl">{contest.title}</CardTitle>
                            <Badge className={`${getStatusColor(contest.status)} text-white`}>
                                {contest.status.toUpperCase()}
                            </Badge>
                            {isRegistered && (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Registered
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="text-base">
                            {contest.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Start Date</p>
                                    <p className="text-sm font-medium">
                                        {new Date(contest.startTime).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Start Time</p>
                                    <p className="text-sm font-medium">
                                        {new Date(contest.startTime).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Timer className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Duration</p>
                                    <p className="text-sm font-medium">{contest.duration} minutes</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-medium">Participants</p>
                                    <p className="text-sm font-medium">{contest.participants?.length || 0}</p>
                                </div>
                            </div>
                        </div>

                        <Separator className="mb-6" />

                        {/* Action Buttons */}
                        <div className="flex gap-3 flex-wrap">
                            {!isRegistered ? (
                                <Button
                                    size="lg"
                                    onClick={handleRegister}
                                    disabled={registering || contest.status === "ended"}
                                >
                                    <Users className="w-5 h-5 mr-2" />
                                    {registering ? "Registering..." : "Register for Contest"}
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    onClick={handleStartContest}
                                    disabled={contest.status !== "active"}
                                >
                                    <Play className="w-5 h-5 mr-2" />
                                    {contest.status === "active" ? "Start Contest" :
                                        contest.status === "ended" ? "Contest Ended" : "Contest Not Started"}
                                </Button>
                            )}
                            
                            {/* Admin Actions */}
                            {(isTeacher || isAdmin) && (
                                <>
                                    {(contest.status === 'ended' || contest.status === 'active' || contest.status === 'upcoming') && (
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            onClick={handleDownloadReport}
                                            className={contest.status === 'ended' ? '' : 'opacity-75'}
                                        >
                                            <Download className="w-5 h-5 mr-2" />
                                            {contest.status === 'ended' ? 'Download Report' : 'Download Report (After Contest)'}
                                        </Button>
                                    )}
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={handleViewStudentSubmissions}
                                    >
                                        <UserCheck className="w-5 h-5 mr-2" />
                                        View Student Submissions
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contest Problems */}
                {contest.problems && contest.problems.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="w-5 h-5" />
                                Contest Problems ({contest.problems.length})
                            </CardTitle>
                            <CardDescription>
                                {!isRegistered && user && !isTeacher && !isAdmin
                                    ? 'You must register for this contest to view problems'
                                    : contest.status === 'upcoming'
                                    ? 'Problems will be visible when the contest starts'
                                    : 'Solve these problems during the contest'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!isRegistered && user && !isTeacher && !isAdmin ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>You must register for this contest to view the problems</p>
                                    <Button 
                                        className="mt-4" 
                                        onClick={handleRegister}
                                        disabled={registering}
                                    >
                                        {registering ? 'Registering...' : 'Register Now'}
                                    </Button>
                                </div>
                            ) : contest.status === 'upcoming' ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Problems are hidden until the contest begins</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>Problem Title</TableHead>
                                            <TableHead>Difficulty</TableHead>
                                            <TableHead>Tags</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contest.problems.map((problem, index) => (
                                            <TableRow key={problem._id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{problem.title}</TableCell>
                                                <TableCell>
                                                    <Badge className={getDifficultyColor(problem.difficulty)} variant="outline">
                                                        {problem.difficulty}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {problem.tags && problem.tags.slice(0, 3).map((tag, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Prizes Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="w-5 h-5" />
                                Prizes & Rewards
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockData.prizes.map((prize, index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-muted flex items-center justify-center">
                                                    {prize.icon}
                                                </div>
                                                <span className="font-semibold">{prize.position}</span>
                                            </div>
                                            <span className="text-sm font-medium text-muted-foreground">{prize.prize}</span>
                                        </div>
                                        {index < mockData.prizes.length - 1 && <Separator />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Marking System Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Marking System
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {mockData.markingSystem.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="p-2 rounded-md bg-primary/10 text-primary">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm mb-1">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Rules Card */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Contest Rules & Regulations
                        </CardTitle>
                        <CardDescription>Please read carefully before starting the contest</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mockData.rules.map((rule, index) => (
                                <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                    <div className="p-2 rounded-md bg-muted flex items-center justify-center">
                                        {rule.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm mb-1">{rule.title}</h3>
                                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Action */}
                <div className="flex justify-center">
                    {!isRegistered ? (
                        <Button
                            size="lg"
                            className="px-12"
                            onClick={handleRegister}
                            disabled={registering || contest.status === "ended"}
                        >
                            <Users className="w-5 h-5 mr-2" />
                            {registering ? "Registering..." : "Register for Contest"}
                        </Button>
                    ) : (
                        <Button
                            size="lg"
                            className="px-12"
                            onClick={handleStartContest}
                            disabled={contest.status !== "active"}
                        >
                            <Play className="w-5 h-5 mr-2" />
                            {contest.status === "active" ? "Start Contest Now" :
                                contest.status === "ended" ? "Contest Ended" : "Contest Not Started Yet"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ContestInfo;
