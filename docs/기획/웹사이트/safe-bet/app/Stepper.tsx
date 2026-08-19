"use client";

/** 진행률 + 이전/다음. 계약조건 페이지와 판정질문 페이지가 같이 쓴다. */
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold text-ink-500">
          {current} / {total}
        </span>
        <span className="text-xs text-ink-500">{percent}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-sand-200"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label="진행률"
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function StepNav({
  onPrev,
  onNext,
  nextLabel,
}: {
  onPrev: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-2 flex gap-2">
      <button
        type="button"
        onClick={onPrev}
        className="rounded-xl border border-ink-200 px-5 py-3 text-base font-semibold text-ink-600 active:scale-[0.99]"
      >
        이전
      </button>
      <button
        type="button"
        onClick={onNext}
        className="flex-1 rounded-xl bg-brand-600 py-3 text-base font-bold text-white active:scale-[0.99]"
      >
        {nextLabel}
      </button>
    </div>
  );
}
