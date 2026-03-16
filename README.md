# AI 신용 위험 분석기

XGBoost 머신러닝 모델과 Groq LLM을 활용한 신용 위험 분석 웹 애플리케이션입니다.

## 주요 기능

- 고객 정보 입력시 2년 내 연체 확률 예측
- 주요 영향 요인 시각화
- AI 전문가 설명 자동 생성

## 기술 스택
- Frontend: React, Vercel
- Backend: FastAPI, HuggingFace Spaces
- ML: XGBoost (ROC-AUC 0.8583)
- LLM: Llama3 via Groq API
- Data: Credit Risk Benchmark Dataset (16,714건)

## 아키텍처
```
React (Vercel) → FastAPI (HuggingFace Spaces) → XGBoost 모델 + Groq LLM
```

## 로컬 실행
```bash
npm install
npm start
```

## 배포

- Backend: https://springtowinter-credit-risk-api.hf.space
- Frontend: Vercel 자동 배포
