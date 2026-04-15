import os
import io
import base64
from gradio_client import Client, handle_file
import subprocess
import requests
import sys
import threading
from flask import Flask, request, jsonify, Response, send_file
from werkzeug.utils import secure_filename
from pyngrok import ngrok
from PIL import Image, ImageOps
from flask_cors import CORS
from openai import OpenAI
import json
import hashlib

# ==========================================
# [중요] API 키 설정 구역
# ==========================================
os.environ["OPENAI_API_KEY"] = "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"
os.environ["HF_TOKEN"] = "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"

app = Flask(__name__)
CORS(app)

hf_client = Client("yisol/IDM-VTON")

client = OpenAI()
analysis_cache = {}

def fix_orientation(img_path):
    img = Image.open(img_path)
    img = ImageOps.exif_transpose(img)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img.save(img_path)

def encode_image_to_b64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

# ==========================================
# 1. 가상 피팅 라우트
# ==========================================
@app.route('/api/try-on', methods=['POST'])
def try_on():
    temp_user_path = "temp_user.jpg"
    temp_cloth_path = "temp_cloth.jpg"

    try:
        if 'user_image' not in request.files or 'cloth_image' not in request.files:
            return jsonify({'error': '사람 사진과 옷 사진 2장이 모두 필요합니다.'}), 400

        user_file = request.files['user_image']
        cloth_file = request.files['cloth_image']
        user_file.save(temp_user_path)
        cloth_file.save(temp_cloth_path)

        def fix_orientation(img_path):
            img = Image.open(img_path)
            img = ImageOps.exif_transpose(img)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            img.save(img_path)

        fix_orientation(temp_user_path)
        fix_orientation(temp_cloth_path)

        # ==========================================================
        base_garment = request.form.get('garment_des', 'the exact clothing from the reference image')
        default_prompt = (
            f"{base_garment},"
            "short waist-length white sherpa zip-up hoodie, realistic fabric texture, preserving material details, " # ★ 질감 유지!
            "hood is folded down and resting on the back (if the clothing has a hood), " # 모자 뒤로!
            "strictly preserve original human body shape, keep exact original posture and proportions, " # 체형 유지!
            "no body distortion, perfectly fit on the existing body, "
            "upper body only, do not modify pants, keep original background"
        )

        # ==========================================================

        print(f">>> 🚀 VIP 전용 쿼터로 가상 피팅 요청 전송 중... (프롬프트 적용 완료)")

        result = hf_client.predict(
            dict={"background": handle_file(temp_user_path), "layers": [], "composite": None},
            garm_img=handle_file(temp_cloth_path),
            garment_des=default_prompt,
            is_checked=True,
            is_checked_crop=False,
            denoise_steps=30,
            seed=42,
            api_name="/tryon"
        )

        result_image_path = result[0]
        with open(result_image_path, "rb") as img_file:
            base64_encoded = base64.b64encode(img_file.read()).decode('utf-8')
            final_url = f"data:image/jpeg;base64,{base64_encoded}"

        print("🎉 AI 피팅 완벽 성공! 결과물을 웹으로 보냅니다.")
        return jsonify({'result_url': final_url})

    except Exception as e:
        print(f"❌ 서버 에러: {str(e)}")
        return jsonify({'error': f'서버 내부 에러: {str(e)}'}), 500

if __name__ == '__main__':
    print("=== 🚀 캡스톤 카운터 서버 가동 (포트 5000) ===")
    app.run(host='0.0.0.0', port=5000, debug=True)

# ==========================================
# 공통 유틸 함수 (얼굴 분석용)
# ==========================================
def encode_image(image_file):
    image_file.seek(0)
    return base64.b64encode(image_file.read()).decode('utf-8')


def get_image_hash(image_file):
    image_file.seek(0)
    file_bytes = image_file.read()
    image_file.seek(0)
    return hashlib.md5(file_bytes).hexdigest()

