from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
from decimal import Decimal
import random
from datetime import timedelta
from django.utils import timezone
from ...models import Project

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with mock projects/orders'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=100,
            help='Number of projects to create'
        )

    def handle(self, *args, **options):
        fake = Faker()
        count = options['count']

        # Get users for assignment
        users = list(User.objects.all())
        if not users:
            self.stdout.write(
                self.style.ERROR('No users found. Run seed_users command first.')
            )
            return

        platforms = ['etsy', 'shopify', 'woocommerce', 'ebay', 'jumia', 'jiji', 'amazon']
        statuses = ['draft', 'pending', 'in_progress', 'completed', 'cancelled']
        priorities = ['low', 'medium', 'high', 'urgent']

        created_count = 0

        for i in range(count):
            # Create project with realistic data
            order_date = timezone.now() - timedelta(days=random.randint(0, 90))
            due_date = order_date + timedelta(days=random.randint(1, 30))

            # Decide status based on dates
            if order_date > timezone.now() - timedelta(days=7):
                # Recent orders are more likely to be pending/in progress
                status = random.choices(
                    ['draft', 'pending', 'in_progress', 'completed'],
                    weights=[10, 30, 40, 20]
                )[0]
            else:
                # Older orders more likely completed
                status = random.choices(
                    ['completed', 'cancelled', 'in_progress'],
                    weights=[70, 20, 10]
                )[0]

            # Set completion date for completed projects
            completed_at = None
            if status == 'completed':
                completed_at = order_date + timedelta(days=random.randint(1, 14))

            project = Project.objects.create(
                title=fake.sentence(nb_words=random.randint(3, 8)).rstrip('.'),
                description=fake.text(max_nb_chars=200) if random.choice([True, False]) else '',
                platform=random.choice(platforms),
                order_id=f'ORD-{random.randint(10000, 99999)}',
                sku=f'SKU-{random.randint(1000, 9999)}',
                quantity=random.randint(1, 10),
                unit_price=Decimal(str(round(random.uniform(10, 500), 2))),
                customer_name=fake.name(),
                customer_email=fake.email(),
                customer_phone=fake.phone_number() if random.choice([True, False]) else '',
                status=status,
                priority=random.choice(priorities),
                order_date=order_date,
                due_date=due_date,
                completed_at=completed_at,
                assigned_to=random.choice(users) if random.choice([True, False]) else None,
                created_by=random.choice(users),
                notes=fake.text(max_nb_chars=100) if random.choice([True, False]) else '',
                tags=random.sample(['urgent', 'vip', 'bulk', 'custom', 'gift'], random.randint(0, 3))
            )

            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} mock projects')
        )
