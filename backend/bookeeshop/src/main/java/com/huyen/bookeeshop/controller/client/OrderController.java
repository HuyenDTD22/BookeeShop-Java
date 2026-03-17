package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.OrderCreationRequest;
import com.huyen.bookeeshop.dto.request.VNPayReturnRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.OrderResponse;
import com.huyen.bookeeshop.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OrderController {

    OrderService orderService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    ApiResponse<List<OrderResponse>> getMyOrders() {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.getMyOrders())
                .build();
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    ApiResponse<OrderResponse> getMyOrderById(@PathVariable UUID orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getMyOrderById(orderId))
                .build();
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    ApiResponse<String> createOrder(
            @RequestBody @Valid OrderCreationRequest request,
            HttpServletRequest httpRequest) {
        return ApiResponse.<String>builder()
                .result(orderService.createOrder(request, httpRequest))
                .message("Order created successfully")
                .build();
    }

    @GetMapping("/vnpay-return")
    ApiResponse<OrderResponse> vnpayReturn(@ModelAttribute VNPayReturnRequest returnRequest) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.handleVNPayReturn(returnRequest))
                .message("Payment confirmed")
                .build();
    }

    @PatchMapping("/{orderId}/cancel")
    @PreAuthorize("isAuthenticated()")
    ApiResponse<OrderResponse> cancelOrder(@PathVariable UUID orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.cancelMyOrder(orderId))
                .message("Order cancelled successfully")
                .build();
    }

}
