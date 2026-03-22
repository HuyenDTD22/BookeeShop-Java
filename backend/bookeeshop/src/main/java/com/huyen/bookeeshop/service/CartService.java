package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.request.AddToCartRequest;
import com.huyen.bookeeshop.dto.request.CartItemUpdateRequest;
import com.huyen.bookeeshop.dto.response.CartItemResponse;
import com.huyen.bookeeshop.dto.response.CartResponse;
import com.huyen.bookeeshop.entity.Book;
import com.huyen.bookeeshop.entity.Cart;
import com.huyen.bookeeshop.entity.CartItem;
import com.huyen.bookeeshop.entity.User;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.CartMapper;
import com.huyen.bookeeshop.repository.BookRepository;
import com.huyen.bookeeshop.repository.CartItemRepository;
import com.huyen.bookeeshop.repository.CartRepository;
import com.huyen.bookeeshop.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CartService {

    CartRepository cartRepository;
    CartItemRepository cartItemRepository;
    BookRepository bookRepository;
    UserRepository userRepository;
    CartMapper cartMapper;

    /**
     * 1. CLIENT - Add item to cart
     */
    @Transactional
    public CartItemResponse addToCart(AddToCartRequest request) {
        Cart cart = getOrCreateCart(getCurrentUser());

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // Check if book is deleted or out of stock
        if (book.getDeleted()) {
            throw new AppException(ErrorCode.BOOK_NOT_AVAILABLE);
        }
        if (book.getStock() <= 0) {
            throw new AppException(ErrorCode.BOOK_OUT_OF_STOCK);
        }

        // If book already in cart => update quantity
        CartItem cartItem = cart.getCartItems().stream()
                .filter(ci -> ci.getBook().getId().equals(book.getId()))
                .findFirst()
                .orElse(null);

        if (cartItem != null) {
            int newQuantity = cartItem.getQuantity() + request.getQuantity();

            // If new quantity exceeds stock
            if (newQuantity > book.getStock()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }

            cartItem.setQuantity(newQuantity);
        } else {
            // Check if requested quantity exceeds stock
            if (request.getQuantity() > book.getStock()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }

            cartItem = CartItem.builder()
                    .cart(cart)
                    .book(book)
                    .quantity(request.getQuantity())
                    .build();

            cart.getCartItems().add(cartItem);
        }

        CartItem savedCartItem = cartItemRepository.save(cartItem);

        return cartMapper.toCartItemResponse(savedCartItem);
    }

    /**
     * 2. CLIENT - Update quantity of item in cart
     */
    @Transactional
    public CartItemResponse updateCartItem(UUID cartItemId, CartItemUpdateRequest request) {
        // Check if cart item exists and belongs to current user
        CartItem cartItem = cartItemRepository.findByIdAndUserId(cartItemId, getCurrentUser().getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        Book book = cartItem.getBook();

        // Check stock
        if (request.getQuantity() > book.getStock()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }

        cartItem.setQuantity(request.getQuantity());
        CartItem savedCartItem = cartItemRepository.save(cartItem);

        return cartMapper.toCartItemResponse(savedCartItem);
    }

    /**
     * 3. CLIENT - Get current user's cart
     */
    @Transactional(readOnly = true)
    public CartResponse getMyCart() {
        Cart cart = getOrCreateCart(getCurrentUser());
        return cartMapper.toCartResponse(cart);
    }

    /**
     *  4. CLIENT - Delete item from cart
     */
    @Transactional
    public void removeCartItem(UUID cartItemId) {
        // Check if cart item exists and belongs to current user
        CartItem cartItem = cartItemRepository.findByIdAndUserId(cartItemId, getCurrentUser().getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        cartItemRepository.delete(cartItem);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameAndDeletedFalseAndLockedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    /**
     * Get current user's cart, if not exist => create new cart
     */
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUsernameAndDeletedFalseAndLockedFalse(user.getUsername())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .cartItems(new ArrayList<>())
                            .build();
                    return cartRepository.save(newCart);
                });
    }

}