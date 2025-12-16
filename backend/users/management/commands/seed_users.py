from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from faker import Faker
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed the database with mock users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Number of users to create'
        )

    def handle(self, *args, **options):
        fake = Faker()
        count = options['count']

        # Create admin user
        if not User.objects.filter(email='admin@example.com').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='admin'
            )
            self.stdout.write(
                self.style.SUCCESS('Created admin user: admin@example.com / admin123')
            )

        # Create test users
        roles = ['admin', 'manager', 'user']
        created_count = 0

        for i in range(count):
            email = f'user{i+1}@example.com'

            if not User.objects.filter(email=email).exists():
                role = random.choice(roles)
                User.objects.create_user(
                    username=f'user{i+1}',
                    email=email,
                    password='password123',
                    first_name=fake.first_name(),
                    last_name=fake.last_name(),
                    role=role,
                    phone=fake.phone_number(),
                    company=fake.company() if random.choice([True, False]) else '',
                )
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} mock users')
        )
