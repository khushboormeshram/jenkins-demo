"use client";

import React, { useState } from "react";
import CodeEditor from "./code-editor";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCodeExecution } from "@/hooks/use-code-execution";
import Navbar from "@/components/navbar";
import "@/App.css";

function Compiler() {
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
        <div className="flex flex-col w-screen h-screen overflow-hidden">
            <Navbar />
            {isMobile ? (
                // Mobile: stack into three rows (editor, input, output)
                <ResizablePanelGroup direction="vertical" className="w-full h-[calc(100vh-64px)] gap-4 overflow-x-hidden">
                    <ResizablePanel className="min-h-[40vh] p-4">
                        <CodeEditor onCodeChange={handleCodeChange} />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel className="flex flex-col min-h-[20vh] gap-2 p-4">
                        <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-full">
                            <div className="flex items-center justify-between border-b bg-muted px-2 h-12">
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
                                    style={{ fontFamily: "Fira Mono, monospace", fontSize: 15 }}
                                />
                            </div>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel className="flex flex-col min-h-[20vh] gap-2 p-4">
                        <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-full">
                            <div className="flex items-center justify-between border-b bg-muted px-2 h-12">
                                <span className="text-sm font-medium">Output</span>
                                {(executionTime || memory) && (
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        {executionTime && <span>Time: {executionTime}s</span>}
                                        {memory && <span>Memory: {memory} KB</span>}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 p-2 overflow-hidden">
                                <div
                                    className="w-full h-full text-foreground font-mono whitespace-pre-wrap"
                                    style={{ fontFamily: "Fira Mono, monospace", fontSize: 15 }}
                                >
                                    {output || <span className="text-muted-foreground">No output yet.</span>}
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            ) : (
                // Desktop/tablet: editor left, input+output right
                <ResizablePanelGroup direction="horizontal" className="w-full h-[calc(100vh-64px)] gap-2 overflow-x-hidden">
                    {/* Code Editor */}
                    <ResizablePanel className="flex-1 min-w-0 p-4">
                        <CodeEditor onCodeChange={handleCodeChange} />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    {/* Right Panel: Input and Output */}
                    <ResizablePanel className="w-full md:w-[25%] min-w-0 flex flex-col gap-3 p-3">
                        <ResizablePanelGroup direction="vertical" className="h-full gap-3">
                            {/* Input Section */}
                            <ResizablePanel className="flex flex-col h-[30%] min-h-[10px] gap-2">
                                <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-full">
                                    <div className="flex items-center justify-between border-b bg-muted px-2 h-12">
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
                                    <div className="flex-1 p-2">
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Enter custom input here..."
                                            className="w-full h-full min-h-0 rounded-md border-none outline-none bg-transparent text-foreground resize-none focus:outline-none"
                                            style={{ fontFamily: "Fira Mono, monospace", fontSize: 15 }}
                                        />
                                    </div>
                                </div>
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            {/* Output Section */}
                            <ResizablePanel className="flex flex-col h-[70%] gap-2">
                                <div className="border rounded-lg shadow bg-card overflow-hidden flex flex-col h-full">
                                    <div className="flex items-center justify-between border-b bg-muted px-2 h-12">
                                        <span className="text-sm font-medium">Output</span>
                                        {(executionTime || memory) && (
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                {executionTime && <span>Time: {executionTime}s</span>}
                                                {memory && <span>Memory: {memory} KB</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-2">
                                        <div
                                            className="w-full h-full text-foreground font-mono whitespace-pre-wrap"
                                            style={{ fontFamily: "Fira Mono, monospace", fontSize: 15 }}
                                        >
                                            {output || <span className="text-muted-foreground">No output yet.</span>}
                                        </div>
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
        </div>
    );
}

export default Compiler;
