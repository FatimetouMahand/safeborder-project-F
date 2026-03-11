from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


User = get_user_model()


class ThreatAssessmentConfig(models.Model):
    """تكوين ديناميكي لتقييم التهديدات"""
    object_name = models.CharField(
        max_length=100, 
        unique=True, 
        verbose_name='اسم الكائن'
    )
    base_risk_level = models.CharField(
        max_length=20, 
        choices=[
            ('critical', 'حرج'), 
            ('high', 'عالي'), 
            ('medium', 'متوسط'), 
            ('low', 'منخفض')
        ], 
        verbose_name='مستوى الخطورة الأساسي'
    )
    confidence_threshold_high = models.FloatField(
        default=0.7,
        validators=[MinValueValidator(0.1), MaxValueValidator(1.0)],
        verbose_name='حد الثقة للخطورة العالية'
    )
    confidence_threshold_medium = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.1), MaxValueValidator(1.0)],
        verbose_name='حد الثقة للخطورة المتوسطة'
    )
    is_active = models.BooleanField(default=True, verbose_name='مفعل')
    description = models.TextField(blank=True, verbose_name='الوصف')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'threat_assessment_config'
        verbose_name = 'تكوين تقييم التهديد'
        verbose_name_plural = 'تكوينات تقييم التهديدات'
        ordering = ['object_name']
    
    def __str__(self):
        return f"{self.object_name} - {self.get_base_risk_level_display()}"


class Camera(models.Model):
    CAMERA_TYPE_CHOICES = (
        ('simulation', 'كاميرا محاكاة'),
        ('real', 'كاميرا حقيقية'),
    )
    
    name = models.CharField(max_length=100, verbose_name='اسم الكاميرا')
    camera_type = models.CharField(
        max_length=20, 
        choices=CAMERA_TYPE_CHOICES, 
        default='simulation',
        verbose_name='نوع الكاميرا'
    )
    location_lat = models.FloatField(
        verbose_name='خط العرض', 
        null=True, 
        blank=True,
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)]
    )
    location_lng = models.FloatField(
        verbose_name='خط الطول', 
        null=True, 
        blank=True,
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)]
    )
    description = models.TextField(verbose_name='الوصف', blank=True)
    is_active = models.BooleanField(default=True, verbose_name='نشط')
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        verbose_name='تم الإنشاء بواسطة',
        related_name='created_cameras'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'surveillance_cameras'
        verbose_name = 'كاميرا'
        verbose_name_plural = 'الكاميرات'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_camera_type_display()})"
    
    def get_location_display(self):
        """عرض الموقع بشكل منسق"""
        if self.location_lat and self.location_lng:
            return f"{self.location_lat:.6f}, {self.location_lng:.6f}"
        return "غير محدد"


class MediaFile(models.Model):
    MEDIA_TYPE_CHOICES = (
        ('image', 'صورة'),
        ('video', 'فيديو'),
    )
    
    camera = models.ForeignKey(
        Camera,
        on_delete=models.SET_NULL,
        null=True,              # ✅ IMPORTANT
        blank=True,             # ✅ IMPORTANT
        related_name='media_files'
    )
    media_type = models.CharField(
        max_length=10, 
        choices=MEDIA_TYPE_CHOICES, 
        verbose_name='نوع الوسائط'
    )
    file = models.FileField(
        upload_to='surveillance/media/%Y/%m/%d/', 
        verbose_name='الملف'
    )
    file_size = models.BigIntegerField(
        verbose_name='حجم الملف (بايت)', 
        default=0
    )
    uploaded_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        verbose_name='تم الرفع بواسطة',
        related_name='uploaded_media'
    )
    uploaded_at = models.DateTimeField(default=timezone.now)
    processed = models.BooleanField(default=False, verbose_name='تم المعالجة')
    processing_error = models.TextField(
        blank=True, 
        verbose_name='خطأ المعالجة'
    )
    processing_started_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name='بدء المعالجة'
    )
    processing_completed_at = models.DateTimeField(
        null=True, 
        blank=True, 
        verbose_name='انتهاء المعالجة'
    )
    
    class Meta:
        db_table = 'surveillance_media_files'
        verbose_name = 'ملف وسائط'
        verbose_name_plural = 'ملفات الوسائط'
        ordering = ['-uploaded_at']
    
    def __str__(self):
            camera_name = self.camera.name if self.camera else "No Camera"
            return f"{self.get_media_type_display()} - {camera_name}"

    
    def get_file_size_display(self):
        """عرض حجم الملف بشكل مقروء"""
        if self.file_size == 0:
            return "0 بايت"
        
        sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
        i = 0
        size = float(self.file_size)
        
        while size >= 1024 and i < len(sizes) - 1:
            size /= 1024
            i += 1
        
        return f"{size:.2f} {sizes[i]}"
    
    def save(self, *args, **kwargs):
        """حساب حجم الملف تلقائياً عند الحفظ"""
        if self.file and not self.file_size:
            try:
                self.file_size = self.file.size
            except (ValueError, OSError):
                self.file_size = 0
        super().save(*args, **kwargs)


