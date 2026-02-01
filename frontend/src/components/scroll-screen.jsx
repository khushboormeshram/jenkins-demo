import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import ideImage from "@/assets/ide.png";

export default function HeroScrollDemo() {
    return (
        <div className="flex flex-col overflow-hidden pb-0 pt-[0px]">
            <ContainerScroll
                titleComponent={
                    <>
                        <h1 className="text-4xl font-semibold text-black dark:text-white font-bold">
                            Unleash the power of<br />
                            <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                                Coding
                            </span>
                        </h1>
                    </>
                }
            >
                <img
                    src={ideImage}
                    alt="hero"
                    height={720}
                    width={1400}
                    className="mx-auto rounded-2xl object-cover h-full object-left-top "
                    draggable={false}
                />
            </ContainerScroll>
        </div>
    );
}
