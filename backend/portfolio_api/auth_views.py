from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import EmailMultiAlternatives
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import UserProfileSerializer
from .utils import render_branded_email

User = get_user_model()
token_generator = PasswordResetTokenGenerator()


class LoginView(TokenObtainPairView):
    """POST {username, password} -> {access, refresh}. Thin wrapper around SimpleJWT's default view."""
    pass


class RefreshView(TokenRefreshView):
    """POST {refresh} -> {access}. Thin wrapper around SimpleJWT's default view."""
    pass


class MeView(APIView):
    """Lets the logged-in dashboard user view/edit their own account (name, email)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return the current user's profile fields."""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Partially update the current user's profile fields."""
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """Lets a logged-in user change their password by confirming the old one first."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Verify old_password, then set new_password if it checks out."""
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response(
                {"detail": "old_password and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        if not user.check_password(old_password):
            return Response({"detail": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password changed successfully."})


class ForgotPasswordView(APIView):
    """Public password-reset request endpoint. Always returns 200 with a generic
    message regardless of whether the email exists, to avoid leaking account existence."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Email a signed reset link if the address matches a user; otherwise silently no-op."""
        email = request.data.get("email")
        if email:
            user = User.objects.filter(email=email).first()
            if user:
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = token_generator.make_token(user)
                reset_link = f"{settings.FRONTEND_URL}/admin/reset-password/{uid}/{token}/"
                try:
                    body_html = (
                        f"<p>We received a request to reset the password for your dashboard account.</p>"
                        f'<p><a href="{reset_link}" style="color:#2563eb;">Reset your password</a></p>'
                        f"<p>If you didn't request this, you can safely ignore this email.</p>"
                        f'<p style="color:#6b6b6b; font-size:12px;">Or copy this link: {reset_link}</p>'
                    )
                    email = EmailMultiAlternatives(
                        subject="Password Reset Request",
                        body=f"Use the link below to reset your password:\n\n{reset_link}",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[user.email],
                    )
                    email.attach_alternative(render_branded_email(body_html), "text/html")
                    email.send(fail_silently=False)
                except Exception:
                    return Response(
                        {"detail": "Unable to send reset email at this time. Please try again later."},
                        status=status.HTTP_502_BAD_GATEWAY,
                    )

        return Response({"detail": "If an account with that email exists, a reset link has been sent."})


class ResetPasswordView(APIView):
    """Public endpoint that completes a password reset given a valid uid/token pair from the emailed link."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Validate the uid/token against PasswordResetTokenGenerator, then set new_password."""
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not uid or not token or not new_password:
            return Response(
                {"detail": "uid, token and new_password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_pk)
        except Exception:
            return Response({"detail": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired reset link."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password has been reset successfully."})
