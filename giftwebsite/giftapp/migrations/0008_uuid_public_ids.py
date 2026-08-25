import uuid

from django.db import migrations, models


def populate_uuids(apps, schema_editor):
    for model_name in ('Ad', 'Event', 'BlogPost', 'GalleryItem', 'Testimonial'):
        Model = apps.get_model('giftapp', model_name)
        for obj in Model.objects.all():
            obj.uuid = uuid.uuid4()
            obj.save(update_fields=['uuid'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('giftapp', '0007_alter_galleryitem_video_file_testimonial'),
    ]

    operations = [
        # Step 1: add the field nullable/non-unique so every existing row
        # can be added without a uniqueness conflict.
        migrations.AddField(
            model_name='ad',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),
        migrations.AddField(
            model_name='blogpost',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),
        migrations.AddField(
            model_name='galleryitem',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),
        migrations.AddField(
            model_name='testimonial',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, null=True),
        ),

        # Step 2: give every existing row its own distinct UUID.
        migrations.RunPython(populate_uuids, noop_reverse),

        # Step 3: now that every row has a distinct value, enforce it.
        migrations.AlterField(
            model_name='ad',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='event',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='blogpost',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='galleryitem',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
        migrations.AlterField(
            model_name='testimonial',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
