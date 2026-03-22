package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.request.OrderUpdateRequest;
import com.huyen.bookeeshop.dto.response.OrderItemResponse;
import com.huyen.bookeeshop.dto.response.OrderResponse;
import com.huyen.bookeeshop.entity.Order;
import com.huyen.bookeeshop.entity.OrderItem;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "userEmail")
    @Mapping(source = "orderItems", target = "orderItems")
    OrderResponse toOrderResponse(Order order);

    @Mapping(source = "book.id", target = "bookId")
    @Mapping(source = "book.thumbnail", target = "thumbnail")
    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(orderItem))")
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    @Mapping(target = "status", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateOrder(@MappingTarget Order order, OrderUpdateRequest request);

    @Named("calculateSubtotal")
    default Double calculateSubtotal(OrderItem item) {
        if (item.getDiscountPercentage() != null && item.getDiscountPercentage() > 0) {
            double discounted = item.getPrice() * (1 - item.getDiscountPercentage() / 100);
            return discounted * item.getQuantity();
        }
        return item.getPrice() * item.getQuantity();
    }
}