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

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameAndDeletedFalseAndLockedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

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

    // 1. CLIENT - Thêm sản phẩm vào giỏ hàng
    @Transactional
    public CartItemResponse addToCart(AddToCartRequest request) {
        Cart cart = getOrCreateCart(getCurrentUser());

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // Kiểm tra sách có bị xóa hoặc hết hàng không
        if (book.getDeleted()) {
            throw new AppException(ErrorCode.BOOK_NOT_AVAILABLE);
        }
        if (book.getStock() <= 0) {
            throw new AppException(ErrorCode.BOOK_OUT_OF_STOCK);
        }

        // Nếu sách đã có trong giỏ hàng => cộng dồn số lượng
        CartItem cartItem = cart.getCartItems().stream()
                .filter(ci -> ci.getBook().getId().equals(book.getId()))
                .findFirst()
                .orElse(null);

        if (cartItem != null) {
            int newQuantity = cartItem.getQuantity() + request.getQuantity();

            // Kiểm tra số lượng mới không vượt quá tồn kho
            if (newQuantity > book.getStock()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }

            cartItem.setQuantity(newQuantity);
        } else {
            // Kiểm tra số lượng yêu cầu không vượt quá tồn kho
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

    // 2. CLIENT - Cập nhật số lượng sản phẩm trong giỏ hàng
    @Transactional
    public CartItemResponse updateCartItem(UUID cartItemId, CartItemUpdateRequest request) {
        // Kiểm tra cart item tồn tại và thuộc về user hiện tại
        CartItem cartItem = cartItemRepository.findByIdAndUserId(cartItemId, getCurrentUser().getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        Book book = cartItem.getBook();

        // Kiểm tra tồn kho
        if (request.getQuantity() > book.getStock()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }

        cartItem.setQuantity(request.getQuantity());
        CartItem savedCartItem = cartItemRepository.save(cartItem);

        return cartMapper.toCartItemResponse(savedCartItem);
    }

    // 3. CLIENT - Xem giỏ hàng của mình
    @Transactional(readOnly = true)
    public CartResponse getMyCart() {
        Cart cart = getOrCreateCart(getCurrentUser());
        return cartMapper.toCartResponse(cart);
    }

    // 4. CLIENT - Xóa sản phẩm khỏi giỏ hàng
    @Transactional
    public void removeCartItem(UUID cartItemId) {
        // Kiểm tra cart item tồn tại và thuộc về user hiện tại
        CartItem cartItem = cartItemRepository.findByIdAndUserId(cartItemId, getCurrentUser().getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        cartItemRepository.delete(cartItem);
    }

}