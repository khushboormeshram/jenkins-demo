import { useState } from 'react';
import Navbar from '@/components/navbar';
import ProblemList from '../components/problem-list';
import { SearchInput } from "@/components/ui/search-input";
import { Search, ArrowDownUp, FunnelPlus, ChevronDown, ChevronUp, LayoutGrid, Network, Database, Terminal, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Topic tags data
const topicTags = [
    { name: "Array", count: 2050 },
    { name: "String", count: 876 },
    { name: "Hash Table", count: 698 },
    { name: "Dynamic Programming", count: 589 },
    { name: "Math", count: 567 },
    { name: "Sorting", count: 456 },
    { name: "Greedy", count: 412 },
    { name: "Depth-First Search", count: 356 },
    { name: "Binary Search", count: 312 },
    { name: "Tree", count: 287 },
    { name: "Breadth-First Search", count: 245 },
    { name: "Two Pointers", count: 234 },
    { name: "Stack", count: 198 },
    { name: "Bit Manipulation", count: 176 },
    { name: "Heap", count: 156 },
    { name: "Graph", count: 145 },
    { name: "Linked List", count: 98 },
    { name: "Recursion", count: 87 },
];

// Category filters data
const categoryFilters = [
    { name: "All Topics", icon: LayoutGrid, color: "text-foreground", active: true },
    { name: "Algorithms", icon: Network, color: "text-yellow-500", active: false },
    { name: "Database", icon: Database, color: "text-blue-500", active: false },
    { name: "Shell", icon: Terminal, color: "text-green-500", active: false },
    { name: "Concurrency", icon: Shuffle, color: "text-purple-500", active: false },
];

export default function Practice() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All Topics");
    const [selectedTag, setSelectedTag] = useState("");

    // Show limited tags when collapsed
    const visibleTags = isExpanded ? topicTags : topicTags.slice(0, 8);

    // Handle tag click
    const handleTagClick = (tagName) => {
        if (selectedTag === tagName) {
            setSelectedTag(""); // Deselect if clicking same tag
        } else {
            setSelectedTag(tagName);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Search Section */}
            <div className="max-w-2xl mx-auto mt-6 sm:mt-8 px-3 sm:px-4">
                <div className="flex items-center gap-2">
                    {/* Search input */}
                    <SearchInput
                        placeholder="Search problems..."
                        leftIcon={<Search className="w-4 h-4" />}
                        clearable
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 rounded-md border shadow-sm min-h-[40px] text-sm"
                    />

                    <Button
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-full shrink-0 bg-blue-600 border-blue-600 hover:bg-blue-500"
                        onClick={() => alert("Sort button clicked!")}
                    >
                        <ArrowDownUp size={18} className="text-white" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-full shrink-0 bg-emerald-600 border-emerald-600 hover:bg-emerald-500"
                        onClick={() => alert("Filter button clicked!")}
                    >
                        <FunnelPlus size={18} className="text-white" />
                    </Button>
                </div>
            </div>

            {/* Topic Tags Row */}
            <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
                <div className="flex items-start sm:items-center gap-2">
                    <div className={`flex flex-wrap gap-2 sm:gap-3 flex-1 ${!isExpanded ? 'max-h-7 sm:max-h-8 overflow-hidden' : ''}`}>
                        {visibleTags.map((tag) => (
                            <button
                                key={tag.name}
                                onClick={() => handleTagClick(tag.name)}
                                className={`flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm transition-colors whitespace-nowrap cursor-pointer ${selectedTag === tag.name
                                    ? 'text-primary font-medium'
                                    : 'text-foreground hover:text-primary'
                                    }`}
                            >
                                <span>{tag.name}</span>
                                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${selectedTag === tag.name
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {tag.count}
                                </span>
                            </button>
                        ))}
                        {selectedTag && (
                            <button
                                onClick={() => setSelectedTag("")}
                                className="flex items-center gap-1 text-[10px] sm:text-xs text-red-500 hover:text-red-400 transition-colors"
                            >
                                Clear ✕
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-xs sm:text-sm text-blue-500 hover:text-blue-400 transition-colors shrink-0"
                    >
                        <span className="hidden sm:inline">{isExpanded ? 'Collapse' : 'Expand'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Category Filter Pills */}
            <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-3 sm:mt-4 relative">
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {categoryFilters.map((category) => {
                        const Icon = category.icon;
                        const isActive = activeCategory === category.name;
                        return (
                            <button
                                key={category.name}
                                onClick={() => setActiveCategory(category.name)}
                                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${isActive
                                    ? 'bg-white dark:bg-white text-black shadow-md'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                                    }`}
                            >
                                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-black' : category.color}`} />
                                <span>{category.name}</span>
                            </button>
                        );
                    })}
                </div>
                {/* Fade effect on right side */}
                <div className="absolute right-0 top-0 bottom-2 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>

            {/* Table container */}
            <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-5">
                <ProblemList
                    searchQuery={searchQuery}
                    selectedTag={selectedTag}
                    selectedCategory={activeCategory}
                />
            </div>
        </div>
    );
}
