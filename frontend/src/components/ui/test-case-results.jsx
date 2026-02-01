import React from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const TestCaseResults = ({ testResults, isSubmitting, isSubmitResults = false, totalTestCases = 0, isClearing = false }) => {
    const renderRow = (state, index, isHidden = false, testCaseNumber = index + 1) => {
        const base = "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card/60 text-xs sm:text-sm shadow-sm transition-colors hover:border-foreground/30 hover:bg-card";
        if (state === "loading") {
            return (
                <div key={`loading-${index}`} className={`${base} animate-pulse border-dashed border-muted-foreground/50`}>
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <span className="font-semibold">Test Case {testCaseNumber}</span>
                        <span className="text-[11px]">(running...)</span>
                    </div>
                </div>
            );
        }

        if (state === "passed") {
            return (
                <div key={`passed-${index}`} className={`${base} border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/15`}>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span>Test Case {testCaseNumber}</span>
                        {isHidden && <span className="text-[11px] text-orange-500">Hidden</span>}
                    </div>
                </div>
            );
        }

        return (
            <div key={`failed-${index}`} className={`${base} border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-900/15`}>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    <XCircle className="w-3.5 h-3.5" />
                </span>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <span>Test Case {testCaseNumber}</span>
                    {isHidden && <span className="text-[11px] text-orange-500">Hidden</span>}
                </div>
            </div>
        );
    };

    if (!isSubmitResults) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">Run your code to see detailed results here</p>
            </div>
        );
    }

    // Submitting with no results yet OR clearing state
    if ((isSubmitting && (!testResults || testResults.length === 0)) || isClearing) {
        const total = totalTestCases || 8;
        return (
            <ScrollArea className="h-full">
                <div className="p-4 flex flex-wrap gap-5">
                    {Array.from({ length: total }, (_, idx) => renderRow("loading", idx, false, idx + 1))}
                </div>
            </ScrollArea>
        );
    }

    // Submitting with partial results (only if not clearing)
    if (isSubmitting && testResults && testResults.length > 0 && !isClearing) {
        const completed = testResults.length;
        const expected = totalTestCases || completed;
        return (
            <ScrollArea className="h-full">
                <div className="p-4 flex flex-wrap gap-5">
                    {testResults.map((result, idx) =>
                        renderRow(result.passed ? "passed" : "failed", idx, result.isHidden, result.isHidden ? result.testCaseNumber : idx + 1)
                    )}
                    {expected > completed && Array.from({ length: expected - completed }, (_, idx) => renderRow("loading", completed + idx, false, completed + idx + 1))}
                </div>
            </ScrollArea>
        );
    }

    // Finished state
    if (!testResults || testResults.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">Submit your code to see test results</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-4 flex flex-wrap gap-5">
                {testResults.map((result, idx) =>
                    renderRow(result.passed ? "passed" : "failed", idx, result.isHidden, result.isHidden ? result.testCaseNumber : idx + 1)
                )}
            </div>
        </ScrollArea>
    );
};

export default TestCaseResults;