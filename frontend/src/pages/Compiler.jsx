"use client";

import React, { useState } from "react";
import CodeEditor from "@/components/editor/code-editor";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCodeExecution } from "@/hooks/use-code-execution";
import Navbar from "@/components/navbar";
import "@/App.css";

function CompilerPage() {
    const [input, setInput] = useState("");
    const isMobile = useIsMobile();
    const {
        output,
        isRunning,
        executionTime,
        memory,
        handleCodeChange,
        executeCode,
    } = useCodeExecution();

    const handleRunClick = () => {
        executeCode(input);
    };

    return (
        <div className="flex flex-col w-screen h-screen overflow-hidden bg-background">
            <Navbar />
            {isMobile ? (
                /* Mobile Layout - Scrollable vertical stack */
                <div className="flex-1 flex flex-col p-2 space-y-2 overflow-auto pb-4">
                    {/* Code Editor Section */}
                    <div className="min-h-[50vh] shrink-0">
                        <CodeEditor onCodeChange={handleCodeChange} />
                    </div>

                    {/* Custom Input Section */}
                    <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-[200px] shrink-0">
                        <div className="flex items-center justify-between border-b bg-muted px-3 min-h-[44px] h-11 shrink-0">
                            <span className="text-sm font-medium">Custom Input</span>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={handleRunClick}
                                disabled={isRunning}
                            >
                                {isRunning ? "Running..." : "Run"}
                            </Button>
                        </div>
                        <div className="flex-1 p-2 overflow-hidden">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter custom input here..."
                                className="w-full h-full min-h-0 rounded-md border-none outline-none bg-transparent text-foreground text-sm resize-none focus:outline-none"
                                style={{ fontFamily: "Fira Mono, monospace" }}
                            />
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-[200px] shrink-0">
                        <div className="flex items-center justify-between border-b bg-muted px-3 min-h-[44px] h-11 shrink-0">
                            <span className="text-sm font-medium">Output</span>
                            {(executionTime || memory) && (
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {executionTime && <span>Time: {executionTime}s</span>}
                                    {memory && <span>Memory: {memory} KB</span>}
                                </div>
                            )}
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-2">
                                <div
                                    className="w-full text-foreground text-sm whitespace-pre-wrap break-all"
                                    style={{ fontFamily: "Fira Mono, monospace" }}
                                >
                                    {output || <span className="text-muted-foreground">No output yet.</span>}
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            ) : (
                /* Desktop Layout - Resizable horizontal panels */
                <ResizablePanelGroup direction="horizontal" className="flex-1 gap-2 p-2">
                    {/* Code Editor Panel */}
                    <ResizablePanel defaultSize={70} minSize={40}>
                        <div className="h-full">
                            <CodeEditor onCodeChange={handleCodeChange} />
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Input/Output Panel */}
                    <ResizablePanel defaultSize={30} minSize={20}>
                        <ResizablePanelGroup direction="vertical" className="h-full gap-2">
                            {/* Custom Input */}
                            <ResizablePanel defaultSize={35} minSize={15}>
                                <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-full">
                                    <div className="flex items-center justify-between border-b bg-muted px-3 min-h-[48px] h-12 shrink-0">
                                        <span className="text-sm font-medium">Custom Input</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleRunClick}
                                            disabled={isRunning}
                                        >
                                            {isRunning ? "Running..." : "Run"}
                                        </Button>
                                    </div>
                                    <div className="flex-1 p-2 overflow-hidden">
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Enter custom input here..."
                                            className="w-full h-full min-h-0 rounded-md border-none outline-none bg-transparent text-foreground resize-none focus:outline-none"
                                            style={{ fontFamily: "Fira Mono, monospace", fontSize: 14 }}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>

                            <ResizableHandle withHandle />

                            {/* Output */}
                            <ResizablePanel defaultSize={65} minSize={20}>
                                <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-full">
                                    <div className="flex items-center justify-between border-b bg-muted px-3 min-h-[48px] h-12 shrink-0">
                                        <span className="text-sm font-medium">Output</span>
                                        {(executionTime || memory) && (
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                {executionTime && <span>Time: {executionTime}s</span>}
                                                {memory && <span>Memory: {memory} KB</span>}
                                            </div>
                                        )}
                                    </div>
                                    <ScrollArea className="flex-1">
                                        <div className="p-3">
                                            <div
                                                className="w-full text-foreground whitespace-pre-wrap"
                                                style={{ fontFamily: "Fira Mono, monospace", fontSize: 14 }}
                                            >
                                                {output || <span className="text-muted-foreground">No output yet.</span>}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
        </div>
    );
}

export default CompilerPage;