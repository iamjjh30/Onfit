from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Onfit AI 서버가 정상 작동 중입니다!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "query": q}