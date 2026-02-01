"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as monaco from "monaco-editor";
import { Button } from "@/components/ui/button";
import { ChevronDown, RefreshCcw, Download, Wand2, Code2, Settings, CheckCircle } from 'lucide-react';
import { toast } from "sonner";

const editorThemes = [
    // Dark Themes
    { key: "vs-dark", label: "VS Code Dark" },
    { key: "hc-black", label: "High Contrast Dark" },
    { key: "monokai", label: "Monokai" },
    { key: "dracula", label: "Dracula" },
    { key: "one-dark-pro", label: "One Dark Pro" },
    { key: "github-dark", label: "GitHub Dark" },
    { key: "night-owl", label: "Night Owl" },
    { key: "tokyo-night", label: "Tokyo Night" },
    // Light Themes
    { key: "vs", label: "VS Code Light" },
    { key: "hc-light", label: "High Contrast Light" },
    { key: "github-light", label: "GitHub Light" },
    { key: "solarized-light", label: "Solarized Light" },
];

// Define custom themes
const defineCustomThemes = () => {
    monaco.editor.defineTheme('monokai', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '88846f', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'f92672' },
            { token: 'string', foreground: 'e6db74' },
            { token: 'number', foreground: 'ae81ff' },
            { token: 'type', foreground: '66d9ef', fontStyle: 'italic' },
            { token: 'function', foreground: 'a6e22e' },
            { token: 'variable', foreground: 'f8f8f2' },
        ],
        colors: {
            'editor.background': '#272822',
            'editor.foreground': '#f8f8f2',
            'editorCursor.foreground': '#f8f8f0',
            'editor.lineHighlightBackground': '#3e3d32',
            'editor.selectionBackground': '#49483e',
        }
    });

    monaco.editor.defineTheme('dracula', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'ff79c6' },
            { token: 'string', foreground: 'f1fa8c' },
            { token: 'number', foreground: 'bd93f9' },
            { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
            { token: 'function', foreground: '50fa7b' },
            { token: 'variable', foreground: 'f8f8f2' },
        ],
        colors: {
            'editor.background': '#282a36',
            'editor.foreground': '#f8f8f2',
            'editorCursor.foreground': '#f8f8f0',
            'editor.lineHighlightBackground': '#44475a',
            'editor.selectionBackground': '#44475a',
        }
    });

    monaco.editor.defineTheme('one-dark-pro', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'c678dd' },
            { token: 'string', foreground: '98c379' },
            { token: 'number', foreground: 'd19a66' },
            { token: 'type', foreground: 'e5c07b' },
            { token: 'function', foreground: '61afef' },
            { token: 'variable', foreground: 'e06c75' },
        ],
        colors: {
            'editor.background': '#282c34',
            'editor.foreground': '#abb2bf',
            'editorCursor.foreground': '#528bff',
            'editor.lineHighlightBackground': '#2c313c',
            'editor.selectionBackground': '#3e4451',
        }
    });

    monaco.editor.defineTheme('github-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'ff7b72' },
            { token: 'string', foreground: 'a5d6ff' },
            { token: 'number', foreground: '79c0ff' },
            { token: 'type', foreground: 'ffa657' },
            { token: 'function', foreground: 'd2a8ff' },
            { token: 'variable', foreground: 'ffa657' },
        ],
        colors: {
            'editor.background': '#0d1117',
            'editor.foreground': '#c9d1d9',
            'editorCursor.foreground': '#c9d1d9',
            'editor.lineHighlightBackground': '#161b22',
            'editor.selectionBackground': '#264f78',
        }
    });

    monaco.editor.defineTheme('night-owl', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '637777', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'c792ea' },
            { token: 'string', foreground: 'ecc48d' },
            { token: 'number', foreground: 'f78c6c' },
            { token: 'type', foreground: 'ffcb8b' },
            { token: 'function', foreground: '82aaff' },
            { token: 'variable', foreground: 'addb67' },
        ],
        colors: {
            'editor.background': '#011627',
            'editor.foreground': '#d6deeb',
            'editorCursor.foreground': '#80a4c2',
            'editor.lineHighlightBackground': '#0b2942',
            'editor.selectionBackground': '#1d3b53',
        }
    });

    monaco.editor.defineTheme('tokyo-night', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '565f89', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'bb9af7' },
            { token: 'string', foreground: '9ece6a' },
            { token: 'number', foreground: 'ff9e64' },
            { token: 'type', foreground: '2ac3de' },
            { token: 'function', foreground: '7aa2f7' },
            { token: 'variable', foreground: 'c0caf5' },
        ],
        colors: {
            'editor.background': '#1a1b26',
            'editor.foreground': '#a9b1d6',
            'editorCursor.foreground': '#c0caf5',
            'editor.lineHighlightBackground': '#24283b',
            'editor.selectionBackground': '#33467c',
        }
    });

    monaco.editor.defineTheme('github-light', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'd73a49' },
            { token: 'string', foreground: '032f62' },
            { token: 'number', foreground: '005cc5' },
            { token: 'type', foreground: '6f42c1' },
            { token: 'function', foreground: '6f42c1' },
            { token: 'variable', foreground: 'e36209' },
        ],
        colors: {
            'editor.background': '#ffffff',
            'editor.foreground': '#24292e',
            'editorCursor.foreground': '#24292e',
            'editor.lineHighlightBackground': '#f6f8fa',
            'editor.selectionBackground': '#c8c8fa',
        }
    });

    monaco.editor.defineTheme('solarized-light', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '93a1a1', fontStyle: 'italic' },
            { token: 'keyword', foreground: '859900' },
            { token: 'string', foreground: '2aa198' },
            { token: 'number', foreground: 'd33682' },
            { token: 'type', foreground: 'b58900' },
            { token: 'function', foreground: '268bd2' },
            { token: 'variable', foreground: 'cb4b16' },
        ],
        colors: {
            'editor.background': '#fdf6e3',
            'editor.foreground': '#657b83',
            'editorCursor.foreground': '#657b83',
            'editor.lineHighlightBackground': '#eee8d5',
            'editor.selectionBackground': '#eee8d5',
        }
    });
};