class ThreatType(models.Model):
    RISK_LEVEL_CHOICES = [
        ('critical', 'حرج'),
        ('high', 'عالي'),
        ('medium', 'متوسط'),
        ('low', 'منخفض')
    ]
    
    name = models.CharField(max_length=100, verbose_name='نوع التهديد')
    description = models.TextField(verbose_name='الوصف', blank=True)
    risk_level = models.CharField(
        max_length=20, 
        choices=RISK_LEVEL_CHOICES,
        default='medium',
        verbose_name='مستوى الخطورة'
    )
    is_active = models.BooleanField(default=True, verbose_name='مفعل')
    detection_count = models.IntegerField(
        default=0,
        verbose_name='عدد مرات الكشف'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'surveillance_threat_types'
        verbose_name = 'نوع التهديد'
        verbose_name_plural = 'أنواع التهديدات'
        ordering = ['-risk_level', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_risk_level_display()})"
    
    def increment_detection_count(self):
        """زيادة عداد مرات الكشف"""
        self.detection_count += 1
        self.save()


class Alert(models.Model):
    ALERT_STATUS_CHOICES = (
        ('new', 'جديد'),
        ('under_review', 'تحت المراجعة'),
        ('resolved', 'تم المعالجة'),
        ('false_alarm', 'إنذار كاذب'),
        ('ignored', 'تم التجاهل'),
    )

    # 🔗 Relations
    media_file = models.ForeignKey(
        MediaFile,
        on_delete=models.CASCADE,
        related_name='alerts',
        verbose_name='ملف الوسائط'
    )

    threat_type = models.ForeignKey(
        ThreatType,
        on_delete=models.CASCADE,
        related_name='alerts',
        verbose_name='نوع التهديد'
    )

    # ===============================
    # 🧠 Layer 1 — AI RAW OUTPUT (YOLO)
    # ===============================
    ai_raw_output = models.JSONField(
        null=True,
        blank=True,
        verbose_name='AI Raw Output',
        help_text='Raw detection output from YOLO model'
    )

    # ===============================
    # 🧩 Layer 2 — INTERPRETATION
    # ===============================
    detected_objects = models.JSONField(
        default=dict,
        verbose_name='الكائنات المكتشفة (مفسّرة)',
        help_text='Interpreted detected objects'
    )

    confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        verbose_name='مستوى الثقة'
    )

    risk_level = models.CharField(
        max_length=20,
        choices=ThreatType.RISK_LEVEL_CHOICES,
        verbose_name='مستوى الخطورة'
    )

    # ===============================
    # 🧠 Layer 3 — HUMAN READABLE
    # ===============================
    ai_explanation = models.TextField(
        blank=True,
        verbose_name='تفسير الذكاء الاصطناعي',
        help_text='Human-readable AI explanation'
    )

    advanced_analysis = models.TextField(
    blank=True,
    verbose_name="Advanced AI Analysis",
    help_text="Full contextual AI analysis"
    )

    ai_decision = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='قرار الذكاء الاصطناعي',
        help_text='AI decision (e.g. Human review required)'
    )

    # ===============================
    # 🏷️ Status & Review
    # ===============================
    status = models.CharField(
        max_length=20,
        choices=ALERT_STATUS_CHOICES,
        default='new',
        verbose_name='الحالة'
    )

    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_alerts',
        verbose_name='تمت المراجعة بواسطة'
    )

    review_notes = models.TextField(
        blank=True,
        verbose_name='ملاحظات المراجعة'
    )

    # 🕒 Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'surveillance_alerts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'risk_level']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Alert #{self.id} - {self.get_risk_level_display()}"

    def save(self, *args, **kwargs):
        if self.status in ['resolved', 'false_alarm', 'ignored'] and not self.processed_at:
            self.processed_at = timezone.now()
        super().save(*args, **kwargs)

    def get_confidence_percentage(self):
        return f"{self.confidence * 100:.1f}%"

