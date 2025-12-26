# Zeham.ai Backend

This is the FastAPI backend for the Zeham.ai crowd control system.

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Download Models**:
    The system uses `yolov8l.pt`. It will download automatically on the first run, or you can verify it exists in this directory.

3.  **Run Server**:
    ```bash
    python -m uvicorn main:app --host 0.0.0.0 --port 8000
    ```

## API

-   `GET /live-data`: Returns the status of all 18 screens and current crowd counts.

## Configuration

-   **Gates**: 6
-   **Screens**: 18
-   **Routing**: Smart circular logic based on People Count + Distance.
