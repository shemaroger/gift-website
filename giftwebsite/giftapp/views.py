import os
from django.conf import settings
from rest_framework import generics, permissions, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import logout
from django.utils import timezone
from .models import *
from rest_framework import filters
from .serializers import *
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser,FormParser
from django.contrib.auth import get_user_model
from django.db.models import Q
import logging
from django.urls import reverse
from rest_framework.permissions import IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly, AllowAny
import random 
from rest_framework.decorators import action
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile


User = get_user_model()
logger = logging.getLogger(__name__)


class RoleListCreateView(generics.ListCreateAPIView):
    queryset = Role.objects.filter(is_active=True)
    serializer_class = RoleSerializer
    permission_classes = [permissions.AllowAny]  # Changed from AllowAny
    
    
def perform_create(self, serializer):
        # Now this will work because created_by exists in the model
        serializer.save(created_by=self.request.user)
class RoleRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated]  # Changed from AllowAny
    
    def perform_destroy(self, instance):
        """Soft delete instead of actual deletion"""
        instance.is_active = False
        instance.save()

class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer 
    permission_classes = [permissions.AllowAny] 
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        user_id = kwargs.get('id')
        user = get_object_or_404(User, id=user_id)

        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User updated successfully', 'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def perform_create(self, serializer):
        user = serializer.save()
        default_role, created = Role.objects.get_or_create(
            name='visitor',
            defaults={
                'description': 'Default user role with basic permissions',
                'is_active': True
            }
        )
        user.roles.add(default_role)        
        UserProfile.objects.create(user=user)

class UserListView(APIView):  # Not using generics.ListAPIView since you're overriding get()
    def get(self, request): 
        users = User.objects.values().all()
        return Response(list(users), status=status.HTTP_200_OK)
    
class UserDetailView(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request, id):
        user = User.objects.values().get(id=id)
        return Response(user, status=status.HTTP_200_OK)

