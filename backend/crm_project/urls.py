from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/auth/', include('accounts.urls')),
    path('api/leads/', include('leads.urls')),
    path('api/notes/', include('notes.urls')),
    path('api/ai/', include('ai_assistant.urls')),
    path('api/integrations/', include('api_integrations.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/', include('properties.urls')),  # ADD THIS
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)