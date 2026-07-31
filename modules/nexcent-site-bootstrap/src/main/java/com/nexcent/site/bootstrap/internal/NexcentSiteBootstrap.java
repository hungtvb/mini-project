package com.nexcent.site.bootstrap.internal;

import com.liferay.client.extension.constants.ClientExtensionEntryConstants;
import com.liferay.client.extension.model.ClientExtensionEntryRel;
import com.liferay.client.extension.service.ClientExtensionEntryRelLocalService;
import com.liferay.dispatch.executor.DispatchTaskClusterMode;
import com.liferay.dispatch.model.DispatchTrigger;
import com.liferay.dispatch.service.DispatchTriggerLocalService;
import com.liferay.object.model.ObjectDefinition;
import com.liferay.object.service.ObjectDefinitionLocalService;
import com.liferay.object.service.ObjectEntryLocalService;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.LayoutSet;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.service.CompanyLocalService;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.LayoutSetLocalService;
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.UnicodeProperties;

import java.util.Calendar;
import java.util.List;
import java.util.TimeZone;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

@Component(immediate = true, service = {})
public class NexcentSiteBootstrap {

    @Activate
    protected void activate() {
        _scheduledFuture = _scheduledExecutorService.scheduleWithFixedDelay(
            this::_configureSafely, 5, 5, TimeUnit.SECONDS);
    }

    @Deactivate
    protected void deactivate() {
        if (_scheduledFuture != null) {
            _scheduledFuture.cancel(false);
        }

        _scheduledExecutorService.shutdownNow();
    }

    private void _addClientExtension(
            String externalReferenceCode, LayoutSet layoutSet, String type,
            String typeSettings, boolean exclusive, long userId)
        throws Exception {

        long classNameId = _portal.getClassNameId(LayoutSet.class);
        long classPK = layoutSet.getLayoutSetId();

        List<ClientExtensionEntryRel> clientExtensionEntryRels =
            _clientExtensionEntryRelLocalService.getClientExtensionEntryRels(
                classNameId, classPK, type);

        for (ClientExtensionEntryRel clientExtensionEntryRel :
                clientExtensionEntryRels) {

            if (externalReferenceCode.equals(
                    clientExtensionEntryRel.getCETExternalReferenceCode())) {

                return;
            }
        }

        if (exclusive) {
            _clientExtensionEntryRelLocalService.deleteClientExtensionEntryRels(
                classNameId, classPK, type);
        }

        ServiceContext serviceContext = new ServiceContext();

        serviceContext.setCompanyId(layoutSet.getCompanyId());
        serviceContext.setScopeGroupId(layoutSet.getGroupId());
        serviceContext.setUserId(userId);

        _clientExtensionEntryRelLocalService.addClientExtensionEntryRel(
            userId, layoutSet.getGroupId(), classNameId, classPK,
            externalReferenceCode, type, typeSettings, serviceContext);
    }

    private void _configure() throws Exception {
        Company company = _companyLocalService.getCompanyByWebId(
            _COMPANY_WEB_ID);
        Group group = _groupLocalService.fetchGroupByExternalReferenceCode(
            _SITE_EXTERNAL_REFERENCE_CODE, company.getCompanyId());

        if (group == null) {
            throw new IllegalStateException(
                "Nexcent site is not provisioned yet");
        }

        User defaultUser = _userLocalService.getDefaultUser(
            company.getCompanyId());

        _configureLayoutSet(group, defaultUser.getUserId());
        _configureMetricsScheduler(company.getCompanyId(), defaultUser);
    }

    private void _configureLayoutSet(Group group, long userId)
        throws Exception {

        LayoutSet layoutSet = _layoutSetLocalService.getLayoutSet(
            group.getGroupId(), false);

        _addClientExtension(
            "nexcent-theme-css", layoutSet,
            ClientExtensionEntryConstants.TYPE_THEME_CSS, "", true, userId);
        _addClientExtension(
            "nexcent-theme-favicon", layoutSet,
            ClientExtensionEntryConstants.TYPE_THEME_FAVICON, "", true,
            userId);
        _addClientExtension(
            "nexcent-global-css", layoutSet,
            ClientExtensionEntryConstants.TYPE_GLOBAL_CSS, "", false, userId);
        _addClientExtension(
            "nexcent-global-js", layoutSet,
            ClientExtensionEntryConstants.TYPE_GLOBAL_JS,
            _GLOBAL_JS_TYPE_SETTINGS, false, userId);
        _addClientExtension(
            "nexcent-react-runtime", layoutSet,
            ClientExtensionEntryConstants.TYPE_GLOBAL_JS,
            _GLOBAL_JS_TYPE_SETTINGS, false, userId);
    }

