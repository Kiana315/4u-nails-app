"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def health(_request):
    return JsonResponse({"ok": True, "service": "api", "version": "1.0"})

urlpatterns = [
    path("admin/", admin.site.urls),

    # Health
    path("api/health/", lambda r: JsonResponse({"ok": True})),

    # OpenAPI schema & Swagger UI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
        # Auth (JWT)
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # TODO: 业务路由（以后逐步加上）
    path("api/", include("apps.services.urls")),
    path("api/", include("apps.appointments.urls")),
    # path("api/", include("apps.users.urls")),
    # path("api/", include("apps.schedule.urls")),
    path("api/", include("apps.technicians.urls")),

    # 根路径跳到 Swagger 文档，避免 404
    path("", RedirectView.as_view(url="/api/docs/", permanent=False)),
]