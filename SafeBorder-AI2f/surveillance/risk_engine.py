def analyze_objects(detected_objects):

    score = 0
    persons = 0
    boats = 0

    for obj in detected_objects:

        name = obj["class_name"]
        conf = obj["confidence"]

        if name == "person":
            persons += 1
            score += 1 * conf

        elif name == "boat":
            boats += 1
            score += 2 * conf

        elif name in ["truck", "vehicle"]:
            score += 3 * conf

    if persons >= 3:
        score += 2

    if boats >= 2:
        score += 3

    return score, persons, boats


def analyze_time(timestamp):

    hour = timestamp.hour

    if 0 <= hour <= 5:
        return 3, "Nuit profonde"

    elif 6 <= hour <= 11:
        return 0, "Matin"

    elif 12 <= hour <= 17:
        return 0.5, "Après-midi"

    elif 18 <= hour <= 22:
        return 2, "Soirée"

    else:
        return 1, "Transition nocturne"


def analyze_weather(weather):

    score = 0
    conditions = []

    if not weather:
        return score, conditions

    if weather.visibility < 3:
        score += 3
        conditions.append("Visibilité très faible")

    elif weather.visibility < 5:
        score += 2
        conditions.append("Visibilité réduite")

    if weather.wind_speed > 40:
        score += 3
        conditions.append("Vents violents")

    elif weather.wind_speed > 25:
        score += 2
        conditions.append("Vents forts")

    if weather.precipitation > 10:
        score += 3
        conditions.append("Pluie intense")

    elif weather.precipitation > 3:
        score += 1
        conditions.append("Pluie modérée")

    return score, conditions


def analyze_location(lat, lng):

    border_zone = (
        lat and lng and
        lat > 17 and lat < 21 and
        lng > -18 and lng < -14
    )

    if border_zone:
        return 2, "Zone frontalière"

    return 0, "Zone normale"


def calculate_final_risk(ai_score, weather_score, time_score, location_score):

    total = ai_score + weather_score + time_score + location_score

    if total >= 10:
        return "critical"

    elif total >= 7:
        return "high"

    elif total >= 4:
        return "medium"

    else:
        return "low"


def generate_french_analysis(
    persons,
    boats,
    time_label,
    weather_conditions,
    location_label,
    risk_level
):

    message = f"""
Analyse automatisée SafeBorder AI

Objets détectés:
- Personnes détectées: {persons}
- Bateaux détectés: {boats}

Contexte temporel:
- Période de la journée: {time_label}

Conditions météorologiques:
"""

    if weather_conditions:
        for c in weather_conditions:
            message += f"- {c}\n"
    else:
        message += "- Conditions météorologiques normales\n"

    message += f"""

Localisation:
- {location_label}

Évaluation finale du risque: {risk_level.upper()}

Recommandation:
"""

    if risk_level == "critical":
        message += "Intervention immédiate recommandée."

    elif risk_level == "high":
        message += "Inspection humaine recommandée."

    elif risk_level == "medium":
        message += "Surveillance renforcée conseillée."

    else:
        message += "Aucune action immédiate requise."

    return message.strip()