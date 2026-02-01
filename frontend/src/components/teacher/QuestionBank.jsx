import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Edit, Trash2, FileDown, FileUp, Code, FileQuestion, Info, CheckCircle2, AlertCircle, Lightbulb, BookOpen, TestTube, Sparkles, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ImageUpload } from "@/components/ui/image-upload";
import { problemService } from "@/services/problem.service";
import { toast } from "sonner";

function QuestionBank() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedType, setSelectedType] = useState("coding");
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch problems from backend
    useEffect(() => {
        fetchProblems();
    }, []);

    const fetchProblems = async () => {
        try {
            setLoading(true);
            const response = await problemService.getProblems();
            if (response.success) {
                setQuestions(response.data.problems || []);
            }
        } catch (error) {
            console.error('Failed to fetch problems:', error);
            toast.error('Failed to load problems');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        const diffLower = difficulty?.toLowerCase();
        const colors = {
            easy: "bg-green-500/10 text-green-600 border-green-500/20",
            medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
            hard: "bg-red-500/10 text-red-600 border-red-500/20",
        };
        return colors[diffLower] || "";
    };

    const handleEditQuestion = (question) => {
        setEditingQuestion(question);
        setShowCreateForm(true);
    };

    const handleViewQuestion = (question) => {
        // Navigate to the practice workspace to view the question as students would see it
        navigate(`/practice/${question._id}/workspace`);
    };

    const handleCloseForm = () => {
        setShowCreateForm(false);
        setEditingQuestion(null);
    };

    const handleDeleteQuestion = async (question) => {
        if (window.confirm(`Are you sure you want to delete "${question.title}"? This action cannot be undone.`)) {
            try {
                console.log('Attempting to delete question:', question._id);
                const response = await problemService.deleteProblem(question._id);
                console.log('Delete response:', response);

                if (response.success) {
                    toast.success('Question deleted successfully!');
                    fetchProblems(); // Refresh the list
                } else {
                    console.error('Delete failed:', response);
                    toast.error(response.message || 'Failed to delete question');
                }
            } catch (error) {
                console.error('Error deleting question:', error);
                toast.error(error.message || 'Failed to delete question');
            }
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-0 max-w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Question Bank</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage coding and MCQ questions</p>
                </div>
                <TooltipProvider>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
                                    <FileUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Import</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Import questions from JSON file</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
                                    <FileDown className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Export</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Export questions to JSON file</p>
                            </TooltipContent>
                        </Tooltip>
                        <Button className="gap-2 flex-1 sm:flex-none text-xs sm:text-sm" onClick={() => setShowCreateForm(!showCreateForm)}>
                            {showCreateForm ? <X className="w-3 h-3 sm:w-4 sm:h-4" /> : <Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
                            {showCreateForm ? 'Cancel' : 'Add Question'}
                        </Button>
                    </div>
                </TooltipProvider>
            </div>

            {showCreateForm && (
                <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-background via-background to-primary/5">
                    <CardHeader className="p-3 sm:p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            {editingQuestion ? 'Edit Question' : 'Add New Question'}
                            <Badge variant="secondary" className="text-xs">
                                {editingQuestion ? 'Update Mode' : 'Create Mode'}
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm mt-1">
                            {editingQuestion ? 'Update the coding problem or MCQ question' : 'Create a coding problem or MCQ question'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 pt-4">
                        <CreateQuestionForm
                            selectedType={selectedType}
                            setSelectedType={setSelectedType}
                            onClose={handleCloseForm}
                            onSuccess={fetchProblems}
                            editingQuestion={editingQuestion}
                        />
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="pb-2 sm:pb-2">
                    <CardTitle className="text-lg sm:text-xl">All Questions</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Browse and manage your question collection</CardDescription>
                </CardHeader>
                <CardContent className="pt-2 sm:pt-2">
                    <TabGroup>
                        <div className="rounded-xl bg-neutral-900 p-2 text-white">
                            <TabList className="flex gap-4">
                                <Tab
                                    className="rounded-full px-3 py-1 text-sm/6 font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10"
                                >
                                    All Questions
                                </Tab>
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
                                <QuestionTable
                                    questions={questions}
                                    getDifficultyColor={getDifficultyColor}
                                    loading={loading}
                                    onEditQuestion={handleEditQuestion}
                                    onDeleteQuestion={handleDeleteQuestion}
                                    onViewQuestion={handleViewQuestion}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                />
                            </TabPanel>
                            <TabPanel>
                                <QuestionTable
                                    questions={questions.filter((q) =>
                                        (q.questionType === "coding" || !q.questionType) &&
                                        !(q.title && q.title.toLowerCase().includes('mcq')) &&
                                        !(q.mcqOptions && q.mcqOptions.length > 0)
                                    )}
                                    getDifficultyColor={getDifficultyColor}
                                    loading={loading}
                                    onEditQuestion={handleEditQuestion}
                                    onDeleteQuestion={handleDeleteQuestion}
                                    onViewQuestion={handleViewQuestion}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                />
                            </TabPanel>
                            <TabPanel>
                                <QuestionTable
                                    questions={questions.filter((q) =>
                                        q.questionType === "mcq" ||
                                        (q.title && q.title.toLowerCase().includes('mcq')) ||
                                        (q.mcqOptions && q.mcqOptions.length > 0)
                                    )}
                                    getDifficultyColor={getDifficultyColor}
                                    loading={loading}
                                    onEditQuestion={handleEditQuestion}
                                    onDeleteQuestion={handleDeleteQuestion}
                                    onViewQuestion={handleViewQuestion}
                                    currentPage={currentPage}
                                    setCurrentPage={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                />
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </CardContent>
            </Card>
        </div>
    );
}

function QuestionTable({ questions, getDifficultyColor, loading, onEditQuestion, onDeleteQuestion, onViewQuestion, currentPage, setCurrentPage, itemsPerPage }) {
    // Calculate pagination
    const totalPages = Math.ceil(questions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQuestions = questions.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading problems...</span>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No problems found. Create your first problem!
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedQuestions.map((question) => (
                            <TableRow key={question._id}>
                                <TableCell className="font-medium">
                                    <HoverCard>
                                        <HoverCardTrigger className="cursor-pointer hover:text-primary transition-colors">
                                            {question.title}
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-80">
                                            <div className="space-y-2">
                                                <h4 className="font-semibold">{question.title}</h4>
                                                <Separator />
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {question.description || 'No description available'}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>Examples: {question.examples?.length || 0}</span>
                                                    <Separator orientation="vertical" className="h-4" />
                                                    <span>Test Cases: {question.testCases?.length || 0}</span>
                                                </div>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {question.questionType === 'mcq' ||
                                            (question.title && question.title.toLowerCase().includes('mcq')) ||
                                            (question.mcqOptions && question.mcqOptions.length > 0)
                                            ? 'MCQ'
                                            : (question.category || 'General')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getDifficultyColor(question.difficulty)} variant="outline">
                                        {question.difficulty}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {question.tags && question.tags.map((tag, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <div className="flex items-center gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="sm" variant="ghost" onClick={() => onViewQuestion(question)}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>View Question</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="sm" variant="ghost" onClick={() => onEditQuestion(question)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Edit Question</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            console.log('Delete button clicked for question:', question);
                                                            onDeleteQuestion(question);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Delete Question</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {questions.map((question) => (
                    <Card key={question._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-sm leading-tight pr-2">{question.title}</h3>
                                    <TooltipProvider>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="sm" variant="ghost" onClick={() => onViewQuestion(question)} className="h-8 w-8 p-0">
                                                        <Eye className="w-3 h-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>View</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="sm" variant="ghost" onClick={() => onEditQuestion(question)} className="h-8 w-8 p-0">
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Edit</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            console.log('Delete button clicked for question:', question);
                                                            onDeleteQuestion(question);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Delete</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </div>

                                <Separator />

                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                        {question.questionType === 'mcq' ||
                                            (question.title && question.title.toLowerCase().includes('mcq')) ||
                                            (question.mcqOptions && question.mcqOptions.length > 0)
                                            ? 'MCQ'
                                            : (question.category || 'General')}
                                    </Badge>
                                    <Badge className={getDifficultyColor(question.difficulty)} variant="outline">
                                        {question.difficulty}
                                    </Badge>
                                </div>

                                {question.tags && question.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                        {question.tags.map((tag, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {question.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {question.description}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination Controls */}
            {!loading && questions.length > 0 && totalPages > 1 && (
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
        </div>
    );
}

function CreateQuestionForm({ selectedType, setSelectedType, onClose, onSuccess, editingQuestion }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '', // Add image field
        difficulty: '',
        category: '',
        tags: '',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        inputFields: [{ name: 'input', label: 'input' }], // Default single input field
        examples: [{ input: '', output: '', explanation: '', imageUrl: '', inputValues: [''] }],
        testCases: [{ input: '', output: '', isHidden: false, inputValues: [''] }],
        driverCode: {
            cpp: '',
            java: '',
            python: '',
            c: '',
            nasm: '',
            sql: '',
            'shell script': ''
        },
        // MCQ-specific fields
        mcqOptions: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ],
        mcqExplanation: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showImageUpload, setShowImageUpload] = useState({}); // Track which examples have image upload enabled

    // Reset step when question type changes
    useEffect(() => {
        setCurrentStep(1);
    }, [selectedType]);

    // Populate form when editing
    useEffect(() => {
        if (editingQuestion) {
            setFormData({
                title: editingQuestion.title || '',
                description: editingQuestion.description || '',
                image: editingQuestion.image || '', // Add image field
                difficulty: (editingQuestion.difficulty || '').toLowerCase(),
                category: editingQuestion.category || '',
                tags: editingQuestion.tags?.join(', ') || '',
                inputFormat: editingQuestion.inputFormat || '',
                outputFormat: editingQuestion.outputFormat || '',
                constraints: editingQuestion.constraints || '',
                inputFields: editingQuestion.inputFields || [{ name: 'input', label: 'input' }],
                examples: (editingQuestion.examples || [{ input: '', output: '', explanation: '', imageUrl: '' }]).map(ex => ({
                    ...ex,
                    imageUrl: ex.imageUrl || '',
                    inputValues: ex.inputValues || (ex.input ? ex.input.split(', ') : [''])
                })),
                testCases: (editingQuestion.testCases || [{ input: '', output: '', isHidden: false }]).map(tc => ({
                    ...tc,
                    inputValues: tc.inputValues || (tc.input ? tc.input.split(' | ') : [''])
                })),
                driverCode: editingQuestion.driverCode || {
                    cpp: '',
                    java: '',
                    python: '',
                    c: '',
                    nasm: '',
                    sql: '',
                    'shell script': ''
                },
                // MCQ fields
                mcqOptions: editingQuestion.mcqOptions || [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false }
                ],
                mcqExplanation: editingQuestion.mcqExplanation || ''
            });
            setSelectedType(editingQuestion.questionType || 'coding'); // Set question type from data
            
            // Initialize toggle state for examples with existing images
            const imageToggleState = {};
            (editingQuestion.examples || []).forEach((ex, idx) => {
                if (ex.imageUrl) {
                    imageToggleState[idx] = true;
                }
            });
            setShowImageUpload(imageToggleState);
        }
    }, [editingQuestion, setSelectedType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Basic validation
            if (!formData.title || !formData.title.trim()) {
                toast.error('Please provide a question title');
                setIsSubmitting(false);
                return;
            }

            if (!formData.description || !formData.description.trim()) {
                toast.error('Please provide a question description');
                setIsSubmitting(false);
                return;
            }

            if (!formData.difficulty) {
                toast.error('Please select a difficulty level');
                setIsSubmitting(false);
                return;
            }

            // Parse tags
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

            // Capitalize difficulty to match backend enum (Easy, Medium, Hard)
            const capitalizedDifficulty = formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1).toLowerCase();

            // Filter out test cases with empty input or output
            const validTestCases = formData.testCases.filter(tc =>
                tc.input && tc.input.trim() !== '' &&
                tc.output && tc.output.trim() !== ''
            );

            // Filter out examples with empty input or output
            const validExamples = formData.examples.filter(ex =>
                ex.input && ex.input.trim() !== '' &&
                ex.output && ex.output.trim() !== ''
            );

            const problemData = {
                title: formData.title,
                description: formData.description,
                image: formData.image || null, // Add image field
                difficulty: capitalizedDifficulty, // Easy, Medium, or Hard
                category: 'Algorithms', // Use valid enum value for all questions
                tags: tagsArray,
                questionType: selectedType, // 'coding' or 'mcq' - this is the field that distinguishes question types
                isPublished: true // Make it visible to students
            };

            // Add coding-specific fields
            if (selectedType === 'coding') {
                // Validate that at least one visible test case exists
                const visibleTestCases = validTestCases.filter(tc => !tc.isHidden);
                if (validTestCases.length > 0 && visibleTestCases.length === 0) {
                    toast.error('Please provide at least one visible test case for students to test their code');
                    setIsSubmitting(false);
                    return;
                }

                problemData.inputFormat = formData.inputFormat;
                problemData.outputFormat = formData.outputFormat;
                problemData.constraints = formData.constraints;
                problemData.inputFields = formData.inputFields;
                problemData.examples = validExamples.length > 0 ? validExamples : undefined;
                problemData.testCases = validTestCases.length > 0 ? validTestCases : [];
                problemData.driverCode = formData.driverCode;
            }

            // Add MCQ-specific fields
            if (selectedType === 'mcq') {
                // Filter out empty options and ensure at least one correct answer
                const validOptions = formData.mcqOptions.filter(opt => opt.text && opt.text.trim() !== '');
                const hasCorrectAnswer = validOptions.some(opt => opt.isCorrect);

                if (validOptions.length < 2) {
                    toast.error('Please provide at least 2 options for the MCQ question');
                    setIsSubmitting(false);
                    return;
                }

                if (!hasCorrectAnswer) {
                    toast.error('Please mark at least one option as correct');
                    setIsSubmitting(false);
                    return;
                }

                problemData.mcqOptions = validOptions;
                problemData.mcqExplanation = formData.mcqExplanation;
            }

            console.log('Sending problem data:', problemData);

            let response;
            if (editingQuestion) {
                // Update existing problem
                response = await problemService.updateProblem(editingQuestion._id, problemData);
            } else {
                // Create new problem
                response = await problemService.createProblem(problemData);
            }

            console.log('Response received:', response);

            if (response.success) {
                toast.success(editingQuestion ? 'Problem updated successfully!' : 'Problem created successfully!');
                onSuccess();
                onClose();
            } else {
                console.error('Backend error:', response);
                toast.error(response.message || (editingQuestion ? 'Failed to update problem' : 'Failed to create problem'));
            }
        } catch (error) {
            console.error('Error creating problem:', error);
            console.error('Error message:', error.message);
            toast.error(error.message || 'Failed to create problem');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepsForType = (type) => {
        if (type === 'mcq') {
            return [
                { id: 1, title: 'Basic Info', description: 'Question type and basic details' },
                { id: 2, title: 'Problem Details', description: 'Description and format' },
                { id: 3, title: 'MCQ Options', description: 'Answer choices and explanation' },
                { id: 4, title: 'Review & Submit', description: 'Final review' }
            ];
        } else {
            return [
                { id: 1, title: 'Basic Info', description: 'Question type and basic details' },
                { id: 2, title: 'Problem Details', description: 'Description and format' },
                { id: 3, title: 'Examples & Test Cases', description: 'Sample inputs and outputs' },
                { id: 4, title: 'Code Templates', description: 'Starter code for students' },
                { id: 5, title: 'Review & Submit', description: 'Final review' }
            ];
        }
    };

    const steps = getStepsForType(selectedType);

    const nextStep = () => {
        const maxSteps = getStepsForType(selectedType).length;
        if (currentStep < maxSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="space-y-6 max-w-full">
            {/* Progress Steps - Responsive */}
            <div className="w-full">
                {/* Large Desktop Progress - Full Layout */}
                <div className="hidden xl:flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className="flex items-center">
                                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium transition-all duration-300 ${currentStep > step.id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : currentStep === step.id
                                        ? 'bg-primary text-primary-foreground border-primary ring-4 ring-primary/20'
                                        : 'border-muted-foreground/30 text-muted-foreground'
                                    }`}>
                                    {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                                </div>
                                <div className="ml-3">
                                    <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                                        }`}>
                                        {step.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-12 h-0.5 mx-4 transition-colors duration-300 ${currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Tablet Progress - Numbers Only */}
                <div className="hidden md:flex xl:hidden items-center justify-center space-x-4 mb-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${currentStep >= step.id
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'border-muted-foreground/30 text-muted-foreground'
                                }`}>
                                {step.id}
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-6 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Mobile Progress - Compact Dots */}
                <div className="md:hidden">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors ${currentStep >= step.id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-muted-foreground/30 text-muted-foreground'
                                    }`}>
                                    {step.id}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-4 h-0.5 mx-1 ${currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Title for Mobile and Tablet */}
                <div className="xl:hidden text-center">
                    <h3 className="text-lg font-semibold">{steps[currentStep - 1]?.title}</h3>
                    <p className="text-sm text-muted-foreground">{steps[currentStep - 1]?.description}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                            <Lightbulb className="h-4 w-4 text-blue-600" />
                            <AlertTitle>Getting Started</AlertTitle>
                            <AlertDescription>
                                Choose between coding problems with test cases or multiple-choice questions. All fields marked with * are required.
                            </AlertDescription>
                        </Alert>

                        <div className="text-center space-y-2 hidden md:block">
                            <h3 className="text-lg font-semibold">Let's start with the basics</h3>
                            <p className="text-muted-foreground">Choose the type of question and provide basic information</p>
                        </div>

                        <div className="grid gap-6 max-w-2xl mx-auto px-4 sm:px-6 lg:px-0">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Label className="text-base font-medium">Question Type</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p>Choose between coding problems with test cases or multiple choice questions</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Card className={`cursor-pointer transition-all hover:shadow-md ${selectedType === 'coding' ? 'ring-2 ring-primary bg-primary/5' : ''
                                        }`}
                                        onClick={() => setSelectedType('coding')}>
                                        <CardContent className="p-4 sm:p-6 text-center">
                                            <Code className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-primary" />
                                            <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Coding Problem</h4>
                                            <p className="text-xs sm:text-sm text-muted-foreground">Algorithm and programming challenges</p>
                                        </CardContent>
                                    </Card>
                                    <Card className={`cursor-pointer transition-all hover:shadow-md ${selectedType === 'mcq' ? 'ring-2 ring-primary bg-primary/5' : ''
                                        }`}
                                        onClick={() => setSelectedType('mcq')}>
                                        <CardContent className="p-4 sm:p-6 text-center">
                                            <FileQuestion className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-primary" />
                                            <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">Multiple Choice</h4>
                                            <p className="text-xs sm:text-sm text-muted-foreground">Theory and concept questions</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <Label htmlFor="title" className="text-sm sm:text-base font-medium">Question Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Two Sum Problem"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="text-sm sm:text-base"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Label htmlFor="difficulty" className="text-sm sm:text-base font-medium">Difficulty *</Label>
                                        <Select
                                            value={formData.difficulty || undefined}
                                            onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select difficulty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="easy">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                        Easy
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                                        Medium
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="hard">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                                        Hard
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="tags" className="text-sm sm:text-base font-medium">Tags</Label>
                                        <Input
                                            id="tags"
                                            placeholder="arrays, sorting, dp"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Problem Details */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <Alert className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                            <AlertTitle>Writing Clear Problem Statements</AlertTitle>
                            <AlertDescription>
                                Include: What the problem asks for, any special requirements, constraints, and edge cases to consider.
                            </AlertDescription>
                        </Alert>

                        <div className="text-center space-y-2 hidden md:block">
                            <h3 className="text-lg font-semibold">Describe the problem</h3>
                            <p className="text-muted-foreground">Provide a clear and detailed problem statement</p>
                        </div>

                        <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
                            <div className="space-y-3">
                                <Label htmlFor="description" className="text-sm sm:text-base font-medium">Problem Statement *</Label>

                                <Textarea
                                    id="description"
                                    placeholder="Write a clear and detailed problem description. Include what the function should do, any constraints, and what the expected behavior is..."
                                    rows={6}
                                    className="text-sm sm:text-base leading-relaxed resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Image Upload Field */}
                            <Label className="text-sm sm:text-base font-medium">Question Image (Optional)</Label>
                            <TabGroup>
                                <TabList className="flex gap-4 mb-2">
                                    <Tab className="rounded-full px-3 py-1 text-sm/6 font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10">
                                        Upload Image
                                    </Tab>
                                    <Tab className="rounded-full px-3 py-1 text-sm/6 font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10">
                                        Image URL
                                    </Tab>
                                </TabList>
                                <TabPanels>
                                    <TabPanel>
                                        <ImageUpload
                                            value={formData.image}
                                            onChange={(url) => setFormData({ ...formData, image: url })}
                                            useInternalTabs={false}
                                            mode="upload"
                                            showLabel={false}
                                        />
                                    </TabPanel>
                                    <TabPanel>
                                        <ImageUpload
                                            value={formData.image}
                                            onChange={(url) => setFormData({ ...formData, image: url })}
                                            useInternalTabs={false}
                                            mode="url"
                                            showLabel={false}
                                        />
                                    </TabPanel>
                                </TabPanels>
                            </TabGroup>

                            {selectedType === "coding" && (
                                <div className="grid gap-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="input-format" className="text-sm sm:text-base font-medium">Input Format</Label>
                                            <Textarea
                                                id="input-format"
                                                placeholder="Describe the input format and structure..."
                                                rows={4}
                                                className="resize-none"
                                                value={formData.inputFormat}
                                                onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="output-format" className="text-sm sm:text-base font-medium">Output Format</Label>
                                            <Textarea
                                                id="output-format"
                                                placeholder="Describe the expected output format..."
                                                rows={4}
                                                className="resize-none"
                                                value={formData.outputFormat}
                                                onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="constraints" className="text-sm sm:text-base font-medium">Constraints</Label>
                                        <Textarea
                                            id="constraints"
                                            placeholder="List the constraints (one per line)..."
                                            rows={3}
                                            className="resize-none"
                                            value={formData.constraints}
                                            onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 3: Examples & Test Cases OR MCQ Options */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        {selectedType === "coding" ? (
                            <>
                                <Alert className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                                    <TestTube className="h-4 w-4 text-green-600" />
                                    <AlertTitle>Test Cases Best Practices</AlertTitle>
                                    <AlertDescription>
                                        Include basic cases, edge cases, and corner cases. Examples are shown to students; test cases verify their solutions.
                                    </AlertDescription>
                                </Alert>

                                <div className="text-center space-y-2 hidden md:block">
                                    <h3 className="text-lg font-semibold">Examples and Test Cases</h3>
                                    <p className="text-muted-foreground">Provide examples for students and test cases for evaluation</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                                    <FileQuestion className="h-4 w-4 text-blue-600" />
                                    <AlertTitle>MCQ Options Setup</AlertTitle>
                                    <AlertDescription>
                                        Create answer choices and mark the correct option(s). You can have multiple correct answers if needed.
                                    </AlertDescription>
                                </Alert>

                                <div className="text-center space-y-2 hidden md:block">
                                    <h3 className="text-lg font-semibold">Multiple Choice Options</h3>
                                    <p className="text-muted-foreground">Set up answer choices and explanations</p>
                                </div>
                            </>
                        )}

                        <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
                            {selectedType === "coding" && (
                                <>
                                    {/* Input Fields Configuration */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Input Fields Configuration</CardTitle>
                                            <CardDescription>
                                                Define the input field names that students will see in the workspace
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4 p-4 sm:p-6">
                                            {formData.inputFields.map((field, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                                    <div className="flex-1 w-full">
                                                        <Input
                                                            placeholder="Field name (e.g., n, k, array)"
                                                            value={field.name}
                                                            onChange={(e) => {
                                                                const newFields = [...formData.inputFields];
                                                                newFields[idx].name = e.target.value;
                                                                newFields[idx].label = e.target.value;
                                                                setFormData({ ...formData, inputFields: newFields });
                                                            }}
                                                            className="text-sm sm:text-base"
                                                        />
                                                    </div>
                                                    {formData.inputFields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newFields = formData.inputFields.filter((_, i) => i !== idx);
                                                                // Update examples and test cases to remove the corresponding input value
                                                                const updatedExamples = formData.examples.map(ex => ({
                                                                    ...ex,
                                                                    inputValues: (ex.inputValues || []).filter((_, i) => i !== idx),
                                                                    input: (ex.inputValues || []).filter((_, i) => i !== idx).join(', ')
                                                                }));
                                                                const updatedTestCases = formData.testCases.map(tc => ({
                                                                    ...tc,
                                                                    inputValues: (tc.inputValues || []).filter((_, i) => i !== idx),
                                                                    input: (tc.inputValues || []).filter((_, i) => i !== idx).join(' | ')
                                                                }));

                                                                setFormData({
                                                                    ...formData,
                                                                    inputFields: newFields,
                                                                    examples: updatedExamples,
                                                                    testCases: updatedTestCases
                                                                });
                                                            }}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 self-end sm:self-center"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const newInputFields = [...formData.inputFields, { name: '', label: '' }];
                                                    // Update examples and test cases to match new input field count
                                                    const updatedExamples = formData.examples.map(ex => ({
                                                        ...ex,
                                                        inputValues: [...(ex.inputValues || []), '']
                                                    }));
                                                    const updatedTestCases = formData.testCases.map(tc => ({
                                                        ...tc,
                                                        inputValues: [...(tc.inputValues || []), '']
                                                    }));

                                                    setFormData({
                                                        ...formData,
                                                        inputFields: newInputFields,
                                                        examples: updatedExamples,
                                                        testCases: updatedTestCases
                                                    });
                                                }}
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Input Field
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Examples */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Examples (Visible to Students)</CardTitle>
                                            <CardDescription>
                                                Provide clear examples to help students understand the problem
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4 p-4 sm:p-6">
                                            {formData.examples.map((example, idx) => (
                                                <div key={idx} className="border rounded-lg p-3 sm:p-4 space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-medium text-sm sm:text-base">Example {idx + 1}</h4>
                                                        {formData.examples.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newExamples = formData.examples.filter((_, i) => i !== idx);
                                                                    setFormData({ ...formData, examples: newExamples });
                                                                    
                                                                    // Update toggle state - remove the deleted index and shift others
                                                                    setShowImageUpload(prev => {
                                                                        const newToggleState = {};
                                                                        Object.keys(prev).forEach(key => {
                                                                            const keyIdx = parseInt(key);
                                                                            if (keyIdx < idx) {
                                                                                newToggleState[keyIdx] = prev[keyIdx];
                                                                            } else if (keyIdx > idx) {
                                                                                newToggleState[keyIdx - 1] = prev[keyIdx];
                                                                            }
                                                                        });
                                                                        return newToggleState;
                                                                    });
                                                                }}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="space-y-4">
                                                        {/* Input Fields */}
                                                        <div className="space-y-3">
                                                            <Label className="text-xs sm:text-sm font-medium">Input Values</Label>
                                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                                {formData.inputFields.map((field, fieldIdx) => (
                                                                    <div key={fieldIdx} className="space-y-1">
                                                                        <Label className="text-xs text-muted-foreground">
                                                                            {field.name || `Field ${fieldIdx + 1}`}
                                                                        </Label>
                                                                        <Input
                                                                            placeholder={`e.g., ${field.name === 'nums' ? '[1,2,3]' : field.name === 'target' ? '5' : 'value'}`}
                                                                            value={example.inputValues?.[fieldIdx] || ''}
                                                                            onChange={(e) => {
                                                                                const newExamples = [...formData.examples];
                                                                                if (!newExamples[idx].inputValues) {
                                                                                    newExamples[idx].inputValues = new Array(formData.inputFields.length).fill('');
                                                                                }
                                                                                newExamples[idx].inputValues[fieldIdx] = e.target.value;
                                                                                // Update the legacy input field for backward compatibility
                                                                                newExamples[idx].input = newExamples[idx].inputValues.join(', ');
                                                                                setFormData({ ...formData, examples: newExamples });
                                                                            }}
                                                                            className="font-mono text-xs sm:text-sm"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs sm:text-sm font-medium">Output</Label>
                                                            <Input
                                                                placeholder="e.g., [0,2]"
                                                                value={example.output}
                                                                onChange={(e) => {
                                                                    const newExamples = [...formData.examples];
                                                                    newExamples[idx].output = e.target.value;
                                                                    setFormData({ ...formData, examples: newExamples });
                                                                }}
                                                                className="font-mono text-xs sm:text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs sm:text-sm font-medium">Explanation (Optional)</Label>
                                                            <Textarea
                                                                placeholder="Explain how this example works..."
                                                                value={example.explanation}
                                                                onChange={(e) => {
                                                                    const newExamples = [...formData.examples];
                                                                    newExamples[idx].explanation = e.target.value;
                                                                    setFormData({ ...formData, examples: newExamples });
                                                                }}
                                                                rows={2}
                                                                className="resize-none text-xs sm:text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-xs sm:text-sm font-medium">Example Image (Optional)</Label>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setShowImageUpload(prev => ({
                                                                            ...prev,
                                                                            [idx]: !prev[idx]
                                                                        }));
                                                                        // If toggling off, clear the image
                                                                        if (showImageUpload[idx]) {
                                                                            const newExamples = [...formData.examples];
                                                                            newExamples[idx].imageUrl = '';
                                                                            setFormData({ ...formData, examples: newExamples });
                                                                        }
                                                                    }}
                                                                    className="h-7 px-2 text-xs"
                                                                >
                                                                    {showImageUpload[idx] ? 'Hide Image Upload' : 'Add Image'}
                                                                </Button>
                                                            </div>
                                                            {showImageUpload[idx] && (
                                                                <div className="mt-2">
                                                                    <ImageUpload
                                                                        onChange={(imageUrl) => {
                                                                            const newExamples = [...formData.examples];
                                                                            newExamples[idx].imageUrl = imageUrl;
                                                                            setFormData({ ...formData, examples: newExamples });
                                                                        }}
                                                                        value={example.imageUrl}
                                                                        onImageRemoved={() => {
                                                                            const newExamples = [...formData.examples];
                                                                            newExamples[idx].imageUrl = '';
                                                                            setFormData({ ...formData, examples: newExamples });
                                                                        }}
                                                                        placeholder="Upload an image to help explain this example"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const newExample = {
                                                        input: '',
                                                        output: '',
                                                        explanation: '',
                                                        imageUrl: '',
                                                        inputValues: new Array(formData.inputFields.length).fill('')
                                                    };
                                                    setFormData({
                                                        ...formData,
                                                        examples: [...formData.examples, newExample]
                                                    });
                                                }}
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Example
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Test Cases */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Test Cases (For Evaluation)</CardTitle>
                                            <CardDescription>
                                                Provide test cases to evaluate student solutions. Each input field will have its own input box.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {formData.testCases.map((testCase, idx) => (
                                                <div key={idx} className="border rounded-lg p-4 space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-medium">Test Case {idx + 1}</h4>
                                                        {formData.testCases.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newTestCases = formData.testCases.filter((_, i) => i !== idx);
                                                                    setFormData({ ...formData, testCases: newTestCases });
                                                                }}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="space-y-4">
                                                        {/* Input Fields */}
                                                        <div className="space-y-3">
                                                            <Label className="text-sm font-medium">Input Values</Label>
                                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                                {formData.inputFields.map((field, fieldIdx) => (
                                                                    <div key={fieldIdx} className="space-y-1">
                                                                        <Label className="text-xs text-muted-foreground">
                                                                            {field.name || `Field ${fieldIdx + 1}`}
                                                                        </Label>
                                                                        <Input
                                                                            placeholder={`Enter ${field.name || 'value'}`}
                                                                            value={testCase.inputValues?.[fieldIdx] || ''}
                                                                            onChange={(e) => {
                                                                                const newTestCases = [...formData.testCases];
                                                                                if (!newTestCases[idx].inputValues) {
                                                                                    newTestCases[idx].inputValues = new Array(formData.inputFields.length).fill('');
                                                                                }
                                                                                newTestCases[idx].inputValues[fieldIdx] = e.target.value;
                                                                                // Update the legacy input field for backward compatibility
                                                                                newTestCases[idx].input = newTestCases[idx].inputValues.join(' | ');
                                                                                setFormData({ ...formData, testCases: newTestCases });
                                                                            }}
                                                                            className="font-mono text-sm"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Expected Output */}
                                                        <div className="space-y-2">
                                                            <Label className="text-sm font-medium">Expected Output</Label>
                                                            <Input
                                                                placeholder="Expected output for this test case"
                                                                value={testCase.output}
                                                                onChange={(e) => {
                                                                    const newTestCases = [...formData.testCases];
                                                                    newTestCases[idx].output = e.target.value;
                                                                    setFormData({ ...formData, testCases: newTestCases });
                                                                }}
                                                                className="font-mono"
                                                            />
                                                        </div>

                                                        {/* Hidden Test Case Toggle */}
                                                        <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded-lg border">
                                                            <Switch
                                                                id={`hidden-${idx}`}
                                                                checked={testCase.isHidden || false}
                                                                onCheckedChange={(checked) => {
                                                                    const newTestCases = [...formData.testCases];
                                                                    newTestCases[idx].isHidden = checked;
                                                                    setFormData({ ...formData, testCases: newTestCases });
                                                                }}
                                                            />
                                                            <div className="space-y-1">
                                                                <Label htmlFor={`hidden-${idx}`} className="text-sm font-medium cursor-pointer">
                                                                    Hidden Test Case
                                                                </Label>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {testCase.isHidden
                                                                        ? "This test case will be hidden from students but used for evaluation"
                                                                        : "This test case will be visible to students for testing their code"
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    const newTestCase = {
                                                        input: '',
                                                        output: '',
                                                        isHidden: false,
                                                        inputValues: new Array(formData.inputFields.length).fill('')
                                                    };
                                                    setFormData({
                                                        ...formData,
                                                        testCases: [...formData.testCases, newTestCase]
                                                    });
                                                }}
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Test Case
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {selectedType === "mcq" && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Multiple Choice Options</CardTitle>
                                        <CardDescription>
                                            Provide the answer choices and mark the correct one
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {formData.mcqOptions.map((option, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <Input
                                                        placeholder={`Option ${index + 1}`}
                                                        value={option.text}
                                                        onChange={(e) => {
                                                            const newOptions = [...formData.mcqOptions];
                                                            newOptions[index].text = e.target.value;
                                                            setFormData({ ...formData, mcqOptions: newOptions });
                                                        }}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant={option.isCorrect ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => {
                                                        const newOptions = [...formData.mcqOptions];
                                                        newOptions[index].isCorrect = !newOptions[index].isCorrect;
                                                        setFormData({ ...formData, mcqOptions: newOptions });
                                                    }}
                                                >
                                                    {option.isCorrect ? "✓ Correct" : "Mark Correct"}
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="space-y-2 pt-4">
                                            <Label htmlFor="mcqExplanation">Explanation</Label>
                                            <Textarea
                                                id="mcqExplanation"
                                                placeholder="Explain why this is the correct answer..."
                                                rows={3}
                                                value={formData.mcqExplanation}
                                                onChange={(e) => setFormData({ ...formData, mcqExplanation: e.target.value })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 4: Code Templates */}
                {currentStep === 4 && selectedType === "coding" && (
                    <div className="space-y-4">
                        <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
                            <Code className="h-4 w-4 text-amber-600" />
                            <AlertTitle>Starter Code Templates</AlertTitle>
                            <AlertDescription>
                                Provide helpful boilerplate code that students can build upon. Keep function signatures clear and add comments for guidance.
                            </AlertDescription>
                        </Alert>

                        <div className="text-center space-y-2 hidden md:block">
                            <h3 className="text-lg font-semibold">Code Templates</h3>
                            <p className="text-muted-foreground">Provide starter code templates to help students get started</p>
                        </div>

                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-0">
                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="text-sm sm:text-base">Starter Code for Students</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">
                                        Provide initial code templates in different programming languages
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <TabGroup>
                                        <div className="rounded-xl bg-neutral-900 p-2 text-white">
                                            <TabList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 h-auto gap-2">
                                                <Tab className="rounded-full px-3 py-1 text-xs sm:text-sm font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10">C++</Tab>
                                                <Tab className="rounded-full px-3 py-1 text-xs sm:text-sm font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10">Java</Tab>
                                                <Tab className="rounded-full px-3 py-1 text-xs sm:text-sm font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10">Python</Tab>
                                                <Tab className="rounded-full px-3 py-1 text-xs sm:text-sm font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10 hidden sm:flex">C</Tab>
                                                <Tab className="rounded-full px-3 py-1 text-xs sm:text-sm font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10 hidden lg:flex">NASM</Tab>
                                                <Tab className="rounded-full px-3 py-1 text-xs sm:text-sm font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10 hidden lg:flex">SQL</Tab>
                                                <Tab className="rounded-full px-3 py-1 text-xs sm:text-sm font-semibold text-white focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-white/5 data-selected:bg-white/10 data-selected:data-hover:bg-white/10 hidden lg:flex">Shell</Tab>
                                            </TabList>
                                        </div>
                                        <TabPanels className="mt-3 space-y-3">
                                            <TabPanel className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Code className="w-4 h-4" />
                                                    <span>C++ Template</span>
                                                </div>
                                                <Textarea
                                                    placeholder="// C++ starter code&#10;class Solution {&#10;public:&#10;    int solve(vector<int>& nums) {&#10;        // Write your code here&#10;        return 0;&#10;    }&#10;};"
                                                    rows={8}
                                                    className="font-mono text-xs sm:text-sm resize-none"
                                                    value={formData.driverCode.cpp}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        driverCode: { ...formData.driverCode, cpp: e.target.value }
                                                    })}
                                                />
                                            </TabPanel>
                                            <TabPanel className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Code className="w-4 h-4" />
                                                    <span>Java Template</span>
                                                </div>
                                                <Textarea
                                                    placeholder="// Java starter code&#10;class Solution {&#10;    public int solve(int[] nums) {&#10;        // Write your code here&#10;        return 0;&#10;    }&#10;}"
                                                    rows={10}
                                                    className="font-mono text-xs sm:text-sm resize-none"
                                                    value={formData.driverCode.java}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        driverCode: { ...formData.driverCode, java: e.target.value }
                                                    })}
                                                />
                                            </TabPanel>
                                            <TabPanel className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Code className="w-4 h-4" />
                                                    <span>Python Template</span>
                                                </div>
                                                <Textarea
                                                    placeholder="# Python starter code&#10;class Solution:&#10;    def solve(self, nums):&#10;        # Write your code here&#10;        pass"
                                                    rows={10}
                                                    className="font-mono text-xs sm:text-sm resize-none"
                                                    value={formData.driverCode.python}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        driverCode: { ...formData.driverCode, python: e.target.value }
                                                    })}
                                                />
                                            </TabPanel>
                                            <TabPanel className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Code className="w-4 h-4" />
                                                    <span>C Template</span>
                                                </div>
                                                <Textarea
                                                    placeholder="// C starter code&#10;#include <stdio.h>&#10;#include <stdlib.h>&#10;&#10;int solve(int* nums, int numsSize) {&#10;    // Write your code here&#10;    return 0;&#10;}"
                                                    rows={10}
                                                    className="font-mono text-xs sm:text-sm resize-none"
                                                    value={formData.driverCode.c}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        driverCode: { ...formData.driverCode, c: e.target.value }
                                                    })}
                                                />
                                            </TabPanel>
                                            <TabPanel className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Code className="w-4 h-4" />
                                                    <span>NASM Template</span>
                                                </div>
                                                <Textarea
                                                    placeholder="; NASM starter code&#10;section .data&#10;    ; Define your data here&#10;&#10;section .text&#10;    global _start&#10;&#10;_start:&#10;    ; Write your code here&#10;    mov eax, 1&#10;    int 0x80"
                                                    rows={10}
                                                    className="font-mono text-xs sm:text-sm resize-none"
                                                    value={formData.driverCode.nasm}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        driverCode: { ...formData.driverCode, nasm: e.target.value }
                                                    })}
                                                />
                                            </TabPanel>
                                            <TabPanel className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Code className="w-4 h-4" />
                                                    <span>SQL Template</span>
                                                </div>
                                                <Textarea
                                                    placeholder="-- SQL starter code&#10;-- Write your SQL query here&#10;SELECT * FROM table_name&#10;WHERE condition;"
                                                    rows={10}
                                                    className="font-mono text-xs sm:text-sm resize-none"
                                                    value={formData.driverCode.sql}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        driverCode: { ...formData.driverCode, sql: e.target.value }
                                                    })}
                                                />
                                            </TabPanel>
                                            <TabPanel className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Code className="w-4 h-4" />
                                                    <span>Shell Script Template</span>
                                                </div>
                                                <Textarea
                                                    placeholder="#!/bin/bash&#10;# Shell script starter code&#10;&#10;solve() {&#10;    # Write your code here&#10;    echo 'Hello World'&#10;}&#10;&#10;solve"
                                                    rows={10}
                                                    className="font-mono text-xs sm:text-sm resize-none"
                                                    value={formData.driverCode['shell script']}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        driverCode: { ...formData.driverCode, 'shell script': e.target.value }
                                                    })}
                                                />
                                            </TabPanel>
                                        </TabPanels>
                                    </TabGroup>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Review & Submit Step - Step 4 for MCQ, Step 5 for Coding */}
                {((currentStep === 4 && selectedType === "mcq") || (currentStep === 5 && selectedType === "coding")) && (
                    <div className="space-y-4">
                        <Alert className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <AlertTitle>Almost Done!</AlertTitle>
                            <AlertDescription>
                                Review your question carefully. You can always edit it later from the question list.
                            </AlertDescription>
                        </Alert>

                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold">Review Your Question</h3>
                            <p className="text-muted-foreground">Please review all details before submitting</p>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-0">
                            {/* Basic Info Review - Modern Stats Card Style */}
                            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 via-primary/10 to-primary/15 dark:from-primary/5 dark:via-primary/10 dark:to-primary/15 border border-primary/20 dark:border-primary/30">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full -translate-y-12 translate-x-12"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-primary/15 to-primary/10 rounded-full translate-y-8 -translate-x-8"></div>

                                <div className="relative p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-1.5">
                                            <Info className="w-4 h-4 text-primary" />
                                        </div>
                                        <h3 className="text-base font-semibold text-foreground">Basic Information</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                <span className="font-medium">Question Title</span>
                                            </div>
                                            <p className="text-lg font-bold text-foreground leading-tight">
                                                {formData.title || 'Not specified'}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/80"></div>
                                                <span className="font-medium">Question Type</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-background/60 border border-primary/20">
                                                    {selectedType === 'coding' ? <Code className="w-3 h-3 text-primary" /> : <FileQuestion className="w-3 h-3 text-primary" />}
                                                </div>
                                                <span className="text-base font-semibold capitalize text-foreground">{selectedType}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                                                <span className="font-medium">Difficulty Level</span>
                                            </div>
                                            <div className="inline-flex">
                                                <Badge className={`px-2 py-0.5 text-xs font-semibold ${formData.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    formData.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400'
                                                    }`} variant="outline">
                                                    {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                                <span className="font-medium">Tags</span>
                                            </div>
                                            <p className="text-base font-semibold text-foreground">
                                                {formData.tags || 'No tags specified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Problem Description Review - Document Style Card */}
                            <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
                                <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                        </div>
                                        <h3 className="text-base font-semibold text-foreground">Problem Description</h3>
                                        <div className="ml-auto flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                                            <div className="w-2 h-2 rounded-full bg-primary/80"></div>
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 space-y-4">
                                    <div className="prose prose-sm max-w-none">
                                        <div className="bg-muted/50 rounded-md p-3 border-primary">
                                            <p className="text-foreground leading-relaxed whitespace-pre-wrap m-0 text-sm">
                                                {formData.description || 'No description provided'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Display image if available */}
                                    {formData.image && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                <span>Visual Illustration</span>
                                            </div>
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/20 rounded-md blur-sm group-hover:blur-none transition-all duration-300"></div>
                                                <div className="relative bg-card rounded-md p-2 border border-border shadow-sm">
                                                    <img
                                                        src={formData.image}
                                                        alt="Question illustration"
                                                        className="max-w-full h-auto max-h-48 rounded-sm mx-auto"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedType === "coding" && (
                                <>
                                    {/* Examples Review */}
                                    {formData.examples.some(ex => ex.input || ex.output) && (
                                        <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
                                            <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-4 py-3 border-b border-border">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5">
                                                        <Lightbulb className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <h3 className="text-base font-semibold text-foreground">Examples ({formData.examples.filter(ex => ex.input || ex.output).length})</h3>
                                                    <div className="ml-auto flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                                                        <div className="w-2 h-2 rounded-full bg-primary/80"></div>
                                                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                {formData.examples.filter(ex => ex.input || ex.output).map((example, idx) => (
                                                    <div key={idx} className="border rounded-lg py-2 px-3 bg-muted/40">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold">{idx + 1}</span>
                                                            <h4 className="font-semibold text-foreground">Example {idx + 1}</h4>
                                                        </div>
                                                        <div className="space-y-2 text-sm bg-background p-2 rounded border border-border/60">
                                                            <div className="space-y-0.5">
                                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Input</p>
                                                                <p className="font-mono text-foreground break-words">{example.input}</p>
                                                            </div>
                                                            <Separator />
                                                            <div className="space-y-0.5">
                                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Output</p>
                                                                <p className="font-mono text-foreground break-words">{example.output}</p>
                                                            </div>
                                                            {example.explanation && (
                                                                <>
                                                                    <Separator />
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Explanation</p>
                                                                        <p className="text-foreground leading-snug">{example.explanation}</p>
                                                                    </div>
                                                                </>
                                                            )}
                                                            {example.imageUrl && (
                                                                <>
                                                                    <Separator />
                                                                    <div className="space-y-2">
                                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Example Image</p>
                                                                        <div className="relative group">
                                                                            <div className="relative bg-card rounded-md p-2 border border-border shadow-sm">
                                                                                <img
                                                                                    src={example.imageUrl}
                                                                                    alt={`Example ${idx + 1} illustration`}
                                                                                    className="max-w-full h-auto max-h-48 rounded-sm mx-auto"
                                                                                    onError={(e) => {
                                                                                        e.target.style.display = 'none';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Test Cases Review */}
                                    {formData.testCases.some(tc => tc.input || tc.output) && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <TestTube className="w-4 h-4" />
                                                    Test Cases
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 gap-4 mb-2">
                                                    <div className="text-sm">
                                                        <span className="font-medium text-muted-foreground">Total: </span>
                                                        <span className="font-semibold">{formData.testCases.filter(tc => tc.input || tc.output).length}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="font-medium text-muted-foreground">Hidden: </span>
                                                        <span className="font-semibold text-orange-600">
                                                            {formData.testCases.filter(tc => (tc.input || tc.output) && tc.isHidden).length}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    {formData.testCases.filter(tc => tc.input || tc.output).slice(0, 3).map((testCase, idx) => (
                                                        <div key={idx} className={`border rounded-lg p-3 ${testCase.isHidden ? 'border-orange-200 bg-orange-50/50 dark:bg-orange-950/20' : 'border-border bg-background'}`}>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-medium text-muted-foreground">Test Case {idx + 1}</span>
                                                                {testCase.isHidden && (
                                                                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                                                                        Hidden
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="font-mono text-sm space-y-1">
                                                                <div><strong>Input:</strong> {testCase.input}</div>
                                                                <div><strong>Output:</strong> {testCase.output}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {formData.testCases.filter(tc => tc.input || tc.output).length > 3 && (
                                                        <p className="text-sm text-muted-foreground">
                                                            ... and {formData.testCases.filter(tc => tc.input || tc.output).length - 3} more test cases
                                                        </p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )}

                            {/* MCQ Review */}
                            {selectedType === "mcq" && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Multiple Choice Options</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {formData.mcqOptions.filter(opt => opt.text.trim()).map((option, idx) => (
                                                <div key={idx} className={`p-3 rounded border ${option.isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-950/20' : 'bg-background'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                                                        <span>{option.text}</span>
                                                        {option.isCorrect && (
                                                            <Badge variant="default" className="ml-auto">Correct Answer</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {formData.mcqExplanation && (
                                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200">
                                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Explanation</h4>
                                                <p className="text-sm text-blue-800 dark:text-blue-200">{formData.mcqExplanation}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons - Mobile Responsive */}
                <Separator className="mt-4" />
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-3 px-4 sm:px-0">
                    <div className="flex gap-1 order-2 sm:order-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                        >
                            Cancel
                        </Button>
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="15 18 9 12 15 6" /></svg>
                                Previous
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2 order-1 sm:order-2">
                        {currentStep < steps.length && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={
                                                (currentStep === 1 && (!formData.title || !formData.difficulty)) ||
                                                (currentStep === 2 && !formData.description)
                                            }
                                            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
                                        >
                                            Next
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><polyline points="9 18 15 12 9 6" /></svg>
                                        </Button>
                                    </TooltipTrigger>
                                    {((currentStep === 1 && !formData.title) || (currentStep === 2 && !formData.description)) && (
                                        <TooltipContent>
                                            <p>Please fill in required fields</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {currentStep === steps.length && (
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none sm:px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {editingQuestion ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        {editingQuestion ? 'Update Question' : 'Create Question'}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}

export default QuestionBank;
