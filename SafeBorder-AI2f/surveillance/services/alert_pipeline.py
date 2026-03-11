from surveillance.models import Alert, ThreatType
from surveillance.services.yolo_service import run_yolo_detection
from django.utils import timezone
from surveillance.models import WeatherData
from surveillance.risk_engine import (
    analyze_objects,
    analyze_time,
    analyze_weather,
    analyze_location,
    calculate_final_risk,
    generate_french_analysis
)

def process_media_and_create_alert(media_file):
    """
    Pipeline:
    MediaFile → YOLO → Alert
    """

    # 1. Run YOLO
    yolo_result = run_yolo_detection(media_file.file.path)

    if not yolo_result or len(yolo_result) == 0:
        return None

    # 2. Extract objects & confidence
    detected_objects = []
    max_confidence = 0.0

    for det in yolo_result:
        detected_objects.append({
            "class_name": det["class_name"],
            "confidence": det["confidence"]
        })
        max_confidence = max(max_confidence, det["confidence"])
        

    # 3. Simple rule-based risk
    risk_level = "low"
    decision = "No action required"

    classes = [obj["class_name"] for obj in detected_objects]
      
    # ===== AI OBJECT ANALYSIS =====

    ai_score, persons, boats = analyze_objects(detected_objects)

    # ===== TIME ANALYSIS =====

    time_score, time_label = analyze_time(timezone.now())

    # ===== WEATHER ANALYSIS =====

    weather = WeatherData.objects.filter(
        camera=media_file.camera
    ).order_by("-recorded_at").first()

    weather_score, weather_conditions = analyze_weather(weather)

   # ===== LOCATION ANALYSIS =====

    lat = None
    lng = None

    if media_file.camera:
      lat = media_file.camera.location_lat
      lng = media_file.camera.location_lng

    location_score, location_label = analyze_location(lat, lng)

    # ===== FINAL RISK =====

    risk_level = calculate_final_risk(
    ai_score,
    weather_score,
    time_score,
    location_score
   )

   # ===== FRENCH ANALYSIS =====

    analysis_message = generate_french_analysis(
    persons,
    boats,
    time_label,
    weather_conditions,
    location_label,
    risk_level
   )
  

    if "person" in classes and "boat" in classes:
        
        decision = "Human review required"

    # 4. ThreatType (default)
    threat_type, _ = ThreatType.objects.get_or_create(
        name="Suspicious Activity",
        defaults={"risk_level": risk_level}
    )

    # 5. Create Alert
    alert = Alert.objects.create(
        media_file=media_file,
        threat_type=threat_type,
        risk_level=risk_level,
        confidence=max_confidence,
        ai_raw_output=yolo_result,
        detected_objects={"objects": detected_objects},

        ai_explanation=(
            f"Detected {', '.join(classes)} "
            f"with confidence {max_confidence:.2f}"
        ),

        advanced_analysis=analysis_message,

        ai_decision=decision,
        status="new",
        created_at=timezone.now()

        
    )

    return alert