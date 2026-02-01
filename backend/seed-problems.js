import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Problem from './models/Problem.model.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

// Create a dummy ObjectId for system-created problems
const systemUserId = new mongoose.Types.ObjectId('000000000000000000000000');

const createProblem = (title, desc, diff, tags, examples, testCases) => ({
    title, description: desc, difficulty: diff, category: "Algorithms", tags,
    inputFormat: examples[0].input, outputFormat: examples[0].output,
    constraints: "Standard constraints apply", examples, testCases,
    driverCode: {
        cpp: `class Solution {\npublic:\n    // Write your code here\n};`,
        java: `class Solution {\n    // Write your code here\n}`,
        python: `class Solution:\n    # Write your code here\n    pass`,
        javascript: `function solve() {\n    // Write your code here\n}`
    },
    createdBy: systemUserId,
    isPublished: true
});

const problems = [
    createProblem("Two Sum", "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", "Easy", ["Array", "Hash Table"],
        [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9" }],
        [{ input: "[2,7,11,15]\n9", output: "[0,1]", isHidden: false }]),
    
    createProblem("Reverse String", "Write a function that reverses a string in-place.", "Easy", ["String", "Two Pointers"],
        [{ input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: "Reverse the array" }],
        [{ input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]', isHidden: false }]),
    
    createProblem("Palindrome Number", "Determine if an integer is a palindrome.", "Easy", ["Math"],
        [{ input: "x = 121", output: "true", explanation: "121 reads same forward and backward" }],
        [{ input: "121", output: "true", isHidden: false }]),
    
    createProblem("Maximum Subarray", "Find the subarray with the largest sum.", "Medium", ["Array", "Dynamic Programming"],
        [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has sum 6" }],
        [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", isHidden: false }]),
    
    createProblem("Merge Two Sorted Lists", "Merge two sorted linked lists.", "Easy", ["Linked List"],
        [{ input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]", explanation: "Merge sorted" }],
        [{ input: "[1,2,4]\n[1,3,4]", output: "[1,1,2,3,4,4]", isHidden: false }]),
    
    createProblem("Valid Parentheses", "Determine if the input string has valid parentheses.", "Easy", ["String", "Stack"],
        [{ input: 's = "()"', output: "true", explanation: "Valid parentheses" }],
        [{ input: "()", output: "true", isHidden: false }]),
    
    createProblem("Binary Search", "Implement binary search algorithm.", "Easy", ["Array", "Binary Search"],
        [{ input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists at index 4" }],
        [{ input: "[-1,0,3,5,9,12]\n9", output: "4", isHidden: false }]),
    
    createProblem("Climbing Stairs", "Count ways to climb n stairs taking 1 or 2 steps.", "Easy", ["Dynamic Programming"],
        [{ input: "n = 3", output: "3", explanation: "Three ways: 1+1+1, 1+2, 2+1" }],
        [{ input: "3", output: "3", isHidden: false }]),
    
    createProblem("Best Time to Buy and Sell Stock", "Find max profit from stock prices.", "Easy", ["Array", "Dynamic Programming"],
        [{ input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy at 1, sell at 6" }],
        [{ input: "[7,1,5,3,6,4]", output: "5", isHidden: false }]),
    
    createProblem("Contains Duplicate", "Check if array contains any duplicates.", "Easy", ["Array", "Hash Table"],
        [{ input: "nums = [1,2,3,1]", output: "true", explanation: "1 appears twice" }],
        [{ input: "[1,2,3,1]", output: "true", isHidden: false }]),
    
    createProblem("Missing Number", "Find the missing number in array [0, n].", "Easy", ["Array", "Math"],
        [{ input: "nums = [3,0,1]", output: "2", explanation: "2 is missing" }],
        [{ input: "[3,0,1]", output: "2", isHidden: false }]),
    
    createProblem("Single Number", "Find the element that appears once.", "Easy", ["Array", "Bit Manipulation"],
        [{ input: "nums = [2,2,1]", output: "1", explanation: "1 appears once" }],
        [{ input: "[2,2,1]", output: "1", isHidden: false }]),
    
    createProblem("Reverse Linked List", "Reverse a singly linked list.", "Easy", ["Linked List"],
        [{ input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "Reverse the list" }],
        [{ input: "[1,2,3,4,5]", output: "[5,4,3,2,1]", isHidden: false }]),
    
    createProblem("Linked List Cycle", "Detect if linked list has a cycle.", "Easy", ["Linked List", "Two Pointers"],
        [{ input: "head = [3,2,0,-4], pos = 1", output: "true", explanation: "Cycle exists" }],
        [{ input: "[3,2,0,-4]\n1", output: "true", isHidden: false }]),
    
    createProblem("Intersection of Two Arrays", "Find intersection of two arrays.", "Easy", ["Array", "Hash Table"],
        [{ input: "nums1 = [1,2,2,1], nums2 = [2,2]", output: "[2]", explanation: "2 is common" }],
        [{ input: "[1,2,2,1]\n[2,2]", output: "[2]", isHidden: false }]),
    
    createProblem("Move Zeroes", "Move all zeros to end maintaining order.", "Easy", ["Array", "Two Pointers"],
        [{ input: "nums = [0,1,0,3,12]", output: "[1,3,12,0,0]", explanation: "Move zeros to end" }],
        [{ input: "[0,1,0,3,12]", output: "[1,3,12,0,0]", isHidden: false }]),
    
    createProblem("Fizz Buzz", "Return array with Fizz, Buzz, FizzBuzz rules.", "Easy", ["Math", "String"],
        [{ input: "n = 15", output: '["1","2","Fizz","4","Buzz",...]', explanation: "Apply FizzBuzz rules" }],
        [{ input: "15", output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]', isHidden: false }]),
    
    createProblem("Power of Two", "Check if n is a power of two.", "Easy", ["Math", "Bit Manipulation"],
        [{ input: "n = 16", output: "true", explanation: "2^4 = 16" }],
        [{ input: "16", output: "true", isHidden: false }]),
    
    createProblem("Valid Anagram", "Check if two strings are anagrams.", "Easy", ["String", "Hash Table"],
        [{ input: 's = "anagram", t = "nagaram"', output: "true", explanation: "Same letters" }],
        [{ input: '"anagram"\n"nagaram"', output: "true", isHidden: false }]),
    
    createProblem("First Unique Character", "Find first non-repeating character index.", "Easy", ["String", "Hash Table"],
        [{ input: 's = "leetcode"', output: "0", explanation: "l is first unique" }],
        [{ input: '"leetcode"', output: "0", isHidden: false }]),
    
    // Medium Problems
    createProblem("3Sum", "Find all unique triplets that sum to zero.", "Medium", ["Array", "Two Pointers", "Sorting"],
        [{ input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "Unique triplets that sum to 0" }],
        [{ input: "[-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", isHidden: false }]),
    
    createProblem("Longest Substring Without Repeating", "Find length of longest substring without repeating characters.", "Medium", ["String", "Hash Table", "Sliding Window"],
        [{ input: 's = "abcabcbb"', output: "3", explanation: '"abc" is the longest' }],
        [{ input: '"abcabcbb"', output: "3", isHidden: false }]),
    
    createProblem("Container With Most Water", "Find two lines that form container with most water.", "Medium", ["Array", "Two Pointers"],
        [{ input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "Max area between lines" }],
        [{ input: "[1,8,6,2,5,4,8,3,7]", output: "49", isHidden: false }]),
    
    createProblem("Group Anagrams", "Group strings that are anagrams together.", "Medium", ["String", "Hash Table", "Sorting"],
        [{ input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: "Group anagrams" }],
        [{ input: '["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', isHidden: false }]),
    
    createProblem("Product of Array Except Self", "Return array where each element is product of all others.", "Medium", ["Array", "Prefix Sum"],
        [{ input: "nums = [1,2,3,4]", output: "[24,12,8,6]", explanation: "Product except self" }],
        [{ input: "[1,2,3,4]", output: "[24,12,8,6]", isHidden: false }]),
    
    createProblem("Longest Palindromic Substring", "Find the longest palindromic substring.", "Medium", ["String", "Dynamic Programming"],
        [{ input: 's = "babad"', output: '"bab"', explanation: '"aba" is also valid' }],
        [{ input: '"babad"', output: '"bab"', isHidden: false }]),
    
    createProblem("Coin Change", "Find minimum coins needed to make amount.", "Medium", ["Dynamic Programming", "Array"],
        [{ input: "coins = [1,2,5], amount = 11", output: "3", explanation: "11 = 5 + 5 + 1" }],
        [{ input: "[1,2,5]\n11", output: "3", isHidden: false }]),
    
    createProblem("Number of Islands", "Count number of islands in 2D grid.", "Medium", ["Array", "DFS", "BFS", "Matrix"],
        [{ input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: "2", explanation: "Two separate islands" }],
        [{ input: '[["1","1","0"],["1","1","0"],["0","0","1"]]', output: "2", isHidden: false }]),
    
    createProblem("Rotate Image", "Rotate n x n matrix by 90 degrees clockwise.", "Medium", ["Array", "Matrix"],
        [{ input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]", explanation: "Rotate 90 degrees" }],
        [{ input: "[[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]", isHidden: false }]),
    
    createProblem("Search in Rotated Sorted Array", "Search target in rotated sorted array.", "Medium", ["Array", "Binary Search"],
        [{ input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4", explanation: "0 is at index 4" }],
        [{ input: "[4,5,6,7,0,1,2]\n0", output: "4", isHidden: false }]),
    
    // Hard Problems
    createProblem("Median of Two Sorted Arrays", "Find median of two sorted arrays.", "Hard", ["Array", "Binary Search", "Divide and Conquer"],
        [{ input: "nums1 = [1,3], nums2 = [2]", output: "2.0", explanation: "Merged array is [1,2,3], median is 2" }],
        [{ input: "[1,3]\n[2]", output: "2.0", isHidden: false }]),
    
    createProblem("Trapping Rain Water", "Calculate how much water can be trapped after raining.", "Hard", ["Array", "Two Pointers", "Dynamic Programming"],
        [{ input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "6 units of water trapped" }],
        [{ input: "[0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", isHidden: false }]),
    
    createProblem("Merge k Sorted Lists", "Merge k sorted linked lists into one sorted list.", "Hard", ["Linked List", "Divide and Conquer", "Heap"],
        [{ input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]", explanation: "Merge all lists" }],
        [{ input: "[[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]", isHidden: false }]),
    
    createProblem("Regular Expression Matching", "Implement regular expression matching with '.' and '*'.", "Hard", ["String", "Dynamic Programming", "Recursion"],
        [{ input: 's = "aa", p = "a*"', output: "true", explanation: "'*' means zero or more of preceding element" }],
        [{ input: '"aa"\n"a*"', output: "true", isHidden: false }]),
    
    createProblem("Longest Valid Parentheses", "Find length of longest valid parentheses substring.", "Hard", ["String", "Dynamic Programming", "Stack"],
        [{ input: 's = "(()"', output: "2", explanation: '"()" is the longest valid' }],
        [{ input: '"(()"', output: "2", isHidden: false }]),
    
    createProblem("Word Ladder", "Find shortest transformation sequence from beginWord to endWord.", "Hard", ["Hash Table", "String", "BFS"],
        [{ input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5", explanation: '"hit" -> "hot" -> "dot" -> "dog" -> "cog"' }],
        [{ input: '"hit"\n"cog"\n["hot","dot","dog","lot","log","cog"]', output: "5", isHidden: false }]),
    
    createProblem("Minimum Window Substring", "Find minimum window substring containing all characters.", "Hard", ["Hash Table", "String", "Sliding Window"],
        [{ input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: "Minimum window containing A, B, C" }],
        [{ input: '"ADOBECODEBANC"\n"ABC"', output: '"BANC"', isHidden: false }]),
    
    createProblem("N-Queens", "Place n queens on n×n chessboard so no two attack each other.", "Hard", ["Array", "Backtracking"],
        [{ input: "n = 4", output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]', explanation: "Two solutions for 4-queens" }],
        [{ input: "4", output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]', isHidden: false }]),
    
    createProblem("Sudoku Solver", "Write a program to solve a Sudoku puzzle.", "Hard", ["Array", "Backtracking", "Matrix"],
        [{ input: 'board = [["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."]]', output: "Solved board", explanation: "Fill empty cells" }],
        [{ input: '[["5","3",".",".","7",".",".",".","."],["6",".",".","1","9","5",".",".","."]]', output: "Solved", isHidden: false }]),
    
    createProblem("Wildcard Matching", "Implement wildcard pattern matching with '?' and '*'.", "Hard", ["String", "Dynamic Programming", "Greedy"],
        [{ input: 's = "aa", p = "*"', output: "true", explanation: "'*' matches any sequence" }],
        [{ input: '"aa"\n"*"', output: "true", isHidden: false }])
];

async function seedProblems() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const result = await Problem.insertMany(problems);
        console.log(`Successfully seeded ${result.length} problems!`);
        
        mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding problems:', error);
        process.exit(1);
    }
}

seedProblems();
