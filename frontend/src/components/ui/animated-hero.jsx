import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { EncryptedTextDemoSecond } from "@/components/effects/encryptedtext-demosecond";
import { Link } from "react-router-dom";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { PartyPopper } from "@/components/animate-ui/icons/party-popper";
function Hero({ secondText }) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(() => ["amazing", "new", "wonderful", "beautiful", "smart"], []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div
          className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col ">
          <div className="z-[3]">
            <MovingBorderButton
              duration={3000}
              borderClassName="opacity-100"
              containerClassName="h-9 w-auto"
              className="gap-2 px-2 py-1"
            >
              <span className="inline-flex items-center gap-2">
                <span className="px-2 py-[2px] text-[11px] font-semibold rounded-full bg-black text-white dark:bg-white dark:text-black inline-flex items-center gap-1">
                  New
                  <AnimateIcon animateOnHover>
                    <PartyPopper className="w-4 h-4" />
                  </AnimateIcon>
                </span>
                Read our launch article <MoveRight className="w-4 h-3" />
              </span>
            </MovingBorderButton>
          </div>
          <div className="flex gap-4 flex-col">
            <h1
              className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular z-[3]">
              <span className="text-spektr-cyan-50">This is something</span>
              <span
                className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                          y: 0,
                          opacity: 1,
                        }
                        : {
                          y: titleNumber > index ? -150 : 150,
                          opacity: 0,
                        }
                    }>
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <EncryptedTextDemoSecond text={secondText} />

          </div>
          <div className="flex flex-row gap-3">
            <Button asChild size="lg" className="gap-4 z-[3]" variant="outline">
              <Link to="/practice">
                Start Coding <Zap className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="gap-4 z-[3] bg-black text-white hover:bg-black/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
            >
              <Link to="/signup">
                Sign up here <MoveRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
