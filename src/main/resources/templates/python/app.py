import os
import base64
import replicate
import requests
from flask import Flask, request, jsonify, Response, send_file
from werkzeug.utils import secure_filename
from PIL import Image, ImageOps
from flask_cors import CORS
from openai import OpenAI
import json
import hashlib

app = Flask(__name__)
CORS(app)

# ==========================================
# [중요] API 키 설정 구역
# ==========================================
os.environ["OPENAI_API_KEY"] = "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"

os.environ["REPLICATE_API_TOKEN"] = "r8_AuAomEeY8p5B9PYoLkRC9Z1Ovf4EclG1VJcbE"

client = OpenAI()

analysis_cache = {}

def encode_image(image_file):
    """이미지 파일을 Base64 문자열로 인코딩하는 함수"""
    image_file.seek(0)
    return base64.b64encode(image_file.read()).decode('utf-8')

def get_image_hash(image_file):
    image_file.seek(0) 
    file_bytes = image_file.read()
    image_file.seek(0) 
    return hashlib.md5(file_bytes).hexdigest()

# ==========================================
# 1. 가상 피팅 라우트
# ==========================================
@app.route('/api/try-on', methods=['POST'])
def try_on():
    temp_user_path = "temp_user.jpg"
    temp_cloth_path = "temp_cloth.jpg"

    try:
        if 'user_image' not in request.files or 'cloth_image' not in request.files:
            return jsonify({'error': '사진 2장(사람, 옷)이 모두 필요합니다.'}), 400

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

        print(">>> Replicate API (IDM-VTON) 가상 피팅 요청 중...")

        # 3. Replicate API 호출
        with open(temp_cloth_path, "rb") as cloth_f, open(temp_user_path, "rb") as user_f:
            output = replicate.run(
                "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
                input={
                    "garm_img": cloth_f,
                    "human_img": user_f,
                    "garment_des": (
                            "short sleeve t-shirt, highly detailed texture, "
                            "fleece zip-up hoodie, thick texture, fitting naturally around folded arms, realistic wrinkles,"
                            "perfectly fitted to the wearer's body shape, natural fabric drape,"
                            "realistic ambient lighting and soft shadows matching the original photo, "
                            "high resolution, photorealistic, ultra-detailed"
                    ),
                    "negative_prompt": (
                        "distorted body, deformed hands, disfigured features, unnatural proportions, "
                        "hands merging with clothing, blurred details, low quality, blurry, "
                        "cartoonish, extra limbs, missing fingers, altered background"
                    ),
                    "category": "upper_body",
                    "crop": False,
                    "steps": 40,
                    "quality": "high"
                }
            )

        print(f">>> 피팅 완료! 원본 결과 데이터: {output}")

        output_list = output if isinstance(output, list) else list(output)
        if not output_list or len(output_list) == 0:
            return jsonify({'error': 'AI가 이미지를 생성하지 못했습니다.'}), 400

        result_item = output_list[0]
        final_url = ""

        # 파일 데이터를 Base64 글자로 변환해서 프론트엔드에 전달
        if hasattr(result_item, 'read'):
            image_data = result_item.read()
            base64_encoded = base64.b64encode(image_data).decode('utf-8')
            final_url = f"data:image/jpeg;base64,{base64_encoded}" # 브라우저가 바로 읽을 수 있는 이미지 주소 포맷

        elif isinstance(result_item, bytes):
            base64_encoded = base64.b64encode(result_item).decode('utf-8')
            final_url = f"data:image/jpeg;base64,{base64_encoded}"

        elif isinstance(result_item, str) and result_item.startswith('http'):
            final_url = result_item

        if final_url:
            print("✅ AI 피팅 완료! (Base64/URL 변환 성공)")
            return jsonify({'result_url': final_url})
        else:
            return jsonify({'error': '이미지를 변환할 수 없습니다.'}), 500

    except Exception as e:
        print(f"Try-on Error: {str(e)}")
        return jsonify({'error': '가상 피팅 중 오류가 발생했습니다.'}), 500

    finally:
        # 임시 파일 깔끔하게 삭제
        if os.path.exists(temp_user_path): os.remove(temp_user_path)
        if os.path.exists(temp_cloth_path): os.remove(temp_cloth_path)


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

        # ★ 핵심 해결책: 이미지의 진짜 포맷(png, jpg 등)을 알아냄
        mime_type = file.mimetype
        base64_image = encode_image(file)

        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            temperature=0.0,
            seed=42,
            messages=[
                {
                    "role": "system",
                    "content": """너는 10년 경력의 깐깐한 퍼스널 컬러 애널리스트야. 
                    
                    [절대 거절 금지 (무조건 분석)]
                    사진에 사람의 이목구비가 1%라도 보인다면, 화질이 나쁘든 화보 조명이든 절대 분석을 포기하거나 에러를 내지 마! 사람이 맞다면 무조건 끝까지 추론해서 결과를 도출해. (사람이 아예 없는 풍경/사물 사진일 때만 "error" 반환)
                    
                    [흑발+밝은 피부 함정 (겨울 쿨톤 오진) 절대 주의]
                    비전 AI의 가장 흔하고 치명적인 실수는 연예인의 '흑발'과 조명에 하얗게 날아간 '피부'만 보고 무조건 '겨울 쿨톤'으로 오진하는 것. 
                    - 겉보기에 흑백 대비가 강해 보인다고 절대 '겨울 쿨톤'으로 직행하지 말 것.
                    - 머리가 까맣고 피부가 밝아도, 목 그림자나 뺨 가장자리에 '따뜻한 피치, 골드, 차분한 황갈색, 올리브톤'이 1%라도 섞여 있다면 그것은 가을 웜톤이나 봄 웜톤이 조명을 받은 것일 확률이 99%. 깊은 곳의 웜톤 베이스를 반드시 찾아낼 것.
                    
                    [사진 품질 평가 및 경고 메시지 생성]
                    먼저 사진의 조명과 필터 상태를 평가. 분석을 멈추지는 말고, 아래 악조건에 해당한다면 결과 JSON에 'warning' 항목을 추가해서 사용자에게 부드럽게 알릴 것.
                    - 조건 1: 스튜디오 백색 조명이나 직사광선으로 피부가 하얗게 날아간 경우
                    - 조건 2: 뷰티 어플의 필터나 색보정이 심해 본연의 피부결이 안 보이는 경우
                    * 경고 문구 예시: "조명이 다소 강해서(혹은 필터가 적용되어서) 정확도가 떨어질 수 있어요. 자연광에서 필터 없이 찍으시면 더 완벽한 진단이 가능해요!"
                    * 사진이 아주 좋다면 'warning' 항목은 아예 빼거나 빈 문자열("")로 보낼 것.
                    
                    [정밀 분석 및 객관식 선택 (품질 통과 시)]
                    사진 품질이 어떻든 절대 분석을 포기하지 말 것. 피부 본연의 색과 그림자를 찾아내고 아래 4가지 톤 중 하나를 무조건 선택할 것.
                    선택지: ["봄 웜톤", "여름 쿨톤", "가을 웜톤", "겨울 쿨톤"]
                    
                    [핵심: 구체적이고 논리적인 진단 이유 작성]
                    'features' 항목에는 절대 '부드럽고 자연스럽습니다', '조화롭습니다' 같은 애매하고 뭉뚱그린 표현을 쓰지 말 것. 
                    마치 전문가가 고객에게 브리핑하듯이, 아래 3가지 요소를 반드시 포함해서 명확한 인과관계(A라서 B이다)로 작성할 것.
                    
                    [다정하지만 명확하고 전문적인 진단 이유 작성]
                    'features' 항목에는 기계적인 말투를 버리고, 고객과 마주 앉아 다정하게 설명해 주듯 부드럽고 따뜻한 말투(~해요, ~하네요 등)를 사용할 것.
                    단, '무조건 예쁘다, 조화롭다' 식의 애매한 칭찬은 금지. 아래 3가지 요소를 부드러운 문장 안에 명확히 녹여내야 함.
                    
                    1. 피부 베이스: 붉은기, 노란기, 창백함, 올리브톤 등 피부에 도는 실제 색감을 구체적으로 묘사할 것.
                    2. 명도/대비감: 피부 밝기와 머리카락/눈동자 색의 밝기 차이(대비감)가 강한지 약한지 콕 집어 설명할 것. (예: "눈동자가 새까매서 피부와 흑백 대비가 강함")
                    3. 최종 결론: 1번과 2번의 이유 때문에 최종적으로 왜 이 톤으로 판별했는지 논리적으로 결론을 내릴 것.
                    
                    [정밀 분석 지침]
                    사진의 겉보기 조명을 걷어내고, 아래의 본연의 특징을 꼼꼼히 따져서 4계절(봄, 여름, 가을, 겨울)을 균형 있게 판별할 것.
                    1. 웜/쿨 판별: 피부 표면의 빛 반사가 아닌, 목과 얼굴 경계선의 '그림자 색상', 붉은기/올리브기 유무, 흰자위의 푸른기, 머리카락이 빛을 받을 때의 반사광(오렌지/골드 vs 애쉬/플럼/블랙)을 확인할 것.
                    2. 명도 및 채도: 이목구비의 대비감을 확인해. 피부색과 머리색/눈동자색의 명도 차이가 부드러운지, 아니면 흑백처럼 아주 강렬하고 또렷한지(겨울 클리어/다크) 분석할 것.
                    3. 여름 쿨톤의 청량/애쉬함, 가을 웜톤의 차분함, 겨울 쿨톤의 강렬한 흑백 대비가 보인다면 주저하지 말고 해당 톤으로 진단할 것.
                    
                    만약 사람이 아예 없는 풍경, 사물 사진이라면 아래 JSON으로 응답할 것:
                    { "error": "얼굴을 인식할 수 없습니다. 정면 사진을 올려주세요." }
                    
                    [정상 분석 결과 JSON 형식] (반드시 한국어 사용)
                    {
                        "tone": "세부 톤 명칭",
                        "features": "강한 조명에도 불구하고 눈동자와 머리카락의 짙은 흑색 멜라닌이 돋보이며, 피부 바탕에 푸른기가 감도는 쿨톤 베이스입니다... (진단 이유 3문장 요약)",
                        "best_colors": ["#HEX", "#HEX", "#HEX"],
                        "worst_colors": ["#HEX", "#HEX"], 
                        "recommended_styles": ["추천 패션 아이템 1", "추천 아이템 2", "추천 아이템 3"]
                        "warning": "현재 사진은 조명이 강해 톤이 다소 차갑게 보일 수 있어요. 자연광 사진을 올려주시면 더 정확해요!"
                    }"""
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
            print("새로운 분석 결과를 기록했습니다. (Hash: {img_hash})")
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
    print("=== All-in-One AI Server Started (Color + GenAI Fitting) ===")
    app.run(host='0.0.0.0', port=5000, debug=True)