package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.DashboardAnalyticsResponse;
import com.huyen.bookeeshop.dto.response.DashboardSummaryResponse;
import com.huyen.bookeeshop.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Stat", description = "Stat APIs for admin")
@RestController
@RequestMapping("${app.admin-prefix}/dashboards")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminDashboardController {

    DashboardService dashboardService;

    @Operation(summary = "Get dashboard summary with key metrics")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<DashboardSummaryResponse> getSummary() {
        return ApiResponse.<DashboardSummaryResponse>builder()
                .result(dashboardService.getSummary())
                .build();
    }

    @Operation(summary = "Get dashboard analytics with charts and trends")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<DashboardAnalyticsResponse> getAnalytics() {
        return ApiResponse.<DashboardAnalyticsResponse>builder()
                .result(dashboardService.getAnalytics())
                .build();
    }
}