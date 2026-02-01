import { useState, useRef } from "react";
import { toast } from "sonner";

// Judge0 Language ID mapping
const JUDGE0_LANGUAGE_MAP = {
    cpp: 54,      // C++ (GCC 9.2.0)
    c: 50,        // C (GCC 9.2.0)
    java: 62,     // Java (OpenJDK 13.0.1)
    python: 71,   // Python (3.8.1)
    nasm: 45,     // Assembly (NASM 2.14.02)
    "shell script": 46, // Bash (5.0.0)
    sql: 82,      // SQL (SQLite 3.27.2)
};

export function useCodeExecution() {
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [executionTime, setExecutionTime] = useState(null);
    const [memory, setMemory] = useState(null);
    const editorCodeRef = useRef("");
    const editorLanguageRef = useRef("cpp");

    const handleCodeChange = (code, language) => {
        if (code !== undefined && language !== undefined) {
            editorCodeRef.current = code;
            editorLanguageRef.current = language;
        }
    };

    const executeCode = async (customInput = "") => {
        const code = editorCodeRef.current;
        const language = editorLanguageRef.current;

        if (!code || !language) {
            setOutput("No code to run.");
            return;
        }

        const languageId = JUDGE0_LANGUAGE_MAP[language];

        if (!languageId) {
            setOutput(`Language "${language}" is not supported by the compiler.`);
            return;
        }

        setIsRunning(true);
        setOutput("Compiling and running...");
        setExecutionTime(null);
        setMemory(null);

        try {
            const apiUrl = import.meta.env.VITE_JUDGE0_API_URL;

            const requestBody = {
                source_code: btoa(code),
                language_id: languageId,
                stdin: btoa(customInput),
            };

            const submissionResponse = await fetch(`${apiUrl}/submissions?base64_encoded=true&wait=true`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (!submissionResponse.ok) {
                const errorText = await submissionResponse.text();
                throw new Error(`Submission failed: ${submissionResponse.statusText}`);
            }

            const result = await submissionResponse.json();

            if (!result.status) {
                throw new Error(result.error || result.message || "Unknown error from Judge0");
            }

            if (result.status.id === 3) {
                const decodedOutput = result.stdout ? atob(result.stdout) : "(No output)";
                setOutput(decodedOutput);
                setExecutionTime(result.time);
                setMemory(result.memory);
            } else if (result.status.id === 6) {
                const compileError = result.compile_output ? atob(result.compile_output) : (result.stderr ? atob(result.stderr) : result.message || "Unknown compilation error");
                setOutput(`Compilation Error:\n${compileError}`);
            } else if (result.status.id === 11) {
                const runtimeError = result.stderr ? atob(result.stderr) : (result.message || "Unknown runtime error");
                setOutput(`Runtime Error:\n${runtimeError}`);
            } else if (result.status.id === 5) {
                setOutput("Time Limit Exceeded");
            } else if (result.status.id === 13) {
                setOutput(`Internal Error: ${result.message || "Please try again"}`);
            } else {
                let details = "";
                if (result.stderr) details = atob(result.stderr);
                else if (result.stdout) details = atob(result.stdout);
                else if (result.compile_output) details = atob(result.compile_output);
                else if (result.message) details = result.message;
                setOutput(`Status: ${result.status.description}\n${details}`);
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`);
            toast.error("Failed to execute code", {
                description: error.message,
            });
        } finally {
            setIsRunning(false);
        }
    };

    return {
        output,
        isRunning,
        executionTime,
        memory,
        handleCodeChange,
        executeCode,
    };
}
