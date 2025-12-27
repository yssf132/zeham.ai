import requests

url = "https://github.com/akanametov/yolo-face/releases/download/v0.0.0/yolov8n-face.pt"
filename = "yolov8n-face.pt"

def download_file():
    print(f"Downloading {filename}...")
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print("Download complete.")
        else:
            print(f"Failed to download. Status: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    download_file()
