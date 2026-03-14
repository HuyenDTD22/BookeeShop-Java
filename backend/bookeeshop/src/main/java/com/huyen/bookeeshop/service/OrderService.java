package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.request.BulkOrderStatusUpdateRequest;
import com.huyen.bookeeshop.dto.request.OrderFilterRequest;
import com.huyen.bookeeshop.dto.request.OrderStatusUpdateRequest;
import com.huyen.bookeeshop.dto.request.OrderUpdateRequest;
import com.huyen.bookeeshop.dto.response.OrderResponse;
import com.huyen.bookeeshop.entity.Order;
import com.huyen.bookeeshop.enums.OrderStatus;
import com.huyen.bookeeshop.enums.PaymentStatus;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.OrderMapper;
import com.huyen.bookeeshop.repository.OrderRepository;
import com.huyen.bookeeshop.specification.OrderSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
    OrderRepository orderRepository;
    OrderMapper orderMapper;

    //==========================================================================
    // ADMIN APIs
    //==========================================================================

    // 1. ADMIN - Lấy tất cả orders (lọc, sắp xếp, phân trang)
    @Transactional(readOnly = true)
    public Page<OrderResponse> getAll(OrderFilterRequest filter) {
        Sort sort = "oldest".equalsIgnoreCase(filter.getSortBy())
                ? Sort.by(Sort.Direction.ASC, "createdAt")
                : Sort.by(Sort.Direction.DESC, "createdAt");

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Specification<Order> specification = OrderSpecification.filter(filter);

        return orderRepository.findAll(specification, pageable)
                .map(orderMapper::toOrderResponse);
    }

    // 2. ADMIN - Lấy chi tiết order theo ID
    @Transactional(readOnly = true)
    public OrderResponse getById(UUID orderId) {
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        return orderMapper.toOrderResponse(order);
    }

    // 3. ADMIN - Cập nhật trạng thái đơn hàng
    @Transactional
    public OrderResponse updateOrderStatus(UUID orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if(currentStatus == newStatus) {
            return orderMapper.toOrderResponse(order);
        }

        // Kiểm tra đơn hàng chuyển đổi trạng thái hợp lệ không
        if(!isValidTransition(currentStatus, newStatus)) {
            throw new AppException(ErrorCode.INVALID_ORDER_STATUS_TRANSITION);
        }

        order.setStatus(newStatus);

        // Nếu đơn hàng chuyển sang COMPLETED và phương thức thanh toán là COD thì tự động cập nhật trạng thái thanh toán thành PAID
        if(newStatus == OrderStatus.COMPLETED && order.getPaymentMethod().name().equals("COD")) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        orderRepository.save(order);

        return orderMapper.toOrderResponse(order);
    }

    // 4. ADMIN - Cập nhật trạng thái của nhiều đơn hàng
    @Transactional
    public void bulkUpdateOrderStatus(BulkOrderStatusUpdateRequest request) {
        List<UUID> ids = request.getOrderIds();
        OrderStatus newStatus = request.getStatus();

        List<Order> orders = orderRepository.findByIdInAndDeletedFalse(ids);

        if(orders.size() != ids.size()) {
            throw new AppException(ErrorCode.ORDER_NOT_FOUND);
        }

        List<UUID> validIds = orders.stream()
                .filter(order -> isValidTransition(order.getStatus(), newStatus))
                .map(Order::getId)
                .toList();

        if(validIds.isEmpty()) {
            throw new AppException(ErrorCode.ORDER_BULK_UPDATE_FAILED);
        }

        orderRepository.bulkUpdateStatus(validIds, newStatus);

    }

    // 5. ADMIN - Chỉnh sửa thông tin 1 order
    @Transactional
    public OrderResponse update(UUID orderId, OrderUpdateRequest request) {
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if(IMMUTABLE_STATUSES.contains(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_MODIFIED);
        }

        orderMapper.updateOrder(order, request);

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = order.getStatus();

        if(currentStatus != null && currentStatus != newStatus && isValidTransition(currentStatus, newStatus)) {
            order.setStatus(newStatus);
        }

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    // 6. ADMIN - Xoá 1 order
    @Transactional
    public void delete(UUID orderId) {
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!IMMUTABLE_STATUSES.contains(order.getStatus())
                && order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_MODIFIED);
        }

        order.setDeleted(true);
        order.setDeletedAt(LocalDateTime.now());

        orderRepository.save(order);
    }

    // Các trạng thái đơn hàng không được phép chỉnh sửa thông tin đơn hàng nữa
    private static final Set<OrderStatus> IMMUTABLE_STATUSES = Set.of(
            OrderStatus.SHIPPING,
            OrderStatus.CANCELLED,
            OrderStatus.COMPLETED
    );

    // Quy tắc chuyển trạng thái đơn hàng hợp lệ: PENDING -> CONFIRMED -> DELIVERED -> COMPLETED
    // Bất kỳ trạng thái nào cũng có thể chuyển sang CANCELLED trừ COMPLETED
    private boolean isValidTransition(OrderStatus current, OrderStatus next) {
        return switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.SHIPPING || next == OrderStatus.CANCELLED;
            case SHIPPING -> next == OrderStatus.COMPLETED || next == OrderStatus.CANCELLED;
            case CANCELLED, COMPLETED -> false;
        };
    }

    //==========================================================================
    // CLIENT APIs
    //==========================================================================

}
