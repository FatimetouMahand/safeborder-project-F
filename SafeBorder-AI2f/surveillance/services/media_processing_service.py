from surveillance.models import Alert, ThreatType
from surveillance.services.yolo_service import run_yolo_detection
from django.utils import timezone


def process_media_file(media_file):
    """
    Process a MediaFile using YOLOv8 and create an Alert
    """

    # 1️⃣ Run YOLO detection
    try:
        yolo_results = run_yolo_detection(media_file.file.path)
    except Exception as e:
        media_file.processing_error = str(e)
        media_file.save(update_fields=["processing_error"])
        return None

    # If no detections → ignore
    if not yolo_results:
        return None

    # 2️⃣ Extract confidence & objects
    confidences = [obj.get("confidence", 0) for obj in yolo_results]
    max_confidence = max(confidences)

    detected_classes = list(
        {obj.get("class_name") for obj in yolo_results if obj.get("class_name")}
    )

    detected_objects = {
        "objects": yolo_results,
        "summary": detected_classes,
    }

    # 3️⃣ Risk level logic
    if max_confidence >= 0.75:
        risk_level = "medium"
    else:
        risk_level = "low"

    # 4️⃣ Human readable explanation
    explanation = (
        f"Detected {', '.join(detected_classes)} in the media file. "
        f"Detection confidence is {max_confidence * 100:.1f}%, "
        f"indicating a reliable observation. "
        f"Activity requires human review."
    )

    # 5️⃣ Get or create ThreatType
    threat_name = "Maritime Activity"
    threat_type, _ = ThreatType.objects.get_or_create(
        name=threat_name,
        defaults={
            "risk_level": risk_level,
            "description": "AI-detected maritime activity",
        },
    )

    # 6️⃣ Create Alert
    alert = Alert.objects.create(
        media_file=media_file,
        threat_type=threat_type,
        ai_raw_output=yolo_results,
        detected_objects=detected_objects,
        confidence=max_confidence,
        risk_level=risk_level,
        ai_explanation=explanation,
        ai_decision="Human review required",
        status="new",
        created_at=timezone.now(),
    )

    # 7️⃣ Mark media as processed
    media_file.processed = True
    media_file.processing_completed_at = timezone.now()
    media_file.save(update_fields=["processed", "processing_completed_at"])

    return alert