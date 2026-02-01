"use client";

import { useEffect, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { problemService } from "@/services/problem.service";

export default function ProblemList({ searchQuery = "", selectedTag = "", selectedCategory = "" }) {
    const id = useId();
    const navigate = useNavigate();

    // Table data
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
    const [sorting, setSorting] = useState([{ id: "problem", desc: false }]);
    const [selectedRows, setSelectedRows] = useState({}); // to track checkbox selection
    const [revisionStars, setRevisionStars] = useState({}); // to track starred revisions
    const [globalFilter, setGlobalFilter] = useState("");

    // Update global filter when searchQuery changes
    useEffect(() => {
        setGlobalFilter(searchQuery);
        // Reset to first page when searching
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [searchQuery]);

    // Fetch problems from backend
    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await problemService.getProblems({
                    search: searchQuery,
                    tags: selectedTag,
                    category: selectedCategory,
                    page: pagination.pageIndex + 1,
                    limit: pagination.pageSize
                });

                if (response.success) {
                    // Transform backend data to match component structure
                    const transformedData = response.data.problems.map(problem => ({
                        problem: problem.title,
                        difficulty: problem.difficulty,
                        id: problem._id,
                        tags: problem.tags || [],
                        category: problem.category
                    }));
                    setData(transformedData);
                    setFilteredData(transformedData);
                }
            } catch (error) {
                console.error('Failed to fetch problems:', error);
                // Fallback to sample data if backend fails
                const sampleData = [
                    { problem: "Binary Search", difficulty: "Easy", id: 1, tags: ["Array", "Binary Search"], category: "Algorithms" },
                    { problem: "Dynamic Programming", difficulty: "Hard", id: 2, tags: ["Dynamic Programming", "Math"], category: "Algorithms" },
                    { problem: "Graph BFS", difficulty: "Medium", id: 3, tags: ["Graph", "Breadth-First Search"], category: "Algorithms" },
                    { problem: "Heap Sort", difficulty: "Medium", id: 4, tags: ["Sorting", "Heap"], category: "Algorithms" },
                    { problem: "Trie Implementation", difficulty: "Hard", id: 5, tags: ["Tree", "String"], category: "Algorithms" },
                    { problem: "Two Pointers", difficulty: "Easy", id: 6, tags: ["Array", "Two Pointers"], category: "Algorithms" },
                    { problem: "Merge Sort", difficulty: "Medium", id: 7, tags: ["Sorting", "Array"], category: "Algorithms" },
                    { problem: "Quick Sort", difficulty: "Medium", id: 8, tags: ["Sorting", "Array"], category: "Algorithms" },
                    { problem: "DFS Graph", difficulty: "Medium", id: 9, tags: ["Graph", "Depth-First Search"], category: "Algorithms" },
                    { problem: "Linked List Cycle", difficulty: "Easy", id: 10, tags: ["Linked List", "Two Pointers"], category: "Algorithms" },
                    { problem: "Palindrome Check", difficulty: "Easy", id: 11, tags: ["String", "Two Pointers"], category: "Algorithms" },
                    { problem: "Stack Implementation", difficulty: "Easy", id: 12, tags: ["Stack"], category: "Algorithms" },
                    { problem: "Queue Implementation", difficulty: "Easy", id: 13, tags: ["Stack", "Queue"], category: "Algorithms" },
                    { problem: "Longest Substring Without Repeating", difficulty: "Medium", id: 14, tags: ["String", "Hash Table", "Sliding Window"], category: "Algorithms" },
                    { problem: "Knapsack Problem", difficulty: "Hard", id: 15, tags: ["Dynamic Programming", "Greedy"], category: "Algorithms" },
                    { problem: "Fibonacci Sequence", difficulty: "Easy", id: 16, tags: ["Math", "Dynamic Programming", "Recursion"], category: "Algorithms" },
                    { problem: "Binary Tree Traversal", difficulty: "Medium", id: 17, tags: ["Tree", "Depth-First Search", "Breadth-First Search"], category: "Algorithms" },
                    { problem: "Graph Dijkstra", difficulty: "Hard", id: 18, tags: ["Graph", "Heap"], category: "Algorithms" },
                    { problem: "Topological Sort", difficulty: "Hard", id: 19, tags: ["Graph", "Depth-First Search"], category: "Algorithms" },
                    { problem: "Minimum Spanning Tree", difficulty: "Hard", id: 20, tags: ["Graph", "Greedy"], category: "Algorithms" },
                    { problem: "Longest Common Subsequence", difficulty: "Medium", id: 21, tags: ["String", "Dynamic Programming"], category: "Algorithms" },
                    { problem: "Reverse Linked List", difficulty: "Easy", id: 22, tags: ["Linked List", "Recursion"], category: "Algorithms" },
                    { problem: "Valid Parentheses", difficulty: "Easy", id: 23, tags: ["String", "Stack"], category: "Algorithms" },
                    { problem: "Binary Search Tree Insertion", difficulty: "Medium", id: 24, tags: ["Tree", "Binary Search"], category: "Algorithms" },
                    { problem: "Graph Cycle Detection", difficulty: "Hard", id: 25, tags: ["Graph", "Depth-First Search"], category: "Algorithms" },
                    { problem: "Sliding Window Maximum", difficulty: "Medium", id: 26, tags: ["Array", "Heap", "Sliding Window"], category: "Algorithms" },
                    { problem: "Counting Inversions", difficulty: "Hard", id: 27, tags: ["Array", "Sorting", "Bit Manipulation"], category: "Algorithms" },
                    { problem: "Longest Palindromic Substring", difficulty: "Medium", id: 28, tags: ["String", "Dynamic Programming"], category: "Algorithms" },
                    { problem: "Matrix Spiral Traversal", difficulty: "Easy", id: 29, tags: ["Array", "Math"], category: "Algorithms" },
                    { problem: "Merge Intervals", difficulty: "Medium", id: 30, tags: ["Array", "Sorting"], category: "Algorithms" },
                    { problem: "Word Ladder", difficulty: "Hard", id: 31, tags: ["String", "Breadth-First Search", "Hash Table"], category: "Algorithms" },
                    { problem: "Climbing Stairs", difficulty: "Easy", id: 32, tags: ["Math", "Dynamic Programming"], category: "Algorithms" },
                    { problem: "Binary Tree Maximum Path Sum", difficulty: "Hard", id: 33, tags: ["Tree", "Dynamic Programming", "Depth-First Search"], category: "Algorithms" },
                    { problem: "Number of Islands", difficulty: "Medium", id: 34, tags: ["Graph", "Depth-First Search", "Breadth-First Search"], category: "Algorithms" },
                    { problem: "LRU Cache Implementation", difficulty: "Hard", id: 35, tags: ["Hash Table", "Linked List"], category: "Algorithms" },
                    { problem: "Coin Change", difficulty: "Medium", id: 36, tags: ["Array", "Dynamic Programming"], category: "Algorithms" },
                    { problem: "Product of Array Except Self", difficulty: "Medium", id: 37, tags: ["Array", "Math"], category: "Algorithms" },
                    { problem: "Remove Nth Node From End", difficulty: "Medium", id: 38, tags: ["Linked List", "Two Pointers"], category: "Algorithms" },
                    { problem: "Design HashMap", difficulty: "Easy", id: 39, tags: ["Hash Table", "Array"], category: "Algorithms" },
                    { problem: "Valid Sudoku", difficulty: "Medium", id: 40, tags: ["Array", "Hash Table", "Math"], category: "Algorithms" },
                    { problem: "House Robber", difficulty: "Medium", id: 41, tags: ["Array", "Dynamic Programming"], category: "Algorithms" },
                    { problem: "Word Search", difficulty: "Hard", id: 42, tags: ["Array", "String", "Depth-First Search"], category: "Algorithms" },
                    { problem: "Maximum Subarray", difficulty: "Easy", id: 43, tags: ["Array", "Dynamic Programming", "Greedy"], category: "Algorithms" },
                    { problem: "Best Time to Buy and Sell Stock", difficulty: "Easy", id: 44, tags: ["Array", "Dynamic Programming"], category: "Algorithms" },
                    { problem: "Rotate Image", difficulty: "Medium", id: 45, tags: ["Array", "Math"], category: "Algorithms" },
                    { problem: "Course Schedule", difficulty: "Medium", id: 46, tags: ["Graph", "Depth-First Search", "Topological Sort"], category: "Algorithms" },
                    { problem: "Word Break", difficulty: "Medium", id: 47, tags: ["String", "Dynamic Programming", "Hash Table"], category: "Algorithms" },
                    { problem: "Trapping Rain Water", difficulty: "Hard", id: 48, tags: ["Array", "Two Pointers", "Stack"], category: "Algorithms" },
                    { problem: "Median of Two Sorted Arrays", difficulty: "Hard", id: 49, tags: ["Array", "Binary Search"], category: "Algorithms" },
                    { problem: "Serialize and Deserialize Binary Tree", difficulty: "Hard", id: 50, tags: ["Tree", "String", "Depth-First Search"], category: "Algorithms" },
                    { problem: "Kth Largest Element in Array", difficulty: "Medium", id: 51, tags: ["Array", "Heap", "Sorting"], category: "Algorithms" },
                    // Database problems
                    { problem: "SQL Join Query", difficulty: "Easy", id: 52, tags: ["SQL"], category: "Database" },
                    { problem: "Second Highest Salary", difficulty: "Medium", id: 53, tags: ["SQL"], category: "Database" },
                    { problem: "Nth Highest Salary", difficulty: "Medium", id: 54, tags: ["SQL"], category: "Database" },
                    { problem: "Rank Scores", difficulty: "Medium", id: 55, tags: ["SQL"], category: "Database" },
                    { problem: "Department Top Three Salaries", difficulty: "Hard", id: 56, tags: ["SQL"], category: "Database" },
                    // Shell problems
                    { problem: "Valid Phone Numbers", difficulty: "Easy", id: 57, tags: ["Shell", "Regex"], category: "Shell" },
                    { problem: "Transpose File", difficulty: "Medium", id: 58, tags: ["Shell"], category: "Shell" },
                    { problem: "Word Frequency", difficulty: "Medium", id: 59, tags: ["Shell"], category: "Shell" },
                    // Concurrency problems
                    { problem: "Print in Order", difficulty: "Easy", id: 60, tags: ["Concurrency"], category: "Concurrency" },
                    { problem: "Print FooBar Alternately", difficulty: "Medium", id: 61, tags: ["Concurrency"], category: "Concurrency" },
                    { problem: "Building H2O", difficulty: "Medium", id: 62, tags: ["Concurrency"], category: "Concurrency" },
                    { problem: "The Dining Philosophers", difficulty: "Hard", id: 63, tags: ["Concurrency"], category: "Concurrency" },
                ];
                setData(sampleData);
                setFilteredData(sampleData);
            }
        };

        fetchProblems();
    }, [searchQuery, selectedTag, selectedCategory, pagination.pageIndex, pagination.pageSize]);

    // Remove the old filter useEffect since backend handles filtering
    useEffect(() => {
        // This is now handled by backend
        // Just use the data as is
        let result = [...data];

        // Filter by tag (client-side for immediate feedback)
        if (selectedTag) {
            result = result.filter(item => item.tags && item.tags.includes(selectedTag));
        }

        setFilteredData(result);
        // Reset to first page when filters change
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [data, selectedTag, selectedCategory]);

    const columns = [
        {
            header: ({ column }) => <div className="pl-4">Problem</div>,
            accessorKey: "problem",
            cell: ({ row }) => <div className="font-medium pl-4">{row.getValue("problem")}</div>,
            size: 200,
            enableSorting: false,
        },
        {
            header: "Difficulty",
            accessorKey: "difficulty",
            cell: ({ row }) => {
                const level = row.getValue("difficulty");
                let colorClass = "";
                if (level === "Easy") colorClass = "bg-green-200 text-green-800";
                else if (level === "Medium") colorClass = "bg-yellow-200 text-yellow-800";
                else if (level === "Hard") colorClass = "bg-red-200 text-red-800";
                return <Badge className={cn(colorClass)}>{level}</Badge>;
            },
            size: 120,
        },
        {
            header: "Revision",
            id: "revision",
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Star
                        className={cn(
                            "cursor-pointer transition-colors",
                            revisionStars[row.original.id] ? "text-yellow-400" : "text-gray-400"
                        )}
                        size={20}
                        onClick={() => {
                            setRevisionStars((prev) => ({
                                ...prev,
                                [row.original.id]: !prev[row.original.id],
                            }));
                        }}
                    />
                </div>
            ),
            size: 30,
            enableSorting: false,
        },
    ];

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        enableSortingRemoval: false,
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        globalFilterFn: (row, columnId, filterValue) => {
            const problemName = row.getValue("problem")?.toString().toLowerCase() || "";
            const difficulty = row.getValue("difficulty")?.toString().toLowerCase() || "";
            const search = filterValue.toLowerCase();
            return problemName.includes(search) || difficulty.includes(search);
        },
        state: { sorting, pagination, globalFilter },
    });

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-background">
                <Table className="table-fixed">
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} style={{ width: `${header.getSize()}px` }} className="h-11">
                                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                            <div
                                                className={cn(
                                                    header.column.getCanSort() && "flex h-full cursor-pointer select-none items-center justify-between gap-2"
                                                )}
                                                onClick={header.column.getToggleSortingHandler()}
                                                onKeyDown={e => {
                                                    if (header.column.getCanSort() && (e.key === "Enter" || e.key === " ")) {
                                                        e.preventDefault();
                                                        header.column.getToggleSortingHandler()?.(e);
                                                    }
                                                }}
                                                tabIndex={header.column.getCanSort() ? 0 : undefined}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{
                                                    asc: <ChevronUp className="shrink-0 opacity-60" size={16} strokeWidth={2} />,
                                                    desc: <ChevronDown className="shrink-0 opacity-60" size={16} strokeWidth={2} />,
                                                }[header.column.getIsSorted()] ?? null}
                                            </div>
                                        ) : (
                                            flexRender(header.column.columnDef.header, header.getContext())
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow
                                    key={row.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => navigate(`/practice/${row.original.id}/workspace`)}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id} onClick={(e) => {
                                            // Prevent navigation when clicking on star
                                            if (cell.column.id === 'revision') {
                                                e.stopPropagation();
                                            }
                                        }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-3">
                    <Label htmlFor={id} className="max-sm:sr-only">
                        Rows per page
                    </Label>
                    <Select
                        value={table.getState().pagination.pageSize.toString()}
                        onValueChange={value => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                            <SelectValue placeholder="Select number of results" />
                        </SelectTrigger>
                        <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                            {[15, 30, 45, 60].map(size => (
                                <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
                    <p aria-live="polite">
                        <span className="text-foreground">
                            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                            {Math.min(
                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                table.getRowCount()
                            )}
                        </span>{" "}of <span className="text-foreground">{table.getRowCount()}</span>
                    </p>
                </div>

                <div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <Button size="icon" variant="outline" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()}>
                                    <ChevronFirst size={16} strokeWidth={2} />
                                </Button>
                            </PaginationItem>
                            <PaginationItem>
                                <Button size="icon" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                    <ChevronLeft size={16} strokeWidth={2} />
                                </Button>
                            </PaginationItem>
                            <PaginationItem>
                                <Button size="icon" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                    <ChevronRight size={16} strokeWidth={2} />
                                </Button>
                            </PaginationItem>
                            <PaginationItem>
                                <Button size="icon" variant="outline" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()}>
                                    <ChevronLast size={16} strokeWidth={2} />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>
        </div>
    );
}

export { ProblemList };
