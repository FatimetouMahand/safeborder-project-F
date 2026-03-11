from rest_framework import serializers
from .models import (
    Camera,
    MediaFile,
    Alert,
    ThreatType,
    WeatherData,
    FishermanReport,
)

# =========================
# THREAT TYPE
# =========================
class ThreatTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ThreatType
        fields = ['id', 'name', 'description', 'risk_level']
        read_only_fields = ['id']

# =========================
# CAMERA
# =========================
class CameraSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Camera
        fields = [
            'id', 'name', 'camera_type', 'location_lat', 'location_lng',
            'description', 'is_active', 'created_by', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

# =========================
# MEDIA FILE
# =========================
class MediaFileSerializer(serializers.ModelSerializer):
    camera_name = serializers.CharField(source='camera.name', read_only=True)
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaFile
        fields = [
            'id', 'camera', 'camera_name', 'media_type', 'file', 'file_url',
            'file_size', 'uploaded_by', 'uploaded_by_username', 'uploaded_at', 'processed'
        ]
        read_only_fields = ['id', 'file_size', 'uploaded_by', 'uploaded_at', 'processed']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None

    def validate_file(self, value):
        allowed_image_types = ['image/jpeg', 'image/png', 'image/webp']
        allowed_video_types = ['video/mp4', 'video/avi', 'video/mov']
        if value.content_type not in allowed_image_types + allowed_video_types:
            raise serializers.ValidationError("نوع الملف غير مدعوم")
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError("حجم الملف كبير جداً (الحد الأقصى 10MB)")
        return value

# =========================
# MEDIA UPLOAD
# =========================
class MediaUploadSerializer(serializers.Serializer):
    camera = serializers.PrimaryKeyRelatedField(
        queryset=Camera.objects.filter(is_active=True),
        required=False,
        allow_null=True
    )
    file = serializers.FileField()
    media_type = serializers.ChoiceField(choices=['image', 'video'])

    def validate(self, attrs):
        file = attrs.get('file')
        media_type = attrs.get('media_type')
        if media_type == 'image' and not file.content_type.startswith('image/'):
            raise serializers.ValidationError("الملف المرفوع ليس صورة")
        if media_type == 'video' and not file.content_type.startswith('video/'):
            raise serializers.ValidationError("الملف المرفوع ليس فيديو")
        return attrs

# =========================
# ALERT
# =========================
class AlertSerializer(serializers.ModelSerializer):
    ai_analysis = serializers.SerializerMethodField()
    source_type = serializers.SerializerMethodField()
    source_id = serializers.SerializerMethodField()
    advanced_analysis = serializers.CharField(read_only=True)

    class Meta:
        model = Alert
        fields = [
            "id",
            "created_at",
            "status",
            "risk_level",
            "confidence",

            # relations
            "media_file",
            "threat_type",

            # source (مهم للـ Front)
            "source_type",
            "source_id",

            # AI
            "ai_analysis",
            
            "advanced_analysis",
        ]

    def get_source_type(self, obj):
     if obj.media_file:
        return "media"
     if hasattr(obj, "fisherman_report"):
        return "fisherman"
     return "system"

    def get_source_id(self, obj):
     if obj.media_file:
        return obj.media_file.id
     return obj.id
 
    def get_ai_analysis(self, obj):
        if not obj:
            return None

        detected_object = None
        if obj.detected_objects and obj.detected_objects.get("objects"):
            detected_object = obj.detected_objects["objects"][0].get("class_name")

        return {
            "object": detected_object,
            "risk_level": obj.risk_level,
            "confidence": round(obj.confidence * 100, 1) if obj.confidence is not None else None,
            "message": obj.ai_explanation,
            "decision": obj.ai_decision,
    }# =========================
# WEATHER DATA
# =========================
class WeatherDataSerializer(serializers.ModelSerializer):
    camera_name = serializers.CharField(source='camera.name', read_only=True)

    class Meta:
        model = WeatherData
        fields = [
            'id', 'camera', 'camera_name', 'temperature', 'humidity',
            'wind_speed', 'visibility', 'weather_condition', 'recorded_at'
        ]
        read_only_fields = ['id', 'recorded_at']

# =========================
# FISHERMAN REPORT (READ)
# =========================
class FishermanReportSerializer(serializers.ModelSerializer):
    fisherman_username = serializers.CharField(source='fisherman.username', read_only=True)
    threat_type_name = serializers.CharField(source='threat_type.name', read_only=True)
    resolved_by_username = serializers.CharField(source='resolved_by.username', read_only=True)
    media = MediaFileSerializer(source='media_files', many=True, read_only=True)
    media_files_count = serializers.SerializerMethodField()

    class Meta:
        model = FishermanReport
        fields = [
            'id', 'fisherman', 'fisherman_username', 'title', 'description',
            'location_lat', 'location_lng', 'media', 'media_files_count',
            'threat_type', 'threat_type_name', 'risk_level', 'status',
            'admin_notes', 'resolved_by', 'resolved_by_username',
            'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = [
            'id', 'fisherman', 'created_at', 'updated_at', 'resolved_at'
        ]

    def get_media_files_count(self, obj):
        return obj.media_files.count()

# =========================
# FISHERMAN REPORT (CREATE) — ✅ CORRIGÉ
# =========================
class FishermanReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FishermanReport
        fields = [
            'id',  # ✅ CRITIQUE : ajouté pour que la réponse contienne l'ID
            'title',
            'description',
            'location_lat',
            'location_lng',
            'threat_type',
            'risk_level',
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'location_lat': {'required': False, 'allow_null': True},
            'location_lng': {'required': False, 'allow_null': True},
            'threat_type': {'required': False, 'allow_null': True},
            'risk_level': {'required': False},
        }

    def validate(self, attrs):
        user = self.context['request'].user
        if getattr(user, 'user_type', None) != 'fisherman':
            raise serializers.ValidationError("Cette action est réservée aux pêcheurs.")
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.setdefault('risk_level', 'low')
        validated_data['status'] = 'pending'
        return FishermanReport.objects.create(fisherman=user, **validated_data)

# =========================
# FISHERMAN REPORT (UPDATE)
# =========================
class FishermanReportUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FishermanReport
        fields = ['status', 'admin_notes', 'risk_level']