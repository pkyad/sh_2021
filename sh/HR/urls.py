from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'users' , UserViewSet , base_name = 'user')
router.register(r'groups' , GroupViewSet)
router.register(r'usersAdminMode' , userAdminViewSet , base_name = 'userAdminMode')
router.register(r'userSearch' , UserSearchViewSet , base_name = 'userSearch')
router.register(r'salaryGrade' , SalaryGradeViewSet , base_name = 'salaryGrade')
router.register(r'profile' , userProfileViewSet , base_name ='profile')
router.register(r'profileAdminMode' , userProfileAdminModeViewSet , base_name ='profileAdminMode')
router.register(r'designation' , userDesignationViewSet , base_name = 'designation')
router.register(r'team' , TeamViewSet , base_name = 'team')
router.register(r'announcements' , AnnouncementsViewSet , base_name = 'announcements')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'profileOrgCharts/$' , OrgChartAPI.as_view()),
    url(r'sendDeboardEmail/$' ,sendDeboardingEmailAPIView.as_view() ),
    url(r'bulkAssign/$' , BulkAssignAPI.as_view()),
    url(r'bulkUpload/$' , BulkUploadAPI.as_view()),
    url(r'resetNeedPasswordField/$' , ResetNeedPasswordFieldAPI.as_view()),
    url(r'assignTeamToTeam/$' , AssignTeamToTeamView.as_view()),
    url(r'getPagination/$' , GetPaginationView.as_view()),
]
