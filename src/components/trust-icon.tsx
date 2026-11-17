// Tabler Icons (MIT). See public/licenses/tabler-icons.txt.
const paths = {
  "price": [
    "M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0",
    "M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3"
  ],
  "advance": [
    "M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12",
    "M20 12v4h-4a2 2 0 0 1 0 -4h4"
  ],
  "cancellation": [
    "M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",
    "M12 7v5l3 3"
  ],
  "chauffeur": [
    "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0",
    "M6 21v-2a4 4 0 0 1 4 -4h4",
    "M15 19l2 2l4 -4"
  ]
} as const;

export function TrustIcon({ name }: { name: keyof typeof paths }) {
  return <svg className="trust-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name].map((path) => <path key={path} d={path} />)}</svg>;
}
