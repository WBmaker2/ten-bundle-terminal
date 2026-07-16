import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const missionSpecs = [
  { total: 0, actions: [], checks: [["quantity", "0"], ["reading", "영"]] },
  { total: 9, actions: [], checks: [["quantity", "9"], ["reading", "구"]] },
  { total: 10, actions: ["낱개 10개 묶기"], checks: [["quantity", "10"]] },
  { total: 19, actions: ["낱개 10개 묶기"], checks: [["reading", "십구"]] },
  { total: 20, actions: ["낱개 10개 묶기"], checks: [["quantity", "20"]] },
  { total: 42, actions: [], checks: [["quantity", "42"], ["place", "40개"]] },
  { total: 40, actions: ["십 묶음 1개 풀기", "낱개 10개 묶기"], checks: [["reading", "사십"]] },
  { total: 99, actions: ["낱개 10개 묶기"], checks: [["quantity", "99"]] },
  { total: 100, actions: ["낱개 10개 묶기"], checks: [["quantity", "100"]] },
] as const;

async function openStart(page: Page) {
  await page.goto("/");
  await page.locator('[data-hydrated="true"]').waitFor();
}

async function begin(page: Page) {
  await openStart(page);
  await page.getByRole("button", { name: "연습 시작" }).click();
  await page.getByRole("button", { name: "10개도 보기" }).click();
  await page.getByRole("button", { name: "낱개 10개 묶기" }).click();
  await page.getByRole("button", { name: "배송 시작" }).click();
}

async function completeMission(page: Page, index: number) {
  const spec = missionSpecs[index];
  await page.getByRole("button", { name: "미션 열기" }).click();
  for (const action of spec.actions) await page.getByRole("button", { name: action }).click();
  if (spec.actions.length) await page.getByRole("button", { name: "묶음 확인" }).click();
  for (const [kind, answer] of spec.checks) {
    if (kind === "quantity") {
      await page.getByRole("textbox", { name: "배송 수량표" }).fill(answer);
      await page.getByRole("button", { name: "수량 확인" }).click();
    } else {
      await page.getByLabel(answer, { exact: true }).check();
      await page.getByRole("button", { name: "선택 확인" }).click();
    }
  }
  await expect(page.getByRole("heading", { name: `${spec.total}개를 정확히 정리했어요` })).toBeVisible();
}

async function reachMission(page: Page, index: number) {
  await begin(page);
  for (let current = 0; current < index; current += 1) {
    await completeMission(page, current);
    await page.getByRole("button", { name: "다음 배송" }).click();
  }
}

test("시작 화면은 학습 목표와 개인정보 비저장을 알린다", async ({ page }) => {
  await openStart(page);
  await expect(page.getByRole("heading", { name: "십 묶음 택배 터미널" })).toBeVisible();
  await expect(page.getByText("학생 정보 저장 안 함")).toBeVisible();
});

test("업데이트 내역은 날짜와 첫 공개 내용을 보여 준다", async ({ page }) => {
  await openStart(page);
  await page.getByRole("button", { name: "업데이트 내역" }).click();
  await expect(page.getByRole("dialog", { name: "업데이트 내역" })).toContainText("v1.4.0");
  await expect(page.getByRole("dialog", { name: "업데이트 내역" })).toContainText("2026. 7. 14.");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "업데이트 내역" })).toBeFocused();
});

test("처음으로는 학습 시작 뒤에만 보이고 확인 뒤 진행을 지운다", async ({ page }) => {
  await openStart(page);
  await expect(page.getByRole("button", { name: "처음으로" })).toHaveCount(0);
  await page.getByRole("button", { name: "연습 시작" }).click();
  await page.getByRole("button", { name: "처음으로" }).click();
  await expect(page.getByRole("dialog", { name: "처음부터 다시 할까요?" })).toBeVisible();
  await page.getByRole("button", { name: "계속 학습하기" }).click();
  await expect(page.getByRole("heading", { name: "낱개를 살펴봐요" })).toBeVisible();
});

test("연습은 낱개 7개를 묶지 못하는 이유를 설명한다", async ({ page }) => {
  await openStart(page);
  await page.getByRole("button", { name: "연습 시작" }).click();
  await expect(page.getByText(/아직 10개가 아니므로/)).toBeVisible();
});

test("연습은 낱개 10개와 십 묶음 하나의 동치를 보여 준다", async ({ page }) => {
  await openStart(page);
  await page.getByRole("button", { name: "연습 시작" }).click();
  await page.getByRole("button", { name: "10개도 보기" }).click();
  await page.getByRole("button", { name: "낱개 10개 묶기" }).click();
  await expect(page.getByText(/같은 수예요. 모두 10개/)).toBeVisible();
});

