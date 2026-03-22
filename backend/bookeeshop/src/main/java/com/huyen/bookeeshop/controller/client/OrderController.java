package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.OrderCreationRequest;
import com.huyen.bookeeshop.dto.request.VNPayReturnRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.OrderResponse;
import com.huyen.bookeeshop.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Tag(name = "Order", description = "Order APIs for client")
@RestController
@RequestMapping("/orders")
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final String frontendReturnUrl;

    public OrderController(
            OrderService orderService,
            @Value("${vnpay.frontend-return-url}") String frontendReturnUrl) {
        this.orderService      = orderService;
        this.frontendReturnUrl = frontendReturnUrl;
    }

    @Operation(summary = "Get all orders of user")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    ApiResponse<List<OrderResponse>> getMyOrders() {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.getMyOrders())
                .build();
    }

    @Operation(summary = "Get details of a specific order by ID for user")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    ApiResponse<OrderResponse> getMyOrderById(@PathVariable UUID orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getMyOrderById(orderId))
                .build();
    }

    @Operation(summary = "Create a new order")
    @SecurityRequirement(name = "bearerAuth")
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


    @Operation(summary = "Handle VNPay return after payment")
    @GetMapping("/vnpay-return")
    void vnpayReturn(
            @ModelAttribute VNPayReturnRequest returnRequest,
            HttpServletResponse response) throws IOException {

        String redirectUrl;

        try {
            orderService.handleVNPayReturn(returnRequest);

            redirectUrl = String.format(
                    "%s?vnp_ResponseCode=%s&vnp_TxnRef=%s",
                    frontendReturnUrl,
                    returnRequest.getVnpResponseCode(),
                    returnRequest.getVnpTxnRef()
            );
        } catch (Exception e) {

            String code = returnRequest.getVnpResponseCode() != null
                    ? returnRequest.getVnpResponseCode() : "99";

            redirectUrl = String.format(
                    "%s?vnp_ResponseCode=%s&vnp_TxnRef=%s",
                    frontendReturnUrl,
                    code,
                    returnRequest.getVnpTxnRef() != null ? returnRequest.getVnpTxnRef() : ""
            );
        }
        response.sendRedirect(redirectUrl);
    }

    @Operation(summary = "Cancel an order by ID")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/{orderId}/cancel")
    @PreAuthorize("isAuthenticated()")
    ApiResponse<OrderResponse> cancelOrder(@PathVariable UUID orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.cancelMyOrder(orderId))
                .message("Order cancelled successfully")
                .build();
    }

}