const LANGUAGE_TEMPLATES = {
    cpp: `#include <bits/stdc++.h>
using namespace std;

string solve() {
    // write code
    return "Hello World";
}

int main() {
    cout << solve();
    return 0;
}`,
    java: `public class Main {
    public static String solve() {
        // write code
        return "Hello World";
    }
    public static void main(String[] args) {
        System.out.println(solve());
    }
}`,
    python: `def solve():
    # write code
    return "Hello World"

print(solve())`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char* solve() {
    // write code
    return "Hello World";
}

int main() {
    printf("%s", solve());
    return 0;
}`,
    nasm: `section .data
    msg db "Hello World", 0

section .text
    global _start

_start:
    ; write code
    mov eax, 4          ; sys_write
    mov ebx, 1          ; stdout
    mov ecx, msg        ; message
    mov edx, 11         ; length
    int 0x80

    mov eax, 1          ; sys_exit
    xor ebx, ebx
    int 0x80`,
    sql: `-- Write your SQL query here
SELECT 'Hello World' AS message;`,
    "shell script": `#!/bin/bash

solve() {
    # write code
    echo "Hello World"
}

solve`,
};

const languageOptions = [
    { key: "python", label: "Python" },
    { key: "cpp", label: "C++" },
    { key: "java", label: "Java" },
    { key: "c", label: "C" },
    { key: "nasm", label: "NASM" },
    { key: "sql", label: "SQL" },
    { key: "shell script", label: "Shell Script" },
];

function CodeEditor({ onCodeChange, problemId, driverCode = {}, allowedLanguages = null }) {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const settingsRef = useRef(null);
    const languageRef = useRef(null);

    const [selectedKeys, setSelectedKeys] = useState(new Set(["cpp"]));
    const selectedLanguage = useMemo(() => Array.from(selectedKeys)[0], [selectedKeys]);
    const [language, setLanguage] = useState(selectedLanguage);
    const [theme, setTheme] = useState("vs-dark");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);

    // Filter language options based on allowed languages for contests
    const filteredLanguageOptions = allowedLanguages
        ? languageOptions.filter(lang => allowedLanguages.includes(lang.key))
        : languageOptions;

    // Ensure selected language is allowed, otherwise switch to first allowed language
    useEffect(() => {
        if (allowedLanguages && !allowedLanguages.includes(selectedLanguage) && filteredLanguageOptions.length > 0) {
            setSelectedKeys(new Set([filteredLanguageOptions[0].key]));
        } else {
            setLanguage(selectedLanguage);
        }
    }, [selectedLanguage, allowedLanguages, filteredLanguageOptions]);

    // Close settings dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
            if (languageRef.current && !languageRef.current.contains(event.target)) {
                setIsLanguageOpen(false);
            }
        };

        if (isSettingsOpen || isLanguageOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isSettingsOpen, isLanguageOpen]);

    // Expose code and language to parent whenever they change
    useEffect(() => {
        if (monacoRef.current && onCodeChange) {
            const updateParent = () => {
                const code = monacoRef.current.getValue();
                // Only call onCodeChange if there's actual code
                if (code && code.trim()) {
                    onCodeChange(code, language);
                }
            };

            // Listen for content changes
            const disposable = monacoRef.current.onDidChangeModelContent(updateParent);

            // Call once on setup with current code
            updateParent();

            return () => {
                disposable.dispose();
            };
        }
    }, [language, onCodeChange]);

    // Load saved code from localStorage
    const getSavedCode = useCallback((lang) => {
        if (problemId) {
            const saved = localStorage.getItem(`code_${problemId}_${lang}`);
            console.log('Getting code for:', { problemId, lang, hasSaved: !!saved, hasDriverCode: !!(driverCode && driverCode[lang]) });
            // If there's saved code, use it
            if (saved) {
                console.log('Using saved code');
                return saved;
            }
            // Otherwise, use driver code if available
            if (driverCode && driverCode[lang]) {
                console.log('Using driver code:', driverCode[lang].substring(0, 50));
                return driverCode[lang];
            }
            // Fall back to template
            console.log('Using template');
            return LANGUAGE_TEMPLATES[lang];
        }
        return LANGUAGE_TEMPLATES[lang];
    }, [problemId, driverCode]);

    // Helper to get initial code synchronously (for initialization)
    const getInitialCode = useCallback((lang) => {
        if (problemId) {
            const saved = localStorage.getItem(`code_${problemId}_${lang}`);
            if (saved) return saved;
            if (driverCode && driverCode[lang]) return driverCode[lang];
        }
        return LANGUAGE_TEMPLATES[lang];
    }, [problemId, driverCode]);

    // Save code to localStorage
    const saveCode = useCallback(() => {
        if (monacoRef.current && problemId) {
            const code = monacoRef.current.getValue();
            localStorage.setItem(`code_${problemId}_${language}`, code);
            toast.success("Your code is saved to local", {
                icon: <CheckCircle className="h-4 w-4" style={{ color: '#22c55e' }} />,
                position: "top-center",
                duration: 2000,
                className: "py-2",
            });
        }
    }, [problemId, language]);

    // Define custom themes on mount
    useEffect(() => {
        defineCustomThemes();
    }, []);

    // Initialize Monaco - only once on mount
    useEffect(() => {
        // Capture initial language value  
        const initialLanguage = language;
        const initialCode = getInitialCode(initialLanguage);

        if (!monacoRef.current) {
            monacoRef.current = monaco.editor.create(editorRef.current, {
                value: initialCode,
                language: initialLanguage,
                theme: "vs-dark",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                fontSize: 14,
                minimap: { enabled: false },
                padding: { bottom: 10 },
                fontFamily: "Fira Code, JetBrains Mono, Consolas, monospace",
                fontLigatures: true,
                lineNumbers: "on",
                lineNumbersMinChars: 4,
                glyphMargin: false,
            });
        }

        const handleResize = () => {
            try {
                monacoRef.current?.layout();
            } catch { }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (monacoRef.current) {
                monacoRef.current.dispose();
                monacoRef.current = null;
            }
        };
    }, []);
    useEffect(() => {
        if (!monacoRef.current) return;

        // Prevent default browser save behavior
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                e.stopPropagation();
                saveCode();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [saveCode]);

    // Update editor theme
    useEffect(() => {
        if (monacoRef.current) {
            monaco.editor.setTheme(theme);
        }
    }, [theme]);

    // Handle language change - load saved code for the new language
    const previousLanguageRef = useRef(null);
    useEffect(() => {
        if (!monacoRef.current || previousLanguageRef.current === language) return;

        // Language actually changed
        previousLanguageRef.current = language;

        // Load saved code for the new language
        const newCode = getInitialCode(language);
        monacoRef.current.setValue(newCode);

        // Update model language
        const currentModel = monacoRef.current.getModel();
        if (currentModel) {
            monaco.editor.setModelLanguage(currentModel, language);
        }
    }, [language, getInitialCode]);

    // Remove runCode, as Run button will be in parent panel

    const formatCode = () => {
        if (monacoRef.current) {
            monacoRef.current.getAction('editor.action.formatDocument')?.run();
        }
    };

    // Download code as file
    const handleDownload = () => {
        if (monacoRef.current) {
            const code = monacoRef.current.getValue();
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const extensionMap = {
                cpp: 'cpp',
                python: 'py',
                java: 'java',
                c: 'c',
                nasm: 'asm',
                sql: 'sql',
                "shell script": 'sh',
            };
            // Handle languages with spaces in their names
            const extension = extensionMap[language] || language.replace(/\s+/g, '').toLowerCase();
            a.download = `solution.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    // Reset code to driver code (or template if no driver code)
    const handleReset = () => {
        if (monacoRef.current) {
            // Use driver code if available, otherwise fall back to template
            const resetCode = (driverCode && driverCode[language])
                ? driverCode[language]
                : LANGUAGE_TEMPLATES[language];

            console.log('Resetting code to:', resetCode.substring(0, 50));
            monacoRef.current.setValue(resetCode);

            // Clear saved code from localStorage so it uses driver code on next load
            if (problemId) {
                localStorage.removeItem(`code_${problemId}_${language}`);
            }
        }
    };

    return (
        <div className="border rounded-lg shadow bg-card overflow-hidden w-full h-full min-w-0 max-w-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-0 border-b bg-muted px-2 h-12">
                {/* Header Left: Icon + Label + Language Selector */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Code2 className="w-4 h-4" />
                        <span>Editor</span>
                        <span className="w-px h-5 bg-border" />
                    </div>
                    <div className="relative group" ref={languageRef}>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 px-3 text-xs font-medium capitalize"
                            tabIndex={0}
                            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                        >
                            {filteredLanguageOptions.find(l => l.key === language)?.label || language}
                            <ChevronDown size={16} className="ml-1" />
                        </Button>
                        {isLanguageOpen && (
                            <div className="absolute left-0 z-10 mt-1 bg-popover border rounded shadow min-w-[120px]">
                                {filteredLanguageOptions.map((lang) => (
                                    <button
                                        key={lang.key}
                                        onClick={() => {
                                            setSelectedKeys(new Set([lang.key]));
                                            setIsLanguageOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent ${lang.key === language ? 'font-semibold text-primary' : ''}`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modern Icons */}
                <div className="flex items-center gap-2">
                    <Button size="icon-sm" variant="ghost" onClick={formatCode} title="Format">
                        <Wand2 size={16} />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={handleDownload} title="Download">
                        <Download size={16} />
                    </Button>
                    <Button size="icon-sm" variant="ghost" onClick={handleReset} title="Reset to Driver Code">
                        <RefreshCcw size={16} />
                    </Button>

                    {/* Settings/Theme Dropdown */}
                    <div className="relative" ref={settingsRef}>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Settings"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        >
                            <Settings size={16} />
                        </Button>
                        {isSettingsOpen && (
                            <div className="absolute right-0 z-10 mt-1 bg-popover border rounded shadow min-w-[180px]">
                                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b">Editor Theme</div>
                                {editorThemes.map((t) => (
                                    <button
                                        key={t.key}
                                        onClick={() => {
                                            setTheme(t.key);
                                            setIsSettingsOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent ${t.key === theme ? 'font-semibold text-primary' : ''}`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden rounded-b-lg p-2 relative">
                <div className="absolute inset-0 m-2">
                    <div
                        ref={editorRef}
                        className="h-full w-full"
                    />
                </div>
            </div>
        </div>
    );
}

export default CodeEditor;
