// 국토교통부 단독/다가구 전월세 실거래가 Open API
// https://www.data.go.kr/data/15126472/openapi.do
// 참고: 2026-08-19 기준 익산시 데이터는 0건으로 확인됨 (표본 부족, PRD R1 리스크)
// 현재 화면(F1~F4)에서는 아직 사용하지 않음 — 추후 시세 비교 기능 추가 시 사용.

const ENDPOINT =
  "https://apis.data.go.kr/1613000/RTMSDataSvcSHRent/getRTMSDataSvcSHRent";

export type RentTransaction = {
  region: string;
  dealYear: number;
  dealMonth: number;
  dealDay: number;
  deposit: number;
  monthlyRent: number;
  houseType: string;
  totalFloorAreaM2: number;
};

function requireApiKey(): string {
  const key = process.env.MOLIT_API_KEY;
  if (!key) {
    throw new Error(
      "MOLIT_API_KEY가 설정되지 않았습니다. .env.local에 키를 추가하세요."
    );
  }
  return key;
}

// lawdCd: 법정동코드 5자리 (예: 익산시 45140), dealYm: YYYYMM
export async function fetchRentTransactions(
  lawdCd: string,
  dealYm: string
): Promise<RentTransaction[]> {
  const url = `${ENDPOINT}?LAWD_CD=${lawdCd}&DEAL_YMD=${dealYm}&numOfRows=1000&pageNo=1&serviceKey=${requireApiKey()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`실거래가 API 호출 실패: ${res.status}`);
  }
  const xml = await res.text();
  return parseItems(xml);
}

function parseItems(xml: string): RentTransaction[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return items.map(([, body]) => ({
    region: field(body, "umdNm"),
    dealYear: Number(field(body, "dealYear")),
    dealMonth: Number(field(body, "dealMonth")),
    dealDay: Number(field(body, "dealDay")),
    deposit: Number(field(body, "deposit").replace(/,/g, "")) || 0,
    monthlyRent: Number(field(body, "monthlyRent").replace(/,/g, "")) || 0,
    houseType: field(body, "houseType"),
    totalFloorAreaM2: Number(field(body, "totalFloorAr")) || 0,
  }));
}

function field(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`));
  return match ? match[1].trim() : "";
}
