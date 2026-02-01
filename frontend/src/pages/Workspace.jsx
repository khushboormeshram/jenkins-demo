import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import WorkspaceNavbar from "@/components/workspace-navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { ThumbsUp, ThumbsDown, CheckCircle2, XCircle, X, BookOpen, ListChecks, Plus, ArrowLeft } from "lucide-react";
import CodeEditor from "@/components/editor/code-editor";
import MCQAnswer from "@/components/mcq/MCQAnswer";
import { useIsMobile } from "@/hooks/use-mobile";
import { contestService } from "@/services/contest.service";
import { problemService } from "@/services/problem.service";
import { submissionService } from "@/services/submission.service";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";
import TestCaseResults from "@/components/ui/test-case-results";

function AppSidebar({ contestProblems, currentProblemId, contestId }) {
    const { toggleSidebar } = useSidebar();
    const isMobile = useIsMobile();
    return (
        <Sidebar style={{ "--sidebar-width": isMobile ? "100vw" : "36rem" }} className="z-[60]">
            <SidebarHeader className="p-4 border-b flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">All Problems</h2>
                <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                    <X className="w-4 h-4" />
                </Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {contestProblems.map((problem, idx) => (
                                <SidebarMenuItem key={problem._id} className="py-0.5">
                                    <SidebarMenuButton asChild isActive={currentProblemId === problem._id} className="h-auto py-1.5">
                                        <Link to={`/contest/${contestId}/problems/${problem._id}/workspace`} className="flex items-center justify-between gap-3 w-full">
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-sm font-semibold">Q{idx + 1}.</span>
                                                {problem.status === "solved" && (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                )}
                                                {problem.status === "attempted" && (
                                                    <XCircle className="w-4 h-4 text-orange-500" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-left flex-1 truncate">{problem.title}</span>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs flex-shrink-0 ${problem.difficulty === "Easy"
                                                    ? "text-green-600 border-green-600"
                                                    : problem.difficulty === "Medium"
                                                        ? "text-yellow-600 border-yellow-600"
                                                        : "text-red-600 border-red-600"
                                                    }`}
                                            >
                                                {problem.difficulty}
                                            </Badge>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

function AllProblemsTrigger() {
    const { toggleSidebar } = useSidebar();
    return (
        <Button variant="outline" size="sm" onClick={toggleSidebar}>
            All Problems
        </Button>
    );
}

function WorkspaceNavbarWrapper(props) {
    const { toggleSidebar } = useSidebar();
    return <WorkspaceNavbar {...props} onToggleSidebar={toggleSidebar} />;
}

function SidebarOverlay() {
    const { open, isMobile, toggleSidebar } = useSidebar();
    if (isMobile || !open) return null;
    return (
        <div
            className="fixed inset-0 z-[55] bg-background/80 backdrop-blur-sm"
            onClick={toggleSidebar}
        />
    );
}

function Workspace() {
    const { id, pid } = useParams();
    const navigate = useNavigate();
    const [code, setCode] = useState('// Write your code here\n');
    const [language, setLanguage] = useState('javascript');
    const [fontSize, setFontSize] = useState(14);
    const [activeCase, setActiveCase] = useState(0);
    const [activeResultCase, setActiveResultCase] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [isClearing, setIsClearing] = useState(false); // New state to handle immediate clearing
    const [isSubmitResults, setIsSubmitResults] = useState(false);
    const [activeTab, setActiveTab] = useState("testcases");
    const isMobile = useIsMobile();

    // Backend data
    const [contest, setContest] = useState(null);
    const [problemData, setProblemData] = useState(null);
    const [contestProblems, setContestProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Test cases data
    const [testCases, setTestCases] = useState([]);

    // MCQ-specific state
    const [selectedMCQAnswer, setSelectedMCQAnswer] = useState(null);
    const [mcqSubmitted, setMcqSubmitted] = useState(false);
    const [mcqResult, setMcqResult] = useState(null);
    
    // Persistent MCQ state for contest mode - stores answers for each problem
    const [contestMCQAnswers, setContestMCQAnswers] = useState({});
    const [contestMCQSubmissions, setContestMCQSubmissions] = useState({});
    const [contestMCQResults, setContestMCQResults] = useState({});



    // Fetch contest and problem data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load persistent MCQ state for this problem in contest mode
                const currentProblemMCQAnswer = contestMCQAnswers[pid] || null;
                const currentProblemMCQSubmitted = contestMCQSubmissions[pid] || false;
                const currentProblemMCQResult = contestMCQResults[pid] || null;
                
                setSelectedMCQAnswer(currentProblemMCQAnswer);
                setMcqSubmitted(currentProblemMCQSubmitted);
                setMcqResult(currentProblemMCQResult);

                // Fetch contest details
                const contestResponse = await contestService.getContest(id);
                if (contestResponse.success) {
                    setContest(contestResponse.data);
                    setContestProblems(contestResponse.data.problems || []);
                    
                    // Check if user is registered for this contest
                    if (contestResponse.data.isRegistered === false) {
                        setError('You are not registered for this contest. Please register first.');
                        return;
                    }
                }

                // Fetch specific problem
                const problemResponse = await problemService.getProblem(pid);
                if (problemResponse.success) {
                    const problem = problemResponse.data;
                    console.log('Problem data received:', { 
                        title: problem.title, 
                        hasDriverCode: !!problem.driverCode,
                        driverCodeKeys: problem.driverCode ? Object.keys(problem.driverCode) : []
                    });
                    
                    setProblemData({
                        title: problem.title,
                        difficulty: problem.difficulty,
                        description: problem.description,
                        questionType: problem.questionType || 'coding', // Add question type
                        examples: problem.examples || [],
                        constraints: problem.constraints ? problem.constraints.split('\n') : [],
                        explanations: problem.examples?.map((ex, idx) => ({
                            title: `Example ${idx + 1}`,
                            content: ex.explanation || ''
                        })) || [],
                        driverCode: problem.driverCode || {},
                        inputFields: problem.inputFields || [{ name: 'input', label: 'input' }], // Get input field definitions
                        // MCQ-specific fields
                        mcqOptions: problem.mcqOptions || [],
                        mcqExplanation: problem.mcqExplanation || '',
                        // Image field
                        image: problem.image || null,
                        // Total test cases count (including hidden ones)
                        totalTestCases: problem.testCases?.length || 0
                    });

                    // Get input fields from problem or use default
                    const inputFields = problem.inputFields || [{ name: 'input', label: 'input' }];
                    
                    // Set test cases with dynamic input fields (exclude hidden test cases)
                    const cases = problem.testCases?.filter(tc => !tc.isHidden)?.map((tc, idx) => {
                        // Split the input by | to get individual field values
                        const inputValues = tc.input ? tc.input.split('|').map(v => v.trim()) : [];
                        
                        // Create inputs array based on inputFields
                        const inputs = inputFields.map((field, fieldIdx) => ({
                            label: field.label || field.name,
                            value: inputValues[fieldIdx] || ''
                        }));
                        
                        // Add output field
                        inputs.push({ label: 'output', value: tc.output || '' });
                        
                        return {
                            id: idx + 1,
                            isUserAdded: false, // Original test cases from teacher
                            inputs
                        };
                    }) || [];

                    // If no test cases, add one empty case with the defined input fields
                    if (cases.length === 0) {
                        const inputs = inputFields.map(field => ({
                            label: field.label || field.name,
                            value: ''
                        }));
                        inputs.push({ label: 'output', value: '' });
                        
                        cases.push({
                            id: 1,
                            isUserAdded: false, // Default case is not user-added
                            inputs
                        });
                    }

                    setTestCases(cases);
                    setActiveCase(0);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load problem');
                toast.error('Failed to load problem');
            } finally {
                setLoading(false);
            }
        };

        if (id && pid) {
            fetchData();
        }
    }, [id, pid]);

    const addNewCase = () => {
        const newId = testCases.length > 0 ? Math.max(...testCases.map(c => c.id)) + 1 : 1;
        // Use the problem's input fields to create template inputs
        const inputFields = problemData?.inputFields || [{ name: 'input', label: 'input' }];
        const templateInputs = inputFields.map(field => ({ 
            label: field.label || field.name, 
            value: '' 
        }));
        // Add output field
        templateInputs.push({ label: 'output', value: '' });
        
        const newCase = {
            id: newId,
            isUserAdded: true, // Mark as user-added
            inputs: templateInputs
        };
        setTestCases([...testCases, newCase]);
        setActiveCase(testCases.length);
    };

    const updateCaseInput = (caseIdx, inputIdx, newValue) => {
        // Prevent editing of teacher-provided test cases
        if (!testCases[caseIdx]?.isUserAdded) {
            return; // Don't allow editing teacher test cases
        }
        
        const updatedCases = [...testCases];
        updatedCases[caseIdx].inputs[inputIdx].value = newValue;
        setTestCases(updatedCases);
    };

    const deleteCase = (caseIdx) => {
        const updatedCases = testCases.filter((_, idx) => idx !== caseIdx);
        setTestCases(updatedCases);
        if (activeCase >= updatedCases.length) {
            setActiveCase(Math.max(0, updatedCases.length - 1));
        } else if (activeCase > caseIdx) {
            setActiveCase(activeCase - 1);
        }
    };

    const currentProblemIndex = contestProblems.findIndex(p => p._id === pid);

    const handlePrevProblem = () => {
        if (currentProblemIndex > 0) {
            navigate(`/contest/${id}/problems/${contestProblems[currentProblemIndex - 1]._id}/workspace`);
        }
    };

    const handleNextProblem = () => {
        if (currentProblemIndex < contestProblems.length - 1) {
            navigate(`/contest/${id}/problems/${contestProblems[currentProblemIndex + 1]._id}/workspace`);
        }
    };

    const handleShuffleProblem = () => {
        if (contestProblems.length > 0) {
            const randomIndex = Math.floor(Math.random() * contestProblems.length);
            navigate(`/contest/${id}/problems/${contestProblems[randomIndex]._id}/workspace`);
        }
    };

    // Handle code change from editor
    const handleCodeChange = (newCode, newLanguage) => {
        if (newCode !== undefined) setCode(newCode);
        if (newLanguage !== undefined) setLanguage(newLanguage);
    };

    // Handle MCQ answer selection change (before submission)
    const handleMCQAnswerChange = (selectedOptionIndex) => {
        setSelectedMCQAnswer(selectedOptionIndex);
        // Update persistent state immediately when user changes selection
        setContestMCQAnswers(prev => ({ ...prev, [pid]: selectedOptionIndex }));
    };

    // Handle MCQ answer submission
    const handleMCQSubmit = async (selectedOptionIndex) => {
        if (!problemData || !problemData.mcqOptions) return;

        setIsSubmitting(true);
        setSelectedMCQAnswer(selectedOptionIndex);

        try {
            const selectedOption = problemData.mcqOptions[selectedOptionIndex];
            const isCorrect = selectedOption.isCorrect;

            // Submit MCQ answer to backend for tracking
            try {
                console.log('Submitting MCQ answer (contest):', {
                    problemId: pid,
                    contestId: id,
                    mcqAnswer: selectedOptionIndex,
                    isCorrect: isCorrect,
                    questionType: 'mcq'
                });
                
                const submitResponse = await submissionService.submitSolution({
                    problemId: pid,
                    contestId: id, // Include contest ID for contest mode
                    mcqAnswer: selectedOptionIndex,
                    isCorrect: isCorrect,
                    questionType: 'mcq'
                });

                console.log('MCQ submission response (contest):', submitResponse);
                
                if (submitResponse.success) {
                    console.log('MCQ submission saved:', submitResponse.data);
                } else {
                    console.error('MCQ submission failed:', submitResponse.message);
                }
            } catch (submitError) {
                console.error('Error saving MCQ submission:', submitError);
                console.error('Submit error details:', submitError.response?.data);
            }

            // Show result and save to persistent state
            const mcqResultData = { isCorrect, selectedOption: selectedOptionIndex };
            setMcqResult(mcqResultData);
            setMcqSubmitted(true);
            
            // Save MCQ state persistently for contest mode
            setContestMCQAnswers(prev => ({ ...prev, [pid]: selectedOptionIndex }));
            setContestMCQSubmissions(prev => ({ ...prev, [pid]: true }));
            setContestMCQResults(prev => ({ ...prev, [pid]: mcqResultData }));

            if (isCorrect) {
                toast.success('Correct Answer! 🎉', {
                    description: 'Well done! You got it right.'
                });
            } else {
                toast.error('Incorrect Answer', {
                    description: 'Don\'t worry, check the explanation below.'
                });
            }

            // Refresh contest data to update problem status if correct
            if (isCorrect) {
                try {
                    const contestResponse = await contestService.getContest(id);
                    if (contestResponse.success) {
                        setContestProblems(contestResponse.data.problems || []);
                    }
                } catch (error) {
                    console.error('Error refreshing contest data:', error);
                }
            }

        } catch (error) {
            console.error('Error submitting MCQ answer:', error);
            toast.error('Failed to submit answer');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Run code with test cases
    const handleRun = async () => {
        if (!code || !code.trim()) {
            toast.error('Please write some code first');
            return;
        }

        if (testCases.length === 0) {
            toast.error('No test cases available');
            return;
        }
        setIsRunning(true);
        setTestResults([]);
        setIsSubmitResults(false); // Set to false for run results
        // Switch to result tab when running code
        setActiveTab("result");

        try {
            // Run code against ALL test cases, including custom ones added by user
            // Note: For RUN, we include user-added test cases for debugging
            // For SUBMIT, only original test cases (including hidden) are used
            const testCasesToRun = testCases.map(tc => {
                // Get all inputs except 'output'
                const inputValues = tc.inputs
                    .filter(inp => inp.label !== 'output')
                    .map(inp => inp.value);
                
                // Join multiple inputs with | separator
                const combinedInput = inputValues.join(' | ');
                
                return {
                    input: combinedInput,
                    output: tc.inputs.find(inp => inp.label === 'output')?.value || '',
                    isHidden: false
                };
            });

            const requestData = {
                problemId: pid,
                code,
                language,
                customTestCases: testCasesToRun // Send current test cases
            };
            console.log('Running code with request:', requestData);
            const response = await submissionService.runCode(requestData);

            if (response.success) {
                const results = response.data.results;
                if (results && results.length > 0) {
                    // Transform all results to match our format
                    const transformedResults = results.map((result, index) => ({
                        passed: result.isCorrect,
                        input: result.input || '',
                        output: result.actualOutput || '',
                        expected: result.expectedOutput || '',
                        executionTime: result.time || 0,
                        memory: result.memory || 0,
                        error: result.error || '',
                        status: result.status || 'Unknown',
                        compilationError: result.error && result.status === 'Compilation Error',
                        testCaseIndex: index
                    }));
                    
                    setTestResults(transformedResults);
                    setActiveResultCase(0); // Reset to first result
                } else {
                    // Show error in results panel instead of toast
                    setTestResults([{
                        passed: false,
                        output: '',
                        expected: '',
                        executionTime: 0,
                        memory: 0,
                        error: 'No test results received',
                        status: 'Error',
                        testCaseIndex: 0
                    }]);
                }
            } else {
                // Show API error in results panel instead of toast
                setTestResults([{
                    passed: false,
                    output: '',
                    expected: '',
                    executionTime: 0,
                    memory: 0,
                    error: response.message || 'Failed to run code',
                    status: 'API Error',
                    testCaseIndex: 0
                }]);
            }
        } catch (error) {
            console.error('Error running code:', error);
            // Show network/execution error in results panel instead of toast
            setTestResults([{
                passed: false,
                output: '',
                expected: '',
                executionTime: 0,
                memory: 0,
                error: error.message || 'Failed to execute code',
                status: 'Execution Error',
                testCaseIndex: 0
            }]);
        } finally {
            setIsRunning(false);
        }
    };

    // Submit code
    const handleSubmit = async () => {
        if (!code || !code.trim()) {
            toast.error('Please write some code first');
            return;
        }

        // Immediately set clearing state and clear results
        setIsClearing(true);
        setTestResults([]);
        setIsSubmitting(true);
        setIsSubmitResults(true);
        
        // Switch to result tab when submitting code
        setActiveTab("result");

        try {
            // For submission, we don't send custom test cases
            // The backend will use all original test cases (including hidden ones)
            console.log('SUBMIT: Using backend original test cases (including hidden ones)');

            const response = await submissionService.submitSolution({
                problemId: pid,
                contestId: id,
                code,
                language
                // Don't send customTestCases - let backend use all test cases including hidden ones
            });

            if (response.success) {
                const result = response.data;
                
                // Transform submission results to match frontend format first
                if (result.testResults && result.testResults.length > 0) {
                    const transformedResults = result.testResults.map((testResult, index) => ({
                        passed: testResult.isCorrect,
                        input: testResult.input || '',
                        output: testResult.actualOutput || '',
                        expected: testResult.expectedOutput || '',
                        executionTime: testResult.time || 0,
                        memory: testResult.memory || 0,
                        error: testResult.error || '',
                        status: testResult.status || 'Unknown',
                        compilationError: testResult.error && testResult.status === 'Compilation Error',
                        testCaseIndex: index,
                        isHidden: testResult.isHidden || false,
                        testCaseNumber: testResult.testCaseNumber || (index + 1)
                    }));
                    setTestResults(transformedResults);
                } else {
                    setTestResults([]);
                }

                // Show toast after results are set
                if (result.status === 'Accepted') {
                    toast.success('Solution Accepted! 🎉', {
                        description: `Passed ${result.passedTests}/${result.totalTests} test cases`
                    });
                } else if (result.status === 'Partially Correct') {
                    toast.success('Partially Correct! 🟡', {
                        description: `Passed ${result.passedTests}/${result.totalTests} test cases (all visible + some hidden)`
                    });
                } else {
                    toast.error(`Submission ${result.status}`, {
                        description: `Passed ${result.passedTests}/${result.totalTests} test cases`
                    });
                }

                // If submission was accepted or partially correct, refresh contest data to update problem status
                if (result.status === 'Accepted' || result.status === 'Partially Correct') {
                    try {
                        const contestResponse = await contestService.getContest(id);
                        if (contestResponse.success) {
                            setContestProblems(contestResponse.data.problems || []);
                        }
                    } catch (error) {
                        console.error('Error refreshing contest data:', error);
                    }
                }
            } else {
                toast.error(response.message || 'Failed to submit solution');
                setTestResults([]); // Clear results on error
            }
        } catch (error) {
            console.error('Error submitting code:', error);
            toast.error('Failed to submit solution');
            setTestResults([]); // Clear results on error
        } finally {
            setIsSubmitting(false);
            setIsClearing(false); // Clear the clearing state
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading problem...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !problemData || !contest) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Problem Not Found</h2>
                    <p className="text-muted-foreground mb-4">{error || 'The problem you are looking for does not exist.'}</p>
                    <Button onClick={() => navigate(`/contest/${id}/problems`)}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Contest
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar contestProblems={contestProblems} currentProblemId={pid} contestId={id} />
            <SidebarOverlay />
            <main className={`flex flex-col w-full max-w-full bg-background ${isMobile ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
                <WorkspaceNavbarWrapper
                    contestName={contest.title}
                    timeRemaining="1:29:45"
                    currentProblem={currentProblemIndex + 1}
                    totalProblems={contestProblems.length}
                    onPrevProblem={handlePrevProblem}
                    onNextProblem={handleNextProblem}
                    onShuffleProblem={handleShuffleProblem}
                    onRun={problemData?.questionType === 'mcq' ? null : handleRun}
                    onSubmit={problemData?.questionType === 'mcq' ? null : handleSubmit}
                    streakCount={7}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    hideRunSubmit={problemData?.questionType === 'mcq'}
                />

                {/* Mobile Layout - Scrollable page with fixed height sections */}
                {isMobile ? (
                    <div className="flex-1 flex flex-col p-2 sm:p-3 space-y-2 sm:space-y-3 pb-4 sm:pb-6">
                        {/* Problem Description Section */}
                        <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col min-h-[50vh] max-h-[70vh] shrink-0">
                            <div className="flex items-center justify-between border-b bg-muted px-2 min-h-[40px] h-10 shrink-0">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <BookOpen className="w-4 h-4 shrink-0 text-muted-foreground" />
                                    <h1 className="text-sm font-medium truncate">{problemData.title}</h1>
                                    <Badge
                                        variant={problemData.difficulty === "Easy" ? "default" : problemData.difficulty === "Medium" ? "secondary" : "destructive"}
                                        className="h-5 px-1.5 py-0 text-[10px] shrink-0"
                                    >
                                        {problemData.difficulty}
                                    </Badge>
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-3 space-y-3">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{problemData.description}</p>
                                    {/* Image display for questions */}
                                    {problemData.image && (
                                        <div className="space-y-1.5">
                                            <img 
                                                src={uploadService.getImageUrl(problemData.image)} 
                                                alt="Problem illustration" 
                                                className="max-w-full h-auto rounded border"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    {problemData.examples.map((example, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                            <p className="font-semibold text-sm">Example {idx + 1}:</p>
                                            <Card className="bg-muted/50 py-1.5">
                                                <CardContent className="px-2 py-1.5 space-y-1 text-sm font-mono">
                                                    <div className="break-all"><span className="font-semibold">Input:</span> {example.input}</div>
                                                    <div className="break-all"><span className="font-semibold">Output:</span> {example.output}</div>
                                                </CardContent>
                                            </Card>
                                            {example.imageUrl && (
                                                <div className="mt-2">
                                                    <img 
                                                        src={example.imageUrl} 
                                                        alt={`Example ${idx + 1} illustration`}
                                                        className="max-w-full h-auto rounded-md border"
                                                        style={{ maxHeight: '300px' }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {/* Constraints - Only show for coding questions */}
                                    {problemData?.questionType !== 'mcq' && (
                                        <div>
                                            <p className="font-semibold text-sm mb-1.5">Constraints:</p>
                                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                {problemData.constraints.map((constraint, idx) => (
                                                    <li key={idx}>{constraint}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {problemData.explanations?.length > 0 && (
                                        <div className="space-y-2">
                                            {problemData.explanations.map((explanation, idx) => (
                                                <div key={idx}>
                                                    <p className="font-semibold text-sm mb-1">{explanation.title} Explanation:</p>
                                                    <p className="text-sm text-muted-foreground">{explanation.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Code Editor or MCQ Section */}
                        <div className="h-[300px] sm:h-[350px] md:h-[400px] shrink-0">
                            {problemData?.questionType === 'mcq' ? (
                                <div className="h-full border rounded-lg shadow bg-card overflow-hidden">
                                    <div className="h-full p-4 overflow-y-auto">
                                        <MCQAnswer
                                            options={problemData.mcqOptions}
                                            explanation={problemData.mcqExplanation}
                                            onSubmit={handleMCQSubmit}
                                            onChange={handleMCQAnswerChange}
                                            isSubmitting={isSubmitting}
                                            showResult={mcqSubmitted}
                                            selectedAnswer={selectedMCQAnswer}
                                            isCorrect={mcqResult?.isCorrect}
                                            onNext={handleNextProblem}
                                            showNext={true}
                                            nextButtonText="Next Question"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <CodeEditor 
                                    problemId={`contest_${id}_${pid}`} 
                                    driverCode={problemData?.driverCode}
                                    onCodeChange={handleCodeChange}
                                    allowedLanguages={contest?.allowedLanguages}
                                />
                            )}
                        </div>

                        {/* Test Cases Section - Only show for coding questions */}
                        {problemData?.questionType !== 'mcq' && (
                            <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-[200px] sm:h-[250px] md:h-[300px] shrink-0">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                                <div className="flex items-center gap-2 border-b bg-muted px-2 min-h-[40px] h-10 shrink-0">
                                    <TabsList className="rounded-none h-8 bg-transparent p-0 border-none">
                                        <ListChecks className="w-4 h-4 shrink-0" />
                                        <TabsTrigger value="testcases" className="rounded-none !bg-transparent shadow-none border-none data-[state=active]:!bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold text-sm px-2">
                                            Test Cases
                                        </TabsTrigger>
                                        <span className="w-px h-4 bg-border mx-0.5" />
                                        {isRunning && (
                                            <div className="animate-spin rounded-full h-2.5 w-2.5 border border-primary border-t-transparent mx-1" />
                                        )}
                                        <TabsTrigger value="result" className="rounded-none !bg-transparent shadow-none border-none data-[state=active]:!bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold text-sm px-2">
                                            Test Result
                                        </TabsTrigger>
                                    </TabsList>
                                    {/* Status and Performance Metrics in Tab Bar */}
                                    {testResults.length > 0 && activeTab === "result" && (
                                        <div className="flex items-center gap-2 ml-auto shrink-0">
                                            {isSubmitResults ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-medium">
                                                        {testResults.filter(r => r.passed).length}/{testResults.length} Passed
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${testResults[activeResultCase]?.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        <span className="text-[10px] font-medium">
                                                            {testResults[activeResultCase]?.passed ? 'Accepted' : 'Failed'}
                                                        </span>
                                                    </div>
                                                    {!testResults[activeResultCase]?.error && (
                                                        <>
                                                            <span className="w-px h-3 bg-border" />
                                                            <span className="text-[10px] text-muted-foreground">Time: {testResults[activeResultCase]?.executionTime || 0}ms</span>
                                                            <span className="w-px h-3 bg-border" />
                                                            <span className="text-[10px] text-muted-foreground">Memory: {testResults[activeResultCase]?.memory || 0}KB</span>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <TabsContent value="testcases" className="flex-1 m-0 overflow-hidden">
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border overflow-x-auto shrink-0">
                                            {testCases.map((testCase, idx) => (
                                                <div key={testCase.id} className="relative group shrink-0">
                                                    <button
                                                        onClick={() => setActiveCase(idx)}
                                                        className={`px-2 py-0.5 text-xs rounded-lg transition-colors whitespace-nowrap ${activeCase === idx
                                                            ? 'bg-[#3e3e3e] dark:bg-[#3e3e3e] bg-gray-200 dark:text-white text-gray-900 font-medium'
                                                            : 'bg-transparent text-[#a1a1aa] hover:text-foreground'
                                                            } ${testCase.isUserAdded ? 'pr-5' : ''}`}
                                                    >
                                                        Case {testCase.id}
                                                    </button>
                                                    {testCase.isUserAdded && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteCase(idx); }}
                                                            className="absolute right-0.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-all opacity-70 hover:opacity-100"
                                                            title="Remove test case"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button onClick={addNewCase} className="p-0.5 text-[#6b7280] hover:text-foreground transition-colors shrink-0">
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        <ScrollArea className="flex-1">
                                            <div className="p-2 space-y-2">
                                                {testCases[activeCase]?.inputs.map((input, idx) => (
                                                    <div key={idx}>
                                                        <label className="text-[10px] font-mono text-[#9ca3af] mb-1 block">{input.label} =</label>
                                                        <input
                                                            type="text"
                                                            value={input.value}
                                                            onChange={(e) => updateCaseInput(activeCase, idx, e.target.value)}
                                                            placeholder={testCases[activeCase]?.isUserAdded ? `Enter ${input.label}...` : `${input.label} (provided by teacher)`}
                                                            disabled={!testCases[activeCase]?.isUserAdded}
                                                            className={`w-full rounded-lg px-2 py-1.5 font-mono text-xs border-none outline-none ${
                                                                testCases[activeCase]?.isUserAdded 
                                                                    ? "bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-100 text-foreground placeholder-[#6b7280] focus:ring-1 focus:ring-[#4a4a4a]"
                                                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                                            }`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </TabsContent>

                                <TabsContent value="result" className="flex-1 m-0 overflow-hidden">
                                    {isSubmitResults ? (
                                        <TestCaseResults 
                                            testResults={testResults} 
                                            isSubmitting={isSubmitting || isRunning}
                                            isSubmitResults={true}
                                            totalTestCases={problemData?.totalTestCases || 0}
                                            isClearing={isClearing}
                                        />
                                    ) : (
                                        <div className="flex flex-col h-full">
                                            {testResults.length > 0 && !testResults[activeResultCase]?.error && (
                                                <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border overflow-x-auto shrink-0">
                                                    {testResults.map((result, idx) => (
                                                        <div key={idx} className="relative group shrink-0">
                                                            <button
                                                                onClick={() => setActiveResultCase(idx)}
                                                                className={`px-2 py-0.5 text-xs rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${activeResultCase === idx
                                                                    ? 'bg-[#3e3e3e] dark:bg-[#3e3e3e] bg-gray-200 dark:text-white text-gray-900 font-medium'
                                                                    : 'bg-transparent text-[#a1a1aa] hover:text-foreground'
                                                                    }`}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                {result.isHidden ? `Test ${result.testCaseNumber}` : `Case ${idx + 1}`}
                                                                {result.isHidden && (
                                                                    <div className="w-1 h-1 rounded-full bg-orange-400 ml-0.5" title="Hidden test case" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex-1 overflow-hidden">
                                                <ScrollArea className="h-full">
                                                    <div className="p-2 space-y-2">
                                                        {isRunning ? (
                                                            // Skeleton UI while running
                                                            <>
                                                                <div>
                                                                    <div className="h-3 bg-muted rounded w-12 mb-1 animate-pulse"></div>
                                                                    <div className="w-full bg-muted rounded-lg px-3 py-2 min-h-[30px] animate-pulse"></div>
                                                                </div>
                                                                <div>
                                                                    <div className="h-3 bg-muted rounded w-16 mb-1 animate-pulse"></div>
                                                                    <div className="w-full bg-muted rounded-lg px-3 py-2 min-h-[30px] animate-pulse"></div>
                                                                </div>
                                                                <div>
                                                                    <div className="h-3 bg-muted rounded w-20 mb-1 animate-pulse"></div>
                                                                    <div className="w-full bg-muted rounded-lg px-3 py-2 min-h-[30px] animate-pulse"></div>
                                                                </div>
                                                            </>
                                                        ) : testResults.length === 0 ? (
                                                            <p className="text-xs text-muted-foreground">Run your code to see results here</p>
                                                        ) : (
                                                            <>
                                                                {/* Show only error if there's a compilation or runtime error */}
                                                                {testResults[activeResultCase]?.error ? (
                                                                    <div>
                                                                        <label className="text-[10px] font-mono text-red-600 mb-1 block">Compilation Error :</label>
                                                                        <div className="w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 font-mono text-xs text-red-600 dark:text-red-400 min-h-[30px] max-h-[200px] whitespace-pre-wrap break-words overflow-auto">
                                                                            {testResults[activeResultCase].error}
                                                                        </div>
                                                                    </div>
                                                                ) : testResults[activeResultCase]?.isHidden ? (
                                                                    /* Hidden test case - show only pass/fail status */
                                                                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${testResults[activeResultCase]?.passed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                                                            {testResults[activeResultCase]?.passed ? (
                                                                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            ) : (
                                                                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-center">
                                                                            <h3 className={`text-sm font-medium ${testResults[activeResultCase]?.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                                                Test {testResults[activeResultCase]?.testCaseNumber} {testResults[activeResultCase]?.passed ? 'Passed' : 'Failed'}
                                                                            </h3>
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                This is a hidden test case. Input and output details are not shown.
                                                                            </p>
                                                                            {testResults[activeResultCase]?.executionTime && (
                                                                                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                                                                                    <span>Time: {testResults[activeResultCase].executionTime}ms</span>
                                                                                    {testResults[activeResultCase]?.memory && (
                                                                                        <span>Memory: {testResults[activeResultCase].memory}KB</span>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {/* Input Fields - Display separately if multiple fields */}
                                                                        {(() => {
                                                                            const inputStr = testResults[activeResultCase]?.input || '';
                                                                            const inputFields = problemData?.inputFields || [{ name: 'input', label: 'input' }];
                                                                            const inputValues = inputStr.split('|').map(v => v.trim());
                                                                            
                                                                            // If multiple fields, show them separately
                                                                            if (inputFields.length > 1 && inputValues.length > 1) {
                                                                                return inputFields.map((field, idx) => (
                                                                                    <div key={idx}>
                                                                                        <label className="text-[10px] font-mono text-[#9ca3af] mb-1 block">{field.label || field.name} =</label>
                                                                                        <div className="w-full bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-100 rounded-lg px-3 py-2 font-mono text-xs text-foreground min-h-[30px] whitespace-pre-wrap">
                                                                                            {inputValues[idx] || '(no value)'}
                                                                                        </div>
                                                                                    </div>
                                                                                ));
                                                                            } else {
                                                                                // Single field, show as before
                                                                                return (
                                                                                    <div>
                                                                                        <label className="text-[10px] font-mono text-[#9ca3af] mb-1 block">input =</label>
                                                                                        <div className="w-full bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-100 rounded-lg px-3 py-2 font-mono text-xs text-foreground min-h-[30px] whitespace-pre-wrap">
                                                                                            {inputStr || '(no input)'}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        })()}
                                                                        
                                                                        {/* Output (Actual) */}
                                                                        <div>
                                                                            <label className="text-[10px] font-mono text-[#9ca3af] mb-1 block">output =</label>
                                                                            <div className="w-full bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-100 rounded-lg px-3 py-2 font-mono text-xs text-foreground min-h-[30px] whitespace-pre-wrap">
                                                                                {testResults[activeResultCase]?.output || '(no output)'}
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Expected */}
                                                                        <div>
                                                                            <label className="text-[10px] font-mono text-[#9ca3af] mb-1 block">expected =</label>
                                                                            <div className="w-full bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-100 rounded-lg px-3 py-2 font-mono text-xs text-foreground min-h-[30px] whitespace-pre-wrap">
                                                                                {testResults[activeResultCase]?.expected || '(no expected output)'}
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                        )}
                    </div>
                ) : (
                    /* Desktop Layout - Resizable panels */
                    <div className="flex-1 overflow-hidden">
                        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
                            {/* Left Panel - Problem Description */}
                            <ResizablePanel defaultSize={40} minSize={20}>
                                <div className="h-full w-full p-2 md:p-3 overflow-hidden">
                                    <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-full">
                                        <div className="flex items-center justify-between border-b bg-muted px-3 min-h-[48px] h-12 shrink-0">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
                                                    <BookOpen className="w-4 h-4 shrink-0" />
                                                    <span>Problem</span>
                                                    <span className="w-px h-5 bg-border" />
                                                </div>
                                                <h1 className="text-sm font-medium truncate">{problemData.title}</h1>
                                                <Badge
                                                    variant={problemData.difficulty === "Easy" ? "default" : problemData.difficulty === "Medium" ? "secondary" : "destructive"}
                                                    className="h-6 px-2 py-0 text-xs shrink-0"
                                                >
                                                    {problemData.difficulty}
                                                </Badge>
                                            </div>
                                            <AllProblemsTrigger />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <ScrollArea className="h-full">
                                                <div className="p-4 space-y-4">
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{problemData.description}</p>
                                                    {/* Image display for questions */}
                                                    {problemData.image && (
                                                        <div className="space-y-2">
                                                            <img 
                                                                src={uploadService.getImageUrl(problemData.image)} 
                                                                alt="Problem illustration" 
                                                                className="max-w-full h-auto rounded border"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    {problemData.examples.map((example, idx) => (
                                                        <div key={idx} className="space-y-2">
                                                            <p className="font-semibold text-sm">Example {idx + 1}:</p>
                                                            <Card className="bg-muted/50 py-2">
                                                                <CardContent className="px-3 py-2 space-y-1 text-sm font-mono">
                                                                    <div className="break-all"><span className="font-semibold">Input:</span> {example.input}</div>
                                                                    <div className="break-all"><span className="font-semibold">Output:</span> {example.output}</div>
                                                                </CardContent>
                                                            </Card>
                                                            {example.imageUrl && (
                                                                <div className="mt-2">
                                                                    <img 
                                                                        src={example.imageUrl} 
                                                                        alt={`Example ${idx + 1} illustration`}
                                                                        className="max-w-full h-auto rounded-md border"
                                                                        style={{ maxHeight: '300px' }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {/* Constraints - Only show for coding questions */}
                                                    {problemData?.questionType !== 'mcq' && (
                                                        <div>
                                                            <p className="font-semibold text-sm mb-2">Constraints:</p>
                                                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                                {problemData.constraints.map((constraint, idx) => (
                                                                    <li key={idx}>{constraint}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {problemData.explanations?.length > 0 && (
                                                        <div className="space-y-3">
                                                            {problemData.explanations.map((explanation, idx) => (
                                                                <div key={idx}>
                                                                    <p className="font-semibold text-sm mb-1">{explanation.title} Explanation:</p>
                                                                    <p className="text-sm text-muted-foreground leading-relaxed">{explanation.content}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            {/* Right Panel - Code Editor & Results */}
                            <ResizablePanel defaultSize={60} minSize={30}>
                                <ResizablePanelGroup direction="vertical" className="h-full w-full">
                                    <ResizablePanel defaultSize={60} minSize={20}>
                                        <div className="h-full w-full p-2 md:p-3 overflow-hidden">
                                            {problemData?.questionType === 'mcq' ? (
                                                <div className="h-full border rounded-lg shadow bg-card overflow-hidden">
                                                    <div className="h-full p-4 overflow-y-auto">
                                                        <MCQAnswer
                                                            options={problemData.mcqOptions}
                                                            explanation={problemData.mcqExplanation}
                                                            onSubmit={handleMCQSubmit}
                                                            onChange={handleMCQAnswerChange}
                                                            isSubmitting={isSubmitting}
                                                            showResult={mcqSubmitted}
                                                            selectedAnswer={selectedMCQAnswer}
                                                            isCorrect={mcqResult?.isCorrect}
                                                            onNext={handleNextProblem}
                                                            showNext={true}
                                                            nextButtonText="Next Question"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <CodeEditor 
                                                    problemId={`contest_${id}_${pid}`} 
                                                    driverCode={problemData?.driverCode}
                                                    onCodeChange={handleCodeChange}
                                                    allowedLanguages={contest?.allowedLanguages}
                                                />
                                            )}
                                        </div>
                                    </ResizablePanel>

                                    <ResizableHandle withHandle />

                                    {/* Test Cases Panel - Only show for coding questions */}
                                    {problemData?.questionType !== 'mcq' && (
                                        <ResizablePanel defaultSize={40} minSize={7}>
                                        <div className="h-full w-full p-2 md:p-3 overflow-hidden">
                                            <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-full">
                                                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                                                    <div className="flex items-center gap-2 md:gap-3 border-b bg-muted px-2 md:px-3 min-h-[48px] h-12 shrink-0 overflow-x-auto">
                                                        <TabsList className="rounded-none h-10 bg-transparent p-0 border-none">
                                                            <ListChecks className="w-4 h-4 shrink-0" />
                                                            <TabsTrigger value="testcases" className="rounded-none !bg-transparent shadow-none border-none data-[state=active]:!bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold text-sm px-3">
                                                                Test Cases
                                                            </TabsTrigger>
                                                            <span className="w-px h-4 bg-border mx-1" />
                                                            {isRunning && (
                                                                <div className="animate-spin rounded-full h-3 w-3 border border-primary border-t-transparent mx-2" />
                                                            )}
                                                            <TabsTrigger value="result" className="rounded-none !bg-transparent shadow-none border-none data-[state=active]:!bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold text-sm px-3">
                                                                Test Result
                                                            </TabsTrigger>
                                                        </TabsList>
                                                        {/* Status and Performance Metrics in Tab Bar */}
                                                        {testResults.length > 0 && activeTab === "result" && (
                                                            <div className="flex items-center gap-2 ml-auto shrink-0">
                                                                {isSubmitResults ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-medium">
                                                                            {testResults.filter(r => r.passed).length}/{testResults.length} Passed
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`w-2 h-2 rounded-full ${testResults[activeResultCase]?.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                            <span className="text-xs font-medium">
                                                                                {testResults[activeResultCase]?.passed ? 'Accepted' : 'Failed'}
                                                                            </span>
                                                                        </div>
                                                                        {!testResults[activeResultCase]?.error && (
                                                                            <>
                                                                                <span className="w-px h-4 bg-border" />
                                                                                <span className="text-xs text-muted-foreground">Time: {testResults[activeResultCase]?.executionTime || 0}ms</span>
                                                                                <span className="w-px h-4 bg-border" />
                                                                                <span className="text-xs text-muted-foreground">Memory: {testResults[activeResultCase]?.memory || 0}KB</span>
                                                                            </>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <TabsContent value="testcases" className="flex-1 m-0 overflow-hidden">
                                                        <div className="flex flex-col h-full">
                                                            <div className="flex items-center gap-2 px-3 py-2 border-b border-border overflow-x-auto scrollbar-hide shrink-0">
                                                                {testCases.map((testCase, idx) => (
                                                                    <div key={testCase.id} className="relative group shrink-0">
                                                                        <button
                                                                            onClick={() => setActiveCase(idx)}
                                                                            className={`px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap ${activeCase === idx
                                                                                ? 'bg-[#3e3e3e] dark:bg-[#3e3e3e] bg-gray-200 dark:text-white text-gray-900 font-medium'
                                                                                : 'bg-transparent text-[#a1a1aa] hover:text-foreground'
                                                                                } ${testCase.isUserAdded ? 'pr-6' : ''}`}
                                                                        >
                                                                            Case {testCase.id}
                                                                        </button>
                                                                        {testCase.isUserAdded && (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); deleteCase(idx); }}
                                                                                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-all opacity-70 hover:opacity-100"
                                                                                title="Remove test case"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                <button onClick={addNewCase} className="p-1 text-[#6b7280] hover:text-foreground transition-colors shrink-0">
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <ScrollArea className="h-full">
                                                                    <div className="p-3 space-y-3">
                                                                        {testCases[activeCase]?.inputs.map((input, idx) => (
                                                                            <div key={idx}>
                                                                                <label className="text-xs font-mono text-[#9ca3af] mb-1.5 block">{input.label} =</label>
                                                                                <input
                                                                                    type="text"
                                                                                    value={input.value}
                                                                                    onChange={(e) => updateCaseInput(activeCase, idx, e.target.value)}
                                                                                    placeholder={testCases[activeCase]?.isUserAdded ? `Enter ${input.label}...` : `${input.label} (provided by teacher)`}
                                                                                    disabled={!testCases[activeCase]?.isUserAdded}
                                                                                    className={`w-full rounded-lg px-3 py-2 font-mono text-sm border-none outline-none ${
                                                                                        testCases[activeCase]?.isUserAdded 
                                                                                            ? "bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-100 text-foreground placeholder-[#6b7280] focus:ring-1 focus:ring-[#4a4a4a]"
                                                                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                                                                    }`}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </ScrollArea>
                                                            </div>
                                                        </div>
                                                    </TabsContent>

                                                    <TabsContent value="result" className="flex-1 m-0 overflow-hidden">
                                                        {isSubmitResults ? (
                                                            <TestCaseResults 
                                                                testResults={testResults} 
                                                                isSubmitting={isSubmitting || isRunning}
                                                                isSubmitResults={true}
                                                                totalTestCases={problemData?.totalTestCases || 0}
                                                                isClearing={isClearing}
                                                            />
                                                        ) : (
                                                            <div className="flex flex-col h-full">
                                                                {testResults.length > 0 && !testResults[activeResultCase]?.error && (
                                                                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border overflow-x-auto scrollbar-hide shrink-0">
                                                                        {testResults.map((result, idx) => (
                                                                            <div key={idx} className="relative group shrink-0">
                                                                                <button
                                                                                    onClick={() => setActiveResultCase(idx)}
                                                                                    className={`px-3 py-1 text-sm rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${activeResultCase === idx
                                                                                        ? 'bg-[#3e3e3e] dark:bg-[#3e3e3e] bg-gray-200 dark:text-white text-gray-900 font-medium'
                                                                                        : 'bg-transparent text-[#a1a1aa] hover:text-foreground'
                                                                                        }`}
                                                                                >
                                                                                    <div className={`w-2 h-2 rounded-full ${result.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                                                                                    {result.isHidden ? `Test ${result.testCaseNumber}` : `Case ${idx + 1}`}
                                                                                    {result.isHidden && (
                                                                                        <div className="w-1 h-1 rounded-full bg-orange-400 ml-0.5" title="Hidden test case" />
                                                                                    )}
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 overflow-hidden">
                                                                    <ScrollArea className="h-full">
                                                                        <div className="p-3 space-y-3">
                                                                            {isRunning ? (
                                                                                // Skeleton UI while running
                                                                                <>
                                                                                    <div>
                                                                                        <div className="h-4 bg-muted rounded w-16 mb-1.5 animate-pulse"></div>
                                                                                        <div className="w-full bg-muted rounded-lg px-3 py-2 min-h-[40px] animate-pulse"></div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="h-4 bg-muted rounded w-20 mb-1.5 animate-pulse"></div>
                                                                                        <div className="w-full bg-muted rounded-lg px-3 py-2 min-h-[40px] animate-pulse"></div>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="h-4 bg-muted rounded w-24 mb-1.5 animate-pulse"></div>
                                                                                        <div className="w-full bg-muted rounded-lg px-3 py-2 min-h-[40px] animate-pulse"></div>
                                                                                    </div>
                                                                                </>
                                                                            ) : testResults.length === 0 ? (
                                                                                <p className="text-sm text-muted-foreground">Run your code to see results here</p>
                                                                            ) : (
                                                                                <>
                                                                                    {/* Show only error if there's a compilation or runtime error */}
                                                                                    {testResults[activeResultCase]?.error ? (
                                                                                        <div>
                                                                                            <label className="text-s font-mono text-red-600 mb-1.5 block">Compilation Error :</label>
                                                                                            <div className="w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 font-mono text-sm text-red-600 dark:text-red-400 min-h-[40px] whitespace-pre-wrap break-words overflow-auto max-h-[300px]">
                                                                                                {testResults[activeResultCase].error}
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : testResults[activeResultCase]?.isHidden ? (
                                                                                        /* Hidden test case - show only pass/fail status */
                                                                                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                                                                            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${testResults[activeResultCase]?.passed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                                                                                                {testResults[activeResultCase]?.passed ? (
                                                                                                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                                    </svg>
                                                                                                ) : (
                                                                                                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                                    </svg>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="text-center">
                                                                                                <h3 className={`text-base font-medium ${testResults[activeResultCase]?.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                                                                    Test {testResults[activeResultCase]?.testCaseNumber} {testResults[activeResultCase]?.passed ? 'Passed' : 'Failed'}
                                                                                                </h3>
                                                                                                <p className="text-sm text-muted-foreground mt-2">
                                                                                                    This is a hidden test case. Input and output details are not shown.
                                                                                                </p>
                                                                                                {testResults[activeResultCase]?.executionTime && (
                                                                                                    <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                                                                                                        <span>Time: {testResults[activeResultCase].executionTime}ms</span>
                                                                                                        {testResults[activeResultCase]?.memory && (
                                                                                                            <span>Memory: {testResults[activeResultCase].memory}KB</span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <>
                                                                                            {/* Input Fields - Display separately if multiple fields */}
                                                                                            {(() => {
                                                                                                const inputStr = testResults[activeResultCase]?.input || '';
                                                                                                const inputFields = problemData?.inputFields || [{ name: 'input', label: 'input' }];
                                                                                                const inputValues = inputStr.split('|').map(v => v.trim());
                                                                                                
                                                                                                // If multiple fields, show them separately
                                                                                                if (inputFields.length > 1 && inputValues.length > 1) {
                                                                                                    return inputFields.map((field, idx) => (
                                                                                                        <div key={idx}>
                                                                                                            <label className="text-xs font-mono text-[#9ca3af] mb-1.5 block">{field.label || field.name} =</label>
                                                                                                            <div className="w-full bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-100 rounded-lg px-3 py-2 font-mono text-sm text-foreground min-h-[40px] whitespace-pre-wrap break-words overflow-auto max-h-[200px]">
                                                                                                                {inputValues[idx] || '(no value)'}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ));
                                                                                                } else {
                                                                                                    // Single field, show as before
                                                                                                    return (
                                                                                                        <div>
                                                                                                            <label className="text-xs font-mono text-[#9ca3af] mb-1.5 block">input =</label>
                                                                                                            <div className="w-full bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-100 rounded-lg px-3 py-2 font-mono text-sm text-foreground min-h-[40px] whitespace-pre-wrap break-words overflow-auto max-h-[200px]">
                                                                                                                {inputStr || '(no input)'}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    );
                                                                                                }
                                                                                            })()}
                                                                                            
                                                                                            {/* Output (Actual) */}
                                                                                            <div>
                                                                                                <label className="text-xs font-mono text-[#9ca3af] mb-1.5 block">output =</label>
                                                                                                <div className="w-full bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-100 rounded-lg px-3 py-2 font-mono text-sm text-foreground min-h-[40px] whitespace-pre-wrap break-words overflow-auto max-h-[200px]">
                                                                                                    {testResults[activeResultCase]?.output || '(no output)'}
                                                                                                </div>
                                                                                            </div>
                                                                                            
                                                                                            {/* Expected */}
                                                                                            <div>
                                                                                                <label className="text-xs font-mono text-[#9ca3af] mb-1.5 block">expected =</label>
                                                                                                <div className="w-full bg-[#2a2a2a] dark:bg-[#2a2a2a] bg-gray-100 rounded-lg px-3 py-2 font-mono text-sm text-foreground min-h-[40px] whitespace-pre-wrap break-words overflow-auto max-h-[200px]">
                                                                                                    {testResults[activeResultCase]?.expected || '(no expected output)'}
                                                                                                </div>
                                                                                            </div>
                                                                                        </>
                                                                                    )}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </ScrollArea>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </TabsContent>
                                                </Tabs>
                                            </div>
                                        </div>
                                        </ResizablePanel>
                                    )}
                                </ResizablePanelGroup>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </div>
                )}
            </main>
        </SidebarProvider>
    );
}

export default Workspace;