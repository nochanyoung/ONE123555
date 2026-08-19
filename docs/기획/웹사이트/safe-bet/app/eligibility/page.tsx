"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import policiesData from "@/data/policies.json";
import type { EligibilityProfile, PolicyMeta } from "@/lib/types";
import { getRequiredQuestions, type QuestionDef } from "@/lib/questions";
import { loadListing, loadProfile, saveProfile } from "@/lib/storage";

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
  const questions = useMemo(() => getRequiredQuestions(policies), []);
  const [profile, setProfile] = useState<EligibilityProfile>(DEFAULT_PROFILE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loadListing()) {
      router.replace("/");
      return;
    }
    const saved = loadProfile();
    if (saved) setProfile(saved);
  }, [router]);

  function update<K extends keyof EligibilityProfile>(key: K, value: EligibilityProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!profile.birthDate) return setError("생년월일을 입력해주세요.");
    setError(null);
    saveProfile(profile);
    router.push("/result");
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-5 py-10">
      <div>
        <p className="text-sm font-semibold text-brand">2. 정책 판정 질문</p>
        <h1 className="mt-1 text-xl font-extrabold">모르면 &lsquo;모름&rsquo;을 선택하세요</h1>
        <p className="mt-1 text-sm text-stone-500">
          공식 소득인정액처럼 정확히 모르는 값은 임의로 추정하지 않습니다. 모름으로 두면
          &lsquo;조건 충족 시 가능&rsquo;으로 분류하고 확인 방법을 안내합니다.
        </p>
      </div>

      <section className="flex flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        {questions.map((q) => (
          <QuestionField
            key={q.key}
            question={q}
            value={profile[q.key]}
            onChange={(v) => update(q.key, v as never)}
          />
        ))}

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          className="mt-2 rounded-xl bg-brand py-3 text-base font-bold text-white active:scale-[0.99]"
        >
          결과 확인하기
        </button>
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
      <p className="text-sm font-bold text-stone-800">{question.label}</p>
      <p className="text-xs text-stone-500">{question.why}</p>

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
        active ? "border-brand bg-orange-50 text-brand-dark" : "border-stone-200 text-stone-500"
      }`}
    >
      {children}
    </button>
  );
}
