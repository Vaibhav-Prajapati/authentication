import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings.development",
)

import django
django.setup()

from apps.users.models import User

print("User count:", User.objects.count())