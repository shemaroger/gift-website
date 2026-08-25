from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('giftapp', '0005_alter_contact_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='galleryitem',
            name='video_file',
            field=models.FileField(blank=True, null=True, upload_to='gallery/videos/'),
        ),
    ]
