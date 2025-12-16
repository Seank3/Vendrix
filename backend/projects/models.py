from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings


class Project(models.Model):
    """Project/Order model"""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    PLATFORM_CHOICES = [
        ('etsy', 'Etsy'),
        ('shopify', 'Shopify'),
        ('woocommerce', 'WooCommerce'),
        ('ebay', 'eBay'),
        ('jumia', 'Jumia'),
        ('jiji', 'Jiji'),
        ('amazon', 'Amazon'),
        ('other', 'Other'),
    ]

    # Basic info
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES, default='other')

    # Order details
    order_id = models.CharField(max_length=100, blank=True)
    sku = models.CharField(max_length=100, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # Customer info
    customer_name = models.CharField(max_length=100, blank=True)
    customer_email = models.EmailField(blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)

    # Status and priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')

    # Dates
    order_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Relationships
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_projects'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_projects'
    )

    # Metadata
    tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['platform', 'order_date']),
            models.Index(fields=['assigned_to', 'status']),
        ]

    def __str__(self):
        return f"{self.title} ({self.order_id or self.id})"

    def save(self, *args, **kwargs):
        # Auto-calculate total amount
        self.total_amount = self.quantity * self.unit_price

        # Auto-set completed_at when status changes to completed
        if self.status == 'completed' and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
        elif self.status != 'completed':
            self.completed_at = None

        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        """Check if project is overdue"""
        if not self.due_date:
            return False
        from django.utils import timezone
        return timezone.now() > self.due_date and self.status not in ['completed', 'cancelled']

    @property
    def days_until_due(self):
        """Calculate days until due date"""
        if not self.due_date:
            return None
        from django.utils import timezone
        delta = self.due_date - timezone.now()
        return delta.days


class ProjectHistory(models.Model):
    """Audit trail for project changes"""

    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('status_changed', 'Status Changed'),
        ('assigned', 'Assigned'),
        ('commented', 'Commented'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    field = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.project.title} - {self.action} by {self.user.email}"
