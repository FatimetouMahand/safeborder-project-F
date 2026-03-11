from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, LoginAttempt


class UserSerializer(serializers.ModelSerializer):
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'user_type_display', 'phone_number',
            'is_verified', 'two_factor_enabled', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']


from rest_framework import serializers

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)



class PasswordResetSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        new_password = attrs.get('new_password')
        confirm_password = attrs.get('confirm_password')
        
        if new_password != confirm_password:
            raise serializers.ValidationError("كلمتا المرور غير متطابقتين")
        
        return attrs


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'user_type', 'phone_number'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("كلمتا المرور غير متطابقتين")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user


class TwoFactorSetupSerializer(serializers.Serializer):
    enable = serializers.BooleanField(required=True)


class LoginAttemptSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = LoginAttempt
        fields = ['id', 'username', 'ip_address', 'user_agent', 'timestamp', 'success']
        