from django.urls import path
from .views import AdminScheduleView

urlpatterns = [
    path("admin/schedule/", AdminScheduleView.as_view(), name="admin-schedule"),
]
