from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.parsers import MultiPartParser, FormParser
from surveillance.services.alert_pipeline import process_media_and_create_alert


from .models import (
    Camera, MediaFile, Alert, ThreatType,
    WeatherData, FishermanReport
)
from .serializers import (
    CameraSerializer, MediaFileSerializer, AlertSerializer,
    ThreatTypeSerializer, WeatherDataSerializer, MediaUploadSerializer,
    FishermanReportSerializer, FishermanReportCreateSerializer,
    FishermanReportUpdateSerializer
)

from django.http import FileResponse
from django.shortcuts import get_object_or_404

# ======================================================
# MEDIA FILE VIEWSET
# ======================================================
class MediaFileViewSet(viewsets.ModelViewSet):
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=["post"])
    def upload_media(self, request):
        serializer = MediaUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        media_file = MediaFile.objects.create(
            camera=serializer.validated_data.get("camera"),
            media_type=serializer.validated_data["media_type"],
            file=serializer.validated_data["file"],
            uploaded_by=request.user,
        )

        # 🔥 AI PIPELINE (SAFE)
        try:
            process_media_and_create_alert(media_file)
        except Exception as e:
            media_file.processing_error = str(e)
            media_file.save()

        return Response(
            MediaFileSerializer(media_file, context={"request": request}).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["get"], url_path="download")
    def download(self, request, pk=None):
        media = get_object_or_404(MediaFile, pk=pk)

        if not media.file:
            return Response(
                {"detail": "File not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return FileResponse(
            media.file.open("rb"),
            as_attachment=True,
            filename=media.file.name.split("/")[-1]
        )

# ======================================================
# CAMERA VIEWSET
# ======================================================
class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    permission_classes = [permissions.IsAuthenticated]

# ======================================================
# ALERT VIEWSET
# ======================================================
class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = Alert.objects.all()
        risk = self.request.query_params.get("risk_level")
        status_q = self.request.query_params.get("status")
        if risk:
            qs = qs.filter(risk_level=risk)
        if status_q:
            qs = qs.filter(status=status_q)
        return qs.order_by("-created_at")

# ======================================================
# THREAT TYPE VIEWSET
# ======================================================
class ThreatTypeViewSet(viewsets.ModelViewSet):
    queryset = ThreatType.objects.all()
    serializer_class = ThreatTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

# ======================================================
# WEATHER DATA VIEWSET
# ======================================================
class WeatherDataViewSet(viewsets.ModelViewSet):
    queryset = WeatherData.objects.all()
    serializer_class = WeatherDataSerializer
    permission_classes = [permissions.IsAuthenticated]

# ======================================================
# FISHERMAN REPORT VIEWSET
# ======================================================
class FishermanReportViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    # ✅ AJOUT CRITIQUE
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    # ✅ FILTRES RÉELS
    filterset_fields = ['status']
    search_fields = ['title', 'description', 'fisherman__username']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    def get_serializer_class(self):
        if self.action == "create":
            return FishermanReportCreateSerializer
        if self.action in ["update", "partial_update"]:
            return FishermanReportUpdateSerializer
        return FishermanReportSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'user_type', None) == "fisherman":
            return FishermanReport.objects.filter(fisherman=user)
        elif getattr(user, 'user_type', None) == "admin":
            return FishermanReport.objects.all()
        return FishermanReport.objects.none()

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        user = request.user
        reports = FishermanReport.objects.filter(fisherman=user)
        now = timezone.now()
        return Response({
            "total_reports": reports.count(),
            "approved_this_month": reports.filter(
                status="verified",
                created_at__year=now.year,
                created_at__month=now.month
            ).count(),
            "recent_reports": [
                {
                    "id": r.id,
                    "title": r.title,
                    "status": r.status,
                    "created_at": r.created_at.isoformat(),
                }
                for r in reports.order_by("-created_at")[:5]
            ],
        })

    @action(detail=False, methods=["get"])
    def my_reports(self, request):
        reports = FishermanReport.objects.filter(fisherman=request.user)
        serializer = FishermanReportSerializer(reports, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def add_media(self, request, pk=None):
        report = self.get_object()
        media_id = request.data.get("media_file_id")
        if not media_id:
            return Response(
                {"detail": "Le champ 'media_file_id' est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            media = MediaFile.objects.get(id=media_id, uploaded_by=request.user)
        except MediaFile.DoesNotExist:
            return Response(
                {"detail": "Média non trouvé ou non autorisé."},
                status=status.HTTP_404_NOT_FOUND
            )
        report.media_files.add(media)
        return Response({"message": "Média ajouté avec succès."}, status=status.HTTP_200_OK)

# ======================================================
# PLACEHOLDER VIEWSETS
# ======================================================
class WeatherAnalysisViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    @action(detail=False, methods=["get"])
    def analyze(self, request):
        return Response({"message": "Weather analysis ready"})
        

    @action(detail=False, methods=["get"])
    def predict_risk(self, request):

     reasons = ["Weather API not connected"]
     risk_level = "Low"

     return Response({
        "date": timezone.now().date(),
        "risk_level": risk_level,
        "reasons": reasons,
        "metrics": {}
      })
      # Règles RÉELLES (pas un jeu)
     if weather["visibility_km"] < 5:
        risk_level = "High"
        reasons.append("Low visibility")

        if weather["wind_speed"] > 40:
          risk_level = "High"
          reasons.append("Strong wind")

        if weather["condition"] in ["Storm", "Thunderstorm"]:
         risk_level = "High"
         reasons.append("Severe weather condition")

        if risk_level == "Low":
         reasons.append("Normal weather conditions")

        return Response({
        "date": weather["timestamp"].date(),
        "risk_level": risk_level,
        "reasons": reasons,
        "metrics": {
            "temperature": weather["temperature"],
            "visibility_km": weather["visibility_km"],
            "wind_speed_kmh": weather["wind_speed"],
            "humidity": weather["humidity"],
            "pressure": weather["pressure"],
            "condition": weather["condition"]
        }
    })
class AdvancedAnalyticsViewSet(viewsets.ViewSet):

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def risk_curve(self, request):

        from django.db.models.functions import TruncHour
        from django.db.models import Count

        data = Alert.objects.annotate(
            hour=TruncHour("created_at")
        ).values("hour").annotate(
            total=Count("id")
        ).order_by("hour")

        return Response(list(data))


    @action(detail=False, methods=["get"])
    def ai_insights(self, request):

        alerts = Alert.objects.order_by("-created_at")[:5]

        insights = []

        for alert in alerts:
            insights.append({
                "id": alert.id,
                "risk_level": alert.risk_level,
                "analysis": alert.advanced_analysis,
                "decision": alert.ai_decision,
                "time": alert.created_at
            })

        return Response(insights)
# ======================================================
# ADMIN REPORT VIEWSET (AJOUT SÛR)
# ======================================================
class AdminReportViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FishermanReportSerializer
    queryset = FishermanReport.objects.all()

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        report = self.get_object()
        report.status = "verified"
        report.resolved_by = request.user
        report.save()
        return Response({"message": "Rapport vérifié avec succès"})

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        report = self.get_object()
        report.status = "rejected"
        report.resolved_by = request.user
        report.save()
        return Response({"message": "Rapport rejeté"}) 
    
       