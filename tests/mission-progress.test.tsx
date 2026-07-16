import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MissionProgress } from "../app/components/MissionProgress";

describe("미션 진행 안내", () => {
  it("현재 미션을 포함한 남은 개수를 보여 준다", () => {
    render(<MissionProgress completedCount={0} currentMission={1} total={9} />);
    expect(screen.getByRole("progressbar")).toHaveAccessibleName(/9개 남음/);
  });

  it("아직 풀지 않은 9번째 미션을 마지막 1개로 안내한다", () => {
    render(<MissionProgress completedCount={8} currentMission={9} total={9} />);
    expect(screen.getByRole("progressbar")).toHaveAccessibleName(/현재 마지막 미션, 1개 남음/);
    expect(screen.getByText(/마지막 미션/)).toBeInTheDocument();
  });
});
