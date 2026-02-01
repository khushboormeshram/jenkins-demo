import {
  Blocks,
  Bot,
  ChartPie,
  Film,
  MessageCircle,
  Settings2,
} from "lucide-react";

const features = [
  {
    icon: Settings2,
    title: "Code Execution Engine",
    description:
      "Run your code instantly in multiple languages with real-time output powered by the Judge0 engine.",
  },
  {
    icon: Blocks,
    title: "Practice Problems",
    description:
      "Solve a curated set of coding challenges with examples, constraints, and difficulty levels.",
  },
  {
    icon: Bot,
    title: "Auto Evaluation",
    description:
      "Your code is automatically tested against public and hidden testcases with detailed verdicts.",
  },
  {
    icon: Film,
    title: "Contest Experience",
    description:
      "Join timed contests, unlock problems when the contest starts, and compete like real coding platforms.",
  },
  {
    icon: ChartPie,
    title: "Live Leaderboard",
    description:
      "Track rankings in real time based on problems solved, penalties, and fastest submissions.",
  },
  {
    icon: MessageCircle,
    title: "User Stats & History",
    description:
      "View all your submissions, performance graphs, solved problems, and contest history in one place.",
  },
];

const Features = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div>
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center">
          Unleash Your Creativity
        </h2>
        <div
          className="mt-10 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-(--breakpoint-lg) mx-auto px-6">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col border rounded-xl py-6 px-5">
              <div
                className="mb-4 h-10 w-10 flex items-center justify-center bg-muted rounded-full">
                <feature.icon className="size-5" />
              </div>
              <span className="text-lg font-semibold">{feature.title}</span>
              <p className="mt-1 text-foreground/80 text-[15px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
