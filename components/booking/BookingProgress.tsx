export default function BookingProgress({
  step,
  brand,
}: {
  step: number;
  brand: string;
}) {
  const steps = [
    { num: 1, label: "Service" },
    { num: 2, label: "Staff" },
    { num: 3, label: "Time" },
    { num: 4, label: "Confirm" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: 48,
      }}
    >
      {steps.map((s, i) => (
        <div key={s.num} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: s.num <= step ? brand : "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: s.num <= step ? "white" : "#999",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {s.num < step ? "✓" : s.num}
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: s.num === step ? 600 : 400,
                color: s.num === step ? "#111" : "#999",
              }}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                width: 60,
                height: 1,
                background: "#e5e7eb",
                margin: "0 12px",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
