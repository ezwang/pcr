# Generated by Django 3.0.1 on 2019-12-20 17:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('apiconsumer', '0003_apiuser_token_last_updated'),
    ]

    operations = [
        migrations.DeleteModel(
            name='APIUser',
        ),
    ]
