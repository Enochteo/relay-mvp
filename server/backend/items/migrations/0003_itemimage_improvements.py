# Generated migration for ItemImage model changes

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('items', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='itemimage',
            name='uploaded_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='itemimage',
            name='is_primary',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterModelOptions(
            name='itemimage',
            options={'ordering': ['is_primary', '-uploaded_at']},
        ),
    ]
