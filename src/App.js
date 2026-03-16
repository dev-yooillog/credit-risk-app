import { useState } from "react";
const API_URL = "https://springtowinter-credit-risk-api.hf.space";
const FIELDS = [
  { key: "age", label: "나이", placeholder: "예: 45", step: 1 },
  { key: "monthly_inc", label: "월수입 (원)", placeholder: "예: 3500000", step: 10000 },
  { key: "debt_ratio", label: "부채비율 (0~1)", placeholder: "예: 0.35", step: 0.01 },
  { key: "rev_util", label: "신용카드 사용률 (0~1)", placeholder: "예: 0.6", step: 0.01 },
  { key: "open_credit", label: "보유 신용계좌 수", placeholder: "예: 5", step: 1 },
  { key: "late_30_59", label: "30-59일 연체 횟수", placeholder: "예: 0", step: 1 },
  { key: "late_60_89", label: "60-89일 연체 횟수", placeholder: "예: 0", step: 1 },
  { key: "late_90", label: "90일+ 연체 횟수", placeholder: "예: 0", step: 1 },
  { key: "real_estate", label: "부동산 담보 대출 수", placeholder: "예: 1", step: 1 },
  { key: "dependents", label: "부양가족 수", placeholder: "예: 2", step: 1 },
];
const FACTOR_LABELS = { rev_util:"신용카드 사용률", age:"나이", late_30_59:"30-59일 연체", debt_ratio:"부채비율", monthly_inc:"월수입", open_credit:"신용계좌 수", late_90:"90일+ 연체", real_estate:"부동산 담보", late_60_89:"60-89일 연체", dependents:"부양가족 수" };
export default function App() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  const handleSubmit = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API_URL}/predict`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("오류");
      setResult(await res.json());
    } catch(e) { setError("분석 중 오류가 발생했습니다."); }
    finally { setLoading(false); }
  };
  const riskColor = (level) => ({ "낮음": "#16a34a", "보통": "#d97706", "높음": "#dc2626" })[level] || "#6b7280";
  const topFactors = result ? Object.entries(result.shap_values).sort((a,b) => b[1]-a[1]).slice(0,5) : [];
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1rem", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>AI 신용 위험 분석기</h1>
      <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>고객 정보를 입력하면 XGBoost + LLM이 신용 위험을 분석합니다</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {FIELDS.map(({ key, label, placeholder, step }) => (
          <div key={key}>
            <label style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 4 }}>{label}</label>
            <input type="number" step={step} placeholder={placeholder} onChange={e => handleChange(key, e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
          </div>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={loading} style={{ marginTop: 20, width: "100%", padding: "12px", background: loading ? "#9ca3af" : "#4f46e5", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? "AI 분석 중..." : "신용 위험 분석하기"}
      </button>
      {error && <div style={{ marginTop: 16, padding: 12, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, color: "#dc2626", fontSize: 14 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ padding: 20, borderRadius: 12, border: `2px solid ${riskColor(result.risk_level)}`, background: "#f9fafb", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>연체 위험 점수</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", background: riskColor(result.risk_level), padding: "4px 12px", borderRadius: 20 }}>{result.risk_level}</span>
            </div>
            <div style={{ marginTop: 12, background: "#e5e7eb", borderRadius: 20, height: 18, overflow: "hidden" }}>
              <div style={{ width: `${result.risk_score * 100}%`, height: "100%", background: riskColor(result.risk_level), borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
                <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>{(result.risk_score * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
          <div style={{ padding: 16, background: "#f9fafb", borderRadius: 12, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>주요 영향 요인</h3>
            {topFactors.map(([key, val]) => {
              const maxVal = topFactors[0][1];
              const barW = (val / maxVal) * 100;
              return (
                <div key={key} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 13, marginBottom: 3 }}>{FACTOR_LABELS[key] || key}</div>
                  <div style={{ background: "#e5e7eb", borderRadius: 4, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${barW}%`, height: "100%", background: "#4f46e5", borderRadius: 4 }}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: 16, background: "#eff6ff", borderRadius: 12, border: "1px solid #bfdbfe" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>AI 전문가 설명</h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#1e40af", margin: 0 }}>{result.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
}