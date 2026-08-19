"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContractType, ListingInput } from "@/lib/types";
import { monthlyRentEquivalent } from "@/lib/rent";
import { loadListing, saveListing } from "@/lib/storage";

const EMPTY: ListingInput = {
  region: "",
  contractType: "연세",
  deposit: 0,
  rentOrYearlyAmount: 0,
  managementFee: 0,
  oneTimeMoveCost: 0,
  contractStartDate: "",
  months: 12,
  sourceType: "중개사 안내",
  confirmedMatchesActualContract: false,
};

export default function InputPage() {
  const router = useRouter();
  const [form, setForm] = useState<ListingInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadListing();
    if (saved) setForm(saved);
  }, []);

  const monthlyEquivalent = form.rentOrYearlyAmount > 0 && form.months > 0
    ? monthlyRentEquivalent(form)
    : 0;

  function update<K extends keyof ListingInput>(key: K, value: ListingInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.region.trim()) return setError("거주 예정 지역을 입력해주세요.");
    if (!form.contractStartDate) return setError("계약 시작 예정일을 입력해주세요.");
    if (form.months <= 0) return setError("거주 예정 개월 수는 1개월 이상이어야 합니다.");
    if (form.deposit < 0 || form.rentOrYearlyAmount < 0 || form.managementFee < 0) {
      return setError("금액은 0원 이상이어야 합니다.");
    }
    if (!form.confirmedMatchesActualContract) {
      return setError("해당 매물의 실제 계약 조건과 일치하는지 확인해주세요.");
    }
    setError(null);
    saveListing(form);
    router.push("/eligibility");
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-5 py-10">
      <div className="text-center">
        <p className="text-sm font-semibold text-brand">청년 주거지원 실부담 계산기</p>
        <h1 className="mt-2 text-2xl font-extrabold leading-snug">
          이 방에 살면, 지원금을 반영해
          <br />내가 실제로 얼마를 내야 할까?
        </h1>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-stone-500">1. 계약 조건 입력</h2>

        <Field label="거주 예정 지역 (시·군·구)">
          <input
            className="input"
            placeholder="예: 전북특별자치도 익산시"
            value={form.region}
            onChange={(e) => update("region", e.target.value)}
          />
        </Field>

        <Field label="계약 형태">
          <div className="flex gap-2">
            {(["연세", "월세"] as ContractType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => update("contractType", type)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  form.contractType === type
                    ? "border-brand bg-orange-50 text-brand-dark"
                    : "border-stone-200 text-stone-500"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </Field>

        <Field label="보증금 (원)">
          <NumberInput value={form.deposit} onChange={(v) => update("deposit", v)} />
        </Field>

        <Field label={form.contractType === "연세" ? "연세 선납액 (원)" : "월세액 (원)"}>
          <NumberInput
            value={form.rentOrYearlyAmount}
            onChange={(v) => update("rentOrYearlyAmount", v)}
          />
        </Field>

        <Field label="월 관리비 (원)">
          <NumberInput value={form.managementFee} onChange={(v) => update("managementFee", v)} />
        </Field>

        <Field label="계약 시작 예정일">
          <input
            type="date"
            className="input"
            value={form.contractStartDate}
            onChange={(e) => update("contractStartDate", e.target.value)}
          />
        </Field>

        <Field label="거주 예정 개월 수">
          <NumberInput value={form.months} onChange={(v) => update("months", v)} />
        </Field>

        <Field label="이사비 등 정책이 요구하는 일시 지출 (원, 없으면 0)">
          <NumberInput value={form.oneTimeMoveCost} onChange={(v) => update("oneTimeMoveCost", v)} />
        </Field>

        {form.contractType === "연세" && monthlyEquivalent > 0 && (
          <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm text-brand-dark">
            연세 {form.rentOrYearlyAmount.toLocaleString()}원 ÷ {form.months}개월 = 월 환산{" "}
            <strong>{monthlyEquivalent.toLocaleString()}원</strong>
          </p>
        )}

        <Field label="이 조건을 어디서 확인했나요?">
          <select
            className="input"
            value={form.sourceType}
            onChange={(e) => update("sourceType", e.target.value as ListingInput["sourceType"])}
          >
            <option value="부동산 광고">부동산 광고</option>
            <option value="중개사 안내">중개사 안내</option>
            <option value="계약서">계약서</option>
          </select>
        </Field>

        <label className="flex items-start gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.confirmedMatchesActualContract}
            onChange={(e) => update("confirmedMatchesActualContract", e.target.checked)}
          />
          위 조건은 제가 검토 중인 매물의 실제 계약 조건과 일치합니다.
        </label>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          className="mt-2 rounded-xl bg-brand py-3 text-base font-bold text-white active:scale-[0.99]"
        >
          다음: 정책 판정 질문으로
        </button>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-stone-700">
      {label}
      {children}
    </label>
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      className="input"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
      min={0}
    />
  );
}
