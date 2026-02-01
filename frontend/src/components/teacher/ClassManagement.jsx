import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Edit, Trash2, Users, UserPlus, UserMinus, FileText, Calendar, Mail, Upload, Edit2, CheckCircle2, AlertCircle, XCircle, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { classService } from "@/services/class.service";
import { toast } from "sonner";

function ClassManagement() {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await classService.getClasses();
            if (response.success) {
                setClasses(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
            toast.error('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (classId) => {
        try {
            const response = await classService.getClassStudents(classId);
            if (response.success) {
                setStudents(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
            toast.error('Failed to load students');
        }
    };

    const handleDeleteClass = async (classId) => {
        if (!confirm('Are you sure you want to delete this class?')) return;

        try {
            const response = await classService.deleteClass(classId);
            if (response.success) {
                toast.success('Class deleted successfully');
                fetchClasses();
            }
        } catch (error) {
            console.error('Failed to delete class:', error);
            toast.error('Failed to delete class');
        }
    };

    const handleUpdateRollNumber = async (studentId, newRollNo) => {
        try {
            // We'll need to create an endpoint for this
            const response = await fetch(`/api/users/${studentId}/rollno`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ rollNo: newRollNo })
            });

            if (response.ok) {
                toast.success('Roll number updated successfully');
                if (selectedClass) {
                    fetchStudents(selectedClass._id);
                }
                setEditingStudent(null);
            } else {
                toast.error('Failed to update roll number');
            }
        } catch (error) {
            console.error('Failed to update roll number:', error);
            toast.error('Failed to update roll number');
        }
    };

    const handleRemoveStudent = async (classId, studentId) => {
        if (!confirm('Are you sure you want to remove this student?')) return;

        try {
            const response = await classService.removeStudent(classId, studentId);
            if (response.success) {
                toast.success('Student removed successfully');
                fetchStudents(classId);
            }
        } catch (error) {
            console.error('Failed to remove student:', error);
            toast.error('Failed to remove student');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading classes...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Class Management</h2>
                    <p className="text-muted-foreground">Manage classes and student enrollments</p>
                </div>
                <Dialog open={isCreateClassOpen} onOpenChange={setIsCreateClassOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Class</DialogTitle>
                            <DialogDescription>Set up a new class group for students</DialogDescription>
                        </DialogHeader>
                        <CreateClassForm
                            onClose={() => setIsCreateClassOpen(false)}
                            onSuccess={fetchClasses}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="classes" className="w-full">
                <TabsList>
                    <TabsTrigger value="classes">Classes</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="classes" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Classes</CardTitle>
                            <CardDescription>Manage your class groups and assignments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {classes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No classes yet. Create your first class!</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {classes.map((cls) => (
                                        <Card key={cls._id}>
                                            <CardHeader>
                                                <CardTitle className="text-lg">{cls.name}</CardTitle>
                                                <CardDescription>
                                                    <Badge variant="outline">{cls.code}</Badge>
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Students</span>
                                                        <span className="font-medium">{cls.students?.length || 0}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-muted-foreground">Semester</span>
                                                        <span className="font-medium">{cls.semester || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => {
                                                            setSelectedClass(cls);
                                                            fetchStudents(cls._id);
                                                        }}
                                                    >
                                                        <Users className="w-4 h-4 mr-1" />
                                                        View Students
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteClass(cls._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="students" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Students</CardTitle>
                                    <CardDescription>View and manage student enrollments</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="gap-2" disabled={classes.length === 0}>
                                                <UserPlus className="w-4 h-4" />
                                                Add Student
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Student</DialogTitle>
                                                <DialogDescription>Enroll a new student to a class</DialogDescription>
                                            </DialogHeader>
                                            <AddStudentForm
                                                classes={classes}
                                                onClose={() => setIsAddStudentOpen(false)}
                                                onSuccess={() => {
                                                    setIsAddStudentOpen(false);
                                                    if (selectedClass) {
                                                        fetchStudents(selectedClass._id);
                                                    }
                                                }}
                                            />
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={isBulkAddOpen} onOpenChange={setIsBulkAddOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="gap-2" disabled={classes.length === 0}>
                                                <Upload className="w-4 h-4" />
                                                Bulk Add
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                                            <DialogHeader>
                                                <DialogTitle>Bulk Add Students</DialogTitle>
                                                <DialogDescription>Add multiple students to a class using their email addresses</DialogDescription>
                                            </DialogHeader>
                                            <BulkAddStudentsForm
                                                classes={classes}
                                                onClose={() => setIsBulkAddOpen(false)}
                                                onSuccess={() => {
                                                    setIsBulkAddOpen(false);
                                                    if (selectedClass) {
                                                        fetchStudents(selectedClass._id);
                                                    }
                                                }}
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {selectedClass ? (
                                <>
                                    <div className="mb-4">
                                        <Badge variant="outline" className="text-sm">
                                            {selectedClass.name} ({selectedClass.code})
                                        </Badge>
                                    </div>
                                    {students.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No students in this class yet</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>PRN</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {students.map((student) => (
                                                    <TableRow key={student._id || student.student?._id}>
                                                        <TableCell className="font-medium">{student.name || student.student?.name}</TableCell>
                                                        <TableCell>{student.email || student.student?.email}</TableCell>
                                                        <TableCell>{student.prn || 'Not Set'}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleRemoveStudent(selectedClass._id, student._id || student.student?._id)}
                                                            >
                                                                <UserMinus className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Select a class from the Classes tab to view students</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Records</CardTitle>
                            <CardDescription>Mark and view attendance for classes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {selectedClass ? (
                                <AttendanceSection classId={selectedClass._id} className={selectedClass.name} />
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Select a class from the Classes tab to manage attendance</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function CreateClassForm({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        semester: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await classService.createClass(formData);
            if (response.success) {
                toast.success('Class created successfully!');
                onSuccess();
                onClose();
            } else {
                toast.error(response.message || 'Failed to create class');
            }
        } catch (error) {
            console.error('Error creating class:', error);
            
            // Handle specific error messages from backend
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error('Failed to create class. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="className">Class Name *</Label>
                <Input
                    id="className"
                    placeholder="e.g., Data Structures - Section A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="classCode">Class Code *</Label>
                <Input
                    id="classCode"
                    placeholder="e.g., CS201-A"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Class code must be unique. Use a combination like CS201-A, MATH101-B, etc.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                    id="semester"
                    placeholder="e.g., Fall 2025"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Class'}
                </Button>
            </div>
        </form>
    );
}

function AddStudentForm({ classes, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        rollNo: '',
        classId: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await classService.addStudent(formData.classId, {
                email: formData.email,
                rollNo: formData.rollNo
            });

            if (response.success) {
                toast.success('Student added successfully!');
                onSuccess();
            } else {
                toast.error(response.message || 'Failed to add student');
            }
        } catch (error) {
            console.error('Error adding student:', error);
            toast.error(error.message || 'Failed to add student');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Student Email *</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Student must already have an account
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input
                    id="rollNo"
                    placeholder="e.g., 2021CS001"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="class">Assign to Class *</Label>
                <Select
                    value={formData.classId}
                    onValueChange={(value) => setFormData({ ...formData, classId: value })}
                    required
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                        {classes.map((cls) => (
                            <SelectItem key={cls._id} value={cls._id}>
                                {cls.name} ({cls.code})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Student'}
                </Button>
            </div>
        </form>
    );
}

function AttendanceSection({ classId, className }) {
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, [classId]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await classService.getClassStudents(classId);
            if (response.success) {
                setStudents(response.data || []);
                // Initialize attendance state
                const initialAttendance = {};
                response.data.forEach(student => {
                    initialAttendance[student._id] = 'present';
                });
                setAttendance(initialAttendance);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = async () => {
        try {
            const attendanceData = {
                date: attendanceDate,
                records: Object.entries(attendance).map(([studentId, status]) => ({
                    student: studentId,
                    status
                }))
            };

            const response = await classService.markAttendance(classId, attendanceData);
            if (response.success) {
                toast.success('Attendance marked successfully!');
            } else {
                toast.error('Failed to mark attendance');
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            toast.error('Failed to mark attendance');
        }
    };

    if (loading) {
        return <div className="text-center py-4">Loading students...</div>;
    }

    if (students.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No students in this class. Add students first.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
                <Button onClick={handleMarkAttendance} className="mt-6">
                    Save Attendance
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>PRN</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student._id || student.student?._id}>
                            <TableCell className="font-medium">{student.name || student.student?.name}</TableCell>
                            <TableCell>{student.prn || 'Not Set'}</TableCell>
                            <TableCell>
                                <Select
                                    value={attendance[student._id || student.student?._id] || 'present'}
                                    onValueChange={(value) => setAttendance({
                                        ...attendance,
                                        [student._id || student.student?._id]: value
                                    })}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="present">Present</SelectItem>
                                        <SelectItem value="absent">Absent</SelectItem>
                                        <SelectItem value="late">Late</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function BulkAddStudentsForm({ classes, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        classId: '',
        emails: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [results, setResults] = useState(null);
    const [inputValue, setInputValue] = useState('');

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email && emailRegex.test(email.trim());
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        // Check for separators and auto-add emails
        if (value.includes(',') || value.includes(';') || value.includes(' ') || value.includes('\n')) {
            const emails = value
                .split(/[\n,;\s]+/)
                .map(email => email.trim().toLowerCase())
                .filter(email => isValidEmail(email));

            if (emails.length > 0) {
                const uniqueEmails = [...new Set([...formData.emails, ...emails])];
                setFormData({ ...formData, emails: uniqueEmails });
                setInputValue('');
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const email = inputValue.trim().toLowerCase();
            if (isValidEmail(email) && !formData.emails.includes(email)) {
                setFormData({ ...formData, emails: [...formData.emails, email] });
                setInputValue('');
            } else if (!isValidEmail(email)) {
                toast.error('Please enter a valid email address');
            }
        }
    };

    const removeEmail = (emailToRemove) => {
        setFormData({
            ...formData,
            emails: formData.emails.filter(email => email !== emailToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setResults(null);

        try {
            const emailList = formData.emails;

            if (emailList.length === 0) {
                toast.error('Please enter at least one valid email address');
                return;
            }

            const response = await classService.addBulkStudents(formData.classId, emailList);

            if (response.success) {
                setResults(response.data.results);
                toast.success(response.message);

                // If all students were added successfully, close the dialog
                if (response.data.results.notFound.length === 0) {
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                }
            } else {
                toast.error(response.message || 'Failed to add students');
            }
        } catch (error) {
            console.error('Error adding students:', error);
            toast.error(error.message || 'Failed to add students');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-h-[80vh] overflow-hidden flex flex-col">
            <form onSubmit={handleSubmit} className="space-y-5 flex-shrink-0">
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900 dark:text-blue-100">Bulk Student Enrollment</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                        Add multiple students at once by entering their email addresses. The system will automatically find and enroll registered users.
                    </AlertDescription>
                </Alert>

                <div className="space-y-2">
                    <Label htmlFor="class" className="text-base font-medium">Select Class *</Label>
                    <Select
                        value={formData.classId}
                        onValueChange={(value) => setFormData({ ...formData, classId: value })}
                        required
                    >
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Choose a class to add students to" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((cls) => (
                                <SelectItem key={cls._id} value={cls._id}>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{cls.name} ({cls.code})</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="emails" className="text-base font-medium">Student Email Addresses *</Label>
                        {formData.emails.length > 0 && (
                            <Badge variant="secondary" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {formData.emails.length} valid email{formData.emails.length !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>

                    {/* Email Input */}
                    <div className="space-y-3">
                        <Input
                            id="emails"
                            type="email"
                            placeholder="Type or paste email addresses..."
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="h-11"
                        />

                        {/* Email Tags Display */}
                        {formData.emails.length > 0 && (
                            <div className="min-h-[120px] max-h-[200px] overflow-y-auto p-3 border rounded-md bg-muted/30">
                                <div className="flex flex-wrap gap-2">
                                    {formData.emails.map((email, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="flex items-center gap-1 px-2 py-1 text-xs"
                                        >
                                            <Mail className="h-3 w-3" />
                                            <span>{email}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeEmail(email)}
                                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Type or paste email addresses. Press Enter or use commas, spaces, semicolons to separate multiple emails.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="min-w-24">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !formData.classId || formData.emails.length === 0}
                        className="min-w-32 gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4" />
                                Add {formData.emails.length} Student{formData.emails.length !== 1 ? 's' : ''}
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {results && (
                <div className="flex-1 overflow-y-auto border-t pt-4">
                    <div className="space-y-4 pr-2">
                        <h4 className="font-semibold text-lg sticky top-0 bg-background py-2 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Enrollment Results
                        </h4>

                        {results.added.length > 0 && (
                            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-900 dark:text-green-100">
                                    Successfully Added ({results.added.length})
                                </AlertTitle>
                                <AlertDescription>
                                    <div className="mt-2 max-h-32 overflow-y-auto">
                                        <div className="grid grid-cols-1 gap-2">
                                            {results.added.map((student, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                                                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    <span className="truncate" title={`${student.name} (${student.email})`}>
                                                        <strong>{student.name}</strong> <span className="text-green-600 dark:text-green-400">({student.email})</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {results.alreadyEnrolled.length > 0 && (
                            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                <AlertTitle className="text-yellow-900 dark:text-yellow-100">
                                    Already Enrolled ({results.alreadyEnrolled.length})
                                </AlertTitle>
                                <AlertDescription>
                                    <div className="mt-2 max-h-32 overflow-y-auto">
                                        <div className="grid grid-cols-1 gap-2">
                                            {results.alreadyEnrolled.map((student, idx) => (
                                                <div key={idx} className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    <span className="truncate" title={`${student.name} (${student.email})`}>
                                                        <strong>{student.name}</strong> <span className="text-yellow-600 dark:text-yellow-400">({student.email})</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {results.notFound.length > 0 && (
                            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                                <XCircle className="h-4 w-4 text-red-600" />
                                <AlertTitle className="text-red-900 dark:text-red-100">
                                    Not Found or Invalid ({results.notFound.length})
                                </AlertTitle>
                                <AlertDescription>
                                    <div className="mt-2 max-h-32 overflow-y-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-red-700 dark:text-red-300">
                                            {results.notFound.map((email, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <XCircle className="h-3 w-3 flex-shrink-0" />
                                                    <span className="truncate" title={email}>{email}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                                        These emails either don't exist in the system or don't belong to student accounts.
                                    </p>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClassManagement;
