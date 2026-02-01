import { EncryptedText } from "@/components/ui/encrypted-text";
import React from "react";

export function EncryptedTextDemoSecond({ text = "Welcome to the Matrix, Neo." }) {
    return (
        <p className="mx-auto max-w-lg font-medium text-left">
            <EncryptedText
                text={text}
                encryptedClassName="text-neutral-500"
                revealedClassName="dark:text-white text-black"
                revealDelayMs={50} />
        </p>
    );
}
