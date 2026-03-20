from django.db import models

class Contract(models.Model):

    file = models.FileField(upload_to='contracts/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    analysis = models.JSONField(null=True, blank=True)
    parsed_text = models.TextField(blank=True)

    def __str__(self):
        return f"Contract {self.id}"