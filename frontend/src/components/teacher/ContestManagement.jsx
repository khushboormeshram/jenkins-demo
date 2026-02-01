import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Eye, Users, X, Globe, Lock, Download, Mail, MailCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { contestService } from "@/services/contest.service";
import { problemService } from "@/services/problem.service";
import { toast } from "sonner";

function ContestManagement() {
    const location = useLocation();
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contestToDelete, setContestToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [sendingNotifications, setSendingNotifications] = useState(null);
    const [formProgress, setFormProgress] = useState({
        step1: false,
        step2: false,
        step3: false,
        step4: false
    });

    // Fetch contests from backend
    useEffect(() => {
        fetchContests();
    }, []);

    // Handle URL parameters for auto-opening create form
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const action = urlParams.get('action');

        if (action === 'create') {
            setShowCreateForm(true);
            // Clean up URL parameters
            navigate('/teacher/dashboard?tab=contests', { replace: true });
        }
    }, [location.search, navigate]);

    const fetchContests = async () => {
        try {
            setLoading(true);
            const response = await contestService.getContests();
            if (response.success) {
                setContests(response.data.contests);
            }
        } catch (error) {
            console.error('Failed to fetch contests:', error);
            toast.error('Failed to load contests');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContest = async () => {
        if (!contestToDelete) return;

        try {
            setIsDeleting(true);
            const response = await contestService.deleteContest(contestToDelete._id);

            if (response.success) {
                toast.success('Contest deleted successfully!');
                fetchContests(); // Refresh the list
                setContestToDelete(null);
            } else {
                toast.error(response.message || 'Failed to delete contest');
            }
        } catch (error) {
            console.error('Error deleting contest:', error);
            toast.error('Failed to delete contest');
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            upcoming: "default",
            active: "destructive",
            ended: "secondary",
        };
        return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
    };

    const handleDownloadReport = async (contestId, contestStatus) => {
        if (contestStatus !== 'ended') {
            toast.info('Contest report will be available for download after the contest ends');
            return;
        }

        try {
            toast.info('Generating report...');
            const response = await contestService.downloadContestReport(contestId);

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

    const handleSendNotifications = async (contest) => {
        // Check if contest can send notifications
        if (contest.visibility === 'private' && (!contest.allowedClasses || contest.allowedClasses.length === 0)) {
            toast.error('Private contests must have assigned classes to send notifications');
            return;
        }

        try {
            setSendingNotifications(contest._id);

            if (contest.visibility === 'public') {
                toast.info('Sending email notifications to all students...');
            } else {
                toast.info('Sending email notifications to students in selected classes...');
            }

            const response = await contestService.sendContestNotifications(contest._id);

            if (response.success) {
                const contestType = contest.visibility === 'public' ? 'all students' : 'students in selected classes';
                toast.success(`Email notifications sent successfully to ${contestType}! ${response.data.successful}/${response.data.totalStudents} emails delivered`);
            } else {
                toast.error(response.message || 'Failed to send notifications');
            }
        } catch (error) {
            console.error('Error sending notifications:', error);
            toast.error('Failed to send notifications');
        } finally {
            setSendingNotifications(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Contest Management</h2>
                    <p className="text-muted-foreground">Create and manage coding contests</p>
                </div>
                <div className="flex items-center gap-2">

                    <Button className="gap-2" onClick={() => {
                        const newShowCreateForm = !showCreateForm;
                        setShowCreateForm(newShowCreateForm);
                        // Reset form progress when opening the form
                        if (newShowCreateForm) {
                            setFormProgress({
                                step1: false,
                                step2: false,
                                step3: false,
                                step4: false
                            });
                        }
                    }}>
                        {showCreateForm ? (
                            <X className="w-4 h-4" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        {showCreateForm ? "Cancel" : "Create Contest"}
                    </Button>
                </div>
            </div>

            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Contest</CardTitle>
                        <CardDescription>Set up a new coding contest with custom rules</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6">
                        <div className="relative flex justify-center">
                            {/* Vertical Progress Bar - Positioned absolutely to the left and vertically centered */}
                            <div className="hidden lg:block absolute left-25 top-1/2 transform -translate-y-1/2">
                                <div className="flex flex-col space-y-8 py-4 w-40">
                                    {/* Step 1: Basic Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-base font-bold transition-all duration-300 ${
                                                formProgress.step1
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                                                    : 'border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground'
                                            }`}>
                                                1
                                            </div>
                                            <div className={`w-0.5 h-16 mt-3 transition-all duration-300 ${
                                                formProgress.step1 
                                                    ? 'bg-gradient-to-b from-primary/50 to-primary/20' 
                                                    : 'bg-gradient-to-b from-muted-foreground/20 to-muted-foreground/10'
                                            }`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-semibold">Basic Information</div>
                                            <div className="text-sm text-muted-foreground">Contest details</div>
                                        </div>
                                    </div>
                                    
                                    {/* Step 2: Visibility */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-base font-bold transition-all duration-300 ${
                                                formProgress.step2
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                                                    : 'border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground'
                                            }`}>
                                                2
                                            </div>
                                            <div className={`w-0.5 h-16 mt-3 transition-all duration-300 ${
                                                formProgress.step2 
                                                    ? 'bg-gradient-to-b from-primary/50 to-primary/20' 
                                                    : 'bg-gradient-to-b from-muted-foreground/20 to-muted-foreground/10'
                                            }`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-semibold">Visibility Settings</div>
                                            <div className="text-sm text-muted-foreground">Public or private</div>
                                        </div>
                                    </div>
                                    
                                    {/* Step 3: Languages */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-base font-bold transition-all duration-300 ${
                                                formProgress.step3
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                                                    : 'border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground'
                                            }`}>
                                                3
                                            </div>
                                            <div className={`w-0.5 h-16 mt-3 transition-all duration-300 ${
                                                formProgress.step3 
                                                    ? 'bg-gradient-to-b from-primary/50 to-primary/20' 
                                                    : 'bg-gradient-to-b from-muted-foreground/20 to-muted-foreground/10'
                                            }`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-semibold">Programming Languages</div>
                                            <div className="text-sm text-muted-foreground">Allowed languages</div>
                                        </div>
                                    </div>
                                    
                                    {/* Step 4: Problems */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-base font-bold transition-all duration-300 ${
                                                formProgress.step4
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                                                    : 'border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground'
                                            }`}>
                                                4
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-semibold">Contest Problems</div>
                                            <div className="text-sm text-muted-foreground">Select questions</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Content - Centered independently */}
                            <div className="w-full max-w-2xl mx-auto">
                                <CreateContestForm
                                    onClose={() => {
                                        setShowCreateForm(false);
                                        // Reset form progress when closing
                                        setFormProgress({
                                            step1: false,
                                            step2: false,
                                            step3: false,
                                            step4: false
                                        });
                                    }}
                                    onSuccess={fetchContests}
                                    onProgressUpdate={setFormProgress}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Contests</CardTitle>
                    <CardDescription>Manage your contests and view live submissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contest Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Visibility</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Participants</TableHead>
                                <TableHead>Problems</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            <span className="ml-2">Loading contests...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : contests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        No contests yet. Create your first contest!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contests.map((contest) => (
                                    <TableRow key={contest._id}>
                                        <TableCell className="font-medium">{contest.title}</TableCell>
                                        <TableCell>{getStatusBadge(contest.status)}</TableCell>
                                        <TableCell>
                                            <Badge variant={contest.visibility === 'public' ? 'default' : 'secondary'} className="gap-1">
                                                {contest.visibility === 'public' ? (
                                                    <><Globe className="w-3 h-3" /> Public</>
                                                ) : (
                                                    <><Lock className="w-3 h-3" /> Private</>
                                                )}
                                            </Badge>
                                            {contest.visibility === 'private' && contest.allowedClasses?.length > 0 && (
                                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <MailCheck className="w-3 h-3" />
                                                    {contest.allowedClasses.length} class{contest.allowedClasses.length !== 1 ? 'es' : ''} notified
                                                </div>
                                            )}
                                            {contest.visibility === 'public' && (
                                                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <MailCheck className="w-3 h-3" />
                                                    All students notified
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(contest.startTime).toLocaleDateString()}</TableCell>
                                        <TableCell>{contest.duration} min</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {contest.participants?.length || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell>{contest.problems?.length || 0}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title="View Details"
                                                    onClick={() => navigate(`/contest/${contest._id}`)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {((contest.visibility === 'private' && contest.allowedClasses?.length > 0) || contest.visibility === 'public') && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title={contest.visibility === 'public' ? "Send Email Notifications to All Students" : "Send Email Notifications to Selected Classes"}
                                                        onClick={() => handleSendNotifications(contest)}
                                                        disabled={sendingNotifications === contest._id}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        {sendingNotifications === contest._id ? (
                                                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                                        ) : (
                                                            <Mail className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                )}
                                                {(contest.status === 'ended' || contest.status === 'active' || contest.status === 'upcoming') && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title={contest.status === 'ended' ? "Download Report" : "Report available after contest ends"}
                                                        onClick={() => handleDownloadReport(contest._id, contest.status)}
                                                    >
                                                        <Download className={`w-4 h-4 ${contest.status === 'ended' ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Edit Contest"
                                                    onClick={() => {
                                                        // TODO: Implement edit functionality
                                                        toast.info('Edit functionality coming soon!');
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Delete Contest"
                                                    onClick={() => setContestToDelete(contest)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!contestToDelete} onOpenChange={() => setContestToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Contest?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{contestToDelete?.title}"? This action cannot be undone.
                            All participant registrations and contest data will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setContestToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteContest}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Contest'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CreateContestForm({ onClose, onSuccess, onProgressUpdate }) {
    const availableLanguages = [
        { key: "python", label: "Python" },
        { key: "cpp", label: "C++" },
        { key: "java", label: "Java" },
        { key: "c", label: "C" },
        { key: "nasm", label: "NASM" },
        { key: "sql", label: "SQL" },
        { key: "shell script", label: "Shell Script" },
    ];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        duration: '',
        visibility: '', // No default selection
        problems: [],
        allowedLanguages: [], // No default languages selected
        allowedClasses: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableProblems, setAvailableProblems] = useState([]);
    const [availableClasses, setAvailableClasses] = useState([]);
    const [loadingProblems, setLoadingProblems] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [showProblemSelector, setShowProblemSelector] = useState(false);
    const [showClassSelector, setShowClassSelector] = useState(false);
    
    // Track user interactions to determine real progress
    const [userInteractions, setUserInteractions] = useState({
        hasSelectedVisibility: false,
        hasModifiedLanguages: false
    });

    // Reset user interactions when form is opened
    useEffect(() => {
        setUserInteractions({
            hasSelectedVisibility: false,
            hasModifiedLanguages: false
        });
    }, []); // Reset on component mount

    // Fetch available problems and classes
    useEffect(() => {
        fetchProblems();
        fetchClasses();
    }, []);

    // Track form progress
    useEffect(() => {
        if (onProgressUpdate) {
            const progress = {
                step1: !!(formData.title.trim() && formData.description.trim() && formData.startTime && formData.duration),
                step2: false,
                step3: false,
                step4: formData.problems.length > 0
            };
            
            // Step 2: Complete when visibility is set and requirements are met
            if (formData.visibility === 'public' || 
                (formData.visibility === 'private' && formData.allowedClasses.length > 0)) {
                progress.step2 = true;
            }
            
            // Step 3: Complete when at least one language is selected
            if (formData.allowedLanguages.length > 0) {
                progress.step3 = true;
            }
            
            onProgressUpdate(progress);
        }
    }, [formData, userInteractions, onProgressUpdate]);

    const fetchProblems = async () => {
        try {
            setLoadingProblems(true);
            const response = await problemService.getProblems();
            if (response.success) {
                setAvailableProblems(response.data.problems || []);
            }
        } catch (error) {
            console.error('Failed to fetch problems:', error);
        } finally {
            setLoadingProblems(false);
        }
    };

    const fetchClasses = async () => {
        try {
            setLoadingClasses(true);
            const { classService } = await import('@/services/class.service');
            const response = await classService.getClasses();
            if (response.success) {
                setAvailableClasses(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        } finally {
            setLoadingClasses(false);
        }
    };

    const toggleProblem = (problemId) => {
        setFormData(prev => ({
            ...prev,
            problems: prev.problems.includes(problemId)
                ? prev.problems.filter(id => id !== problemId)
                : [...prev.problems, problemId]
        }));
    };

    const toggleClass = (classId) => {
        setFormData(prev => ({
            ...prev,
            allowedClasses: prev.allowedClasses.includes(classId)
                ? prev.allowedClasses.filter(id => id !== classId)
                : [...prev.allowedClasses, classId]
        }));
    };

    const toggleLanguage = (languageKey) => {
        setUserInteractions(prev => ({ ...prev, hasModifiedLanguages: true }));
        setFormData(prev => ({
            ...prev,
            allowedLanguages: prev.allowedLanguages.includes(languageKey)
                ? prev.allowedLanguages.filter(key => key !== languageKey)
                : [...prev.allowedLanguages, languageKey]
        }));
    };

    const removeLanguage = (languageKey) => {
        setUserInteractions(prev => ({ ...prev, hasModifiedLanguages: true }));
        setFormData(prev => ({
            ...prev,
            allowedLanguages: prev.allowedLanguages.filter(key => key !== languageKey)
        }));
    };

    const removeProblem = (problemId) => {
        setFormData(prev => ({
            ...prev,
            problems: prev.problems.filter(id => id !== problemId)
        }));
    };

    const removeClass = (classId) => {
        setFormData(prev => ({
            ...prev,
            allowedClasses: prev.allowedClasses.filter(id => id !== classId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Calculate end time
            const startDate = new Date(formData.startTime);
            const now = new Date();

            // Validate start time is not in the past
            if (startDate < now) {
                toast.error('Contest start time cannot be in the past');
                setIsSubmitting(false);
                return;
            }

            // Validate private contest has classes selected
            if (formData.visibility === 'private' && formData.allowedClasses.length === 0) {
                toast.error('Please select at least one class for private contest');
                setIsSubmitting(false);
                return;
            }

            const endDate = new Date(startDate.getTime() + formData.duration * 60000);

            const contestData = {
                title: formData.title,
                description: formData.description,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                duration: parseInt(formData.duration),
                visibility: formData.visibility,
                isPublic: formData.visibility === 'public', // Keep for backward compatibility
                problems: formData.problems,
                allowedLanguages: formData.allowedLanguages,
                allowedClasses: formData.visibility === 'private' ? formData.allowedClasses : [],
                rules: "Standard contest rules",
            };

            const response = await contestService.createContest(contestData);

            if (response.success) {
                if (formData.visibility === 'private' && formData.allowedClasses.length > 0) {
                    toast.success('Contest created successfully! Email notifications are being sent to students in the selected classes.');
                } else if (formData.visibility === 'public') {
                    toast.success('Contest created successfully! Email notifications are being sent to all students.');
                } else {
                    toast.success('Contest created successfully!');
                }
                onSuccess();
                onClose();
            } else {
                toast.error(response.message || 'Failed to create contest');
            }
        } catch (error) {
            console.error('Error creating contest:', error);
            toast.error('Failed to create contest');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Contest Name</Label>
                    <Input
                        id="name"
                        placeholder="Enter contest name"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Contest description and instructions"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="resize-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date & Time</Label>
                        <Input
                            id="startDate"
                            type="datetime-local"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            min={new Date().toISOString().slice(0, 16)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">Contest must start in the future</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                            id="duration"
                            type="number"
                            placeholder="Enter duration in minutes"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Visibility Settings */}
            <div className="space-y-4 border-t pt-6">
                <div className="space-y-2">
                    <Label>Contest Visibility</Label>
                    <Select
                        value={formData.visibility}
                        onValueChange={(value) => {
                            setUserInteractions(prev => ({ ...prev, hasSelectedVisibility: true }));
                            setFormData({ ...formData, visibility: value });
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Please select contest visibility" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    <span>Public - Anyone can participate</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="private">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    <span>Private - Only selected classes</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Class Selection for Private Contests */}
                {formData.visibility === 'private' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Allowed Classes ({formData.allowedClasses.length} selected)</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowClassSelector(!showClassSelector)}
                            >
                                {showClassSelector ? 'Hide' : 'Select'} Classes
                            </Button>
                        </div>

                        {/* Selected Classes */}
                        {formData.allowedClasses.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50">
                                {formData.allowedClasses.map(classId => {
                                    const classData = availableClasses.find(c => c._id === classId);
                                    return classData ? (
                                        <Badge key={classId} variant="secondary" className="gap-1 pr-1">
                                            <span>{classData.name} ({classData.code})</span>
                                            <button
                                                type="button"
                                                className="pointer-events-auto ml-0.5 rounded-sm hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    removeClass(classId);
                                                }}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        )}

                        {/* Class Selector */}
                        {showClassSelector && (
                            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                                {loadingClasses ? (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                        Loading classes...
                                    </div>
                                ) : availableClasses.length === 0 ? (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                        No classes available. Create classes first.
                                    </div>
                                ) : (
                                    availableClasses.map(classData => (
                                        <div key={classData._id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                                            <Checkbox
                                                id={classData._id}
                                                checked={formData.allowedClasses.includes(classData._id)}
                                                onCheckedChange={() => toggleClass(classData._id)}
                                            />
                                            <label
                                                htmlFor={classData._id}
                                                className="flex-1 text-sm cursor-pointer flex items-center gap-2"
                                            >
                                                <span className="font-medium">{classData.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {classData.code}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    ({classData.students?.length || 0} students)
                                                </span>
                                            </label>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {formData.allowedClasses.length === 0 && (
                            <p className="text-sm text-red-600">
                                Please select at least one class for private contest
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Languages Allowed */}
            <div className="space-y-3 border-t pt-6">
                <Label>Languages Allowed ({formData.allowedLanguages.length} selected)</Label>

                {/* Selected Languages */}
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50 min-h-[50px]">
                    {formData.allowedLanguages.length === 0 ? (
                        <span className="text-sm text-muted-foreground flex items-center">No languages selected</span>
                    ) : (
                        formData.allowedLanguages.map(languageKey => {
                            const language = availableLanguages.find(l => l.key === languageKey);
                            return language ? (
                                <Badge key={languageKey} variant="secondary" className="gap-1 pr-1">
                                    <span>{language.label}</span>
                                    <button
                                        type="button"
                                        className="pointer-events-auto ml-0.5 rounded-sm hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeLanguage(languageKey);
                                        }}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ) : null;
                        })
                    )}
                </div>

                {/* Language Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availableLanguages.map(language => (
                        <div key={language.key} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                            <Checkbox
                                id={`lang-${language.key}`}
                                checked={formData.allowedLanguages.includes(language.key)}
                                onCheckedChange={() => toggleLanguage(language.key)}
                            />
                            <label
                                htmlFor={`lang-${language.key}`}
                                className="text-sm cursor-pointer font-medium"
                            >
                                {language.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Problem Selection */}
            <div className="space-y-3 border-t pt-6">
                <div className="flex items-center justify-between">
                    <Label>Contest Problems ({formData.problems.length} selected)</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowProblemSelector(!showProblemSelector)}
                    >
                        {showProblemSelector ? 'Hide' : 'Select'} Problems
                    </Button>
                </div>

                {/* Selected Problems */}
                {formData.problems.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/50">
                        {formData.problems.map(problemId => {
                            const problem = availableProblems.find(p => p._id === problemId);
                            return problem ? (
                                <Badge key={problemId} variant="secondary" className="gap-1">
                                    {problem.title}
                                    <X
                                        className="w-3 h-3 cursor-pointer"
                                        onClick={() => removeProblem(problemId)}
                                    />
                                </Badge>
                            ) : null;
                        })}
                    </div>
                )}

                {/* Problem Selector */}
                {showProblemSelector && (
                    <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                        {loadingProblems ? (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                Loading problems...
                            </div>
                        ) : availableProblems.length === 0 ? (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                No problems available. Create problems first.
                            </div>
                        ) : (
                            availableProblems.map(problem => (
                                <div key={problem._id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded">
                                    <Checkbox
                                        id={problem._id}
                                        checked={formData.problems.includes(problem._id)}
                                        onCheckedChange={() => toggleProblem(problem._id)}
                                    />
                                    <label
                                        htmlFor={problem._id}
                                        className="flex-1 text-sm cursor-pointer flex items-center gap-2"
                                    >
                                        <span className="font-medium">{problem.title}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {problem.difficulty}
                                        </Badge>
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Contest'}
                </Button>
            </div>
        </form>
    );
}

export default ContestManagement;
