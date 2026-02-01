import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Megaphone, MessageSquare, Bell, Send, Eye, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function Communications() {
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: "Mid-Term Results Published",
            message: "Results for the mid-term assessment are now available...",
            type: "results",
            date: "2025-12-02",
            class: "All Classes",
            views: 42,
        },
        {
            id: 2,
            title: "Upcoming Contest: Week 5 Practice",
            message: "The weekly practice contest will start on Friday...",
            type: "announcement",
            date: "2025-12-01",
            class: "CS201-A",
            views: 38,
        },
    ]);

    const [clarifications, setClarifications] = useState([
        {
            id: 1,
            contest: "Mid-Term Assessment",
            student: "John Doe",
            question: "Can we use STL in Problem 2?",
            answer: "Yes, you can use any standard library functions.",
            status: "answered",
            timestamp: "2025-12-02 14:30",
        },
        {
            id: 2,
            contest: "Weekly Practice",
            student: "Jane Smith",
            question: "What is the time limit for Problem 1?",
            answer: null,
            status: "pending",
            timestamp: "2025-12-02 14:25",
        },
    ]);

    const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Communications</h2>
                    <p className="text-muted-foreground">Announcements, clarifications, and notifications</p>
                </div>
                <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Megaphone className="w-4 h-4" />
                            New Announcement
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Announcement</DialogTitle>
                            <DialogDescription>Send announcements or publish results to students</DialogDescription>
                        </DialogHeader>
                        <CreateAnnouncementForm onClose={() => setIsAnnouncementDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="announcements" className="w-full">
                <TabsList>
                    <TabsTrigger value="announcements">
                        <Megaphone className="w-4 h-4 mr-2" />
                        Announcements
                    </TabsTrigger>
                    <TabsTrigger value="clarifications">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Clarifications
                        <Badge className="ml-2" variant="destructive">
                            {clarifications.filter((c) => c.status === "pending").length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="announcements" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Announcements</CardTitle>
                            <CardDescription>View and manage announcements sent to students</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {announcements.map((announcement) => (
                                    <Card key={announcement.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                                                        <Badge
                                                            variant={
                                                                announcement.type === "results" ? "default" : "secondary"
                                                            }
                                                        >
                                                            {announcement.type}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription className="mt-1">
                                                        {announcement.date} • {announcement.class}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="ghost">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{announcement.message}</p>
                                            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3 h-3" />
                                                    {announcement.views} views
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="clarifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contest Clarifications</CardTitle>
                            <CardDescription>Answer student queries during contests</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contest</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Question</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clarifications.map((clarification) => (
                                        <TableRow key={clarification.id}>
                                            <TableCell className="font-medium">{clarification.contest}</TableCell>
                                            <TableCell>{clarification.student}</TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {clarification.question}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        clarification.status === "answered" ? "default" : "destructive"
                                                    }
                                                >
                                                    {clarification.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {clarification.timestamp}
                                            </TableCell>
                                            <TableCell>
                                                <AnswerClarificationDialog clarification={clarification} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>Configure automated notifications for students</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Contest Start Reminder</p>
                                        <p className="text-sm text-muted-foreground">
                                            Notify students 1 hour before contest starts
                                        </p>
                                    </div>
                                    <Badge variant="default">Enabled</Badge>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Result Publication</p>
                                        <p className="text-sm text-muted-foreground">
                                            Notify students when results are published
                                        </p>
                                    </div>
                                    <Badge variant="default">Enabled</Badge>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Practice Set Assignment</p>
                                        <p className="text-sm text-muted-foreground">
                                            Notify when new practice problems are assigned
                                        </p>
                                    </div>
                                    <Badge variant="default">Enabled</Badge>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Submission Feedback</p>
                                        <p className="text-sm text-muted-foreground">
                                            Notify students when manual scoring is updated
                                        </p>
                                    </div>
                                    <Badge variant="secondary">Disabled</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function CreateAnnouncementForm({ onClose }) {
    return (
        <form className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="announcementType">Type</Label>
                <Select defaultValue="announcement">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="announcement">General Announcement</SelectItem>
                        <SelectItem value="results">Results Publication</SelectItem>
                        <SelectItem value="reminder">Contest Reminder</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="targetClass">Target Audience</Label>
                <Select defaultValue="all">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="cs201">CS201-A</SelectItem>
                        <SelectItem value="cs301">CS301-B</SelectItem>
                        <SelectItem value="cs401">CS401</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter announcement title" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Enter announcement message..." rows={6} />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" className="gap-2">
                    <Send className="w-4 h-4" />
                    Send Announcement
                </Button>
            </div>
        </form>
    );
}

function AnswerClarificationDialog({ clarification }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    {clarification.status === "pending" ? "Answer" : "View"}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Clarification Request</DialogTitle>
                    <DialogDescription>
                        {clarification.contest} • {clarification.student}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Question</Label>
                        <p className="text-sm p-3 bg-muted rounded-md">{clarification.question}</p>
                    </div>
                    {clarification.status === "pending" ? (
                        <div className="space-y-2">
                            <Label htmlFor="answer">Your Answer</Label>
                            <Textarea id="answer" placeholder="Type your answer here..." rows={4} />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>Answer</Label>
                            <p className="text-sm p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                                {clarification.answer}
                            </p>
                        </div>
                    )}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        {clarification.status === "pending" && (
                            <Button className="gap-2">
                                <Send className="w-4 h-4" />
                                Send Answer
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default Communications;
