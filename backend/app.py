from fastapi import FastAPI
from pydantic import BaseModel
from optimizer import optimize_prompt

app = FastAPI()

class OptimizeRequest(BaseModel):
    prompt: str

@app.post("/optimize")
def optimize(req: OptimizeRequest):
    data = optimize_prompt(req.prompt)

    # Rough estimate: 1 token ≈ 4 characters (beta approximation)
    orig_tokens = max(1, len(data["original"]) // 4)
    opt_tokens = max(1, len(data["optimized"]) // 4)
    savings_pct = round((orig_tokens - opt_tokens) / orig_tokens * 100, 1)

    return {
        **data,
        "est": {
            "orig_tokens": orig_tokens,
            "opt_tokens": opt_tokens,
            "savings_pct": savings_pct
        }
    }