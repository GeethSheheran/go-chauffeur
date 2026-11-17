export function CampaignGoBadge({ placement }: { placement: "hat" | "suitcase" | "car" }) {
  if (placement === "car") return <svg className="campaign-go-badge" viewBox="0 0 1536 1024" aria-hidden="true" focusable="false">
    <image href="/brand/go-symbol.png" x="705" y="547" width="220" height="93" preserveAspectRatio="xMidYMid meet" opacity="0.86" style={{ filter: "brightness(0) invert(1)" }} />
  </svg>;
  const hat = placement === "hat";
  const x = hat ? 680 : 698;
  const y = hat ? 734 : 834;
  return <svg className="campaign-go-badge" viewBox="0 0 1536 1024" aria-hidden="true" focusable="false">
    <g transform={`rotate(${hat ? -1 : 10} ${x + 19} ${y + 13})`}>
      <rect x={x} y={y} width="38" height="26" rx="6" fill="#fffdf5" />
      <image href="/brand/go-symbol.png" x={x + 4} y={y + 6} width="30" height="13" preserveAspectRatio="xMidYMid meet" />
    </g>
  </svg>;
}
