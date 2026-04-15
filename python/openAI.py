import os
import base64
from flask import Flask, request, jsonify, Response # Flask 추가됨!
from flask_cors import CORS
from openai import OpenAI
import json

app = Flask(__name__)
CORS(app)

# 1. API 키 설정 (이름은 OPENAI_API_KEY 고정, 값에 새 API 키 입력!)
os.environ["OPENAI_API_KEY"] = "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"
client = OpenAI()

def encode_image(image_file):
    """이미지 파일을 Base64 문자열로 인코딩하는 함수"""
    return base64.b64encode(image_file.read()).decode('utf-8')

@app.route('/api/analyze-face', methods=['POST'])
def analyze_face():
    try:
        if 'image' not in request.files:
            return jsonify({'error': '이미지가 없습니다.'}), 400

        file = request.files['image']

        # 이미지를 Base64로 변환
        base64_image = encode_image(file)

        # 2. OpenAI API 호출 (일관성 + 정밀 분석 프롬프트 적용)
        # 2. OpenAI API 호출 (얼굴 감지 예외처리 추가)
        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={ "type": "json_object" },
            temperature=0.1,
            seed=42,
            messages=[
                {
                    "role": "system",
                    "content": """너는 10년 경력의 VIP 전담 퍼스널 컬러 애널리스트야. 
                    
                    [1순위 확인 사항: 얼굴 인식]
                    가장 먼저 업로드된 사진에 '사람의 얼굴'이 명확하게 포함되어 있는지 확인해.
                    만약 사람 얼굴이 없거나(풍경, 사물, 동물 등), 얼굴을 알아볼 수 없는 뒷모습이라면 분석을 즉시 중단하고 반드시 아래 JSON 형식으로만 응답해:
                    {
                        "error": "얼굴을 인식할 수 없습니다. 얼굴이 잘 보이는 정면 사진을 올려주세요."
                    }
                    
                    [정상 분석 기준]
                    사람의 얼굴이 맞다면, 조명이나 배경색에 휘둘리지 말고 아래의 절대 분석 기준을 엄격하게 적용해.
                    1. 웜/쿨 판별: 피부의 노란기(Warm) vs 붉은기/푸른기(Cool) 베이스 확인
                    2. 대비감 분석: 피부 밝기와 이목구비(눈동자 색, 머리색)의 명도 차이 확인
                    
                    얼굴이 정상 인식된 경우에만 아래 JSON 형식으로 응답해. (모든 텍스트는 한국어 필수, 항목 누락 절대 금지)
                    {
                        "tone": "봄 라이트 웜톤 등 세부 톤 명칭",
                        "features": "피부톤, 이목구비 대비감 등 진단 이유 (3문장 요약)",
                        "best_colors": ["#HEX", "#HEX", "#HEX"],
                        "worst_colors": ["#HEX", "#HEX"], 
                        "recommended_styles": ["추천 패션 아이템 1", "추천 아이템 2", "추천 아이템 3"]
                    }"""
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "이 사진에 얼굴이 있는지 확인하고, 있다면 퍼스널 컬러를 분석해 줘."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ]
        )

        # AI의 답변(JSON 문자열)을 파이썬 딕셔너리로 변환
        ai_result = json.loads(response.choices[0].message.content)

        return jsonify(ai_result)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'AI 분석 중 오류가 발생했습니다.'}), 500

# 2. 서버 실행 코드 추가 (이게 있어야 서버가 켜집니다)
if __name__ == '__main__':
    print("=== OpenAI 진단 서버 시작 ===")
    app.run(host='0.0.0.0', port=5000, debug=True)