# ==========================================
# 2. 얼굴 및 톤 분석 라우트
# ==========================================
@app.route('/api/analyze-face', methods=['POST'])
def analyze_face():
    try:
        if 'image' not in request.files:
            return jsonify({'error': '이미지가 없습니다.'}), 400

        file = request.files['image']

        img_hash = get_image_hash(file)

        if img_hash in analysis_cache:
            print("이미 검사한 사진입니다! 기존 결과를 반환합니다.")
            return jsonify(analysis_cache[img_hash])

        mime_type    = file.mimetype
        base64_image = encode_image(file)

        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            temperature=0.0,
            seed=42,
            messages=[
                {
                    "role": "system",
                    "content": """당신은 10년 경력의 까다로운 퍼스널 컬러 애널리스트입니다.
 
                    ## [절대 규칙]
                    1. 얼굴이 1%라도 보이면 무조건 분석 완료 (화질/조명 불문)
                    2. 사람이 아예 없는 사진만 error 반환
                    3. 반드시 4계절 중 하나 선택: "봄 웜톤" | "여름 쿨톤" | "가을 웜톤" | "겨울 쿨톤"
 
        ## [최우선 주의: 흑발+밝은피부 함정]
        겉보기 흑백 대비 강해도 → 절대 바로 '겨울 쿨톤' 판정 금지
        → 반드시 먼저 확인: 목/뺨 그림자의 색온도, 머리카락 반사광(골드/오렌지=웜 vs 애쉬/블루=쿨)
        → 따뜻한 기운 1%라도 있으면 → 봄/가을 웜톤 강력 의심
 
        ## [분석 순서 — 반드시 이 순서로 판단]
        STEP 1. 웜/쿨 판별
                    - 목·얼굴 경계 그림자색: 황금빛/복숭아빛=웜 / 회청빛=쿨
                                                     - 머리카락 빛 반사: 오렌지·골드=웜 / 애쉬·플럼·차콜=쿨
                                                                                      - 눈 흰자: 살짝 노란빛=웜 / 파란빛=쿨
 
        STEP 2. 명도·채도 판별
                      - 전체 인상이 밝고 투명한가? → 봄/여름
                                          - 전체 인상이 깊고 차분한가? → 가을/겨울
                                                              - 이목구비 대비(피부↔눈동자·머리) 강한가? → 겨울/가을 다크
                                                                                                - 이목구비 대비 부드러운가? → 봄/여름
 
        STEP 3. 최종 4계절 확정
        웜+밝고 맑음 → 봄 웜톤
        쿨+밝고 부드러움 → 여름 쿨톤
        웜+깊고 차분함 → 가을 웜톤
        쿨+강렬한 대비 → 겨울 쿨톤
 
        ## [사진 품질 경고 (분석은 계속)]
        아래 해당 시 warning 필드에 부드럽게 안내:
        - 스튜디오 백색조명·직사광선으로 피부 날아간 경우
                                  - 뷰티앱 필터/보정으로 피부톤 변형된 경우
        사진이 좋다면 warning은 "" (빈 문자열)
 
        ## [features 작성 규칙]
        - 말투: 친근하고 전문적 (~해요, ~하네요)
                   - 애매한 칭찬 금지: "자연스럽다", "조화롭다" → 사용 금지
                                                     - 필수 포함 3가지:
        ① 피부 베이스의 구체적 색감 (붉은기, 노란기, 올리브, 창백함 등)
        ② 명도 대비 (피부↔눈동자·머리색의 밝기 차이가 강/약)
        ③ 인과 결론 (①+②이기 때문에 → ○○톤)
 
        ## [출력 형식 — JSON만, 다른 텍스트 금지]
 
        정상 분석:
        {
            "tone": "가을 웜톤",
            "features": "뺨 그림자에서 황갈색 기운이 감도는 웜톤 베이스가 확인돼요. 머리카락도 빛을 받으면 골드빛 반사가 나타나고 피부에 은은한 올리브기가 섞여 있어요. 눈동자와 피부의 명도 차이는 중간 정도로, 선명하기보다 깊고 차분한 인상이라서 가을 웜톤으로 진단했어요.",
            "best_colors": ["#8B4513", "#D2691E", "#6B8E23", "#CD853F", "#2F4F4F"],
            "worst_colors": ["#FF69B4", "#00FFFF", "#FFD700"],
            "recommended_styles": ["카멜 코트", "올리브 와이드 팬츠", "버건디 니트", "브라운 레더 자켓"],
            "warning": ""
        }
 
        사람 없는 사진:
        {"error": "얼굴을 인식할 수 없습니다. 정면 사진을 올려주세요."}
        """
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "이 사진에 얼굴이 있는지 확인하고, 있다면 퍼스널 컬러를 분석해 줘."},
                        {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}}
                    ]
                }
            ]
        )

        ai_result = json.loads(response.choices[0].message.content)

        if "error" not in ai_result:
            analysis_cache[img_hash] = ai_result
            print(f"새로운 분석 결과를 기록했습니다. (Hash: {img_hash})")
        else:
            print("에러 발생:", ai_result)

        print("AI의 실제 답변:", ai_result)
        return jsonify(ai_result)

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'AI 분석 중 오류가 발생했습니다.'}), 500

# ==========================================
# 서버 실행
# ==========================================
if __name__ == '__main__':
    print("=== 🚀 AI 피팅 서버 가동 (포트 5000) ===")
    print(f"  · 가상 피팅: Vertex AI Virtual Try-On (virtual-try-on-001)")
    print(f"  · 얼굴 분석: OpenAI GPT-4o")
    app.run(host='0.0.0.0', port=5000, debug=True)

