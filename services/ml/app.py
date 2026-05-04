from pydantic import BaseModel, Field
from fastapi import FastAPI

app = FastAPI(title="HIS Predictive Analytics Service")


class ReadmissionRiskInput(BaseModel):
    patientId: str
    age: int = Field(ge=0)
    priorAdmissions: int = Field(ge=0)
    comorbidityScore: float = Field(ge=0)
    abnormalLabs: int = Field(ge=0)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict/readmission-risk")
def predict_readmission_risk(payload: ReadmissionRiskInput):
    score = (
        0.015 * payload.age
        + 0.11 * payload.priorAdmissions
        + 0.09 * payload.comorbidityScore
        + 0.07 * payload.abnormalLabs
    )
    probability = max(0.01, min(score / 3.0, 0.97))
    return {
        "patientId": payload.patientId,
        "risk": round(probability, 3),
        "explanation": [
            "priorAdmissions",
            "comorbidityScore",
            "abnormalLabs",
        ],
        "modelVersion": "baseline-risk-v1",
    }

