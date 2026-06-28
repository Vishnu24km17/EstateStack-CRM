from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, LoginActivity

@admin.register(LoginActivity)
class LoginActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'login_time', 'ip_address', 'user_agent')
    list_filter = ('login_time',)
    search_fields = ('user__username', 'user__email', 'ip_address')
    ordering = ('-login_time',)

# If you have custom UserAdmin, keep it