    private void _configureMetricsScheduler(long companyId, User user)
        throws Exception {

        ObjectDefinition objectDefinition =
            _objectDefinitionLocalService.
                getObjectDefinitionByExternalReferenceCode(
                    _METRICS_OBJECT_DEFINITION_ERC, companyId);

        for (String externalReferenceCode : _METRIC_ENTRY_ERCS) {
            if (_objectEntryLocalService.fetchObjectEntry(
                    externalReferenceCode, 0,
                    objectDefinition.getObjectDefinitionId()) == null) {

                throw new IllegalStateException(
                    "Metric seed is not available yet: " +
                        externalReferenceCode);
            }
        }

        UnicodeProperties taskSettings = new UnicodeProperties(true);

        taskSettings.setProperty("maximumGrowthPercent", "10");
        taskSettings.setProperty(
            "metricExternalReferenceCodes",
            String.join(",", _METRIC_ENTRY_ERCS));
        taskSettings.setProperty("minimumGrowthPercent", "-10");

        DispatchTrigger dispatchTrigger =
            _dispatchTriggerLocalService.
                fetchDispatchTriggerByExternalReferenceCode(
                    _METRICS_TRIGGER_ERC, companyId);

        if (dispatchTrigger == null) {
            dispatchTrigger = _dispatchTriggerLocalService.addDispatchTrigger(
                _METRICS_TRIGGER_ERC, user.getUserId(),
                _METRICS_EXECUTOR_TYPE, taskSettings,
                _METRICS_TRIGGER_NAME, false);
        }
        else {
            dispatchTrigger =
                _dispatchTriggerLocalService.updateDispatchTrigger(
                    dispatchTrigger.getDispatchTriggerId(), taskSettings,
                    _METRICS_TRIGGER_NAME);
        }

        Calendar startCalendar = Calendar.getInstance(
            TimeZone.getTimeZone("UTC"));

        startCalendar.add(Calendar.MINUTE, 1);

        _dispatchTriggerLocalService.updateDispatchTrigger(
            dispatchTrigger.getDispatchTriggerId(), true,
            _METRICS_CRON_EXPRESSION,
            DispatchTaskClusterMode.SINGLE_NODE_MEMORY_CLUSTERED,
            0, 0, 0, 0, 0, true, false,
            startCalendar.get(Calendar.MONTH),
            startCalendar.get(Calendar.DAY_OF_MONTH),
            startCalendar.get(Calendar.YEAR),
            startCalendar.get(Calendar.HOUR_OF_DAY),
            startCalendar.get(Calendar.MINUTE), "UTC");
    }

    private void _configureSafely() {
        if (_configured.get()) {
            return;
        }

        try {
            _configure();

            _configured.set(true);

            if (_log.isInfoEnabled()) {
                _log.info(
                    "Configured Nexcent public client extensions and metrics " +
                        "scheduler trigger");
            }

            if (_scheduledFuture != null) {
                _scheduledFuture.cancel(false);
            }
        }
        catch (Exception exception) {
            int attempt = ++_attempt;

            if ((attempt % 12) == 0 && _log.isWarnEnabled()) {
                _log.warn(
                    "Nexcent site bootstrap is waiting for the company, site, " +
                        "client extensions, objects, or dispatch executor " +
                        "(attempt " + attempt + ")",
                    exception);
            }
        }
    }

    private static final String _COMPANY_WEB_ID = "nexcent.com";

    private static final String _GLOBAL_JS_TYPE_SETTINGS =
        "loadType=default\nscriptLocation=bottom\n";

    private static final String[] _METRIC_ENTRY_ERCS = {
        "NXC_METRIC_MEMBERS", "NXC_METRIC_CLUBS",
        "NXC_METRIC_EVENT_BOOKINGS", "NXC_METRIC_PAYMENTS"
    };

    private static final String _METRICS_CRON_EXPRESSION =
        "0 0/5 * * * ?";

    private static final String _METRICS_EXECUTOR_TYPE =
        "nexcent-metrics-updater";

    private static final String _METRICS_OBJECT_DEFINITION_ERC =
        "NXC_METRIC_SNAPSHOT";

    private static final String _METRICS_TRIGGER_ERC =
        "NXC_METRICS_UPDATER_TRIGGER";

    private static final String _METRICS_TRIGGER_NAME =
        "Nexcent Metrics Updater";

    private static final String _SITE_EXTERNAL_REFERENCE_CODE =
        "NXC_NEXT_GEN_SITE";

    private static final Log _log = LogFactoryUtil.getLog(
        NexcentSiteBootstrap.class);

    private int _attempt;

    @Reference
    private ClientExtensionEntryRelLocalService
        _clientExtensionEntryRelLocalService;

    @Reference
    private CompanyLocalService _companyLocalService;

    private final AtomicBoolean _configured = new AtomicBoolean();

    @Reference
    private DispatchTriggerLocalService _dispatchTriggerLocalService;

    @Reference
    private GroupLocalService _groupLocalService;

    @Reference
    private LayoutSetLocalService _layoutSetLocalService;

    @Reference
    private ObjectDefinitionLocalService _objectDefinitionLocalService;

    @Reference
    private ObjectEntryLocalService _objectEntryLocalService;

    @Reference
    private Portal _portal;

    private final ScheduledExecutorService _scheduledExecutorService =
        Executors.newSingleThreadScheduledExecutor(runnable -> {
            Thread thread = new Thread(
                runnable, "nexcent-site-bootstrap");

            thread.setDaemon(true);

            return thread;
        });

    private ScheduledFuture<?> _scheduledFuture;

    @Reference
    private UserLocalService _userLocalService;

}
