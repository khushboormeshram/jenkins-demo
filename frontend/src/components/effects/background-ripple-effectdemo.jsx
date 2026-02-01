"use client";
import React from "react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

import { HeroDemo } from "@/components/herodemo.jsx";

export function BackgroundRippleEffectDemo() {
    return (
        <div
            className="relative flex h-auto w-full flex-col items-start justify-start">
            <BackgroundRippleEffect />
            <div className="w-full">
                <HeroDemo />
            </div>
        </div>
    );
}

