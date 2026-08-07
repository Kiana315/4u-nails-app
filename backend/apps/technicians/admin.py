from django.contrib import admin
from django import forms
from .models import Technician, WEEKDAYS

class TechnicianAdminForm(forms.ModelForm):
    working_days = forms.MultipleChoiceField(
        choices=WEEKDAYS,
        required=False,
        widget=forms.CheckboxSelectMultiple,
        label="Working Days",
        help_text="Select which days this technician works (full-day based on store hours).",
    )

    class Meta:
        model = Technician
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 把 JSON list 显示到勾选框
        self.fields["working_days"].initial = self.instance.working_days or []

    def clean_working_days(self):
        return self.cleaned_data["working_days"] or []

@admin.register(Technician)
class TechnicianAdmin(admin.ModelAdmin):
    form = TechnicianAdminForm
    list_display = ("name", "active", "working_days")
