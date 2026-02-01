import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import WorkspaceNavbar from "@/components/workspace-navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { CheckCircle2, XCircle, X, BookOpen, ListChecks, Plus, ArrowLeft } from "lucide-react";
import CodeEditor from "@/components/editor/code-editor";
import MCQAnswer from "@/components/mcq/MCQAnswer";
import { useIsMobile } from "@/hooks/use-mobile";
import { problemService } from "@/services/problem.service";
import { submissionService } from "@/services/submission.service";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";
import TestCaseResults from "@/components/ui/test-case-results";

function AppSidebar({ currentProblemId, allProblems }) {
    const { toggleSidebar } = useSidebar();
    const isMobile = useIsMobile();
    return (
        <Sidebar style={{ "--sidebar-width": isMobile ? "100vw" : "36rem" }} className="z-[60]">
            <SidebarHeader className="p-4 border-b flex flex-row items-center justify-between">
                <h2 className="text-lg font-semibold">Practice Problems</h2>
                <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                    <X className="w-4 h-4" />
                </Button>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {allProblems.map((problem, idx) => (
                                <SidebarMenuItem key={problem._id} className="py-0.5">
                                    <SidebarMenuButton asChild isActive={currentProblemId === problem._id} className="h-auto py-1.5">
                                        <Link to={`/practice/${problem._id}/workspace`} className="flex items-center justify-between gap-3 w-full">
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-sm font-semibold">{idx + 1}.</span>
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

function PracticeNavbarWrapper(props) {
    const { toggleSidebar } = useSidebar();
    return <WorkspaceNavbar {...props} onToggleSidebar={toggleSidebar} isPracticeMode={true} />;
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

function PracticeWorkspace() {
    const { problemId } = useParams();
    const navigate = useNavigate();
    const [code, setCode] = useState('// Write your code here\n');
    const [language, setLanguage] = useState('javascript');

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
    const [problemData, setProblemData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allProblems, setAllProblems] = useState([]);

    // Test cases data
    const [testCases, setTestCases] = useState([]);

    // MCQ-specific state
    const [selectedMCQAnswer, setSelectedMCQAnswer] = useState(null);
    const [mcqSubmitted, setMcqSubmitted] = useState(false);
    const [mcqResult, setMcqResult] = useState(null);

    // Fetch all problems for sidebar
    useEffect(() => {
        const fetchAllProblems = async () => {
            try {
                const response = await problemService.getProblems({ limit: 100 });
                if (response.success) {
                    setAllProblems(response.data.problems || []);
                }
            } catch (err) {
                console.error('Error fetching problems list:', err);
            }
        };
        fetchAllProblems();
    }, []);

    // Fetch problem from backend
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                setError(null);

                // Reset MCQ state when changing questions
                setSelectedMCQAnswer(null);
                setMcqSubmitted(false);
                setMcqResult(null);

                const response = await problemService.getProblem(problemId);

                if (response.success) {
                    const problem = response.data;
                    setProblemData({
                        id: problem._id,
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
                } else {
                    setError('Problem not found');
                    toast.error('Failed to load problem');
                }
            } catch (err) {
                console.error('Error fetching problem:', err);
                setError('Failed to load problem');
                toast.error('Failed to load problem');
            } finally {
                setLoading(false);
            }
        };

        if (problemId) {
            fetchProblem();
        }
    }, [problemId]);

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

    const currentProblemIndex = allProblems.findIndex(p => p._id === problemId);

    const handlePrevProblem = () => {
        if (currentProblemIndex > 0) {
            navigate(`/practice/${allProblems[currentProblemIndex - 1]._id}/workspace`);
        }
    };

    const handleNextProblem = () => {
        if (currentProblemIndex < allProblems.length - 1) {
            navigate(`/practice/${allProblems[currentProblemIndex + 1]._id}/workspace`);
        }
    };

    const handleShuffleProblem = () => {
        if (allProblems.length > 0) {
            const randomIndex = Math.floor(Math.random() * allProblems.length);
            navigate(`/practice/${allProblems[randomIndex]._id}/workspace`);
        }
    };

    // Handle code change from editor
    const handleCodeChange = (newCode, newLanguage) => {
        if (newCode !== undefined) setCode(newCode);
        if (newLanguage !== undefined) setLanguage(newLanguage);
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
                console.log('Submitting MCQ answer:', {
                    problemId: problemId,
                    mcqAnswer: selectedOptionIndex,
                    isCorrect: isCorrect,
                    questionType: 'mcq'
                });

                const submitResponse = await submissionService.submitSolution({
                    problemId: problemId,
                    // No contestId for practice mode
                    mcqAnswer: selectedOptionIndex,
                    isCorrect: isCorrect,
                    questionType: 'mcq'
                });

                console.log('MCQ submission response:', submitResponse);

                if (submitResponse.success) {
                    console.log('MCQ submission saved:', submitResponse.data);
                } else {
                    console.error('MCQ submission failed:', submitResponse.message);
                }
            } catch (submitError) {
                console.error('Error saving MCQ submission:', submitError);
                console.error('Submit error details:', submitError.response?.data);
            }

            // Show result
            setMcqResult({ isCorrect, selectedOption: selectedOptionIndex });
            setMcqSubmitted(true);

            if (isCorrect) {
                toast.success('Correct Answer! 🎉', {
                    description: 'Well done! You got it right.'
                });
            } else {
                toast.error('Incorrect Answer', {
                    description: 'Don\'t worry, check the explanation below.'
                });
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
                problemId: problemId,
                code,
                language,
                customTestCases: testCasesToRun // Send current test cases
            };
            console.log('Running code with request:', requestData);
            console.log('Test cases to run:', testCasesToRun);
            const response = await submissionService.runCode(requestData);
            console.log('Run code response:', response);

            if (response.success) {
                const results = response.data.results;
                console.log('Test results received:', results);
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

                    console.log('Transformed results:', transformedResults);
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

    // Submit code (for practice mode, run first then submit)
    const handleSubmit = async () => {
        if (!code || !code.trim()) {
            toast.error('Please write some code first');
            return;
        }

        if (testCases.length === 0) {
            toast.error('No test cases available');
            return;
        }

        // Immediately set clearing state and clear results
        setIsClearing(true);
        setTestResults([]);
        setIsSubmitting(true);
        setIsRunning(true);
        setIsSubmitResults(true); // Set to true for submit results
        
        // Switch to result tab when submitting code
        setActiveTab("result");

        try {
            // First, run the code to test it (including user-added test cases)
            // Note: For practice mode, we test with user test cases first, then submit with original ones
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

            console.log('PRACTICE SUBMIT: Running code first with test cases:', testCasesToRun);
            const runResponse = await submissionService.runCode({
                problemId: problemId,
                code,
                language,
                customTestCases: testCasesToRun
            });

            if (runResponse.success) {
                const results = runResponse.data.results;
                if (results && results.length > 0) {
                    // Transform results to match our format
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

                    // Set results first, then show toasts
                    setTestResults(transformedResults);
                    setActiveResultCase(0); // Reset to first result

                    // Check if all test cases passed
                    const allPassed = transformedResults.every(result => result.passed && !result.error);
                    const passedCount = transformedResults.filter(result => result.passed && !result.error).length;
                    const totalCount = transformedResults.length;

                    if (allPassed) {
                        // All tests passed, now submit the solution to backend
                        console.log('PRACTICE SUBMIT: All tests passed, submitting solution to backend...');

                        try {
                            const submitResponse = await submissionService.submitSolution({
                                problemId: problemId,
                                // No contestId for practice mode
                                code,
                                language
                                // Don't send customTestCases - let backend use all test cases including hidden ones
                            });

                            if (submitResponse.success) {
                                const backendResult = submitResponse.data;
                                if (backendResult.status === 'Accepted') {
                                    toast.success('Solution Accepted! 🎉', {
                                        description: `All ${totalCount} test cases passed! Solution saved successfully.`
                                    });
                                } else if (backendResult.status === 'Partially Correct') {
                                    toast.success('Partially Correct! 🟡', {
                                        description: `Passed visible test cases, but some hidden tests failed. Solution saved.`
                                    });
                                } else {
                                    toast.success('Solution Accepted! 🎉', {
                                        description: `All ${totalCount} test cases passed! Solution saved successfully.`
                                    });
                                }
                                console.log('PRACTICE SUBMIT: Solution saved to backend:', submitResponse.data);
                            } else {
                                toast.success('Solution Accepted! 🎉', {
                                    description: `All ${totalCount} test cases passed! (Note: ${submitResponse.message || 'Could not save to backend'})`
                                });
                            }
                        } catch (submitError) {
                            console.error('Error saving practice submission:', submitError);
                            toast.success('Solution Accepted! 🎉', {
                                description: `All ${totalCount} test cases passed! (Note: Could not save submission)`
                            });
                        }

                    } else {
                        // Some tests failed - still submit to backend for tracking
                        console.log('PRACTICE SUBMIT: Some tests failed, submitting partial solution...');

                        try {
                            const submitResponse = await submissionService.submitSolution({
                                problemId: problemId,
                                // No contestId for practice mode
                                code,
                                language
                                // Don't send customTestCases - let backend use all test cases including hidden ones
                            });

                            if (submitResponse.success) {
                                const backendResult = submitResponse.data;
                                if (backendResult.status === 'Partially Correct') {
                                    toast.success('Partially Correct! 🟡', {
                                        description: `Passed ${passedCount}/${totalCount} visible tests, but some hidden tests failed.`
                                    });
                                } else {
                                    toast.error(`Submission ${backendResult.status || 'Failed'}`, {
                                        description: `Passed ${passedCount}/${totalCount} test cases. Submission saved for review.`
                                    });
                                }
                                console.log('PRACTICE SUBMIT: Failed solution saved to backend:', submitResponse.data);
                            }
                        } catch (submitError) {
                            console.error('Error saving failed practice submission:', submitError);
                            toast.error(`Submission Failed`, {
                                description: `Passed ${passedCount}/${totalCount} test cases. Check the results below.`
                            });
                        }
                    }
                } else {
                    // No results received
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
                    toast.error('Failed to run code - no results received');
                }
            } else {
                // API error during run
                setTestResults([{
                    passed: false,
                    output: '',
                    expected: '',
                    executionTime: 0,
                    memory: 0,
                    error: runResponse.message || 'Failed to run code',
                    status: 'API Error',
                    testCaseIndex: 0
                }]);
                toast.error('Failed to run code: ' + (runResponse.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error during practice submission:', error);
            // Show network/execution error in results panel
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
            toast.error('Failed to submit: ' + error.message);
        } finally {
            setIsRunning(false);
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
    if (error || !problemData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Problem Not Found</h2>
                    <p className="text-muted-foreground mb-4">{error || 'The problem you are looking for does not exist.'}</p>
                    <Button onClick={() => navigate('/practice')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Problems
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={false}>
            <AppSidebar currentProblemId={problemId} allProblems={allProblems} />
            <SidebarOverlay />
            <main className={`flex flex-col w-full max-w-full bg-background ${isMobile ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
                <PracticeNavbarWrapper
                    contestName="Practice Mode"
                    currentProblem={currentProblemIndex + 1}
                    totalProblems={allProblems.length}
                    onPrevProblem={handlePrevProblem}
                    onNextProblem={handleNextProblem}
                    onShuffleProblem={handleShuffleProblem}
                    onRun={problemData?.questionType === 'mcq' ? null : handleRun}
                    onSubmit={problemData?.questionType === 'mcq' ? null : handleSubmit}
                    streakCount={7}
                    isRunning={isRunning}
                    isSubmitting={isSubmitting}
                    isPracticeMode={true}
                    hideRunSubmit={problemData?.questionType === 'mcq'}
                />

                {/* Mobile Layout */}
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
                                    {/* Display image if available */}
                                    {problemData.image && (
                                        <div className="my-4">
                                            <img
                                                src={uploadService.getImageUrl(problemData.image)}
                                                alt="Question illustration"
                                                className="max-w-full h-auto max-h-64 rounded border mx-auto"
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
                                    problemId={problemId}
                                    driverCode={problemData?.driverCode}
                                    onCodeChange={handleCodeChange}
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
                                                                className={`w-full rounded-lg px-2 py-1.5 font-mono text-xs border-none outline-none ${testCases[activeCase]?.isUserAdded
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
                                                                    Case {idx + 1}
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
                    /* Desktop Layout */
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
                                                    {/* Display image if available */}
                                                    {problemData.image && (
                                                        <div className="my-4">
                                                            <img
                                                                src={uploadService.getImageUrl(problemData.image)}
                                                                alt="Question illustration"
                                                                className="max-w-full h-auto max-h-64 rounded border mx-auto"
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
                                                    problemId={problemId}
                                                    driverCode={problemData?.driverCode}
                                                    onCodeChange={handleCodeChange}
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
                                                                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-all"
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
                                                                                        className={`w-full rounded-lg px-3 py-2 font-mono text-sm border-none outline-none ${testCases[activeCase]?.isUserAdded
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
                                                                                        Case {idx + 1}
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
                                                                                            <div className="h-3 bg-muted rounded w-12 mb-1 animate-pulse"></div>
                                                                                            <div className="w-full bg-muted rounded-lg px-3 py-2 min-h-[40px] animate-pulse"></div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="h-3 bg-muted rounded w-16 mb-1 animate-pulse"></div>
                                                                                            <div className="w-full bg-muted rounded-lg px-3 py-2 min-h-[40px] animate-pulse"></div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="h-3 bg-muted rounded w-20 mb-1 animate-pulse"></div>
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
                                                                                                <label className="text-xs font-mono text-red-600 mb-1.5 block">Compilation Error :</label>
                                                                                                <div className="w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 font-mono text-sm text-red-600 dark:text-red-400 min-h-[40px] max-h-[300px] whitespace-pre-wrap break-words overflow-auto">
                                                                                                    {testResults[activeResultCase].error}
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

export default PracticeWorkspace;
