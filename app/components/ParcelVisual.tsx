import { calculateTotal } from "../lib/math";
import type { Representation } from "../lib/types";

interface ParcelVisualProps {
  readonly value: Representation;
  readonly compact?: boolean;
}

function Bundle() {
  return (
    <div className="ten-bundle" aria-hidden="true">
      <span className="bundle-label">10</span>
      <span className="bundle-tape" />
      <div className="bundle-grid">
        {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
      </div>
    </div>
  );
}

export function ParcelVisual({ value, compact = false }: ParcelVisualProps) {
  const total = calculateTotal(value);
  return (
    <section className={`parcel-visual ${compact ? "compact" : ""}`} aria-label={`십 묶음 ${value.bundles}개, 낱개 ${value.loose}개, 모두 ${total}개입니다.`}>
      <span className="sr-only">낱개 {value.loose}개</span>
      <div className="parcel-zone bundle-zone">
        <div className="zone-heading">
          <span><b aria-hidden="true">🎁</b> 십 묶음</span>
          <strong>{value.bundles}개</strong>
        </div>
        <div className="bundle-shelf" aria-hidden="true">
          {value.bundles === 0 ? <span className="empty-marker">0</span> : Array.from({ length: value.bundles }, (_, index) => <Bundle key={index} />)}
        </div>
      </div>
      <div className="parcel-zone loose-zone">
        <div className="zone-heading">
          <span><b aria-hidden="true">📦</b> 낱개</span>
          <strong>{value.loose}개</strong>
        </div>
        <div className="loose-grid" aria-hidden="true">
          {value.loose === 0 ? <span className="empty-marker">0</span> : Array.from({ length: value.loose }, (_, index) => <span className="loose-box" key={index} />)}
        </div>
      </div>
      <div className="total-strip">
        <span>{value.bundles * 10} + {value.loose}</span>
        <strong>= 모두 {total}개</strong>
      </div>
    </section>
  );
}
