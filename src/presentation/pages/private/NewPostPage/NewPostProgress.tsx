import { Fragment, type FC } from "react";
import { LuCheck } from "react-icons/lu";

interface NewPostProgressProps {
  step: 1 | 2 | 3;
}

const STEPS: { n: 1 | 2 | 3; label: string }[] = [
  { n: 1, label: "Datos generales" },
  { n: 2, label: "Datos particulares" },
  { n: 3, label: "Duración" },
];

const NewPostProgress: FC<NewPostProgressProps> = ({ step }) => (
  <div className="flex items-center gap-2 w-full max-w-md mx-auto mb-6">
    {STEPS.map((s, i) => {
      const done = step > s.n;
      const active = step === s.n;
      return (
        <Fragment key={s.n}>
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${
                active
                  ? "bg-primary text-background border-primary"
                  : done
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-gray-100 text-gray-400 border-gray-200"
              }`}
            >
              {done ? <LuCheck size={16} /> : s.n}
            </div>
            <span
              className={`text-[11px] font-medium text-center leading-tight ${
                active ? "text-primary" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`flex-1 h-0.5 mb-5 rounded-full transition-colors ${
                done ? "bg-primary/40" : "bg-gray-200"
              }`}
            />
          )}
        </Fragment>
      );
    })}
  </div>
);

export default NewPostProgress;
