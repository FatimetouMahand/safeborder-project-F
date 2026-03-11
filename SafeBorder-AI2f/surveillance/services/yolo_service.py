from ultralytics import YOLO

model = YOLO("yolov8n.pt")

def run_yolo_detection(image_path):
    results = model(image_path)

    detections = []
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            detections.append({
                "class_name": model.names[class_id],
                "confidence": round(float(box.conf[0]), 3)
            })

    return detections