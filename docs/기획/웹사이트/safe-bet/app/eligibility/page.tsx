"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import policiesData from "@/data/policies.json";
import type { EligibilityProfile, PolicyMeta } from "@/lib/types";
import { getRequiredQuestions, type QuestionDef } from "@/lib/questions";
import { buildQuestionSteps } from "@/lib/steps";
import { policiesForRegion } from "@/lib/region";
import { loadListing, loadProfile, saveProfile } from "@/lib/storage";
import { ProgressBar, StepNav } from "../Stepper";

const policies = policiesData as PolicyMeta[];

const DEFAULT_PROFILE: EligibilityProfile = {
  birthDate: "",
  isStudentOrEmployed: "unknown",
  livesApartFromParents: "unknown",
  canRegisterResidence: "unknown",
  hasNoHouse: "unknown",
  isContractHolder: "unknown",
  householdSize: "unknown",
  useOriginHousehold: "unknown",
  ownHouseholdMonthlyIncome: "unknown",
  originHouseholdMonthlyIncome: "unknown",
  assetsUnder107M: "unknown",
  isBasicLivelihoodRecipient: "unknown",
  isNearPovertyClass: "unknown",
  receivingOtherRentSupport: "unknown",
  jeonbukResidentOverOneYear: "unknown",
  employedInTargetSectorOver3Months: "unknown",
};

export default function EligibilityPage() {
  const router = useRouter();
  const [region, setRegion] = useState<string | null>(null);
  const [profile, setProfile] = useState<EligibilityProfile>(DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const listing = loadListing();
    if (!listing) {
      router.replace("/");
      return;
    }
    setRegion(listing.region);
    const saved = loadProfile();
    if (saved) setProfile(saved);
  }, [router]);

  // 지역에 해당하지 않는 정책은 후보에서 빠지고, 그 정책만 쓰던 질문도 함께 사라진다.
  // 빠진 질문은 어떤 판정 규칙도 참조하지 않으므로 결과에 영향이 없다.
  const steps = useMemo(() => {
    if (region === null) return [];
    return buildQuestionSteps(getRequiredQuestions(policiesForRegion(policies, region)));
  }, [region]);

  function update<K extends keyof EligibilityProfile>(key: K, value: EligibilityProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    const current = steps[step];
    // 생년월일은 나이 요건 때문에 '모름'을 허용하지 않는 유일한 질문이다.
    if (current?.questions.some((q) => q.key === "birthDate") && !profile.birthDate) {
      return setError("생년월일을 입력해주세요.");
    }
    setError(null);
    saveProfile(profile); // 스텝마다 저장 — 새로고침해도 답이 남는다.
    if (step < steps.length - 1) return setStep(step + 1);
    router.push("/result");
  }

  function handlePrev() {
    setError(null);
    if (step === 0) return router.push("/");
    setStep(step - 1);
  }

  if (region === null || steps.length === 0) {
    return <main className="p-10 text-center text-ink-500">불러오는 중...</main>;
  }

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-5 py-10">
      <div>
        <p className="text-sm font-semibold text-brand-700">정책 판정 질문</p>
        <h1 className="mt-1 text-xl font-extrabold">모르면 &lsquo;모름&rsquo;을 선택하세요</h1>
        <p className="mt-1 text-sm text-ink-500">
          공식 소득인정액처럼 정확히 모르는 값은 임의로 추정하지 않습니다. 모름으로 두면
          &lsquo;조건 충족 시 가능&rsquo;으로 분류하고 확인 방법을 안내합니다.
        </p>
      </div>

      <section className="flex flex-col gap-5 rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
        {/* 계약조건 2스텝이 앞에 있으므로 전체 진행률에 더해서 보여준다. */}
        <ProgressBar current={step + 3} total={steps.length + 2} />

        <div key={step} className="step-in flex flex-col gap-5">
          <h2 className="text-sm font-bold text-ink-900">{current.title}</h2>

          {current.questions.map((q) => (
            <QuestionField
              key={q.key}
              question={q}
              value={profile[q.key]}
              onChange={(v) => update(q.key, v as never)}
            />
          ))}
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <StepNav onPrev={handlePrev} onNext={handleNext} nextLabel={isLast ? "결과 확인하기" : "다음"} />
      </section>
    </main>
  );
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: QuestionDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const isUnknown = value === "unknown";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-ink-900">{question.label}</p>
      <p className="text-xs text-ink-500">{question.why}</p>

      {question.type === "date" && (
        <input
          type="date"
          className="input"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "boolean" && (
        <div className="flex gap-2">
          <ToggleButton active={value === true} onClick={() => onChange(true)}>
            그렇다
          </ToggleButton>
          <ToggleButton active={value === false} onClick={() => onChange(false)}>
            아니다
          </ToggleButton>
          {question.allowUnknown && (
            <ToggleButton active={isUnknown} onClick={() => onChange("unknown")}>
              모름
            </ToggleButton>
          )}
        </div>
      )}

      {question.type === "number" && (
        <div className="flex gap-2">
          <input
            type="number"
            className="input"
            disabled={isUnknown}
            value={isUnknown ? "" : typeof value === "number" ? value : ""}
            onChange={(e) => onChange(Number(e.target.value))}
            min={0}
          />
          {question.allowUnknown && (
            <ToggleButton active={isUnknown} onClick={() => onChange(isUnknown ? 0 : "unknown")}>
              모름
            </ToggleButton>
          )}
        </div>
      )}

      {question.type === "select" && (
        <select
          className="input"
          value={typeof value === "string" ? value : "unknown"}
          onChange={(e) => onChange(e.target.value)}
        >
          {question.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {question.allowUnknown && <option value="unknown">모름</option>}
        </select>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
        active ? "border-brand-600 bg-brand-50 text-brand-900" : "border-ink-200 text-ink-500"
      }`}
    >
      {children}
    </button>
  );
}
