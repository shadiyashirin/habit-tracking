from django.contrib import admin
from .models import Habit, HabitLog

@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'color', 'created_at']
    list_filter  = ['color', 'user']
    search_fields = ['name']

@admin.register(HabitLog)
class HabitLogAdmin(admin.ModelAdmin):
    list_display  = ['habit', 'date', 'completed']
    list_filter   = ['completed', 'date']
    search_fields = ['habit__name']
    date_hierarchy = 'date'
