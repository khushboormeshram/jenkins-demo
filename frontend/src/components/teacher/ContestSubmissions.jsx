import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye, Download, User } from "lucide-react";
import { contestService } from "@/services/contest.service";
import { submissionService } from "@/services/submission.service";
import { toast } from "sonner";

function ContestSubmissions() {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [studentSubmissions, setStudentSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);

    useEffect(() => {
        fetchContestData();
    }, [contestId]);

    const fetchContestData = async () => {
        try {
            setLoading(true);
            const response = await contestService.getContest(contestId);
            if (response.success) {
                setContest(response.data);
                setParticipants(response.data.participants || []);
            } else {
                toast.error('Failed to load contest data');
            }
        } catch (error) {
            console.error('Error fetching contest:', error);
            toast.error('Failed to load contest data');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentSubmissions = async (studentId) => {
        try {
            setSubmissionsLoading(true);
            const response = await contestService.getStudentContestSubmissions(contestId, studentId);
            if (response.success) {
                setStudentSubmissions(response.data);
            } else {
                toast.error('Failed to load student submissions');
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast.error('Failed to load student submissions');
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const handleStudentChange = (studentId) => {
        setSelectedStudent(studentId);
        if (studentId) {
            fetchStudentSubmissions(studentId);
        } else {
            setStudentSubmissions([]);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'Accepted': 'default',
            'Wrong Answer': 'destructive',
            'Time Limit Exceeded': 'secondary',
            'Runtime Error': 'destructive',
            'Compilation Error': 'destructive',
            'Pending': 'outline'
        };

        const colors = {
            'Accepted': 'bg-green-100 text-green-800 border-green-300',
            'Wrong Answer': 'bg-red-100 text-red-800 border-red-300',
            'Time Limit Exceeded': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'Runtime Error': 'bg-red-100 text-red-800 border-red-300',
            'Compilation Error': 'bg-orange-100 text-orange-800 border-orange-300',
            'Pending': 'bg-gray-100 text-gray-800 border-gray-300'
        };

        return (
            <Badge className={colors[status] || colors['Pending']}>
                {status}
            </Badge>
        );
    };

    const handleViewSubmission = (submissionId) => {
        // Navigate to submission details (you can implement this route)
        navigate(`/teacher/submissions/${submissionId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading contest data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/teacher/dashboard')}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{contest?.title} - Student Submissions</h1>
                    <p className="text-muted-foreground">
                        View and analyze submissions from contest participants
                    </p>
                </div>
            </div>

            {/* Contest Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Contest Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Participants</p>
                            <p className="text-2xl font-bold">{participants.length}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Problems</p>
                            <p className="text-2xl font-bold">{contest?.problems?.length || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="text-2xl font-bold">{contest?.duration} min</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge className="text-sm">
                                {contest?.status?.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Student Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Student</CardTitle>
                    <CardDescription>
                        Choose a student to view their submissions for this contest
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedStudent} onValueChange={handleStudentChange}>
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder="Select a student..." />
                        </SelectTrigger>
                        <SelectContent>
                            {participants.map((participant) => (
                                <SelectItem key={participant.user._id} value={participant.user._id}>
                                    {participant.user.name} ({participant.user.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Student Submissions */}
            {selectedStudent && (
                <Card>
                    <CardHeader>
                        <CardTitle>Student Submissions</CardTitle>
                        <CardDescription>
                            All submissions by {participants.find(p => p.user._id === selectedStudent)?.user.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submissionsLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading submissions...</p>
                            </div>
                        ) : studentSubmissions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No submissions found for this student
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Problem</TableHead>
                                        <TableHead>Language</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Submitted At</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentSubmissions.map((submission) => (
                                        <TableRow key={submission._id}>
                                            <TableCell className="font-medium">
                                                {submission.problem?.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {submission.language}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(submission.status)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">
                                                    {submission.score || 0}/100
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(submission.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleViewSubmission(submission._id)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default ContestSubmissions;