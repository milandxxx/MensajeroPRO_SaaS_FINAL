from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a superadmin user with unlimited business access'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Username for superadmin')
        parser.add_argument('--email', type=str, help='Email for superadmin')
        parser.add_argument('--password', type=str, help='Password for superadmin')

    def handle(self, *args, **options):
        username = options.get('username') or input('Username: ')
        email = options.get('email') or input('Email: ')
        password = options.get('password') or input('Password: ')

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'User {username} already exists'))
            return

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=True,
            is_superuser=True,
            role='superadmin',
            max_businesses=999999
        )

        self.stdout.write(self.style.SUCCESS(f'✓ Superadmin created: {username}'))
        self.stdout.write(self.style.SUCCESS(f'  - Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'  - Role: Superadmin'))
        self.stdout.write(self.style.SUCCESS(f'  - Business limit: Unlimited'))
        self.stdout.write(self.style.SUCCESS(f'  - No payment required'))