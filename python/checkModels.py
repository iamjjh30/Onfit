import google.generativeai as genai

genai.configure(api_key="AIzaSyBqGZFB-QAGeJTacVTysJS1AJpna5ZZvgQ")

print("🔎 사용 가능한 모델 목록:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)