// 응답 값: 사용자가 판단할 수 없으면 "unknown"을 허용한다 (PRD F2-1).
export type Answer<T> = T | "unknown";

export type ContractType = "월세" | "연세";

// F1. 사용자가 입력하는 계약 조건
export interface ListingInput {
  region: string; // 시·군·구
  contractType: ContractType;
  deposit: number; // 보증금
  rentOrYearlyAmount: number; // 월세액 또는 연세 선납액
  managementFee: number; // 월 관리비
  oneTimeMoveCost: number; // 이사비 등 정책이 요구하는 일시 지출(F1-4), 없으면 0
  contractStartDate: string; // YYYY-MM-DD
  months: number; // 거주 예정 개월 수
  sourceType: "부동산 광고" | "중개사 안내" | "계약서";
  confirmedMatchesActualContract: boolean; // F1-10
}

// F2. 정책 판정용 공통 입력
export interface EligibilityProfile {
  birthDate: string; // YYYY-MM-DD
  isStudentOrEmployed: "student" | "employed" | "unemployed" | "unknown";
  livesApartFromParents: Answer<boolean>;
  canRegisterResidence: Answer<boolean>;
  hasNoHouse: Answer<boolean>; // 무주택 여부
  isContractHolder: Answer<boolean>; // 계약 명의자 본인 여부
  householdSize: Answer<number>; // 본인 가구원 수
  useOriginHousehold: Answer<boolean>; // 원가구 소득 산정 대상인지
  ownHouseholdMonthlyIncome: Answer<number>;
  originHouseholdMonthlyIncome: Answer<number>;
  assetsUnder107M: Answer<boolean>; // 익산시 재산 기준(1억 700만원 이하)
  isBasicLivelihoodRecipient: Answer<boolean>;
  isNearPovertyClass: Answer<boolean>;
  receivingOtherRentSupport: Answer<boolean>; // 다른 월세·주거비 지원 중복 수급 여부
  jeonbukResidentOverOneYear: Answer<boolean>;
  employedInTargetSectorOver3Months: Answer<boolean>; // 농업·임업·어업·중소기업정규직·문화예술·연구소기업정규직
}

export type RequiredInputKey = keyof EligibilityProfile;

export type PolicyStatus = "예상적용" | "조건충족시가능" | "대상아님" | "신청불가";

export type CheckResult = "pass" | "fail" | "unknown";

export interface CheckOutcome {
  key: string;
  label: string;
  result: CheckResult;
  howToConfirm?: string;
}

// rent_capped_monthly: min(월 상한, 실제 인정 월세) × 개월수 (예: 월세지원형)
// flat_monthly: 실제 월세와 무관하게 정액 × 개월수 (예: 정착지원금)
// lump_sum: min(총 상한, 실제 지출) 1회 지급
export type BenefitType = "rent_capped_monthly" | "flat_monthly" | "lump_sum";

export interface PolicyMeta {
  id: string;
  name: string;
  agency: string;
  regionScope: string;
  applicationStart: string; // YYYY-MM-DD
  applicationEnd: string | null; // null = 상시(마감 없음)
  benefitType: BenefitType;
  benefitSummary: string; // 사람이 읽는 지원 형태 요약
  monthlyCap?: number; // 월 상한액
  maxMonths?: number; // 지급 가능 개월 수
  lumpSumCap?: number; // 일시 지급 상한액
  requiredInputs: RequiredInputKey[];
  exclusiveGroup: string[]; // 동시 합산 불가 그룹 id들
  sourceUrl: string;
  applyUrl: string;
  verifiedAt: string | null; // null = 팀 교차검수 전
  effectiveYear: number;
  notes: string;
}

export interface PolicyResult {
  policy: PolicyMeta;
  status: PolicyStatus;
  checks: CheckOutcome[];
  passedLabels: string[];
  failedLabels: string[];
  unknownLabels: string[];
  estimatedAmount: number; // 이 정책 단독 총 예상액 (월 상한 × 개월 등 반영)
}

export interface CombinationResult {
  includedPolicyIds: string[];
  totalAmount: number;
}

export interface CalculationSummary {
  nominalTotalCost: number; // 명목 총 지출
  maxSupportAmount: number; // 최대 지원 가능액
  finalEstimatedHousingCost: number; // 최종 예상 주거비
  bestCombination: CombinationResult;
  results: PolicyResult[];
}
