from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date, timedelta
from .models import Habit, HabitLog
from .serializers import HabitSerializer, HabitLogSerializer, HabitLogToggleSerializer


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer

    def get_queryset(self):
        """Return habits belonging to the current user."""
        return Habit.objects.filter(
            user=self.request.user
        ).prefetch_related('logs')

    def perform_create(self, serializer):
        """Auto-assign the logged-in user when creating a habit."""
        serializer.save(user=self.request.user)

    def list(self, request):
        """Return habits with logs filtered to last 7 days."""
        today = date.today()
        start = today - timedelta(days=6)
        habits = self.get_queryset()

        data = []
        for habit in habits:
            habit_data = HabitSerializer(habit).data
            # Only include logs within the 7-day window
            habit_data['logs'] = [
                log for log in habit_data['logs']
                if start.isoformat() <= log['date'] <= today.isoformat()
            ]
            data.append(habit_data)

        return Response(data)

    @action(detail=False, methods=['post'], url_path='toggle')
    def toggle_log(self, request):
        """Toggle a habit log for a given date."""
        habit_id = request.data.get('habit_id')
        log_date = request.data.get('date')
        completed = request.data.get('completed', True)

        if not habit_id or not log_date:
            return Response(
                {'error': 'habit_id and date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            habit = Habit.objects.get(id=habit_id, user=request.user)
        except Habit.DoesNotExist:
            return Response(
                {'error': 'Habit not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        log, created = HabitLog.objects.get_or_create(
            habit=habit,
            date=log_date,
            defaults={'completed': completed}
        )

        if not created:
            log.completed = completed
            log.save()

        return Response(HabitLogSerializer(log).data)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Return daily completion stats for the last 7 days."""
        today = date.today()
        days = []

        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            total = Habit.objects.filter(user=request.user).count()
            completed = HabitLog.objects.filter(
                habit__user=request.user,
                date=day,
                completed=True
            ).count()
            days.append({
                'date': day.isoformat(),
                'day_name': day.strftime('%a'),
                'day_num': day.strftime('%d'),
                'month': day.strftime('%b'),
                'total': total,
                'completed': completed,
                'percentage': round((completed / total * 100) if total > 0 else 0),
                'is_today': day == today,
            })

        return Response(days)
