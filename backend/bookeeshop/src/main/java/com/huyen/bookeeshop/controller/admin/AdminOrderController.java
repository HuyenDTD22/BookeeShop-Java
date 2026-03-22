package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.BulkOrderStatusUpdateRequest;
import com.huyen.bookeeshop.dto.request.OrderFilterRequest;
import com.huyen.bookeeshop.dto.request.OrderStatusUpdateRequest;
import com.huyen.bookeeshop.dto.request.OrderUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.OrderResponse;
import com.huyen.bookeeshop.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Order", description = "Order APIs for admin")
@RestController
@RequestMapping("${app.admin-prefix}/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminOrderController {

    OrderService orderService;

    @Operation(summary = "Get all orders")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("hasAuthority('ORDER_LIST_VIEW')")
    ApiResponse<Page<OrderResponse>> getAll(@ModelAttribute OrderFilterRequest filter) {
        return ApiResponse.<Page<OrderResponse>>builder()
                .result(orderService.getAll(filter))
                .build();
    }

    @Operation(summary = "Get order details by ID")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{orderId}")
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    ApiResponse<OrderResponse> getById(@PathVariable UUID orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getById(orderId))
                .build();
    }

    @Operation(summary = "Update order status")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAuthority('ORDER_APPROVE')")
    ApiResponse<OrderResponse> updateOrderStatus(@PathVariable UUID orderId, @RequestBody @Valid OrderStatusUpdateRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateOrderStatus(orderId, request))
                .message("Order status updated successfully")
                .build();
    }

    @Operation(summary = "Bulk update order status")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/bulk-status")
    @PreAuthorize("hasAuthority('ORDER_APPROVE')")
    ApiResponse<String> bulkUpdateOrderStatus(@RequestBody @Valid BulkOrderStatusUpdateRequest request) {
        orderService.bulkUpdateOrderStatus(request);

        return ApiResponse.<String>builder()
                .message("Bulk order status update successful")
                .build();
    }

    @Operation(summary = "Update order's information")
    @SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{orderId}")
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    ApiResponse<OrderResponse> update(@PathVariable UUID orderId, @RequestBody @Valid OrderUpdateRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.update(orderId, request))
                .message("Order updated successfully")
                .build();
    }

    @Operation(summary = "Delete an order")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasAuthority('ORDER_DELETE')")
    ApiResponse<String> delete(@PathVariable UUID orderId) {
        orderService.delete(orderId);

        return ApiResponse.<String>builder()
                .result("Order has been deleted")
                .build();
    }
}
