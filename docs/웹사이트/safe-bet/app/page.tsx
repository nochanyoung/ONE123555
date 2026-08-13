"use client";

import { useMemo, useState } from "react";

type ContractType = "월세" | "연세";
type SourceType = "부동산 광고" | "중개사 안내" | "계약서";

function formatWon(n: number) {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

function parseAmount(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return Number(digits);
}

export default function Home() {
  const [region, setRegion] = useState("");
  const [contractType, setContractType] = useState<ContractType>("월세");
  const [deposit, setDeposit] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [maintenanceFee, setMaintenanceFee] = useState("");
  const [oneTimeCost, setOneTimeCost] = useState("");
  const [startDate, setStartDate] = useState("");
  const [months, setMonths] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("부동산 광고");
  const [confirmed, setConfirmed] = useState(false);
  const [touched, setTouched] = useState(false);

  const depositNum = parseAmount(deposit);
  const rentNum = parseAmount(rentAmount);
  const maintenanceNum = parseAmount(maintenanceFee) ?? 0;
  const oneTimeNum = parseAmount(oneTimeCost) ?? 0;
  const monthsNum = months ? Number(months) : null;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!region.trim()) e.region = "거주 예정 지역을 입력해 주세요.";
    if (depositNum === null) e.deposit = "보증금을 숫자로 입력해 주세요.";
    if (rentNum === null)
      e.rentAmount =
        contractType === "연세" ? "연세 선납액을 숫자로 입력해 주세요." : "월세를 숫자로 입력해 주세요.";
    if (!startDate) e.startDate = "계약 시작 예정일을 입력해 주세요.";
    if (!monthsNum || monthsNum <= 0) e.months = "거주 예정 개월 수를 1 이상으로 입력해 주세요.";
    return e;
  }, [region, depositNum, rentNum, contractType, startDate, monthsNum]);

  const hasErrors = Object.keys(errors).length > 0;

  const monthlyRent = useMemo(() => {
    if (rentNum === null) return null;
    if (contractType === "월세") return rentNum;
    if (!monthsNum || monthsNum <= 0) return null;
    return rentNum / monthsNum;
  }, [contractType, rentNum, monthsNum]);

  const nominalTotal = useMemo(() => {
    if (monthlyRent === null || !monthsNum) return null;
    return (monthlyRent + maintenanceNum) * monthsNum + oneTimeNum;
  }, [monthlyRent, monthsNum, maintenanceNum, oneTimeNum]);

  // 최대 지원 가능액: 정책 판정 엔진(F2~F4)이 아직 연결되지 않아 0으로 고정된다.
  const maxSupport = 0;
  const finalExpected = nominalTotal === null ? null : Math.max(0, nominalTotal - maxSupport);

  const canShowResult = confirmed && !hasErrors && nominalTotal !== null;

  function handleStartCalculation() {
    setTouched(true);
    if (!hasErrors) setConfirmed(true);
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={{ fontSize: "40px" }}>🏠</div>
          <h1 style={styles.title}>청년 주거지원 실부담 계산기</h1>
          <p style={styles.subtitle}>이 방에 살면, 지원금을 반영해 내가 실제로 얼마를 내야 할까?</p>
        </header>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>매물 조건 입력</h2>
          <p style={styles.cardHint}>중개사·부동산 앱·임대인에게 받은 계약 조건을 그대로 입력해 주세요.</p>

          <div style={styles.fieldLabel}>거주 예정 지역 (시·군·구) *</div>
          <input
            style={styles.input}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="예: 익산시 신동"
          />
          {touched && errors.region && <div style={styles.errorText}>{errors.region}</div>}

          <div style={styles.fieldLabel}>계약형태 *</div>
          <div style={styles.buttonGroup}>
            {(["월세", "연세"] as ContractType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setContractType(t)}
                style={{
                  ...styles.choiceButton,
                  ...(contractType === t ? styles.choiceButtonActive : {}),
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={styles.fieldLabel}>보증금 (원) *</div>
          <input
            style={styles.input}
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="예: 1000000"
            inputMode="numeric"
          />
          {touched && errors.deposit && <div style={styles.errorText}>{errors.deposit}</div>}

          <div style={styles.fieldLabel}>
            {contractType === "연세" ? "연세 선납액 (원) *" : "월세 (원) *"}
          </div>
          <input
            style={styles.input}
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            placeholder={contractType === "연세" ? "예: 5000000" : "예: 350000"}
            inputMode="numeric"
          />
          {touched && errors.rentAmount && <div style={styles.errorText}>{errors.rentAmount}</div>}
          {contractType === "연세" && monthlyRent !== null && (
            <div style={styles.helperText}>월 환산액: {formatWon(monthlyRent)} (연세액 ÷ 계약 개월 수)</div>
          )}

          <div style={styles.fieldLabel}>월 관리비 (원)</div>
          <input
            style={styles.input}
            value={maintenanceFee}
            onChange={(e) => setMaintenanceFee(e.target.value)}
            placeholder="예: 50000"
            inputMode="numeric"
          />

          <div style={styles.fieldLabel}>일시 주거 지출 (이사비·중개보수 등, 선택)</div>
          <input
            style={styles.input}
            value={oneTimeCost}
            onChange={(e) => setOneTimeCost(e.target.value)}
            placeholder="예: 300000"
            inputMode="numeric"
          />

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <div style={styles.fieldLabel}>계약 시작 예정일 *</div>
              <input
                style={styles.input}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {touched && errors.startDate && <div style={styles.errorText}>{errors.startDate}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={styles.fieldLabel}>거주 예정 개월 수 *</div>
              <input
                style={styles.input}
                value={months}
                onChange={(e) => setMonths(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="예: 12"
                inputMode="numeric"
              />
              {touched && errors.months && <div style={styles.errorText}>{errors.months}</div>}
            </div>
          </div>

          <div style={styles.fieldLabel}>입력값 출처</div>
          <div style={styles.buttonGroup}>
            {(["부동산 광고", "중개사 안내", "계약서"] as SourceType[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSourceType(s)}
                style={{
                  ...styles.choiceButton,
                  ...(sourceType === s ? styles.choiceButtonActive : {}),
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            입력한 조건이 해당 매물의 실제 계약 조건과 일치합니다.
          </label>

          <button type="button" style={styles.submitButton} onClick={handleStartCalculation}>
            최대 가능액·예상 주거비 확인하기
          </button>
        </section>

        <section style={styles.resultCard}>
          <h2 style={styles.cardTitle}>최대 가능액 · 예상 주거비</h2>

          {!canShowResult ? (
            <p style={styles.emptyText}>
              매물 조건을 모두 입력하고, 실제 계약 조건과 일치함을 확인한 뒤 계산할 수 있습니다.
            </p>
          ) : (
            <>
              <div style={styles.amountRow}>
                <div style={styles.amountBox}>
                  <div style={styles.amountLabel}>최대 지원 가능액</div>
                  <div style={styles.amountValuePositive}>{formatWon(maxSupport)}</div>
                </div>
                <div style={styles.amountBox}>
                  <div style={styles.amountLabel}>최종 예상 주거비</div>
                  <div style={styles.amountValue}>{formatWon(finalExpected ?? 0)}</div>
                </div>
              </div>

              <p style={styles.policyNotice}>
                정책 자격 판정 기능은 아직 연결되어 있지 않아 최대 지원 가능액을 0원으로 표시합니다.
                정책별 조건 확인 단계가 추가되면 이 화면의 최대 지원 가능액에 반영됩니다.
              </p>

              <p style={styles.disclaimer}>
                최대 지원 가능액은 입력값을 바탕으로 조건 충족 시 받을 수 있는 상한을 계산한 값입니다.
                실제 소득인정액, 제출 서류, 예산 상황 등에 따라 지원액이 더 적거나 없을 수 있으며 최종
                자격과 지급액은 해당 기관이 결정합니다.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#f7f7f8",
    padding: "40px 16px",
  },
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    textAlign: "center",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#111111",
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#555555",
    margin: 0,
  },
  card: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e6e6e6",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  cardTitle: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#111111",
    margin: 0,
  },
  cardHint: {
    fontSize: "13px",
    color: "#6b7280",
    margin: "2px 0 8px",
  },
  fieldLabel: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#111111",
    marginTop: "12px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #e6e6e6",
    fontSize: "15px",
  },
  helperText: {
    fontSize: "12px",
    color: "#2563eb",
    marginTop: "4px",
  },
  errorText: {
    fontSize: "12px",
    color: "#dc2626",
    marginTop: "4px",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  choiceButton: {
    flex: "1 1 auto",
    border: "2px solid #e6e6e6",
    background: "#f9fafb",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#374151",
  },
  choiceButtonActive: {
    borderColor: "#ff5d00",
    background: "#fff3ea",
    color: "#ff5d00",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#374151",
    marginTop: "16px",
  },
  submitButton: {
    marginTop: "16px",
    background: "#ff5d00",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "13px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  resultCard: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e6e6e6",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  emptyText: {
    fontSize: "14px",
    color: "#9ca3af",
    margin: 0,
  },
  amountRow: {
    display: "flex",
    gap: "12px",
  },
  amountBox: {
    flex: 1,
    background: "#fff3ea",
    border: "1px solid #ffd9b8",
    borderRadius: "10px",
    padding: "16px",
    textAlign: "center",
  },
  amountLabel: {
    fontSize: "13px",
    color: "#a35a1f",
    marginBottom: "6px",
  },
  amountValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#111111",
  },
  amountValuePositive: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#ff5d00",
  },
  policyNotice: {
    fontSize: "12px",
    color: "#a35a1f",
    background: "#fff8f0",
    border: "1px solid #ffe6cc",
    borderRadius: "8px",
    padding: "10px 12px",
    margin: 0,
  },
  disclaimer: {
    fontSize: "11px",
    color: "#9ca3af",
    margin: 0,
    lineHeight: 1.5,
  },
};
