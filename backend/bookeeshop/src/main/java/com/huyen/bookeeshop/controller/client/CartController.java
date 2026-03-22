package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.AddToCartRequest;
import com.huyen.bookeeshop.dto.request.CartItemUpdateRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.CartItemResponse;
import com.huyen.bookeeshop.dto.response.CartResponse;
import com.huyen.bookeeshop.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Cart", description = "Cart APIs for client")
@RestController
@RequestMapping("/carts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CartController {

    CartService cartService;

    @Operation(summary = "Get current user's cart")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    ApiResponse<CartResponse> getMyCart() {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.getMyCart())
                .build();
    }

    @Operation(summary = "Add item to cart")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    ApiResponse<CartItemResponse> addToCart(@RequestBody @Valid AddToCartRequest request) {
        return ApiResponse.<CartItemResponse>builder()
                .result(cartService.addToCart(request))
                .build();
    }

    @Operation(summary = "Update cart item quantity")
    @SecurityRequirement(name = "bearerAuth")
    @PatchMapping("/items/{cartItemId}")
    ApiResponse<CartItemResponse> updateCartItem(@PathVariable UUID cartItemId, @RequestBody @Valid CartItemUpdateRequest request) {
        return ApiResponse.<CartItemResponse>builder()
                .result(cartService.updateCartItem(cartItemId, request))
                .build();
    }

    @Operation(summary = "Remove item from cart")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/items/{cartItemId}")
    ApiResponse<Void> removeCartItem(@PathVariable UUID cartItemId) {
        cartService.removeCartItem(cartItemId);
        return ApiResponse.<Void>builder()
                .message("Cart item removed successfully")
                .build();
    }

}