class WeatherData(models.Model):
    camera = models.ForeignKey(
        Camera,
        on_delete=models.CASCADE,
        related_name='weather_data'
    )

    temperature = models.FloatField(verbose_name='درجة الحرارة (°C)')
    humidity = models.FloatField(
        verbose_name='الرطوبة (%)',
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )

    pressure = models.FloatField(
        verbose_name='الضغط الجوي (hPa)',
        null=True,
        blank=True
    )

    wind_speed = models.FloatField(
        verbose_name='سرعة الرياح (كم/س)',
        validators=[MinValueValidator(0.0)]
    )

    wind_degree = models.IntegerField(
        verbose_name='اتجاه الرياح (درجة)',
        null=True,
        blank=True
    )

    visibility = models.FloatField(
        verbose_name='مدى الرؤية (كم)',
        validators=[MinValueValidator(0.0)]
    )

    weather_main = models.CharField(
        max_length=50,
        verbose_name='الحالة العامة للطقس',
        null=True,
        blank=True
    )

    weather_condition = models.CharField(
        max_length=100,
        verbose_name='وصف حالة الطقس'
    )

    precipitation = models.FloatField(
        verbose_name='الهطول (مم)',
        default=0.0
    )

    recorded_at = models.DateTimeField(default=timezone.now)

    data_source = models.CharField(
        max_length=50,
        default='openweathermap'
    )
    
    class Meta:
        db_table = 'surveillance_weather_data'
        verbose_name = 'بيانات الطقس'
        verbose_name_plural = 'بيانات الطقس'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['camera', 'recorded_at']),
        ]
    
    def __str__(self):
        return f"طقس {self.camera.name} - {self.recorded_at.strftime('%Y-%m-%d %H:%M')}"
    
    def get_weather_impact_level(self):
        """تحديد مستوى تأثير الطقس على الرؤية"""
        if self.visibility >= 10.0:
            return 'ممتاز'
        elif self.visibility >= 5.0:
            return 'جيد'
        elif self.visibility >= 2.0:
            return 'متوسط'
        else:
            return 'ضعيف'


class SystemSettings(models.Model):
    """إعدادات النظام الديناميكية"""
    key = models.CharField(max_length=100, unique=True, verbose_name='المفتاح')
    value = models.JSONField(verbose_name='القيمة')
    description = models.TextField(verbose_name='الوصف', blank=True)
    is_active = models.BooleanField(default=True, verbose_name='مفعل')
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'surveillance_system_settings'
        verbose_name = 'إعداد النظام'
        verbose_name_plural = 'إعدادات النظام'
    
    def __str__(self):
        return f"{self.key} - {self.description}"


class ProcessingStats(models.Model):
    """إحصائيات معالجة الوسائط"""
    date = models.DateField(unique=True, verbose_name='التاريخ')
    total_media_processed = models.IntegerField(default=0, verbose_name='إجمالي الوسائط المعالجة')
    successful_processing = models.IntegerField(default=0, verbose_name='المعالجات الناجحة')
    failed_processing = models.IntegerField(default=0, verbose_name='المعالجات الفاشلة')
    total_alerts_generated = models.IntegerField(default=0, verbose_name='إجمالي الإنذارات المولدة')
    avg_processing_time = models.FloatField(default=0.0, verbose_name='متوسط وقت المعالجة (ثانية)')
    
    class Meta:
        db_table = 'surveillance_processing_stats'
        verbose_name = 'إحصائية معالجة'
        verbose_name_plural = 'إحصائيات المعالجة'
        ordering = ['-date']
    
    def __str__(self):
        return f"إحصائيات {self.date}"
    
    def success_rate(self):
        """معدل النجاح في المعالجة"""
        if self.total_media_processed > 0:
            return (self.successful_processing / self.total_media_processed) * 100
        return 0.0
class FishermanReport(models.Model):
    REPORT_STATUS_CHOICES = (
        ('pending', 'قيد المراجعة'),
        ('verified', 'تم التحقق'),
        ('rejected', 'مرفوض'),
        ('resolved', 'تم الحل'),
    )

    fisherman = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='fisherman_reports',
        limit_choices_to={'user_type': 'fisherman'}
    )

    title = models.CharField(max_length=200)
    description = models.TextField()

    # ✅✅✅ FIX CRITIQUE
    location_lat = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)]
    )

    location_lng = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)]
    )

    media_files = models.ManyToManyField(
        MediaFile,
        blank=True,
        related_name='fisherman_reports'
    )

    threat_type = models.ForeignKey(
        ThreatType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    risk_level = models.CharField(
        max_length=20,
        choices=ThreatType.RISK_LEVEL_CHOICES,
        default='medium'
    )

    status = models.CharField(
        max_length=20,
        choices=REPORT_STATUS_CHOICES,
        default='pending'
    )

    admin_notes = models.TextField(blank=True)

    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_reports',
        limit_choices_to={'user_type': 'admin'}
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.status == 'resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
        super().save(*args, **kwargs)
