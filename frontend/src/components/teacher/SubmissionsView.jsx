import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { CheckCircle2, XCircle, Clock, Eye, AlertTriangle, Search, X, Download, CalendarIcon, Code, FileQuestion } from "lucide-react";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowDownAZIcon } from "@/components/ui/arrow-down-a-z";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { submissionService } from "@/services/submission.service";
import { toast } from "sonner";

function SubmissionsTable({ submissions, loading, filteredSubmissions, getStatusBadge, handleViewSubmission }) {
    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-xs">Student</TableHead>
                            <TableHead className="text-xs">Problem</TableHead>
                            <TableHead className="text-xs">Contest</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Language</TableHead>
                            <TableHead className="text-xs">Time</TableHead>
                            <TableHead className="text-xs">Score</TableHead>
                            <TableHead className="text-xs">Timestamp</TableHead>
                            <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <span className="ml-2">Loading submissions...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredSubmissions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    {submissions.length === 0
                                        ? "No submissions yet. Students haven't submitted any solutions."
                                        : "No submissions match the selected filters."
                                    }
                                </TableCell>
                            </TableRow>
                        ) : (
                            submissions.map((submission) => (
                                <TableRow key={submission._id}>
                                    <TableCell className="font-medium">{submission.user?.name || 'Unknown'}</TableCell>
                                    <TableCell>{submission.problem?.title || 'Unknown Problem'}</TableCell>
                                    <TableCell>{submission.contest?.title || 'Practice'}</TableCell>
                                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                    <TableCell>
                                        {submission.problem?.questionType === 'mcq' || 
                                         submission.questionType === 'mcq' ||
                                         submission.problem?.mcqOptions?.length > 0 ||
                                         submission.mcqAnswer !== undefined ? (
                                            <Badge variant="outline">MCQ</Badge>
                                        ) : (
                                            <Badge variant="outline">{submission.language?.toUpperCase()}</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {submission.problem?.questionType === 'mcq' || 
                                         submission.questionType === 'mcq' ||
                                         submission.problem?.mcqOptions?.length > 0 ||
                                         submission.mcqAnswer !== undefined ? (
                                            '-'
                                        ) : (
                                            submission.executionTime ? `${submission.executionTime.toFixed(3)}s` : '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={submission.score === 100 ? "text-green-600 font-semibold" : ""}>
                                            {submission.score || 0}/100
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : 'Unknown'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleViewSubmission(submission)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View - Submissions Cards */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <Card>
                        <CardContent className="pt-6 flex items-center justify-center py-8">
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className="ml-2">Loading submissions...</span>
                            </div>
                        </CardContent>
                    </Card>
                ) : filteredSubmissions.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground py-8">
                            {submissions.length === 0
                                ? "No submissions yet. Students haven't submitted any solutions."
                                : "No submissions match the selected filters."
                            }
                        </CardContent>
                    </Card>
                ) : (
                    submissions.map((submission) => (
                        <Card key={submission._id} className="overflow-hidden">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{submission.user?.name || 'Unknown'}</p>
                                        <p className="text-xs text-muted-foreground truncate">{submission.problem?.title || 'Unknown Problem'}</p>
                                    </div>
                                    {getStatusBadge(submission.status)}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <p className="text-muted-foreground">Contest</p>
                                        <p className="font-medium truncate">{submission.contest?.title || 'Practice'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Language</p>
                                        <p className="font-medium">
                                            {submission.problem?.questionType === 'mcq' || 
                                             submission.questionType === 'mcq' ||
                                             submission.problem?.mcqOptions?.length > 0 ||
                                             submission.mcqAnswer !== undefined ? 'MCQ' : (submission.language || '-')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Time</p>
                                        <p className="font-medium">
                                            {submission.problem?.questionType === 'mcq' || 
                                             submission.questionType === 'mcq' ||
                                             submission.problem?.mcqOptions?.length > 0 ||
                                             submission.mcqAnswer !== undefined ? '-' : `${submission.executionTime || '-'}ms`}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Score</p>
                                        <p className={`font-medium ${submission.score === 100 ? 'text-green-600' : ''}`}>
                                            {submission.score || 0}/100
                                        </p>
                                    </div>
                                </div>

                                <div className="text-xs pt-1 border-t">
                                    <p className="text-muted-foreground">Submitted</p>
                                    <p className="font-medium">
                                        {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : 'Unknown'}
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 text-xs h-8"
                                        onClick={() => handleViewSubmission(submission)}
                                    >
                                        <Eye className="w-3 h-3 mr-1" />
                                        View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </>
    );
}

function SubmissionsView() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'details'
    const [statusFilter, setStatusFilter] = useState('all');
    const [contestFilter, setContestFilter] = useState('all');
    const [submissionTypeFilter, setSubmissionTypeFilter] = useState('coding'); // 'coding', 'mcq' (removed 'all')
    const [searchTerm, setSearchTerm] = useState('');
    const [commandOpen, setCommandOpen] = useState(false);
    const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp' | 'score' | 'status'
    const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
    const [dateRange, setDateRange] = useState({ from: null, to: null });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch submissions from backend
    useEffect(() => {
        console.log('SubmissionsView mounted, fetching submissions...');
        fetchSubmissions();
    }, []);

    // Command palette hotkey: Ctrl/Cmd + K
    useEffect(() => {
        const handler = (e) => {
            const isK = e.key?.toLowerCase() === 'k';
            if ((e.ctrlKey || e.metaKey) && isK) {
                e.preventDefault();
                setCommandOpen(true);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await submissionService.getAllSubmissions();
            if (response.success) {
                setSubmissions(response.data.submissions || []);
            } else {
                console.error('API returned error:', response.message);
                toast.error(response.message || 'Failed to load submissions');
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
            toast.error('Failed to load submissions: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusLower = status?.toLowerCase();
        const config = {
            accepted: { icon: CheckCircle2, className: "bg-green-500/10 text-green-700 " },
            "partially correct": { icon: CheckCircle2, className: "bg-orange-500/10 text-orange-700" },
            "wrong answer": { icon: XCircle, className: "bg-red-500/10 text-red-700" },
            "time limit exceeded": { icon: Clock, className: "bg-yellow-500/10 text-yellow-700" },
            "runtime error": { icon: AlertTriangle, className: "bg-orange-500/10 text-orange-700" },
            "compilation error": { icon: AlertTriangle, className: "bg-purple-500/10 text-purple-700" },
            pending: { icon: Clock, className: "bg-blue-500/10 text-blue-700" },
        };

        const { icon: Icon, className } = config[statusLower] || { icon: Clock, className: "bg-gray-500/10 text-gray-700" };
        return (
            <Badge variant="default" className={className}>
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </Badge>
        );
    };

    const handleViewSubmission = async (submission) => {
        setViewMode('details');
        setSelectedSubmission(submission); // Show basic data first
        setLoadingDetails(true);

        try {
            // Fetch detailed submission data
            const response = await submissionService.getSubmissionDetails(submission._id);
            if (response.success) {
                setSelectedSubmission(response.data);
            } else {
                toast.error('Could not load detailed submission data');
            }
        } catch (error) {
            console.error('Error fetching submission details:', error);
            toast.error('Could not load detailed submission data');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedSubmission(null);
        setLoadingDetails(false);
    };

    // Filter submissions based on selected filters
    const filteredSubmissions = submissions.filter(submission => {
        // Search filter - filter by student name, email, or problem title
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            const matchName = submission.user?.name?.toLowerCase().includes(search);
            const matchEmail = submission.user?.email?.toLowerCase().includes(search);
            const matchProblem = submission.problem?.title?.toLowerCase().includes(search);
            if (!matchName && !matchEmail && !matchProblem) {
                return false;
            }
        }

        // Date range filter
        if (dateRange.from || dateRange.to) {
            const subDate = new Date(submission.createdAt);
            if (dateRange.from) {
                const fromDate = new Date(dateRange.from);
                fromDate.setHours(0, 0, 0, 0);
                if (subDate < fromDate) return false;
            }
            if (dateRange.to) {
                const toDate = new Date(dateRange.to);
                toDate.setHours(23, 59, 59, 999);
                if (subDate > toDate) return false;
            }
        }

        // Status filter
        if (statusFilter !== 'all') {
            const statusMatch = {
                'accepted': 'Accepted',
                'partially-correct': 'Partially Correct',
                'wrong-answer': 'Wrong Answer',
                'tle': 'Time Limit Exceeded',
                'runtime-error': 'Runtime Error',
                'compilation-error': 'Compilation Error'
            };
            if (submission.status !== statusMatch[statusFilter]) {
                return false;
            }
        }

        // Contest filter
        if (contestFilter !== 'all') {
            if (contestFilter === 'practice') {
                // Show only practice submissions (no contest)
                if (submission.contest) {
                    return false;
                }
            } else {
                // Show only submissions from specific contest
                if (!submission.contest || submission.contest._id !== contestFilter) {
                    return false;
                }
            }
        }

        // Submission type filter
        const isMCQ = submission.problem?.questionType === 'mcq' || 
                     submission.questionType === 'mcq' ||
                     submission.problem?.mcqOptions?.length > 0 ||
                     submission.mcqAnswer !== undefined;
        
        if (submissionTypeFilter === 'mcq' && !isMCQ) {
            return false;
        }
        if (submissionTypeFilter === 'coding' && isMCQ) {
            return false;
        }

        return true;
    });

    // Get unique contests for filter dropdown
    const uniqueContests = [...new Set(submissions
        .filter(s => s.contest)
        .map(s => ({ id: s.contest._id, title: s.contest.title }))
    )].filter((contest, index, self) =>
        index === self.findIndex(c => c.id === contest.id)
    );

    // Sort submissions
    const sortValue = (s) => {
        switch (sortBy) {
            case 'score':
                return Number(s.score ?? -1);
            case 'status': {
                const order = {
                    'Accepted': 4,
                    'Wrong Answer': 1,
                    'Time Limit Exceeded': 2,
                    'Runtime Error': 0,
                    'Compilation Error': 0,
                    'Pending': 3,
                };
                return order[s.status] ?? -1;
            }
            case 'timestamp':
            default:
                return new Date(s.createdAt ?? 0).getTime();
        }
    };
    const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
        const av = sortValue(a);
        const bv = sortValue(b);
        return sortDir === 'asc' ? av - bv : bv - av;
    });

    // Calculate pagination on sorted data
    const totalPages = Math.ceil(sortedSubmissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSubmissions = sortedSubmissions.slice(startIndex, startIndex + itemsPerPage);

    // CSV Export (aggregated by user)
    const handleExportCSV = () => {
        try {
            const agg = new Map();
            for (const s of filteredSubmissions) {
                const uid = s.user?._id || s.user?.email || s.user?.name || 'unknown';
                const key = uid;
                const cur = agg.get(key) || {
                    name: s.user?.name || 'Unknown',
                    email: s.user?.email || '',
                    solved: 0,
                    submissions: 0,
                    accepted: 0,
                    partiallyCorrect: 0,
                    wrong: 0,
                    tle: 0,
                    runtime: 0,
                    compile: 0,
                    avgScoreSum: 0,
                    lastTime: 0,
                };
                cur.submissions += 1;
                if (s.status === 'Accepted') cur.solved += 1;
                if (s.status === 'Accepted') cur.accepted += 1;
                if (s.status === 'Partially Correct') cur.partiallyCorrect += 1;
                if (s.status === 'Wrong Answer') cur.wrong += 1;
                if (s.status === 'Time Limit Exceeded') cur.tle += 1;
                if (s.status === 'Runtime Error') cur.runtime += 1;
                if (s.status === 'Compilation Error') cur.compile += 1;
                cur.avgScoreSum += Number(s.score || 0);
                const t = new Date(s.createdAt || 0).getTime();
                cur.lastTime = Math.max(cur.lastTime, t);
                agg.set(key, cur);
            }

            // Build filter info for CSV header
            const filterInfo = [];
            if (searchTerm) filterInfo.push(`Search: ${searchTerm}`);
            if (statusFilter !== 'all') filterInfo.push(`Status: ${statusFilter}`);
            if (contestFilter !== 'all') filterInfo.push(`Contest: ${contestFilter}`);
            if (dateRange.from) {
                const dateStr = dateRange.to
                    ? `${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`
                    : `From ${new Date(dateRange.from).toLocaleDateString()}`;
                filterInfo.push(`Date: ${dateStr}`);
            }

            const rows = [
                ['# Submissions Report'],
                [`# Generated: ${new Date().toLocaleString()}`],
                filterInfo.length > 0 ? [`# Filters: ${filterInfo.join(' | ')}`] : [],
                ['# Total Students:', String(agg.size)],
                ['# Total Submissions:', String(filteredSubmissions.length)],
                [],
                [
                    'Student Name', 'Email', 'Solved Count', 'Total Submissions',
                    'Accepted', 'Partially Correct', 'Wrong Answer', 'TLE', 'Runtime Error', 'Compilation Error',
                    'Average Score', 'Last Submission Time'
                ],
                ...Array.from(agg.values()).map(v => [
                    v.name,
                    v.email,
                    String(v.solved),
                    String(v.submissions),
                    String(v.accepted),
                    String(v.partiallyCorrect),
                    String(v.wrong),
                    String(v.tle),
                    String(v.runtime),
                    String(v.compile),
                    (v.submissions ? (v.avgScoreSum / v.submissions).toFixed(2) : '0.00'),
                    v.lastTime ? new Date(v.lastTime).toLocaleString() : ''
                ])
            ].filter(row => row.length > 0);

            const csv = rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Add date range to filename if present
            let filename = 'submissions_report';
            if (dateRange.from) {
                const fromStr = new Date(dateRange.from).toISOString().split('T')[0];
                const toStr = dateRange.to ? new Date(dateRange.to).toISOString().split('T')[0] : 'now';
                filename += `_${fromStr}_to_${toStr}`;
            }
            filename += `_${Date.now()}.csv`;

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('CSV export failed', e);
            toast.error('Failed to export CSV');
        }
    };

    if (viewMode === 'details' && selectedSubmission) {
        return (
            <div className="mt-4 space-y-6">
                <Button variant="outline" onClick={handleBackToList}>
                    ← Back to Submissions
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Submission Details</h2>
                    <p className="text-muted-foreground">
                        {selectedSubmission?.user?.name || 'Unknown Student'} - {selectedSubmission?.problem?.title || 'Unknown Problem'}
                    </p>
                </div>
                <SubmissionDetails
                    submission={selectedSubmission}
                    loading={loadingDetails}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4 sm:p-6 lg:p-0 max-w-full overflow-x-hidden">
            {/* Search, Sort and Filter Section */}
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Submissions</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Monitor and review student submissions
                        {(searchTerm || statusFilter !== 'all' || contestFilter !== 'all' || dateRange.from) && (
                            <span className="ml-2 text-primary">
                                • Filters active ({filteredSubmissions.length} results)
                            </span>
                        )}
                    </p>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by student name, email, or problem..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-10 pr-10 w-full text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setCurrentPage(1);
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Date Range Filter */}
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="text-xs sm:text-sm justify-start text-left font-normal w-full sm:w-[240px]">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>
                                            {new Date(dateRange.from).toLocaleDateString()} - {new Date(dateRange.to).toLocaleDateString()}
                                        </>
                                    ) : (
                                        new Date(dateRange.from).toLocaleDateString()
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={(range) => {
                                    setDateRange(range || { from: null, to: null });
                                    setCurrentPage(1);
                                }}
                                numberOfMonths={2}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {(dateRange.from || dateRange.to) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setDateRange({ from: null, to: null });
                                setCurrentPage(1);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Sort & Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* Sort By */}
                    <Select value={sortBy} onValueChange={(val) => { setSortBy(val); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="timestamp">Sort by Timestamp</SelectItem>
                            <SelectItem value="score">Sort by Score</SelectItem>
                            <SelectItem value="status">Sort by Status</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Sort Direction Toggle */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
                                        setCurrentPage(1);
                                    }}
                                    className={sortDir === 'asc' ? 'rotate-180' : ''}
                                >
                                    <ArrowDownAZIcon size={16} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{sortDir === 'asc' ? 'Ascending (A-Z)' : 'Descending (Z-A)'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Submissions</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="partially-correct">Partially Correct</SelectItem>
                            <SelectItem value="wrong-answer">Wrong Answer</SelectItem>
                            <SelectItem value="tle">Time Limit Exceeded</SelectItem>
                            <SelectItem value="runtime-error">Runtime Error</SelectItem>
                            <SelectItem value="compilation-error">Compilation Error</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={contestFilter} onValueChange={(val) => { setContestFilter(val); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[160px] text-xs sm:text-sm">
                            <SelectValue placeholder="Filter by contest" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Contests</SelectItem>
                            <SelectItem value="practice">Practice Mode</SelectItem>
                            {uniqueContests.map((contest) => (
                                <SelectItem key={contest.id} value={contest.id}>
                                    {contest.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* Export CSV */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={handleExportCSV}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Export CSV Report</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Recent Submissions</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">View and manage all student code submissions</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <TabGroup selectedIndex={submissionTypeFilter === 'coding' ? 0 : 1} onChange={(index) => setSubmissionTypeFilter(index === 0 ? 'coding' : 'mcq')}>
                        <div className="rounded-xl bg-neutral-900 p-2 text-white">
                            <TabList className="flex gap-4">
                                <Tab
                                    className="rounded-full px-3 py-1 text-sm/6 font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10 flex items-center gap-2"
                                >
                                    <Code className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Coding</span>
                                    <span className="sm:hidden">Code</span>
                                </Tab>
                                <Tab
                                    className="rounded-full px-3 py-1 text-sm/6 font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10 flex items-center gap-2"
                                >
                                    <FileQuestion className="w-3 h-3 sm:w-4 sm:h-4" />
                                    MCQ
                                </Tab>
                            </TabList>
                        </div>
                        <TabPanels className="mt-3">
                            <TabPanel>
                                <SubmissionsTable 
                                    submissions={paginatedSubmissions}
                                    loading={loading}
                                    filteredSubmissions={filteredSubmissions}
                                    getStatusBadge={getStatusBadge}
                                    handleViewSubmission={handleViewSubmission}
                                />
                            </TabPanel>
                            <TabPanel>
                                <SubmissionsTable 
                                    submissions={paginatedSubmissions}
                                    loading={loading}
                                    filteredSubmissions={filteredSubmissions}
                                    getStatusBadge={getStatusBadge}
                                    handleViewSubmission={handleViewSubmission}
                                />
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {!loading && filteredSubmissions.length > 0 && totalPages > 1 && (
                <div className="flex justify-center mt-6 mb-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationPrevious
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                if (totalPages <= 5) return i + 1;
                                if (currentPage <= 3) return i + 1;
                                if (currentPage >= totalPages - 2) return totalPages - 4 + i;
                                return currentPage - 2 + i;
                            }).map((pageNum) => (
                                <PaginationItem key={pageNum}>
                                    <PaginationLink
                                        onClick={() => setCurrentPage(pageNum)}
                                        isActive={currentPage === pageNum}
                                        className="cursor-pointer"
                                    >
                                        {pageNum}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationNext
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Command Palette */}
            <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Quick Search</DialogTitle>
                    </DialogHeader>
                    <Command>
                        <CommandInput placeholder="Type a name, email, or problem..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Submissions">
                                {submissions.map((s) => (
                                    <CommandItem
                                        key={s._id}
                                        onSelect={() => {
                                            setSelectedSubmission(s);
                                            setViewMode('details');
                                            setCommandOpen(false);
                                        }}
                                    >
                                        <span className="font-medium mr-2">{s.user?.name || 'Unknown'}</span>
                                        <span className="text-muted-foreground">— {s.problem?.title || 'Unknown Problem'}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>

        </div>
    );
}

function SubmissionDetails({ submission, loading = false }) {
    const [manualScore, setManualScore] = useState(submission?.score || 0);
    const [isUpdatingScore, setIsUpdatingScore] = useState(false);

    const handleUpdateScore = async (submissionId, score) => {
        try {
            setIsUpdatingScore(true);
            const numericScore = parseFloat(score);

            if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
                toast.error('Score must be a number between 0 and 100');
                return;
            }

            const response = await submissionService.updateScore(submissionId, numericScore);

            if (response.success) {
                toast.success('Score updated successfully');
                // Update the local state to reflect the change
                submission.score = numericScore;
                submission.manuallyScored = true;
            } else {
                toast.error('Failed to update score');
            }
        } catch (error) {
            console.error('Error updating score:', error);
            toast.error('Failed to update score');
        } finally {
            setIsUpdatingScore(false);
        }
    };

    const handleDownloadCode = (sub) => {
        try {
            const codeStr = sub?.code || '';
            const ext = (() => {
                const lang = sub?.language?.toLowerCase();
                switch (lang) {
                    case 'python':
                    case 'py':
                        return 'py';
                    case 'cpp':
                        return 'cpp';
                    case 'c':
                        return 'c';
                    case 'java':
                        return 'java';
                    case 'javascript':
                    case 'node':
                    case 'js':
                        return 'js';
                    case 'typescript':
                    case 'ts':
                        return 'ts';
                    default:
                        return 'txt';
                }
            })();
            const safeTitle = (sub?.problem?.title || 'code').replace(/[^a-z0-9_-]+/gi, '_');
            const safeName = (sub?.user?.name || 'student').replace(/[^a-z0-9_-]+/gi, '_');
            const filename = `${safeTitle}_${safeName}.${ext}`;
            const blob = new Blob([codeStr], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Failed to download code:', e);
            toast.error('Failed to download code');
        }
    };

    if (!submission) {
        return <div>No submission data available</div>;
    }

    // Check if this is an MCQ submission
    const isMCQSubmission = submission.problem?.questionType === 'mcq' || 
                           submission.questionType === 'mcq' ||
                           submission.problem?.mcqOptions?.length > 0 ||
                           submission.mcqAnswer !== undefined;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Student Name:</span>
                        <span className="font-medium">{submission.user?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Student Email:</span>
                        <span className="text-sm">{submission.user?.email || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Problem Title:</span>
                        <span className="font-medium">{submission.problem?.title || 'Unknown Problem'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Difficulty:</span>
                        <Badge variant="outline">
                            {submission.problem?.difficulty || 'Unknown'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Language Used:</span>
                        <span className="font-medium">{isMCQSubmission ? 'N/A (MCQ)' : (submission.language?.toUpperCase() || 'Unknown')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Contest Name:</span>
                        <span className="font-medium">{submission.contest?.title || 'Practice Mode'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Status:</span>
                        <Badge variant={submission.status === "Accepted" ? "default" : "destructive"}>
                            {submission.status}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Score:</span>
                        <span className={`font-medium ${submission.score === 100 ? "text-green-600" : submission.score > 0 ? "text-yellow-600" : "text-red-600"}`}>
                            {submission.score || 0} / 100
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">{isMCQSubmission ? 'Options:' : 'Test Cases:'}</span>
                        <span className="font-medium">
                            {isMCQSubmission 
                                ? `${submission.problem?.mcqOptions?.length || 0} choices`
                                : `${submission.testCasesPassed || 0} / ${submission.totalTestCases || 0}`
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground min-w-[120px]">Submitted:</span>
                        <span className="text-sm">
                            {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>

            {isMCQSubmission ? (
                // MCQ Answer Section
                <Card>
                    <CardHeader>
                        <CardTitle>Selected Answer</CardTitle>
                        <CardDescription>Student's choice and correct answer</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {submission.problem?.mcqOptions && submission.problem.mcqOptions.length > 0 ? (
                            <div className="space-y-3">
                                {submission.problem.mcqOptions.map((option, index) => {
                                    const isSelected = submission.mcqAnswer === index;
                                    const isCorrect = option.isCorrect;
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className={`p-3 rounded-lg border ${
                                                isSelected && isCorrect 
                                                    ? 'bg-green-50 border-green-200 dark:bg-green-950/20' 
                                                    : isSelected && !isCorrect
                                                    ? 'bg-red-50 border-red-200 dark:bg-red-950/20'
                                                    : isCorrect
                                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20'
                                                    : 'bg-muted'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">Option {index + 1}:</span>
                                                <span>{option.text}</span>
                                                <div className="flex gap-2 ml-auto">
                                                    {isSelected && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Selected
                                                        </Badge>
                                                    )}
                                                    {isCorrect && (
                                                        <Badge variant="default" className="text-xs bg-green-600">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Correct
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">
                                <p>No MCQ options available</p>
                                <p className="text-sm">Selected Answer: {submission.mcqAnswer ?? 'None'}</p>
                            </div>
                        )}
                        
                        {submission.problem?.mcqExplanation && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Explanation:</h4>
                                <p className="text-sm text-blue-800 dark:text-blue-200">{submission.problem.mcqExplanation}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                // Coding Submission Section
                <Card>
                    <CardHeader>
                        <CardTitle>Submitted Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                            <code>{submission.code || 'No code available'}</code>
                        </pre>
                    </CardContent>
                </Card>
            )}

            {!isMCQSubmission && (
                // Only show execution results for coding submissions
                <Card>
                    <CardHeader>
                        <CardTitle>Execution Results</CardTitle>
                        <CardDescription>
                            Test case results and execution details
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className="ml-2">Loading detailed results...</span>
                            </div>
                        ) : submission.testResults && submission.testResults.length > 0 ? (
                            <Tabs defaultValue="0">
                                <TabsList>
                                    {submission.testResults.map((_, index) => (
                                        <TabsTrigger key={index} value={index.toString()}>
                                            Test Case {index + 1}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {submission.testResults.map((result, index) => (
                                    <TabsContent key={index} value={index.toString()} className="space-y-3">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant={result.isCorrect ? "default" : "destructive"}>
                                                {result.isCorrect ? (
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                )}
                                                {result.isCorrect ? "Passed" : "Failed"}
                                            </Badge>
                                            {result.time && (
                                                <span className="text-sm text-muted-foreground">
                                                    {result.time}s
                                                </span>
                                            )}
                                            {result.memory && (
                                                <span className="text-sm text-muted-foreground">
                                                    {result.memory} KB
                                                </span>
                                            )}
                                        </div>

                                        {result.error ? (
                                            <div>
                                                <p className="text-sm font-medium mb-2 text-red-600">Error:</p>
                                                <pre className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3 rounded text-sm text-red-600 dark:text-red-400 overflow-x-auto">
                                                    {result.error}
                                                </pre>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium mb-2">Input</p>
                                                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                                                        {result.input || 'No input'}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium mb-2">Expected Output</p>
                                                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                                                        {result.expectedOutput || 'No expected output'}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium mb-2">Actual Output</p>
                                                    <pre className={`p-3 rounded text-sm overflow-x-auto ${result.isCorrect
                                                        ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                                                        : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                                                        }`}>
                                                        {result.actualOutput || 'No output'}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No detailed test results available for this submission.</p>
                                <p className="text-sm mt-2">
                                    Status: {submission.status} |
                                    Passed: {submission.testCasesPassed || 0}/{submission.totalTestCases || 0} test cases
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Manual Scoring</CardTitle>
                    <CardDescription>Adjust score for partial credit or manual evaluation</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Input
                        type="number"
                        value={manualScore}
                        onChange={(e) => setManualScore(e.target.value)}
                        className="w-24"
                        min="0"
                        max="100"
                    />
                    <span className="text-muted-foreground">/ 100</span>
                    <Button
                        onClick={() => handleUpdateScore(submission._id, manualScore)}
                        disabled={isUpdatingScore}
                    >
                        {isUpdatingScore ? 'Updating...' : 'Update Score'}
                    </Button>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                {!isMCQSubmission && (
                    <Button variant="outline" onClick={() => handleDownloadCode(submission)}>
                        Download Code
                    </Button>
                )}
            </div>
        </div>
    );
}

export default SubmissionsView;