class LoginView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            
            # Generate 6-digit OTP
            otp = str(random.randint(100000, 999999))
            user.otp = otp
            user.otp_created_at = timezone.now()
            user.save()

            # Dev-only visibility: print the OTP to the terminal so it doesn't
            # require checking email during local testing. Never runs when
            # DEBUG is off, so this must not appear in production logs.
            if settings.DEBUG:
                print(f"[DEV] OTP for {user.email}: {otp}")

            # Send OTP via email with enhanced error handling
            email_sent = self._send_otp_email(user, otp)
            
            if not email_sent:
                return Response(
                    {'error': 'Failed to send OTP email'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response({
                'message': 'OTP sent to your email',
                'email': user.email,
                'otp_required': True,
                'user_id': user.id
            }, status=status.HTTP_200_OK)
            
        except serializers.ValidationError as e:
            error_data = e.detail
            status_code = status.HTTP_401_UNAUTHORIZED
            if isinstance(error_data, dict) and error_data.get('code') == 'unverified':
                status_code = status.HTTP_403_FORBIDDEN
            return Response(error_data, status=status_code)
        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Internal server error during login'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _send_otp_email(self, user, otp):
        """Enhanced email sending with proper error handling and debugging"""
        subject = "Your Login Verification Code"
        message = f"""
        Hello {user.first_name},
        
        Your verification code is: {otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this, please ignore this email.
        
        Thanks,
        Your Platform Team
        """
        
        try:
            logger.info(f"Attempting to send OTP email to {user.email}")
            
            # Debug print the email configuration
            logger.debug(f"Email config - Host: {settings.EMAIL_HOST}, Port: {settings.EMAIL_PORT}, "
                        f"User: {settings.EMAIL_HOST_USER}, TLS: {settings.EMAIL_USE_TLS}")
            
            send_result = send_mail(
                subject=subject,
                message=message.strip(),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            if send_result == 1:
                logger.info(f"OTP email successfully sent to {user.email}")
                return True
            else:
                logger.error(f"Email sending returned unexpected result: {send_result}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send OTP email to {user.email}: {str(e)}", exc_info=True)
            
            # Print detailed error information for debugging
            error_details = {
                'error': str(e),
                'recipient': user.email,
                'sender': settings.DEFAULT_FROM_EMAIL,
                'host': settings.EMAIL_HOST,
                'time': timezone.now().isoformat()
            }
            logger.debug(f"Email error details: {error_details}")
            
            return False

class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            otp = request.data.get('otp', '').strip()
            
            if not email or not otp:
                return Response(
                    {"error": "Email and OTP are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if len(otp) != 6 or not otp.isdigit():
                return Response(
                    {"error": "OTP must be a 6-digit number"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generic response for every failure path below: distinguishing
            # "no such user" / "no active OTP" / "expired" / "wrong code" via
            # message or status code lets someone probe which emails are
            # registered without ever knowing a password. Keep this message
            # and status identical across all of them.
            generic_failure = Response(
                {'error': 'Invalid or expired verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )

            try:
                user = User.objects.get(email__iexact=email)

                if user.is_account_locked():
                    return generic_failure

                if not user.otp or not user.otp_created_at:
                    return generic_failure

                if timezone.now() > user.otp_created_at + timedelta(minutes=10):
                    return generic_failure

                if user.otp != otp:
                    user.record_failed_login()
                    return generic_failure

                # Verification successful
                user.otp = None
                user.otp_created_at = None
                user.is_verified = True
                user.record_login()  # Update login time and reset failed attempts
                
                # Use the simplified serializer to avoid any field issues
                user_data = UserSerializer(user).data
                
                # Generate tokens - wrapped in try/except
                try:
                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    refresh_token = str(refresh)
                except Exception as token_error:
                    logger.error(f"Token generation error: {str(token_error)}")
                    # Create a custom token as fallback
                    auth_token = AuthToken.objects.create(
                        user=user,
                        expires_at=timezone.now() + timedelta(days=7)
                    )
                    access_token = auth_token.key
                    refresh_token = None
                
                return Response({
                    'access': access_token,
                    'refresh': refresh_token,
                    'user': user_data
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return generic_failure
                
        except Exception as e:
            # Log the actual error
            logger.error(f"VerifyOTP error: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, token):
        try:
            user = User.objects.get(verification_token=token)
            if user.verification_token_expires < timezone.now():
                return Response(
                    {"error": "Verification link has expired"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            user.is_verified = True
            user.verification_token = None
            user.verification_token_expires = None
            user.save()
            
            return Response(
                {"message": "Email successfully verified"},
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid verification token"},
                status=status.HTTP_400_BAD_REQUEST
            )

class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email', '').lower().strip()
        if not email:
            return Response(
                {'detail': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            
            if user.is_verified:
                return Response(
                    {'detail': 'Account is already verified'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Generate new token and expiration
            user.verification_token = uuid.uuid4()
            user.verification_token_expires = timezone.now() + timedelta(hours=24)
            user.save()
            
            # Send verification email
            verification_url = request.build_absolute_uri(
                reverse('verify-email', kwargs={'token': user.verification_token})
            )
            
            send_mail(
                'Verify Your Account',
                f'Please click the following link to verify your account:\n\n{verification_url}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            
            return Response({
                'detail': 'Verification email resent',
                'email': user.email
            })
            
        except User.DoesNotExist:
            return Response(
                {'detail': 'No account found with this email'},
                status=status.HTTP_404_NOT_FOUND
            )

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  # This will now work
            logout(request)
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile

class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user

class ProfilePictureUploadView(generics.UpdateAPIView):
    serializer_class = ProfilePictureSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]
    
    def get_object(self):
        return self.request.user.profile

class AdListCreateAPI(generics.ListCreateAPIView):
    """List all ads or create new ad (admin only)"""
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    permission_classes = [permissions.AllowAny]

class ActiveAdsAPI(generics.ListAPIView):
    """Get currently active ads (public access)"""
    serializer_class = AdSerializer    
    def get_queryset(self):
        return Ad.objects.filter(
            is_active=True,
            start_date__lte=timezone.now().date(),
            end_date__gte=timezone.now().date()
        )
    
class TrackAdViewAPI(generics.UpdateAPIView):
    """Track ad view (public access)"""
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    permission_classes = [permissions.AllowAny]
    
    def update(self, request, *args, **kwargs):
        ad = self.get_object()
        ad.views += 1
        ad.save()
        return Response({'status': 'view tracked'}, status=status.HTTP_200_OK)

class TrackAdClickAPI(generics.UpdateAPIView):
    """Track ad click (public access)"""
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    permission_classes = [permissions.AllowAny]
    
    def update(self, request, *args, **kwargs):
        ad = self.get_object()
        ad.clicks += 1
        ad.save()
        return Response({'status': 'click tracked'}, status=status.HTTP_200_OK)    

class EventDetailAPI(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]
    

    def get(self, request, *args, **kwargs):
        event_id = kwargs.get('pk')
        event = get_object_or_404(Event, id=event_id)
        serializer = self.get_serializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)

class EventListCreateAPI(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event_type', 'is_public', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['start_date', 'end_date']
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.query_params.get('upcoming') == 'true':
            queryset = queryset.filter(start_date__gt=timezone.now())
        if self.request.query_params.get('ongoing') == 'true':
            now = timezone.now()
            queryset = queryset.filter(start_date__lte=now, end_date__gte=now)
        return queryset  

    def post(self, request, *args, **kwargs):
        print("Received POST data:", request.data)
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        event_id = kwargs.get('pk')  # get 'pk' from the URL

        if not event_id:
            return Response({'error': 'Event ID is required in URL.'}, status=status.HTTP_400_BAD_REQUEST)

        event_instance = get_object_or_404(Event, id=event_id)
        serializer = self.get_serializer(event_instance, data=request.data, partial=True)  # allow partial update

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class EventRetrieveUpdateDestroyAPI(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

class EventRegistrationCreateAPI(generics.CreateAPIView):
    queryset = EventRegistration.objects.all()
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class EventRegistrationListAPI(generics.ListAPIView):
    serializer_class = EventRegistrationSerializer
    
    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return EventRegistration.objects.filter(event_id=event_id)
    
class BlogPostListCreateAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        posts = BlogPost.objects.filter(status='published').order_by('-published_date')
        serializer = BlogPostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        print("Received POST data:", request.data)
        if not request.user.is_staff:
            return Response(
                {"error": "Only admin users can create blog posts"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = BlogPostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BlogPostRetrieveUpdateDestroyAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, slug):
        return get_object_or_404(BlogPost, slug=slug)

    def get(self, request, slug):
        post = self.get_object(slug)
        serializer = BlogPostSerializer(post, context={'request': request})
        return Response(serializer.data)

    def put(self, request, slug):
        post = self.get_object(slug)
        if post.author != request.user and not request.user.is_staff:
            return Response(
                {"error": "You don't have permission to edit this post"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = BlogPostSerializer(post, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        post = self.get_object(slug)
        if post.author != request.user and not request.user.is_staff:
            return Response(
                {"error": "You don't have permission to delete this post"},
                status=status.HTTP_403_FORBIDDEN
            )

        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BlogCommentListCreateAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, slug):
        post = get_object_or_404(BlogPost, slug=slug)
        comments = post.comments.filter(is_approved=True).order_by('-created_at')
        serializer = BlogCommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, slug):
        post = get_object_or_404(BlogPost, slug=slug)
        serializer = BlogCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BlogLikeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        post = get_object_or_404(BlogPost, slug=slug)
        like, created = BlogLike.objects.get_or_create(
            post=post,
            user=request.user
        )

        if not created:
            like.delete()
            return Response({
                "status": "unliked",
                "like_count": post.likes.count(),
                "is_liked": False
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "liked",
            "like_count": post.likes.count(),
            "is_liked": True
        }, status=status.HTTP_201_CREATED)

class BlogLikesListAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, slug):
        post = get_object_or_404(BlogPost, slug=slug)
        likes = post.likes.select_related('user').all()
        users = [like.user for like in likes]
        return Response({
            "like_count": len(users),
            "users": UserSerializer(users, many=True).data
        })

class BlogCategoryListAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = BlogCategory.objects.all()
        serializer = BlogCategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()

        if 'slug' not in data or not data['slug']:
            data['slug'] = slugify(data.get('name', ''))

        if 'icon' not in data or not data['icon']:
            data['icon'] = 'tag'

        serializer = BlogCategorySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print(serializer.errors)  # Add this for debugging
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, id):
        category = get_object_or_404(BlogCategory, id=id)
        data = request.data.copy()

        # Regenerate slug if not provided
        if 'slug' not in data or not data['slug']:
            data['slug'] = slugify(data.get('name', category.name))

        # Set default or retain existing icon
        if 'icon' not in data or not data['icon']:
            data['icon'] = category.icon or 'tag'

        serializer = BlogCategorySerializer(category, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class BlogPostDetailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        post = get_object_or_404(BlogPost, pk=pk)
        serializer = BlogPostSerializer(post, context={'request': request})
        return Response(serializer.data)
    
class BlogPostsByCategoryAPIView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, category_slug):
        category = get_object_or_404(BlogCategory, id=category_slug)
        posts = BlogPost.objects.filter(
            category=category,
            status='published'
        ).order_by('-published_date')
        serializer = BlogPostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

class ActiveAnnouncementsAPI(APIView):
    """Public endpoint for active announcements"""
    permission_classes = []
    
    def get(self, request):
        announcements = Announcement.objects.filter(
            is_active=True
        ).exclude(
            show_until__lt=timezone.now()
        ).order_by('-created_at')
        
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data)

class AnnouncementListCreateAPI(APIView):
    """Admin endpoint for announcement management"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        announcements = Announcement.objects.all().order_by('-created_at')
        serializer = AnnouncementSerializer(announcements, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = AnnouncementSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AnnouncementDetailAPI(APIView):
    """Admin endpoint for single announcement"""
    permission_classes = [IsAuthenticated]
    
    def get_object(self, pk):
        try:
            return Announcement.objects.get(pk=pk)
        except Announcement.DoesNotExist:
            return None
    
    def get(self, request, pk):
        announcement = self.get_object(pk)
        if not announcement:
            return Response(
                {"error": "Announcement not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = AnnouncementSerializer(announcement)
        return Response(serializer.data)
    
    def put(self, request, pk):
        announcement = self.get_object(pk)
        if not announcement:
            return Response(
                {"error": "Announcement not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = AnnouncementSerializer(announcement, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        announcement = self.get_object(pk)
        if not announcement:
            return Response(
                {"error": "Announcement not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        announcement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)    
    
class GalleryItemListCreateAPI(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        items = GalleryItem.objects.all().order_by('-uploaded_at')
        serializer = GalleryItemSerializer(items, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        files = request.FILES.getlist('image') if 'image' in request.FILES else []        
        created_items = []
        errors = []
        
        if not files:
            serializer = GalleryItemCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                item = serializer.save(uploaded_by=request.user)
                created_items.append(GalleryItemSerializer(item, context={'request': request}).data)
                return Response(created_items, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Multiple image upload
        for i, file in enumerate(files):
            data = request.data.copy()
            data['image'] = file
            data['media_type'] = 'image'
            
            # Generate title if not provided
            if not data.get('title'):
                filename = os.path.splitext(file.name)[0]
                data['title'] = filename
            
            serializer = GalleryItemCreateSerializer(data=data, context={'request': request})
            if serializer.is_valid():
                item = serializer.save(uploaded_by=request.user)
                
                # Generate thumbnail
                if item.image:
                    self.generate_thumbnail(item)
                
                created_items.append(GalleryItemSerializer(item, context={'request': request}).data)
            else:
                errors.append({
                    'file': file.name,
                    'errors': serializer.errors
                })
        
        if errors and not created_items:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        
        response_data = {
            'created': created_items,
            'errors': errors
        }
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    def generate_thumbnail(self, gallery_item):
        img = Image.open(gallery_item.image)
        img.thumbnail((300, 300))  # Create thumbnail
        
        thumb_io = BytesIO()
        if img.format.lower() == 'jpeg':
            img.save(thumb_io, format='JPEG')
            ext = 'jpg'
        else:
            img.save(thumb_io, format='PNG')
            ext = 'png'
        
        thumb_file = ContentFile(thumb_io.getvalue())
        thumb_name = f"{os.path.splitext(gallery_item.image.name)[0]}_thumb.{ext}"
        
        gallery_item.thumbnail.save(thumb_name, thumb_file, save=True)

class GalleryItemDetailAPI(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return GalleryItem.objects.get(pk=pk)
        except GalleryItem.DoesNotExist:
            return None

    def get(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = GalleryItemSerializer(item, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check ownership
        if item.uploaded_by != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to edit this item'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = GalleryItemCreateSerializer(
            item, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            updated_item = serializer.save()
            
            # Regenerate thumbnail if image changed
            if 'image' in request.data and updated_item.image:
                self.generate_thumbnail(updated_item)
            
            return Response(
                GalleryItemSerializer(updated_item, context={'request': request}).data
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check ownership
        if item.uploaded_by != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to delete this item'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class GalleryCategoryListAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = GalleryCategory.objects.all()
        serializer = GalleryCategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        data = request.data.copy()

        if 'slug' not in data or not data['slug']:
            data['slug'] = slugify(data.get('name', ''))

        if 'icon' not in data or not data['icon']:
            data['icon'] = 'tag'

        serializer = GalleryCategorySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        print(serializer.errors)  # Add this for debugging
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, id):
        category = get_object_or_404(GalleryCategory, id=id)
        data = request.data.copy()

        # Regenerate slug if not provided
        if 'slug' not in data or not data['slug']:
            data['slug'] = slugify(data.get('name', category.name))

        # Set default or retain existing icon
        if 'icon' not in data or not data['icon']:
            data['icon'] = category.icon or 'tag'

        serializer = GalleryCategorySerializer(category, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PublicGalleryAPI(APIView):
    def get(self, request):
        items = GalleryItem.objects.filter(is_active=True).order_by('-uploaded_at')
        
        # Filter by category
        category = request.query_params.get('category')
        if category:
            items = items.filter(categories__slug=category)
        
        # Filter by media type
        media_type = request.query_params.get('media_type')
        if media_type in ['image', 'video']:
            items = items.filter(media_type=media_type)
        
        serializer = GalleryItemSerializer(items, many=True, context={'request': request})
        return Response(serializer.data)    

class DonationPagination(PageNumberPagination):
    """Custom pagination for donation commitments"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

# PUBLIC API VIEWS

class DonationCommitmentCreateAPIView(APIView):
    """Public API endpoint for donation interest submissions"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Create new donation commitment"""
        serializer = DonationCommitmentCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            commitment = serializer.save()
            return Response({
                'success': True,
                'message': 'Thank you for your interest in supporting our cause! We will contact you soon.',
                'reference_id': str(commitment.reference_id)
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# ADMIN API VIEWS

class DonationCommitmentListAPIView(APIView):
    """List all donation commitments with filtering (admin only)"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get list of donation commitments"""
        commitments = DonationCommitment.objects.all()              
        serializer = DonationCommitmentListSerializer(commitments, many=True)
        return Response(serializer.data)

class DonationCommitmentDetailAPIView(APIView):
    """Get, update, or delete a single donation commitment (admin only)"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get_object(self, commitment_id):
        """Helper method to get commitment object"""
        return get_object_or_404(DonationCommitment, id=commitment_id)
    
    def get(self, request, commitment_id):
        """Get single donation commitment details"""
        commitment = self.get_object(commitment_id)
        serializer = DonationCommitmentSerializer(commitment)
        return Response(serializer.data)
    
    def put(self, request, commitment_id):
        """Update donation commitment"""
        commitment = self.get_object(commitment_id)
        serializer = DonationCommitmentSerializer(commitment, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Donation commitment updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, commitment_id):
        """Partially update donation commitment"""
        commitment = self.get_object(commitment_id)
        serializer = DonationCommitmentSerializer(commitment, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Donation commitment updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, commitment_id):
        """Delete donation commitment (admin only)"""
        if not request.user.is_superuser:
            return Response({
                'success': False,
                'message': 'Only superusers can delete commitments'
            }, status=status.HTTP_403_FORBIDDEN)
        
        commitment = self.get_object(commitment_id)
        commitment_name = commitment.full_name
        commitment.delete()
        
        return Response({
            'success': True,
            'message': f'Donation commitment from {commitment_name} deleted successfully'
        })

class DonationUpdateAPIView(APIView):
    """Update any field(s) of a donation commitment"""
    permission_classes = [AllowAny]

    def patch(self, request, commitment_id):
        """Partially update donation commitment by ID"""
        commitment = get_object_or_404(DonationCommitment, id=commitment_id)
        
        serializer = DonationCommitmentSerializer(
            commitment,
            data=request.data,
            partial=True
        )

        print(request.data)
        
        if serializer.is_valid():
            
            serializer.save()
            return Response({
                'success': True,
                'message': 'Donation commitment updated successfully',
                'data': serializer.data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class DonationActionAPIView(APIView):
    """Handle specific donation actions (contacted, committed, etc.)"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, commitment_id, action):
        """Handle different donation actions"""
        commitment = get_object_or_404(DonationCommitment, id=commitment_id)
        
        if action == 'contacted':
            commitment.mark_contacted()
            message = 'Marked as contacted'
        elif action == 'committed':
            commitment.mark_committed()
            message = 'Marked as committed to donate'
        elif action == 'completed':
            commitment.mark_donated()
            message = 'Marked as donated successfully'
        elif action == 'declined':
            commitment.mark_declined()
            message = 'Marked as declined'
        else:
            return Response({
                'success': False,
                'message': 'Invalid action'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': message,
            'status': commitment.status,
            'contact_attempts': getattr(commitment, 'contact_attempts', 0)
        })

class DonationStatsAPIView(APIView):
    """Get donation commitment statistics"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get donation statistics for dashboard"""
        stats = {
            'total': DonationCommitment.objects.count(),
            'new': DonationCommitment.objects.filter(status='new').count(),
            'contacted': DonationCommitment.objects.filter(status='contacted').count(),
            'committed': DonationCommitment.objects.filter(status='committed').count(),
            'donated': DonationCommitment.objects.filter(status='donated').count(),
            'declined': DonationCommitment.objects.filter(status='declined').count(),
            'needs_follow_up': DonationCommitment.objects.filter(
                next_follow_up__lte=timezone.now().date()
            ).exclude(status__in=['donated', 'declined']).count(),
            'by_donation_type': {},
            'recent_activity': DonationCommitment.objects.filter(
                submitted_at__gte=timezone.now().date()
            ).count()
        }
        
        # Count by donation type
        for choice in DonationCommitment.DONATION_TYPE_CHOICES:
            key = choice[0]
            stats['by_donation_type'][key] = DonationCommitment.objects.filter(
                donation_type=key
            ).count()
        
        return Response(stats)

class DonationFollowUpAPIView(APIView):
    """Get list of commitments needing follow-up"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get commitments needing follow-up"""
        commitments = DonationCommitment.objects.filter(
            next_follow_up__lte=timezone.now().date(),
            status__in=['new', 'contacted', 'committed']
        ).order_by('next_follow_up')
        
        serializer = DonationCommitmentListSerializer(commitments, many=True)
        
        return Response({
            'count': commitments.count(),
            'results': serializer.data
        })

class DonationBulkUpdateAPIView(APIView):
    """Bulk update status for multiple commitments"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        """Bulk update commitment statuses"""
        commitment_ids = request.data.get('commitment_ids', [])
        new_status = request.data.get('status')
        
        if not commitment_ids or not new_status:
            return Response({
                'success': False,
                'message': 'commitment_ids and status are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in [choice[0] for choice in DonationCommitment.STATUS_CHOICES]:
            return Response({
                'success': False,
                'message': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate commitment_ids exist
        existing_commitments = DonationCommitment.objects.filter(
            id__in=commitment_ids
        )
        
        if existing_commitments.count() != len(commitment_ids):
            return Response({
                'success': False,
                'message': 'Some commitment IDs are invalid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        updated_count = existing_commitments.update(status=new_status)
        
        return Response({
            'success': True,
            'message': f'Updated {updated_count} commitments to {new_status}',
            'updated_count': updated_count
        })

class DonationSearchAPIView(APIView):
    """Advanced search for donation commitments"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Advanced search with multiple filters"""
        commitments = DonationCommitment.objects.all()
        
        # Date range filter
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            commitments = commitments.filter(submitted_at__date__gte=date_from)
        if date_to:
            commitments = commitments.filter(submitted_at__date__lte=date_to)
        
        # Amount range filter (if estimated_amount contains numbers)
        min_amount = request.query_params.get('min_amount')
        max_amount = request.query_params.get('max_amount')
        
        # Multiple status filter
        statuses = request.query_params.getlist('statuses')
        if statuses:
            commitments = commitments.filter(status__in=statuses)
        
        # Contact attempts filter
        min_attempts = request.query_params.get('min_contact_attempts')
        if min_attempts:
            commitments = commitments.filter(contact_attempts__gte=min_attempts)
        
        # Organization filter
        has_organization = request.query_params.get('has_organization')
        if has_organization == 'true':
            commitments = commitments.exclude(organization='')
        elif has_organization == 'false':
            commitments = commitments.filter(organization='')
        
        # Order by
        ordering = request.query_params.get('ordering', '-submitted_at')
        commitments = commitments.order_by(ordering)
        
        # Pagination
        paginator = DonationPagination()
        page = paginator.paginate_queryset(commitments, request)
        
        if page is not None:
            serializer = DonationCommitmentListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = DonationCommitmentListSerializer(commitments, many=True)
        return Response({
            'count': commitments.count(),
            'results': serializer.data
        })        

class ContactPagination(PageNumberPagination):
    """Custom pagination for contact list"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# PUBLIC API VIEWS (for contact form submission)

class ContactCreateView(APIView):
    """Public API endpoint for creating contact submissions"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Create a new contact submission"""
        serializer = ContactCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            contact = serializer.save()
            
            # You can add email notifications here
            # send_notification_email(contact)
            
            return Response({
                'success': True,
                'message': 'Thank you for your message. We will get back to you soon!',
                'contact_id': contact.id
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ADMIN API VIEWS (require authentication)

class ContactListView(APIView):
    """List all contact submissions (admin only)"""
    permission_classes = [AllowAny]
    pagination_class = ContactPagination
    
    def get(self, request):
        """Get paginated list of contacts with filtering and search"""
        queryset = Contact.objects.all()
        serializer = ContactListSerializer(queryset, many=True)
        return Response(serializer.data)
    


class ContactDetailView(APIView):
    """Get single contact submission details (admin only)"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, id):
        """Get contact details by ID"""
        contact = get_object_or_404(Contact, id=id)
        serializer = ContactDetailSerializer(contact)
        return Response(serializer.data)

class ContactUpdateView(APIView):
    """Update any field of a contact submission (admin only)"""
    permission_classes = [AllowAny]

    def put(self, request, id):
        """Full update: Replaces all fields of the contact"""
        return self._update_contact(request, id, partial=False)

    def patch(self, request, id):
        """Partial update: Updates only the provided fields"""
        return self._update_contact(request, id, partial=True)

    def _update_contact(self, request, id, partial):
        contact = get_object_or_404(Contact, id=id)
        serializer = ContactSerializer(contact, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Contact updated successfully',
                'data': serializer.data
            })

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ContactDeleteView(APIView):
    """Delete contact submission (admin only)"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def delete(self, request, id):
        """Delete contact by ID"""
        contact = get_object_or_404(Contact, id=id)
        contact.delete()
        
        return Response({
            'success': True,
            'message': 'Contact deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)


# SPECIFIC ACTION VIEWS

class ContactStatusUpdateView(APIView):
    """Update only the status of a contact"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def patch(self, request, contact_id):
        """Update contact status"""
        contact = get_object_or_404(Contact, id=contact_id)
        
        serializer = ContactStatusUpdateSerializer(
            contact, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': f'Status updated to {contact.get_status_display()}',
                'status': contact.status
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ContactMarkRepliedView(APIView):
    """Mark contact as replied"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, contact_id):
        """Mark contact as replied"""
        contact = get_object_or_404(Contact, id=contact_id)
        contact.mark_replied()
        
        return Response({
            'success': True,
            'message': 'Contact marked as replied',
            'status': contact.status
        })


class ContactMarkClosedView(APIView):
    """Mark contact as closed"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, contact_id):
        """Mark contact as closed"""
        contact = get_object_or_404(Contact, id=contact_id)
        contact.mark_closed()
        
        return Response({
            'success': True,
            'message': 'Contact marked as closed',
            'status': contact.status
        })


class ContactStatsView(APIView):
    """Get contact statistics for dashboard"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get contact statistics"""
        stats = {
            'total': Contact.objects.count(),
            'new': Contact.objects.filter(status='new').count(),
            'replied': Contact.objects.filter(status='replied').count(),
            'closed': Contact.objects.filter(status='closed').count(),
            'by_subject_type': {}
        }
        
        # Count by subject type
        for choice in Contact.SUBJECT_CHOICES:
            key = choice[0]
            stats['by_subject_type'][key] = Contact.objects.filter(subject_type=key).count()
        
        return Response(stats)


# BULK OPERATIONS

class ContactBulkUpdateStatusView(APIView):
    """Bulk update status for multiple contacts"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        """Bulk update contact statuses"""
        contact_ids = request.data.get('contact_ids', [])
        new_status = request.data.get('status')
        
        if not contact_ids or not new_status:
            return Response({
                'success': False,
                'message': 'contact_ids and status are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in [choice[0] for choice in Contact.STATUS_CHOICES]:
            return Response({
                'success': False,
                'message': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        updated_count = Contact.objects.filter(
            id__in=contact_ids
        ).update(status=new_status)
        
        return Response({
            'success': True,
            'message': f'Updated {updated_count} contacts',
            'updated_count': updated_count
        })