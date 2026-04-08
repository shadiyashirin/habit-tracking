from rest_framework import serializers
from .models import Habit, HabitLog


class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ['id', 'date', 'completed']


class HabitSerializer(serializers.ModelSerializer):
    logs = HabitLogSerializer(many=True, read_only=True)

    class Meta:
        model = Habit
        fields = ['id', 'name', 'color', 'created_at', 'logs']
        read_only_fields = ['created_at']


class HabitLogToggleSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ['id', 'habit', 'date', 'completed']
