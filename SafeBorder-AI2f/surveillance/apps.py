# surveillance/apps.py
from django.apps import AppConfig
import torch

class SurveillanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'surveillance'
    verbose_name = 'نظام المراقبة'
    
    def ready(self):
        import surveillance.signals
        # تحميل نموذج YOLO عند بدء التشغيل
        self.load_yolo_model_final()
    
    def load_yolo_model_final(self):
        """الحل النهائي لمشكلة PyTorch 2.6+"""
        try:
            from ultralytics import YOLO
            import os
            
            # الحل: استخدام context manager مع weights_only=False
            import torch.serialization
            
            # حفظ الدالة الأصلية
            original_load = torch.load
            
            def safe_load(*args, **kwargs):
                """تحميل آمع weights_only=False"""
                kwargs['weights_only'] = False
                return original_load(*args, **kwargs)
            
            # استبدال مؤقت لـ torch.load
            torch.load = safe_load
            
            try:
                # تحميل YOLO مع الإعدادات المعدلة
                self.yolo_model = YOLO('yolov8n.pt')
                print("✅ YOLOv8 model loaded successfully with weights_only=False!")
            finally:
                # استعادة الدالة الأصلية
                torch.load = original_load
            
        except Exception as e:
            print(f"❌ Final error loading YOLOv8: {e}")
            print("🔄 Using fallback detection system")
            self.yolo_model = None