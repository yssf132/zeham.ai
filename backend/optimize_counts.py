import cv2
from ultralytics import YOLO
import os

# Configuration to test
IMAGE_PATH = "./images/gate_2.jpg"
MODELS = ["yolov8m.pt", "yolov8l.pt"] # Test Medium and Large
CONFIGS = [
    {"conf": 0.25, "imgsz": 640},  # Baseline
    {"conf": 0.15, "imgsz": 640},  # Lower Conf
    {"conf": 0.10, "imgsz": 640},  # Very Low Conf
    {"conf": 0.15, "imgsz": 1280}, # High Res + Low Conf
    {"conf": 0.10, "imgsz": 1280}, # High Res + Very Low Conf
]

def test_inference():
    if not os.path.exists(IMAGE_PATH):
        print(f"Error: {IMAGE_PATH} not found.")
        return

    img = cv2.imread(IMAGE_PATH)
    if img is None:
        print("Error reading image.")
        return

    print(f"--- Optimizing Counts for {IMAGE_PATH} ---")
    
    for model_name in MODELS:
        print(f"\nLoading Model: {model_name}...")
        try:
            model = YOLO(model_name)
        except Exception as e:
            print(f"Failed to load {model_name}: {e}")
            continue

        for config in CONFIGS:
            conf = config["conf"]
            imgsz = config["imgsz"]
            
            # Run inference
            # agnostic_nms=True helps with overlapping people
            results = model(img, classes=0, conf=conf, imgsz=imgsz, agnostic_nms=True, verbose=False)
            count = len(results[0].boxes)
            
            print(f"Model: {model_name} | Conf: {conf} | ImgSz: {imgsz} | Count: {count}")

if __name__ == "__main__":
    test_inference()
