import os
import random
import logging
import time
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
from ultralytics import YOLO

# ==========================================
# Configuration & Constants
# ==========================================
app = FastAPI(title="Stadium Crowd Control Backend")

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MAX_CAPACITY = 50
NUM_GATES = 6 # 6 Gates
PENALTY_FACTOR = 15 
IMAGE_FOLDER = "./images"
MODEL_PATH = "yolov8l.pt" # Large Model for Accuracy

# Initialize Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==========================================
# Global Cache
# ==========================================
# Structure: { gate_id (int): {'mtime': float, 'count': int} }
GATE_CACHE = {}

# ==========================================
# Model Initialization
# ==========================================
try:
    model = YOLO(MODEL_PATH)
    logger.info(f"Model {MODEL_PATH} loaded successfully.")
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
    if current_idx == target_idx:
        return 0
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

# ==========================================
# API Endpoints
# ==========================================

@app.get("/live-data")
async def get_live_data():
    """
    Optimized: Uses Caching + Batch Inference.
    """
    start_time = time.time()
    
    current_counts = [0] * NUM_GATES
    images_to_process = []
    processing_indices = [] # Keeps track of which gate index corresponds to which image in batch
    
    # 1. Check Cache & Prepare Batch
    for i in range(NUM_GATES):
        gate_id = i + 1
        image_filename = f"gate_{gate_id}.jpg"
        image_path = os.path.join(IMAGE_FOLDER, image_filename)
        
        if not os.path.exists(image_path):
            current_counts[i] = 0
            continue
            
        try:
            mtime = os.path.getmtime(image_path)
            
            # Check if valid in cache
            if gate_id in GATE_CACHE and GATE_CACHE[gate_id]['mtime'] == mtime:
                # HIT: Use cached value
                current_counts[i] = GATE_CACHE[gate_id]['count']
            else:
                # MISS: Need to process
                img = cv2.imread(image_path)
                if img is not None:
                    images_to_process.append(img)
                    processing_indices.append(i) # Remember this image belongs to gate index i
                    # Store mtime temporarily, will update count after inference
                    if gate_id not in GATE_CACHE: GATE_CACHE[gate_id] = {}
                    GATE_CACHE[gate_id]['mtime'] = mtime
                else:
                    current_counts[i] = 0
                    
        except Exception as e:
            logger.error(f"Error prepping gate {gate_id}: {e}")
            current_counts[i] = 0

    # 2. Batch Inference (if needed)
    if images_to_process and model:
        try:
            # Run batch inference
            # conf=0.15, imgsz=1280 (High Accuracy Settings)
            results = model(images_to_process, classes=0, conf=0.15, imgsz=1280, agnostic_nms=True, verbose=False)
            
            for idx, result in enumerate(results):
                # Map back to the correct gate index
                gate_index = processing_indices[idx]
                count = len(result.boxes)
                
                # Update current view
                current_counts[gate_index] = count
                
                # Update Cache
                gate_id = gate_index + 1
                GATE_CACHE[gate_id]['count'] = count
                
        except Exception as e:
            logger.error(f"Batch inference failed: {e}")

    # 3. Apply Jitter & Routing Logic
    final_counts_with_jitter = []
    for count in current_counts:
        jitter = random.randint(-3, 3)
        final_counts_with_jitter.append(max(0, count + jitter))
        
    # Generate Screens Response (Same Logic as before)
    screens_output = []
    for i in range(NUM_GATES):
        gate_id = i + 1
        decision = get_best_gate_and_direction(i, final_counts_with_jitter)
        
        base_data = {
            "assigned_gate": gate_id,
            "people_count": final_counts_with_jitter[i],
            "recommended_gate": decision["recommended_gate"],
            "direction": decision["direction"]
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
    logger.info(f"Processed request in {process_time:.3f}s. Processed Cache Misses: {len(images_to_process)}")

    return {
        "screens": screens_output,
        "metadata": {
            "total_people": sum(final_counts_with_jitter),
            "max_capacity_per_gate": MAX_CAPACITY,
            "num_gates": NUM_GATES,
            "latency_ms": int(process_time * 1000)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
