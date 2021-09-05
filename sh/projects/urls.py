from django.conf.urls import include, url
from .views import *
from rest_framework import routers

router = routers.DefaultRouter()

router.register(r'media' , mediaViewSet , base_name ='media')
router.register(r'comment' , projectCommentViewSet , base_name ='projectComment')
router.register(r'project' , projectViewSet , base_name ='project')
router.register(r'projectLite' , projectLiteListViewSet , base_name ='projectLite')
router.register(r'projectDashboard' , projectDashboardViewSet , base_name ='projectDashboard')
router.register(r'timelineItem' , timelineItemViewSet , base_name ='projectTimelineItem')
router.register(r'projectSearch' , projectLiteViewSet , base_name ='projectSearch')
router.register(r'projectfield' , ProjectFieldsViewSet , base_name ='projectfield')
router.register(r'fileupload' , FileUploadViewSet , base_name ='fileupload')
router.register(r'fieldValue' , FieldValueViewSet , base_name ='fieldValue')
router.register(r'LDDAssignment' , LDDAssignmentViewSet , base_name ='LDDAssignment')
router.register(r'fileUploadTracer' , FileUploadTracerViewSet , base_name ='FileUploadTracer')
router.register(r'plannerItem' , PlannerItemViewSet , base_name ='plannerItem')
router.register(r'ocrConfig' , OCRConfigViewSet , base_name ='ocrConfig')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'dashboardprojectmgmt/$' , DashboardDataProjectMgmtAPIView.as_view() ),
    url(r'projectDownload/$' , ProjectDownloadAPIView.as_view()),
    url(r'projectCCView/$' , ProjectCCViewAPIView.as_view()),
    url(r'updateLDDAssignment/$' , UpdateLDDAssignmentAPIView.as_view()),
    url(r'uploadLDDFiles/$' , UploadLDDFilesAPIView.as_view()),
    url(r'assignLDD/$' , AssignLDDAPIView.as_view()),
    url(r'LDDDownload/$' , LDDDownloadAPIView.as_view()),
    url(r'uploadLDDFile/$' , UploadLDDFileAPIView.as_view()),
    url(r'projectCompletionCheck/$' , ProjectCompletionCheckAPIView.as_view()),
    url(r'getProjectStatus/$' , GetProjectStatusAPI.as_view()),
    # url(r'getUserStats/$' , GetUserStatsAPI.as_view()),
    url(r'downloadPerformanceReport/$' , DownloadPerformanceReportAPI.as_view()),
    url(r'getCoderAndQcData/$' , GetCoderAndQcDataAPI.as_view()),
    url(r'assignFilesToUser/$' , AssignFilesToUserAPI.as_view()),
    url(r'unlockFilesForUser/$' , UnlockFilesForUserAPI.as_view()),
    url(r'userReports/$' , UserReportsAPI.as_view()),
    url(r'getOnlineReports/$' , GetOnlineReportsAPI.as_view()),
    url(r'getProjectReports/$' , GetProjectReportsAPI.as_view()),
    url(r'checkNextFile/$' , CheckNextFileAPI.as_view()),
    url(r'clearOldFileValues/$' , ClearOldFileValuesAPI.as_view()),
    url(r'projectPerformaceReport/$' , ProjectPerformaceReportAPI.as_view()),
    url(r'abbyImportData/$' , AbbyImportDataAPI.as_view()),
    url(r'downloadPlanner/$' , DownloadPlannerView.as_view()),
    url(r'getPerformanceReport/$' , GetPerformanceReportAPI.as_view()),
    url(r'getOCRConfig/$' , getOCRConfig),
    url(r'getOCRResult/$' , getOCRResult),
    url(r'saveMediaFile/$' , SaveMediaFile),
    url(r'getBulkOCRResult/$' , getBulkOCRResult),
    url(r'retentionNotice/$' , RetentionNoticeAPI.as_view())

]
