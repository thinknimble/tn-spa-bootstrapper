from django import forms


class PreviewTemplateForm(forms.Form):
    _send_to = forms.EmailField(label="Send by email to", widget=forms.EmailInput(attrs={"size": 60}))
