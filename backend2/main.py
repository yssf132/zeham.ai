import os
import logging
import time
import random
from typing import List, Dict, Any

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import cv2
from ultralytics import YOLO

# ==========================================
# Configuration & Constants
# ==========================================
app = FastAPI(title="Stadium Crowd Control Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory="images"), name="images")

MAX_CAPACITY = 50
NUM_GATES = 6 
PENALTY_FACTOR = 15 
IMAGE_FOLDER = "./images"
MODEL_PATH = "yolov8n-face.pt" # Customized Face Model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

IMAGE_CACHE = {}

# ==========================================
# AI Model Initialization (YOLOv8-Face)
# ==========================================
try:
    if not os.path.exists(MODEL_PATH):
        logger.error(f"Model file not found: {MODEL_PATH}")
        model = None
    else:
        model = YOLO(MODEL_PATH)
        logger.info(f"YOLOv8-Face Model loaded: {MODEL_PATH}")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    model = None

# ==========================================
# Helper Functions
# ==========================================

def calculate_circular_distance(gate_a_idx: int, gate_b_idx: int, num_gates: int) -> int:
    abs_diff = abs(gate_a_idx - gate_b_idx)
    return min(abs_diff, num_gates - abs_diff)

def determine_direction(current_idx: int, target_idx: int, num_gates: int) -> int:
    if current_idx == target_idx: return 0
    right_dist = (target_idx - current_idx) % num_gates
    left_dist = (current_idx - target_idx) % num_gates
    return 1 if right_dist <= left_dist else -1

def get_best_gate_and_direction(current_gate_idx: int, all_counts: List[int]) -> Dict[str, Any]:
    current_count = all_counts[current_gate_idx]
    if current_count < MAX_CAPACITY:
        return {"recommended_gate": current_gate_idx + 1, "direction": 0}
        
    best_score = float('inf')
    best_gate_idx = current_gate_idx
    
    for i in range(NUM_GATES):
        distance = calculate_circular_distance(current_gate_idx, i, NUM_GATES)
        people = all_counts[i]
        score = people + (distance * PENALTY_FACTOR)
        if score < best_score:
            best_score = score
            best_gate_idx = i
            
    direction = determine_direction(current_gate_idx, best_gate_idx, NUM_GATES)
    return {"recommended_gate": best_gate_idx + 1, "direction": direction}

def detect_faces_yolo(img) -> int:
    if img is None or model is None: return 0
    
    try:
        # Run inference
        # conf=0.25 (Standard YOLO confidence)
        results = model(img, conf=0.25, verbose=False)
        return len(results[0].boxes)
    except Exception as e:
        logger.error(f"Inference error: {e}")
        return 0

# ==========================================
# API Endpoints
# ==========================================

@app.get("/live-data")
async def get_live_data():
    start_time = time.time()
    
    current_counts = [0] * NUM_GATES
    current_images = [""] * NUM_GATES
    
    # Change randomness every 2 seconds
    time_seed = int(time.time() / 2)
    available_images = [f"gate_{i+1}.jpg" for i in range(NUM_GATES)]
    
    for i in range(NUM_GATES):
        gate_id = i + 1
        
        # Select a random image for this gate based on time window
        rng = random.Random(time_seed + gate_id)
        image_filename = rng.choice(available_images)
        current_images[i] = image_filename
        
        image_path = os.path.join(IMAGE_FOLDER, image_filename)
        
        if not os.path.exists(image_path):
            current_counts[i] = 0
            continue
            
        try:
            mtime = os.path.getmtime(image_path)
            
            # Use image filename as cache key since we rotate images
            if image_filename in IMAGE_CACHE and IMAGE_CACHE[image_filename]['mtime'] == mtime:
                current_counts[i] = IMAGE_CACHE[image_filename]['count']
            else:
                img = cv2.imread(image_path)
                count = detect_faces_yolo(img)
                
                IMAGE_CACHE[image_filename] = {
                    'mtime': mtime,
                    'count': count
                }
                current_counts[i] = count
                    
        except Exception as e:
            logger.error(f"Error process gate {gate_id} (img: {image_filename}): {e}")
            current_counts[i] = 0

    screens_output = []
    
    for i in range(NUM_GATES):
        gate_id = i + 1
        decision = get_best_gate_and_direction(i, current_counts)
        
        base_data = {
            "assigned_gate": gate_id,
            "people_count": current_counts[i],
            "recommended_gate": decision["recommended_gate"],
            "direction": decision["direction"],
            "image_url": f"http://localhost:8000/images/{current_images[i]}"
        }
        
        lower_screen = base_data.copy()
        lower_screen["screen_id"] = f"Lower_Gate_{gate_id}"
        lower_screen["type"] = "Lower"
        screens_output.append(lower_screen)
        
        for j in range(1, 3):
            upper_screen = base_data.copy()
            upper_screen["screen_id"] = f"Upper_Gate_{gate_id}_{j}"
            upper_screen["type"] = "Upper"
            screens_output.append(upper_screen)
            
    process_time = time.time() - start_time
    
    response_data = {
        "screens": screens_output,
        "metadata": {
            "total_people": sum(current_counts),
            "max_capacity_per_gate": MAX_CAPACITY,
            "num_gates": NUM_GATES,
            "latency_ms": int(process_time * 1000)
        }
    }
    
    # Detailed console logging
    logger.info(f"\n{'='*60}")
    logger.info(f"📡 API RESPONSE - /live-data")
    logger.info(f"{'='*60}")
    logger.info(f"⏱️  Processing Time: {process_time:.3f}s")
    logger.info(f"\n📊 Gate Analysis:")
    for i in range(NUM_GATES):
        gate_id = i + 1
        logger.info(f"   Gate {gate_id}: {current_counts[i]} people | Image: {current_images[i]} | Recommend: Gate {screens_output[i*3]['recommended_gate']} | Direction: {screens_output[i*3]['direction']}")
    
    logger.info(f"\n📈 Metadata:")
    logger.info(f"   Total People: {sum(current_counts)}")
    logger.info(f"   Max Capacity: {MAX_CAPACITY} per gate")
    logger.info(f"   Latency: {int(process_time * 1000)}ms")
    logger.info(f"{'='*60}\n")

    return response_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
