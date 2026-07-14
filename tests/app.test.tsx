import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TenBundleTerminal } from "../app/components/TenBundleTerminal";

describe("십 묶음 택배 터미널", () => {
  it("한 문장 목표와 연습 시작 버튼을 보여 준다", () => {
    render(<TenBundleTerminal />);
    expect(screen.getByRole("heading", { name: "십 묶음 택배 터미널" })).toBeInTheDocument();
    expect(screen.getByText(/10개가 모이면 십 묶음 1개/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "연습 시작" })).toBeInTheDocument();
  });

  it("업데이트 내역을 열고 Escape로 닫는다", async () => {
    const user = userEvent.setup();
    render(<TenBundleTerminal />);
    await user.click(screen.getByRole("button", { name: "업데이트 내역" }));
    expect(screen.getByRole("dialog", { name: "업데이트 내역" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "업데이트 내역" })).not.toBeInTheDocument();
  });

  it("낱개 7개와 10개를 비교하는 연습을 제공한다", async () => {
    const user = userEvent.setup();
    render(<TenBundleTerminal />);
    await user.click(screen.getByRole("button", { name: "연습 시작" }));
    expect(screen.getByRole("heading", { name: "낱개를 살펴봐요" })).toBeInTheDocument();
    expect(screen.getByText("낱개 7개")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "10개도 보기" }));
    expect(screen.getByRole("heading", { name: "10개를 한 묶음으로" })).toBeInTheDocument();
  });

  it("연습에서 버튼으로 낱개 10개를 묶는다", async () => {
    const user = userEvent.setup();
    render(<TenBundleTerminal />);
    await user.click(screen.getByRole("button", { name: "연습 시작" }));
    await user.click(screen.getByRole("button", { name: "10개도 보기" }));
    await user.click(screen.getByRole("button", { name: "낱개 10개 묶기" }));
    expect(screen.getByText(/낱개 10개와 십 묶음 1개는 같은 수/)).toBeInTheDocument();
  });

  it("첫 미션에서 0을 수량표에 쓸 수 있다", async () => {
    const user = userEvent.setup();
    render(<TenBundleTerminal />);
    await user.click(screen.getByRole("button", { name: "연습 시작" }));
    await user.click(screen.getByRole("button", { name: "10개도 보기" }));
    await user.click(screen.getByRole("button", { name: "낱개 10개 묶기" }));
    await user.click(screen.getByRole("button", { name: "배송 시작" }));
    await user.click(screen.getByRole("button", { name: "미션 열기" }));
    const input = screen.getByRole("textbox", { name: "배송 수량표" });
    await user.type(input, "0");
    await user.click(screen.getByRole("button", { name: "수량 확인" }));
    expect(screen.getByRole("group", { name: "0은 어떻게 읽을까요?" })).toBeInTheDocument();
  });

  it("화면 숫자 키패드와 지우기 버튼을 제공한다", async () => {
    const user = userEvent.setup();
    render(<TenBundleTerminal />);
    await user.click(screen.getByRole("button", { name: "연습 시작" }));
    await user.click(screen.getByRole("button", { name: "10개도 보기" }));
    await user.click(screen.getByRole("button", { name: "낱개 10개 묶기" }));
    await user.click(screen.getByRole("button", { name: "배송 시작" }));
    await user.click(screen.getByRole("button", { name: "미션 열기" }));
    const keypad = screen.getByRole("group", { name: "화면 숫자 키패드" });
    expect(within(keypad).getAllByRole("button")).toHaveLength(11);
  });

  it("수량 오류가 입력값을 지우지 않는다", async () => {
    const user = userEvent.setup();
    render(<TenBundleTerminal />);
    await user.click(screen.getByRole("button", { name: "연습 시작" }));
    await user.click(screen.getByRole("button", { name: "10개도 보기" }));
    await user.click(screen.getByRole("button", { name: "낱개 10개 묶기" }));
    await user.click(screen.getByRole("button", { name: "배송 시작" }));
    await user.click(screen.getByRole("button", { name: "미션 열기" }));
    const input = screen.getByRole("textbox", { name: "배송 수량표" });
    await user.type(input, "4");
    await user.click(screen.getByRole("button", { name: "수량 확인" }));
    expect(input).toHaveValue("4");
    expect(screen.getByText(/다시 세어/)).toBeInTheDocument();
  });

  it("처음으로 버튼은 확인 대화상자를 연다", async () => {
    const user = userEvent.setup();
    render(<TenBundleTerminal />);
    await user.click(screen.getByRole("button", { name: "처음으로" }));
    expect(screen.getByRole("dialog", { name: "처음부터 다시 할까요?" })).toBeInTheDocument();
  });
});
