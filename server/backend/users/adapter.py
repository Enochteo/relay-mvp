from allauth.account.adapter import DefaultAccountAdapter

class CustomAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        user = super().save_user(request, user, form, commit=False)
        data = form.cleaned_data
        full_name = data.get("full_name")
        if full_name:
            user.full_name = full_name
        if commit:
            user.save()
        return user
