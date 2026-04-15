import os
from openai import OpenAI

# 1. 기존 app.py에서 사용하시던 OpenAI API 키를 똑같이 넣어주세요!
OPENAI_API_KEY = "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"

# 2. xAI용 주소(base_url)를 지우고 순정 OpenAI 클라이언트로 돌아옵니다.
client = OpenAI(api_key=OPENAI_API_KEY)

def generate_dalle_image(prompt_text):
    try:
        # 터미널 에러 방지용 순수 영문 출력
        print("Requesting image generation to DALL-E 3... Please wait.")

        # 3. DALL-E 3 모델 호출
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt_text,
            n=1,
            size="1024x1024", # DALL-E 3 기본 고화질 사이즈
            quality="standard" # "hd"로 바꾸면 초고화질이 되지만 비용이 약간 늘어납니다
        )

        # 4. 결과 URL 추출
        image_url = response.data[0].url

        print("\nSuccess! Image generated.")
        print(f"URL: {image_url}")

        return image_url

    except Exception as e:
        print(f"\nError occurred: {e}")
        return None

# ==========================================
# 실행 테스트 (퍼스널 컬러 맞춤 프롬프트)
# ==========================================
if __name__ == "__main__":
    test_prompt = (
        "A sophisticated fashion editorial of a 20-something model wearing "
        "a calm orange-brown knit sweater perfectly matched for "
        "'Autumn Mute Warm Tone' personal color. "
        "Natural lighting, studio shot, highly detailed, photorealistic."
    )

    generate_dalle_image(test_prompt)