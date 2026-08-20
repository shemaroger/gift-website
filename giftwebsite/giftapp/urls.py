from django.urls import path
from django.conf import settings
from .views import *
from django.conf.urls.static import static

urlpatterns = [
    path('roles/', RoleListCreateView.as_view(), name='role-list-create'),
    path('roles/<int:pk>/', RoleRetrieveUpdateDestroyView.as_view(), name='role-detail'),
    
    # Authentication Endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('verify-email/<uuid:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('logout/', LogoutView.as_view(), name='logout'),

    path('users/', UserListView.as_view(), name='user-list'),
    path('userDetails/<int:id>/', UserDetailView.as_view(), name='user-detail'),
    # path('users/create/', UserCreateView.as_view(), name='user-create'),
    # path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    # path('users/<int:pk>/update/', UserUpdateView.as_view(), name='user-update'),
    # path('users/<int:pk>/delete/', UserDeleteView.as_view(), name='user-delete'),
    
    # User Management Endpoints
    path('users/', UserListView.as_view(), name='user-list'),
    
    # Profile Endpoints
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/picture/', ProfilePictureUploadView.as_view(), name='profile-picture-upload'),
    path('me/', CurrentUserView.as_view(), name='current-user'),

    # Admin endpoints
    path('ads/', AdListCreateAPI.as_view(), name='ad-list-create'),
    
    # Public endpoints
    path('ads/active/', ActiveAdsAPI.as_view(), name='active-ads'),
    path('ads/<int:pk>/track-view/', TrackAdViewAPI.as_view(), name='track-view'),
    path('ads/<int:pk>/track-click/', TrackAdClickAPI.as_view(), name='track-click'),

    # Event endpoints
    path('events/', EventListCreateAPI.as_view(), name='event-list'),
    path('events/<int:pk>/', EventListCreateAPI.as_view(), name='event-update'),
     path('events_detail/<int:pk>/', EventDetailAPI.as_view(), name='event-detail'),
    
    
    # Registration endpoints
    path('events/<int:event_id>/register/', EventRegistrationCreateAPI.as_view(), name='event-register'),
    path('events/<int:event_id>/registrations/', EventRegistrationListAPI.as_view(), name='event-registrations'),

    # Blog posts
    path('posts/', BlogPostListCreateAPIView.as_view(), name='blogpost-list'),
    path('posts/<int:pk>/', BlogPostDetailAPIView.as_view(), name='blogpost-detail'),

    # Comments
    path('posts/<slug:slug>/comments/', BlogCommentListCreateAPIView.as_view(), name='blog-comments'),
    
    # Likes
    path('posts/<slug:slug>/like/', BlogLikeAPIView.as_view(), name='blog-like'),
    path('posts/<slug:slug>/likes/', BlogLikesListAPIView.as_view(), name='blog-likes-list'),
    
    # Categories
    path('categories/', BlogCategoryListAPIView.as_view(), name='blog-category-list'),
    path('categories/<int:id>/', BlogCategoryListAPIView.as_view(), name='blog-category-update'),


    path('categories/<slug:category_slug>/posts/', BlogPostsByCategoryAPIView.as_view(), name='blog-posts-by-category'),

    path('announcements/active/', ActiveAnnouncementsAPI.as_view(), name='active-announcements'),
    path('announcements/', AnnouncementListCreateAPI.as_view(), name='announcement-list'),
    path('announcements/<int:pk>/', AnnouncementDetailAPI.as_view(), name='announcement-detail'),

    path('gallery/', GalleryItemListCreateAPI.as_view(), name='gallery-list'),
    path('gallery/<int:pk>/', GalleryItemDetailAPI.as_view(), name='gallery-detail'),
    path('gallery-categories/', GalleryCategoryListAPI.as_view(), name='gallery-categories'),
    path('gallery-categories/<int:id>/', GalleryCategoryListAPI.as_view(), name='gallery-categories-update'),    

    # Public endpoints
    path('gallery/', PublicGalleryAPI.as_view(), name='public-gallery'),

    # Public API (no authentication required)
    path('donation/interest/', DonationCommitmentCreateAPIView.as_view(), name='donation-interest'),
    
    # Admin API (authentication required)
    path('admin-donations/', DonationCommitmentListAPIView.as_view(), name='donation-list'),
    path('admin-donations/<int:commitment_id>/', DonationCommitmentDetailAPIView.as_view(), name='donation-detail'),
    
    # Status management
    path('admin-donations/<int:commitment_id>/status/', DonationUpdateAPIView.as_view(), name='donation-status-update'),
    path('admin-donations/<int:commitment_id>/action/<str:action>/', DonationActionAPIView.as_view(), name='donation-action'),
    
    # Management and analytics
    path('admin-donations/stats/', DonationStatsAPIView.as_view(), name='donation-stats'),
    path('admin-donations/follow-up/', DonationFollowUpAPIView.as_view(), name='donation-follow-up'),
    path('admin-donations/bulk-update/', DonationBulkUpdateAPIView.as_view(), name='donation-bulk-update'),
    path('admin-donations/search/', DonationSearchAPIView.as_view(), name='donation-search'),

    path('contact/', ContactCreateView.as_view(), name='contact-create'),
    
    # ADMIN ENDPOINTS (authentication required)
    path('admin-contacts/', ContactListView.as_view(), name='contact-list'),
    path('admin-contacts/<int:id>/', ContactDetailView.as_view(), name='contact-detail'),
    path('admin-contacts/<int:id>/update/', ContactUpdateView.as_view(), name='contact-update'),
    path('admin-contacts/<int:id>/delete/', ContactDeleteView.as_view(), name='contact-delete'),
    
    # SPECIFIC ACTION ENDPOINTS
    path('admin-contacts/<int:contact_id>/status/', ContactStatusUpdateView.as_view(), name='contact-status-update'),
    path('admin-contacts/<int:contact_id>/mark-replied/',ContactMarkRepliedView.as_view(), name='contact-mark-replied'),
    path('admin-contacts/<int:contact_id>/mark-closed/',ContactMarkClosedView.as_view(), name='contact-mark-closed'),
    
    # STATISTICS AND BULK OPERATIONS
    path('admin-contacts/stats/', ContactStatsView.as_view(), name='contact-stats'),
    path('admin-contacts/bulk-update/', ContactBulkUpdateStatusView.as_view(), name='contact-bulk-update'),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)