import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, Award, Target } from "lucide-react";

function PerformanceInsights() {
    const leaderboard = [
        { rank: 1, name: "Alice Johnson", score: 950, solved: 48, accuracy: "96%" },
        { rank: 2, name: "John Doe", score: 920, solved: 46, accuracy: "94%" },
        { rank: 3, name: "Jane Smith", score: 890, solved: 44, accuracy: "92%" },
        { rank: 4, name: "Bob Williams", score: 860, solved: 42, accuracy: "90%" },
        { rank: 5, name: "Charlie Brown", score: 840, solved: 40, accuracy: "88%" },
    ];

    const topicAnalysis = [
        { topic: "Arrays", avgScore: 85, attempts: 120, weakness: false },
        { topic: "Dynamic Programming", avgScore: 62, attempts: 90, weakness: true },
        { topic: "Graphs", avgScore: 78, attempts: 85, weakness: false },
        { topic: "Trees", avgScore: 55, attempts: 75, weakness: true },
        { topic: "Sorting", avgScore: 92, attempts: 130, weakness: false },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Performance Insights</h2>
                    <p className="text-muted-foreground">Analyze student performance and identify areas for improvement</p>
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="cs201">CS201-A</SelectItem>
                        <SelectItem value="cs301">CS301-B</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">78.5%</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+5.2%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
                        <Award className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">#3</div>
                        <p className="text-xs text-muted-foreground">Out of 12 classes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                        <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">86%</div>
                        <p className="text-xs text-muted-foreground">Problems attempted</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Weak Areas</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">Topics need attention</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Contest Leaderboard</CardTitle>
                        <CardDescription>Top performers in recent contests</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">Rank</TableHead>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Solved</TableHead>
                                    <TableHead>Accuracy</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboard.map((entry) => (
                                    <TableRow key={entry.rank}>
                                        <TableCell>
                                            <div className="flex items-center justify-center">
                                                {entry.rank === 1 && (
                                                    <Badge className="bg-yellow-500 hover:bg-yellow-500">🥇</Badge>
                                                )}
                                                {entry.rank === 2 && (
                                                    <Badge className="bg-gray-400 hover:bg-gray-400">🥈</Badge>
                                                )}
                                                {entry.rank === 3 && (
                                                    <Badge className="bg-orange-500 hover:bg-orange-500">🥉</Badge>
                                                )}
                                                {entry.rank > 3 && <span className="font-medium">{entry.rank}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{entry.name}</TableCell>
                                        <TableCell>{entry.score}</TableCell>
                                        <TableCell>{entry.solved}</TableCell>
                                        <TableCell>{entry.accuracy}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Topic-wise Performance</CardTitle>
                        <CardDescription>Identify weak areas and strengths</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topicAnalysis.map((topic, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{topic.topic}</span>
                                            {topic.weakness && (
                                                <Badge variant="destructive" className="text-xs">
                                                    Weak Area
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-sm text-muted-foreground">{topic.attempts} attempts</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                            <div
                                                className={`h-2 rounded-full ${topic.avgScore >= 80
                                                        ? "bg-green-500"
                                                        : topic.avgScore >= 60
                                                            ? "bg-yellow-500"
                                                            : "bg-red-500"
                                                    }`}
                                                style={{ width: `${topic.avgScore}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium w-12 text-right">{topic.avgScore}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Performance Trend</CardTitle>
                    <CardDescription>Average class score over time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Performance chart visualization</p>
                            <p className="text-sm">(Integration with charting library like Recharts)</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Student-wise Performance</CardTitle>
                        <CardDescription>Individual progress tracking</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="john">John Doe</SelectItem>
                                <SelectItem value="jane">Jane Smith</SelectItem>
                                <SelectItem value="alice">Alice Johnson</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Submissions</span>
                                <span className="font-medium">45</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Accepted</span>
                                <span className="font-medium text-green-600">38</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Accuracy</span>
                                <span className="font-medium">84.4%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Avg. Score</span>
                                <span className="font-medium">82/100</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Language Usage</CardTitle>
                        <CardDescription>Preferred programming languages</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { lang: "C++", percent: 45 },
                                { lang: "Python", percent: 30 },
                                { lang: "Java", percent: 20 },
                                { lang: "C", percent: 5 },
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>{item.lang}</span>
                                        <span className="text-muted-foreground">{item.percent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${item.percent}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contest Participation</CardTitle>
                        <CardDescription>Attendance statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold">92%</div>
                                <p className="text-sm text-muted-foreground mt-1">Average participation rate</p>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Contests</span>
                                    <span className="font-medium">8</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Avg. Participants</span>
                                    <span className="font-medium">41/45</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Completion Rate</span>
                                    <span className="font-medium">89%</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default PerformanceInsights;