test("0 미션은 숫자 0과 읽기 영을 확인한다", async ({ page }) => {
  await reachMission(page, 0);
  await completeMission(page, 0);
  await expect(page.getByText("아무것도 없는 수량도 0으로 나타내요.")).toBeVisible();
});

test("선행 0은 자동 정답 처리하지 않고 입력을 유지한다", async ({ page }) => {
  await reachMission(page, 0);
  await page.getByRole("button", { name: "미션 열기" }).click();
  await page.getByRole("textbox", { name: "배송 수량표" }).fill("00");
  await page.getByRole("button", { name: "수량 확인" }).click();
  await expect(page.getByText(/앞의 0을 지워/)).toBeVisible();
  await expect(page.getByRole("textbox", { name: "배송 수량표" })).toHaveValue("00");
});

test("9 미션은 십의 자리 문항 없이 한 자리 수를 보여 준다", async ({ page }) => {
  await reachMission(page, 1);
  await completeMission(page, 1);
  await expect(page.getByText(/한 자리 수/)).toBeVisible();
});

test("10 미션은 묶기 전후 전체 10을 보존한다", async ({ page }) => {
  await reachMission(page, 2);
  await page.getByRole("button", { name: "미션 열기" }).click();
  await page.getByRole("button", { name: "낱개 10개 묶기" }).click();
  await expect(page.getByText(/모두 10개입니다/)).toBeVisible();
});

test("3/9 미션은 지금 할 조작을 알려 주고 탐색 뒤 올바른 마지막 묶기를 인정한다", async ({ page }) => {
  await reachMission(page, 2);
  await page.getByRole("button", { name: "미션 열기" }).click();
  await expect(page.getByText("지금 할 일: 낱개 10개 묶기", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "낱개 10개 묶기" }).click();
  await page.getByRole("button", { name: "십 묶음 1개 풀기" }).click();
  await page.getByRole("button", { name: "낱개 10개 묶기" }).click();
  await expect(page.getByText("순서 완료!", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "묶음 확인" }).click();
  await expect(page.getByRole("textbox", { name: "배송 수량표" })).toBeVisible();
});

test("현재 미션 다시 시작은 3/9만 처음 모습으로 되돌린다", async ({ page }) => {
  await reachMission(page, 2);
  await page.getByRole("button", { name: "미션 열기" }).click();
  await page.getByRole("button", { name: "낱개 10개 묶기" }).click();
  await page.getByRole("button", { name: "이 미션 다시 시작" }).click();
  const dialog = page.getByRole("dialog", { name: "이 미션을 다시 시작할까요?" });
  await expect(dialog).toContainText("앞에서 완료한 미션은 그대로");
  await dialog.getByRole("button", { name: "이 미션 다시 시작" }).click();
  await expect(page.getByRole("heading", { name: "처음 만드는 십 묶음" })).toBeVisible();
  await expect(page.getByRole("button", { name: "미션 열기" })).toBeVisible();
  await page.getByRole("button", { name: "미션 열기" }).click();
  await expect(page.getByText("지금 할 일: 낱개 10개 묶기", { exact: true })).toBeVisible();
  await expect(page.getByLabel(/십 묶음 0개, 낱개 10개, 모두 10개/)).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAccessibleName(/2개 완료, 현재 3번째 미션/);
});

test("19 미션은 1묶음 9낱개와 십구를 연결한다", async ({ page }) => {
  await reachMission(page, 3);
  await completeMission(page, 3);
  await expect(page.getByText(/낱개 9개가 남아도 모두 19개/)).toBeVisible();
});

test("20 미션은 낱개 0개의 의미를 보여 준다", async ({ page }) => {
  await reachMission(page, 4);
  await completeMission(page, 4);
  await expect(page.getByText(/낱개는 0개/)).toBeVisible();
});

test("42 미션은 24 입력에서 십 묶음 수부터 보도록 안내한다", async ({ page }) => {
  await reachMission(page, 5);
  await page.getByRole("button", { name: "미션 열기" }).click();
  await expect(page.getByRole("heading", { name: "십 묶음 4개와 낱개 2개를 보고, 모두 몇 개인지 써 보세요." })).toBeVisible();
  await page.getByRole("textbox", { name: "배송 수량표" }).fill("24");
  await page.getByRole("button", { name: "수량 확인" }).click();
  await expect(page.getByText(/4묶음은 40개/)).toBeVisible();
});

test("40 미션은 풀기와 다시 묶기 뒤에도 전체 40이다", async ({ page }) => {
  await reachMission(page, 6);
  await page.getByRole("button", { name: "미션 열기" }).click();
  await page.getByRole("button", { name: "십 묶음 1개 풀기" }).click();
  await expect(page.getByText(/모두 40개입니다/)).toBeVisible();
  await page.getByRole("button", { name: "낱개 10개 묶기" }).click();
  await expect(page.getByText(/모두 40개입니다/)).toBeVisible();
});

