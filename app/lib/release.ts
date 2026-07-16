export const APP_VERSION = "1.4.0";

export interface ReleaseNote {
  readonly version: string;
  readonly date: string;
  readonly displayDate: string;
  readonly summary: string;
}

export const releaseNotes: readonly ReleaseNote[] = [
  {
    version: APP_VERSION,
    date: "2026-07-16",
    displayDate: "2026. 7. 16.",
    summary: "같은 수를 나타내는 여러 묶음 모습을 인정하고, 마지막 미션 안내, 42 문항, 완료 화면, 320px 입력 화면을 더 쉽게 개선했습니다.",
  },
  {
    version: "1.3.0",
    date: "2026-07-15",
    displayDate: "2026. 7. 15.",
    summary: "현재 미션 다시 시작, 완료·현재·남은 미션 안내, 조작 버튼 구분, 모바일 화면 압축, 미션 복습과 고정 보너스 연습을 추가했습니다.",
  },
  {
    version: "1.2.0",
    date: "2026-07-15",
    displayDate: "2026. 7. 15.",
    summary: "파스텔 종이 공예형 색상, 귀여운 상자 로고와 배지, 학습 여정 안내, 카드·버튼·완료 화면을 밝고 친근하게 개선했습니다.",
  },
  {
    version: "1.1.1",
    date: "2026-07-15",
    displayDate: "2026. 7. 15.",
    summary: "3/9를 포함한 묶기·풀기 미션에 지금 할 일과 단계별 순서를 표시하고, 탐색 뒤에도 올바른 마지막 순서로 통과하도록 개선했습니다.",
  },
  {
    version: "1.1.0",
    date: "2026-07-15",
    displayDate: "2026. 7. 15.",
    summary: "밝은 택배 터미널 삽화와 색상 체계, 택배 상자 모형, 화면별 카드 구성을 개선했습니다.",
  },
  {
    version: "1.0.0",
    date: "2026-07-14",
    displayDate: "2026. 7. 14.",
    summary: "첫 공개: 십 묶음·낱개 버튼 조작, 0~100 고정 미션, 배송 수량표 학습을 추가했습니다.",
  },
] as const;
