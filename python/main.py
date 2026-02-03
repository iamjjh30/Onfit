from fastapi import FastAPI, UploadFile, File
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import cv2
import os
import uvicorn

app = FastAPI()

# 동적 경로 설정: 모델 파일 위치 찾기
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, 'pose_landmarker.task')

# AI 모델 초기화
base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    output_segmentation_masks=True)
detector = vision.PoseLandmarker.create_from_options(options)

@app.post("/analyze")
async def analyze_pose(photo: UploadFile = File(...)):
    print(f"📸 사진 수신: {photo.filename}")

    # 1. 이미지 디코딩
    contents = await photo.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 2. MediaPipe 분석
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image)
    detection_result = detector.detect(mp_image)

    # 3. 모든 좌표를 리스트 형태로 담기
    points = []
    if detection_result.pose_landmarks:
        for landmark in detection_result.pose_landmarks[0]:
            points.append({
                "x": landmark.x,
                "y": landmark.y,
                "z": landmark.z
            })

    print(f"✅ 분석 완료 (좌표 {len(points)}개 추출)")
    return {"status": "success", "landmarks": points}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)