test("되돌리기는 직전 40 표현을 복원한다", async ({ page }) => {
  await reachMission(page, 6);
  await page.getByRole("button", { name: "미션 열기" }).click();
  await page.getByRole("button", { name: "십 묶음 1개 풀기" }).click();
  await page.getByRole("button", { name: "한 단계 되돌리기" }).click();
  await expect(page.getByLabel(/십 묶음 4개, 낱개 0개, 모두 40개/)).toBeVisible();
});

test("99 미션은 90과 9의 관계를 보여 준다", async ({ page }) => {
  await reachMission(page, 7);
  await completeMission(page, 7);
  await expect(page.getByText(/90과 9를 합한 99/)).toBeVisible();
});

test("100 미션은 십 묶음 10개와 자리 1·0·0을 구분한다", async ({ page }) => {
  await reachMission(page, 8);
  await expect(page.getByRole("progressbar")).toHaveAccessibleName(/현재 마지막 미션, 1개 남음/);
  await completeMission(page, 8);
  await expect(page.getByText(/십 묶음 10개는 100개/)).toBeVisible();
  await expect(page.getByText("1 · 0 · 0")).toBeVisible();
});

test("고정 9개 미션을 마치면 점수 없는 배송 정리표가 열린다", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await begin(page);
  for (let index = 0; index < missionSpecs.length; index += 1) {
    await completeMission(page, index);
    await page.getByRole("button", { name: index === 8 ? "배송 정리표 보기" : "다음 배송" }).click();
  }
  await expect(page.getByRole("heading", { name: "오늘 해 본 활동" })).toBeVisible();
  await expect(page.getByText("✓ 100 경계")).toBeVisible();
  await expect(page.locator("details.reflection-panel")).not.toHaveAttribute("open");
  await page.getByText("생각 정리 3개", { exact: true }).click();
  await expect(page.getByRole("group", { name: "왜 택배를 10개씩 묶으면 편리할까요?" })).toBeVisible();
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  await page.getByText("보너스 연습 3개", { exact: true }).click();
  await page.getByLabel("2묶음 10낱개", { exact: true }).check();
  await expect(page.getByText(/2묶음 10낱개도 모두 30개/)).toBeVisible();
  await page.getByText("완료한 미션 다시 보기", { exact: true }).click();
  const replayButton = page.getByRole("button").filter({ hasText: "처음 만드는 십 묶음" });
  await replayButton.click();
  await expect(page.getByRole("heading", { name: "처음 만드는 십 묶음" })).toBeVisible();
  await expect(page.getByText("미션 복습 · 3번째", { exact: true })).toBeVisible();
});

test("수량 입력은 물리 키보드 숫자와 Enter로 제출한다", async ({ page }) => {
  await reachMission(page, 0);
  await page.getByRole("button", { name: "미션 열기" }).click();
  await page.getByRole("textbox", { name: "배송 수량표" }).pressSequentially("0");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("group", { name: "0은 어떻게 읽을까요?" })).toBeVisible();
});

test("첫 화면에 심각한 자동 접근성 위반이 없다", async ({ page }) => {
  await openStart(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("작업대와 수량 입력 화면에 심각한 자동 접근성 위반이 없다", async ({ page }) => {
  await reachMission(page, 2);
  await page.getByRole("button", { name: "미션 열기" }).click();
  const workbench = await new AxeBuilder({ page }).analyze();
  expect(workbench.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
  await page.getByRole("button", { name: "낱개 10개 묶기" }).click();
  await page.getByRole("button", { name: "묶음 확인" }).click();
  const quantityCheck = await new AxeBuilder({ page }).analyze();
  expect(quantityCheck.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});

test("320px 작업대에서도 가로 넘침이 없다", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await reachMission(page, 2);
  await page.getByRole("button", { name: "미션 열기" }).click();
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  await expect(page.getByRole("button", { name: "낱개 10개 묶기" })).toBeVisible();
});

test("320px 수량 입력 화면에서도 가로 넘침이 없다", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await reachMission(page, 0);
  await page.getByRole("button", { name: "미션 열기" }).click();
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  await expect(page.getByRole("textbox", { name: "배송 수량표" })).toBeVisible();
  await expect(page.getByRole("button", { name: "지우기" })).toBeVisible();
});

for (const viewport of [
  { width: 320, height: 568 }, { width: 375, height: 812 },
  { width: 768, height: 1024 }, { width: 1280, height: 800 },
]) {
  test(`${viewport.width}px 화면에서 가로 넘침이 없다`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openStart(page);
    const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  });
}
