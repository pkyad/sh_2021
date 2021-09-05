# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2021-08-21 15:09
from __future__ import unicode_literals

import HR.models
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='accountsKey',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('activation_key', models.CharField(blank=True, max_length=40)),
                ('key_expires', models.DateTimeField(default=django.utils.timezone.now)),
                ('keyType', models.CharField(choices=[(b'hashed', b'hashed'), (b'otp', b'otp')], default=b'hashed', max_length=6)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accountKey', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Announcements',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateField(auto_now_add=True)),
                ('updated', models.DateField(auto_now=True)),
                ('message', models.TextField(blank=True, null=True)),
                ('fil', models.FileField(null=True, upload_to=HR.models.getAnnouncementFilePath)),
                ('toAll', models.BooleanField(default=False)),
                ('createdUser', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='announcementCreated', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='designation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hrApprover', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='hrTo', to=settings.AUTH_USER_MODEL)),
                ('primaryApprover', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='approving', to=settings.AUTH_USER_MODEL)),
                ('reportingTo', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='managing', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Document',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('description', models.CharField(max_length=400)),
                ('issuedTo', models.CharField(max_length=400)),
                ('passKey', models.CharField(max_length=4)),
                ('email', models.CharField(max_length=35)),
                ('docID', models.CharField(blank=True, max_length=10)),
                ('app', models.CharField(blank=True, max_length=20)),
                ('issuedBy', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='certificatesIssued', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='profile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('empID', models.PositiveIntegerField(null=True, unique=True)),
                ('empType', models.CharField(choices=[(b'full time', b'full time'), (b'part time', b'part time')], default=b'full time', max_length=4)),
                ('displayPicture', models.ImageField(upload_to=HR.models.getDisplayPicturePath)),
                ('dateOfBirth', models.DateField(null=True)),
                ('anivarsary', models.DateField(null=True)),
                ('married', models.BooleanField(default=False)),
                ('permanentAddressStreet', models.TextField(blank=True, max_length=100, null=True)),
                ('permanentAddressCity', models.CharField(blank=True, max_length=15, null=True)),
                ('permanentAddressPin', models.IntegerField(blank=True, null=True)),
                ('permanentAddressState', models.CharField(blank=True, max_length=20, null=True)),
                ('permanentAddressCountry', models.CharField(blank=True, max_length=20, null=True)),
                ('sameAsLocal', models.BooleanField(default=False)),
                ('localAddressStreet', models.TextField(max_length=100, null=True)),
                ('localAddressCity', models.CharField(max_length=15, null=True)),
                ('localAddressPin', models.IntegerField(null=True)),
                ('localAddressState', models.CharField(max_length=20, null=True)),
                ('localAddressCountry', models.CharField(max_length=20, null=True)),
                ('prefix', models.CharField(choices=[(b'NA', b'NA'), (b'Kumar', b'Kumar'), (b'Kumari', b'Kumari'), (b'Smt', b'Smt'), (b'Shri', b'Shri'), (b'Dr', b'Dr')], default=b'NA', max_length=4)),
                ('gender', models.CharField(choices=[(b'M', b'Male'), (b'F', b'Female'), (b'O', b'Other')], default=b'M', max_length=6)),
                ('email', models.EmailField(max_length=50)),
                ('mobile', models.CharField(max_length=14, null=True)),
                ('emergency', models.CharField(max_length=100, null=True)),
                ('website', models.URLField(blank=True, max_length=100, null=True)),
                ('sign', models.FileField(null=True, upload_to=HR.models.getSignaturesPath)),
                ('IDPhoto', models.FileField(null=True, upload_to=HR.models.getDisplayPicturePath)),
                ('TNCandBond', models.FileField(null=True, upload_to=HR.models.getTNCandBondPath)),
                ('resume', models.FileField(null=True, upload_to=HR.models.getResumePath)),
                ('certificates', models.FileField(null=True, upload_to=HR.models.getCertificatesPath)),
                ('transcripts', models.FileField(null=True, upload_to=HR.models.getTranscriptsPath)),
                ('otherDocs', models.FileField(blank=True, null=True, upload_to=HR.models.getOtherDocsPath)),
                ('resignation', models.FileField(blank=True, null=True, upload_to=HR.models.getResignationDocsPath)),
                ('vehicleRegistration', models.FileField(blank=True, null=True, upload_to=HR.models.getVehicleRegDocsPath)),
                ('appointmentAcceptance', models.FileField(blank=True, null=True, upload_to=HR.models.getAppointmentAcceptanceDocsPath)),
                ('pan', models.FileField(blank=True, null=True, upload_to=HR.models.getPANDocsPath)),
                ('drivingLicense', models.FileField(blank=True, null=True, upload_to=HR.models.getDrivingLicenseDocsPath)),
                ('cheque', models.FileField(blank=True, null=True, upload_to=HR.models.getChequeDocsPath)),
                ('passbook', models.FileField(blank=True, null=True, upload_to=HR.models.getPassbookDocsPath)),
                ('bloodGroup', models.CharField(max_length=20, null=True)),
                ('almaMater', models.CharField(max_length=100, null=True)),
                ('pgUniversity', models.CharField(blank=True, max_length=100, null=True)),
                ('docUniversity', models.CharField(blank=True, max_length=100, null=True)),
                ('fathersName', models.CharField(max_length=100, null=True)),
                ('mothersName', models.CharField(max_length=100, null=True)),
                ('wifesName', models.CharField(blank=True, max_length=100, null=True)),
                ('childCSV', models.CharField(blank=True, max_length=100, null=True)),
                ('note1', models.TextField(blank=True, max_length=500, null=True)),
                ('note2', models.TextField(blank=True, max_length=500, null=True)),
                ('note3', models.TextField(blank=True, max_length=500, null=True)),
                ('needPwdReset', models.BooleanField(default=False)),
                ('loginFailureAttempt', models.IntegerField(default=0)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='SalaryGrade',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('title', models.CharField(blank=True, max_length=20, null=True)),
                ('target', models.CharField(blank=True, max_length=20, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('title', models.CharField(max_length=100)),
                ('manager', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='teamManager', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='designation',
            name='salaryGrade',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='sallary', to='HR.SalaryGrade'),
        ),
        migrations.AddField(
            model_name='designation',
            name='secondaryApprover',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='alsoApproving', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='designation',
            name='team',
            field=models.ManyToManyField(blank=True, related_name='teamMembers', to='HR.Team'),
        ),
        migrations.AddField(
            model_name='designation',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='announcements',
            name='toTeam',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='announcementTeam', to='HR.Team'),
        ),
    ]
