package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.BulkOrderStatusUpdateRequest;
import com.huyen.bookeeshop.dto.request.OrderFilterRequest;
import com.huyen.bookeeshop.dto.request.OrderStatusUpdateRequest;
import com.huyen.bookeeshop.dto.request.OrderUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.OrderResponse;
import com.huyen.bookeeshop.service.OrderService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("${app.admin-prefix}/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminOrderController {

    OrderService orderService;

    @GetMapping
    @PreAuthorize("hasAuthority('ORDER_LIST_VIEW')")
    ApiResponse<Page<OrderResponse>> getAll(@ModelAttribute OrderFilterRequest filter) {
        return ApiResponse.<Page<OrderResponse>>builder()
                .result(orderService.getAll(filter))
                .build();
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAuthority('ORDER_VIEW')")
    ApiResponse<OrderResponse> getById(@PathVariable UUID orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getById(orderId))
                .build();
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAuthority('ORDER_APPROVE')")
    ApiResponse<OrderResponse> updateOrderStatus(@PathVariable UUID orderId, @RequestBody @Valid OrderStatusUpdateRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateOrderStatus(orderId, request))
                .message("Order status updated successfully")
                .build();
    }

    @PatchMapping("/bulk-status")
    @PreAuthorize("hasAuthority('ORDER_APPROVE')")
    ApiResponse<List<OrderResponse>> bulkUpdateOrderStatus(@RequestBody @Valid BulkOrderStatusUpdateRequest request) {
        orderService.bulkUpdateOrderStatus(request);

        return ApiResponse.<List<OrderResponse>>builder()
                .message("Bulk order status update successful")
                .build();
    }

    @PutMapping("/{orderId}")
    @PreAuthorize("hasAuthority('ORDER_UPDATE')")
    ApiResponse<OrderResponse> update(@PathVariable UUID orderId, @RequestBody @Valid OrderUpdateRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.update(orderId, request))
                .message("Order updated successfully")
                .build();
    }

    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasAuthority('ORDER_DELETE')")
    ApiResponse<String> delete(@PathVariable UUID orderId) {
        orderService.delete(orderId);

        return ApiResponse.<String>builder()
                .result("Order has been deleted")
                .build();
    }
}
