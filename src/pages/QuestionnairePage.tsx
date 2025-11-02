// src/pages/QuestionnairePage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ORANGE = "#FF785A";

const questions = [
  {
    id: "q0",
    title: (
      <>
        Never have I ever been on a group trip with{" "}
        <span className="text-orange-500 font-semibold">strangers.</span>
      </>
    ),
  },
  {
    id: "q1",
    title: (
      <>
        Never have I ever cancelled a group trip due to{" "}
        <span className="text-orange-500 font-semibold">
          trust/security issues
        </span>{" "}
        with agency/co-travellers.
      </>
    ),
  },
  {
    id: "q2",
    title: (
      <>
        Never have I ever missed an event because my{" "}
        <span className="text-orange-500 font-semibold">friends backed out.</span>
      </>
    ),
  },
  {
    id: "q3",
    title: (
      <>
        Never have I ever made{" "}
        <span className="text-orange-500 font-semibold">new friends</span> at a
        concert or event.
      </>
    ),
  },
  {
    id: "q4",
    title: (
      <>
        Never have I ever wanted to find{" "}
        <span className="text-orange-500 font-semibold">like-minded people</span>{" "}
        through real events, not apps.
      </>
    ),
  },
];

const OptionRow: React.FC<{
  letter: string;
  text: string;
  onClick: () => void;
}> = ({ letter, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 border border-orange-300 text-orange-500 rounded-lg px-4 py-3 w-full text-left hover:bg-orange-50 transition font-mono text-sm md:text-base"
  >
    <span className="border border-orange-300 text-orange-500 rounded-sm px-2 py-0.5 text-xs md:text-sm font-semibold">
      {letter}
    </span>
    <span>{text}</span>
  </button>
);

const QuestionnairePage: React.FC = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});

  const q = questions[index];

  function recordAnswer(val: "yes" | "no") {
    const qId = questions[index].id;
    const next = { ...answers, [qId]: val };
    setAnswers(next);

    // Save progress locally
    sessionStorage.setItem("arz_answers", JSON.stringify(next));

    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      // ✅ Finished all questions → go to Waitlist
      navigate("/waitlist");
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-mono relative">
      <div className="absolute top-4 left-4 md:top-6 md:left-10">
        <img
          src="/logo.png"
          alt="ARZ Logo"
          className="h-20 md:h-28 lg:h-32 object-contain drop-shadow-lg"
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 md:px-12 pt-28 md:pt-32">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <h1 className="text-lg md:text-3xl text-slate-900 font-semibold leading-relaxed text-left">
              {q.title}
            </h1>
          </div>

          <div className="flex flex-col gap-3 md:gap-5 w-full">
            <OptionRow letter="A" text="Yes, I have" onClick={() => recordAnswer("yes")} />
            <OptionRow letter="B" text="No, I haven't" onClick={() => recordAnswer("no")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;
