package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.response.BookInCartResponse;
import com.huyen.bookeeshop.dto.response.CartItemResponse;
import com.huyen.bookeeshop.dto.response.CartResponse;
import com.huyen.bookeeshop.entity.Cart;
import com.huyen.bookeeshop.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "cartId", source = "id")
    @Mapping(target = "items", source = "cartItems")
    @Mapping(target = "totalItems", expression = "java(cart.getCartItems() != null ? cart.getCartItems().size() : 0)")
    CartResponse toCartResponse(Cart cart);

    @Mapping(target = "cartItemId", source = "id")
    @Mapping(target = "book", source = "book")
    CartItemResponse toCartItemResponse(CartItem cartItem);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "thumbnail", source = "thumbnail")
    @Mapping(target = "price", source = "price")
    @Mapping(target = "discountPercentage", source = "discountPercentage")
    BookInCartResponse toBookInCartResponse(com.huyen.bookeeshop.entity.Book book);

}