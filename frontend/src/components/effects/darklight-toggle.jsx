"use client";

import { Toggle } from "@/components/ui/toggle";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function DarkLightToggle() {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        // Check if dark mode is already enabled on page load
        if (document.documentElement.classList.contains("dark")) {
            setTheme("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <div>
            <Toggle
                variant="outline"
                className="group size-9 data-[state=on]:bg-transparent data-[state=on]:hover:bg-muted"
                pressed={theme === "dark"}
                onPressedChange={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
                <Moon
                    size={16}
                    strokeWidth={2}
                    className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
                    aria-hidden="true"
                />
                <Sun
                    size={16}
                    strokeWidth={2}
                    className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0"
                    aria-hidden="true"
                />
            </Toggle>
        </div>
    );
}

export { DarkLightToggle };
