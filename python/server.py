import os
import io
import base64
import subprocess
import requests
import sys
import threading
from flask import Flask, request, jsonify, Response, send_file
from werkzeug.utils import secure_filename
from PIL import Image, ImageOps
from flask_cors import CORS
from openai import OpenAI
import json
import hashlib
import google.auth
import google.auth.transport.requests
from google.oauth2 import service_account

app = Flask(__name__)
CORS(app)

# ==========================================
# [중요] API 키 설정 구역
# ==========================================
os.environ["OPENAI_API_KEY"] = "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"

# ==========================================
# [Vertex AI] 설정 구역 ← 여기만 수정하세요
# ==========================================
GCP_PROJECT_ID = "your-project-id"       # ← GCP 프로젝트 ID
GCP_REGION     = "us-central1"           # ← 리전 (us-central1 권장)
GCS_OUTPUT_URI = "gs://your-bucket/tryon-output/"  # ← GCS 버킷 경로

client = OpenAI()
analysis_cache = {}


# ==========================================
# 공통 유틸 함수
# ==========================================
def fix_orientation(img_path):
    img = Image.open(img_path)
    img = ImageOps.exif_transpose(img)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img.save(img_path)


def encode_image_to_b64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def get_gcp_access_token() -> str:
    """gcloud CLI로 액세스 토큰을 가져옵니다."""
    try:
        token = subprocess.check_output(
            ["gcloud", "auth", "print-access-token"],
            stderr=subprocess.DEVNULL
        ).decode().strip()
        return token
    except Exception as e:
        raise RuntimeError(
            "gcloud 인증 실패. 서버에서 'gcloud auth application-default login'을 먼저 실행하세요.\n"
            f"상세 오류: {e}"
        )


def call_vertex_tryon(person_path: str, cloth_path: str, image_count: int = 1) -> str:
    """
    Vertex AI Virtual Try-On API를 호출하고,
    결과 이미지를 Base64 data URL로 반환합니다.

    Args:
        person_path: 사람(상반신) 이미지 경로
        cloth_path: 상의 이미지 경로
        image_count: 생성할 이미지 수 (1~4)

    Returns:
        "data:image/jpeg;base64,..." 형식의 문자열
    """
    person_b64 = encode_image_to_b64(person_path)
    cloth_b64  = encode_image_to_b64(cloth_path)
    token      = get_gcp_access_token()

    url = (
        f"https://{GCP_REGION}-aiplatform.googleapis.com/v1"
        f"/projects/{GCP_PROJECT_ID}/locations/{GCP_REGION}"
        f"/publishers/google/models/virtual-try-on-001:predict"
    )

    payload = {
        "instances": [
            {
                "person_image":  {"bytesBase64Encoded": person_b64},
                "product_image": {"bytesBase64Encoded": cloth_b64},
            }
        ],
        "parameters": {
            "imageCount":   image_count,
            "outputGcsUri": GCS_OUTPUT_URI,
        }
    }

    print(f">>> 🚀 Vertex AI Virtual Try-On 요청 전송 중...")

    resp = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type":  "application/json",
        },
        json=payload,
        timeout=120,  # 최대 2분 대기
    )

    if not resp.ok:
        raise RuntimeError(
            f"Vertex AI API 오류 {resp.status_code}: {resp.text}"
        )

    data = resp.json()

    # 응답에서 Base64 이미지 추출
    # 응답 구조: {"predictions": [{"bytesBase64Encoded": "..."}]}
    try:
        b64_image = data["predictions"][0]["bytesBase64Encoded"]
        return f"data:image/jpeg;base64,{b64_image}"
    except (KeyError, IndexError) as e:
        raise RuntimeError(
            f"응답 파싱 실패. 전체 응답: {json.dumps(data, indent=2)}\n원인: {e}"
        )


# ==========================================
# 1. 가상 피팅 라우트 (Vertex AI Virtual Try-On)
# ==========================================
@app.route('/api/try-on', methods=['POST'])
def try_on():
    temp_user_path  = "temp_user.jpg"
    temp_cloth_path = "temp_cloth.jpg"

    try:
        # 1. 리액트(웹)에서 보낸 사진 2장 받기
        if 'user_image' not in request.files or 'cloth_image' not in request.files:
            return jsonify({'error': '사람 사진과 옷 사진 2장이 모두 필요합니다.'}), 400

        user_file  = request.files['user_image']
        cloth_file = request.files['cloth_image']

        user_file.save(temp_user_path)
        cloth_file.save(temp_cloth_path)

        # 사진 회전 오류 방지 (EXIF)
        fix_orientation(temp_user_path)
        fix_orientation(temp_cloth_path)

        # 생성할 이미지 수 (옵션, 기본 1장)
        image_count = int(request.form.get('image_count', 1))
        image_count = max(1, min(image_count, 4))  # 1~4 범위 제한

        print(f">>> 👕 가상 피팅 시작 (이미지 {image_count}장 요청)")

        # 2. Vertex AI Virtual Try-On API 호출
        final_url = call_vertex_tryon(temp_user_path, temp_cloth_path, image_count)

        print("🎉 Vertex AI 피팅 완료! 결과를 웹으로 전송합니다.")
        return jsonify({'result_url': final_url})

    except RuntimeError as e:
        # API 설정/인증/파싱 관련 명확한 오류
        print(f"❌ Vertex AI 오류: {e}")
        return jsonify({'error': str(e)}), 500

    except Exception as e:
        print(f"❌ 서버 에러: {e}")
        return jsonify({'error': f'서버 내부 에러: {str(e)}'}), 500

    finally:
        # 임시 파일 정리
        for path in [temp_user_path, temp_cloth_path]:
            if os.path.exists(path):
                os.remove(path)


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
