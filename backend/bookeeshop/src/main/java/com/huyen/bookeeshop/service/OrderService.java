package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.internal.AutoNotificationData;
import com.huyen.bookeeshop.dto.internal.OrderItemData;
import com.huyen.bookeeshop.dto.request.*;
import com.huyen.bookeeshop.dto.response.OrderResponse;
import com.huyen.bookeeshop.entity.*;
import com.huyen.bookeeshop.enums.NotificationType;
import com.huyen.bookeeshop.enums.OrderStatus;
import com.huyen.bookeeshop.enums.PaymentMethod;
import com.huyen.bookeeshop.enums.PaymentStatus;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.OrderMapper;
import com.huyen.bookeeshop.repository.BookRepository;
import com.huyen.bookeeshop.repository.CartItemRepository;
import com.huyen.bookeeshop.repository.OrderRepository;
import com.huyen.bookeeshop.repository.UserRepository;
import com.huyen.bookeeshop.specification.OrderSpecification;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
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
    BookRepository bookRepository;
    CartItemRepository cartItemRepository;
    UserRepository userRepository;
    VNPayService vnPayService;
    NotificationService  notificationService;

    //==========================================================================
    // ADMIN APIs
    //==========================================================================

    // 1. ADMIN - Lấy tất cả orders (lọc, sắp xếp, phân trang, tìm kiếm)
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
        if (newStatus == OrderStatus.COMPLETED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setPaidAt(LocalDateTime.now());
        }

        orderRepository.save(order);

        // Thông báo tự động: trạng thái đơn hàng thay đổi
        notificationService.sendAutoNotification(
                AutoNotificationData.builder()
                        .recipientUserId(order.getUser().getId())
                        .title(buildOrderStatusTitle(newStatus))
                        .content(buildOrderStatusContent(orderId.toString(), newStatus))
                        .type(NotificationType.ORDER_STATUS_CHANGED)
                        .refId(orderId.toString())
                        .build()
        );

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

        // Gửi thông báo cho từng đơn hàng hợp lệ
        orders.stream()
                .filter(order -> validIds.contains(order.getId()))
                .forEach(order -> notificationService.sendAutoNotification(
                        AutoNotificationData.builder()
                                .recipientUserId(order.getUser().getId())
                                .title(buildOrderStatusTitle(newStatus))
                                .content(buildOrderStatusContent(order.getId().toString(), newStatus))
                                .type(NotificationType.ORDER_STATUS_CHANGED)
                                .refId(order.getId().toString())
                                .build()
                ));

    }

    // 5. ADMIN - Chỉnh sửa thông tin 1 order
    @Transactional
    public OrderResponse update(UUID orderId, OrderUpdateRequest request) {
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if(IMMUTABLE_STATUSES.contains(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_MODIFIED);
        }

        OrderStatus statusBefore = order.getStatus();

        orderMapper.updateOrder(order, request);

        if (request.getStatus() != null
                && request.getStatus() != statusBefore
                && isValidTransition(statusBefore, request.getStatus())) {
            order.setStatus(request.getStatus());
        } else {
            order.setStatus(statusBefore);
        }

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    // 6. ADMIN - Xoá 1 order
    @Transactional
    public void delete(UUID orderId) {
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        OrderStatus status = order.getStatus();

        if (status != OrderStatus.PENDING && status != OrderStatus.CANCELLED) {
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

    // 1. CLIENT - Lấy tất cả orders của chính mình
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        List<Order> orders = orderRepository
                .findByUserIdAndDeletedFalseOrderByCreatedAtDesc(getCurrentUserId());

        return orders.stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    // 2. CLIENT - Lấy chi tiết order của chính mình
    @Transactional(readOnly = true)
    public OrderResponse getMyOrderById(UUID orderId) {
        Order order = orderRepository.findByIdAndUserIdAndDeletedFalse(orderId, getCurrentUserId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        return orderMapper.toOrderResponse(order);
    }

    // 3. CLIENT - Tạo đơn hàng mới (từ Buy Now hoặc từ Cart)
    @Transactional
    public String createOrder(OrderCreationRequest request, HttpServletRequest httpRequest) {
        UUID userId = getCurrentUserId();

        boolean isBuyNow = request.getBookId() != null;
        boolean isBuyFromCart = request.getCartItemIds() != null
                && !request.getCartItemIds().isEmpty();

        // Phải có đúng 1 trong 2 luồng
        if (isBuyNow == isBuyFromCart) {
            throw new AppException(ErrorCode.INVALID_ORDER_SOURCE);
        }

        // Resolve danh sách item cần đặt tuỳ luồng
        List<OrderItemData> itemDataList = isBuyNow
                ? resolveBuyNow(request.getBookId(), request.getQuantity())
                : resolveBuyFromCart(request.getCartItemIds(), userId);

        double totalAmount = itemDataList.stream()
                .mapToDouble(OrderItemData::getSubtotal)
                .sum();

        if (request.getPaymentMethod() == PaymentMethod.COD) {
            Order order = buildOrder(request, itemDataList, userId, totalAmount, PaymentStatus.PENDING);
            Order saved = orderRepository.save(order);

            // Trừ kho ngay khi đặt hàng COD thành công
            decreaseStock(itemDataList);

            // Thông báo: đặt hàng thành công (COD)
            notificationService.sendAutoNotification(
                    AutoNotificationData.builder()
                            .recipientUserId(userId)
                            .title("Đặt hàng thành công")
                            .content(buildOrderPlacedContent(saved.getId().toString(), totalAmount))
                            .type(NotificationType.ORDER_PLACED)
                            .refId(saved.getId().toString())
                            .build()
            );

            return saved.getId().toString();

        } else if (request.getPaymentMethod() == PaymentMethod.VNPAY) {
            // Tạo order tạm — chưa trừ kho, chờ VNPay callback
            Order order = buildOrder(request, itemDataList, userId, totalAmount, PaymentStatus.PENDING);
            Order saved = orderRepository.save(order);

            return vnPayService.createPaymentUrl(
                    saved.getId().toString(),
                    (long) (totalAmount * 100),
                    httpRequest
            );
        }

        throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
    }

    // 4. CLIENT - Xử lý callback từ VNPay sau khi khách thanh toán
    @Transactional
    public OrderResponse handleVNPayReturn(VNPayReturnRequest returnRequest) {
        if (!vnPayService.verifySignature(returnRequest)) {
            throw new AppException(ErrorCode.VNPAY_INVALID_SIGNATURE);
        }

        UUID orderId = UUID.fromString(returnRequest.getVnpTxnRef());
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Tránh xử lý lại nếu callback được gọi nhiều lần
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return orderMapper.toOrderResponse(order);
        }

        if ("00".equals(returnRequest.getVnpResponseCode())) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setVnpayTransactionId(returnRequest.getVnpTransactionNo());
            order.setPaidAt(LocalDateTime.now());

            // Trừ kho sau khi VNPay xác nhận thành công
            List<OrderItemData> itemDataList = order.getOrderItems().stream()
                    .map(item -> OrderItemData.builder()
                            .book(item.getBook())
                            .quantity(item.getQuantity())
                            .subtotal(0.0) // subtotal không cần dùng lại ở đây
                            .build())
                    .toList();

            decreaseStock(itemDataList);

            // Thông báo: đặt hàng + thanh toán VNPay thành công
            notificationService.sendAutoNotification(
                    AutoNotificationData.builder()
                            .recipientUserId(order.getUser().getId())
                            .title("Thanh toán thành công")
                            .content(buildOrderPlacedContent(orderId.toString(), order.getTotalAmount()))
                            .type(NotificationType.ORDER_PLACED)
                            .refId(orderId.toString())
                            .build()
            );

        } else {
            // Thanh toán thất bại: xóa order tạm, không trừ kho
            order.setDeleted(true);
            order.setDeletedAt(LocalDateTime.now());
            orderRepository.save(order);
            throw new AppException(ErrorCode.VNPAY_PAYMENT_FAILED);
        }

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    // 5. CLIENT - Huỷ đơn hàng của chính mình
    @Transactional
    public OrderResponse cancelMyOrder(UUID orderId) {
        UUID userId = getCurrentUserId();

        Order order = orderRepository
                .findByIdAndUserIdAndDeletedFalse(orderId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_CANCELLED);
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Hoàn kho
        order.getOrderItems().forEach(item -> {
            Book book = item.getBook();
            book.setStock(book.getStock() + item.getQuantity());
            bookRepository.save(book);
        });

        // Nếu đã thanh toán VNPay thì đánh dấu cần hoàn tiền
        if (order.getPaymentStatus() == PaymentStatus.PAID
                && order.getPaymentMethod() == PaymentMethod.VNPAY) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        // Thông báo: khách tự huỷ đơn
        notificationService.sendAutoNotification(
                AutoNotificationData.builder()
                        .recipientUserId(userId)
                        .title("Đơn hàng đã huỷ")
                        .content(buildOrderStatusContent(orderId.toString(), OrderStatus.CANCELLED))
                        .type(NotificationType.ORDER_STATUS_CHANGED)
                        .refId(orderId.toString())
                        .build()
        );

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private UUID getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameAndDeletedFalseAndLockedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED))
                .getId();
    }

    private List<OrderItemData> resolveBuyNow(UUID bookId, Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new AppException(ErrorCode.QUANTITY_MUST_BE_POSITIVE);
        }

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        if (book.getDeleted()) {
            throw new AppException(ErrorCode.BOOK_NOT_AVAILABLE);
        }

        if (book.getStock() < quantity) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }

        double unitPrice = calculateFinalPrice(book);
        double subtotal = unitPrice * quantity;

        return List.of(OrderItemData.builder()
                .book(book)
                .quantity(quantity)
                .unitPrice(unitPrice)
                .subtotal(subtotal)
                .build());
    }

    private List<OrderItemData> resolveBuyFromCart(List<UUID> cartItemIds, UUID userId) {
        List<CartItem> cartItems = cartItemRepository.findByIdsAndUserId(cartItemIds, userId);

        // Kiểm tra tất cả cartItemIds có hợp lệ và thuộc user không
        if (cartItems.size() != cartItemIds.size()) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        return cartItems.stream().map(cartItem -> {
            Book book = cartItem.getBook();

            if (book.getDeleted()) {
                throw new AppException(ErrorCode.BOOK_NOT_AVAILABLE);
            }

            if (book.getStock() < cartItem.getQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }

            double unitPrice = calculateFinalPrice(book);
            double subtotal = unitPrice * cartItem.getQuantity();

            return OrderItemData.builder()
                    .book(book)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(subtotal)
                    .build();
        }).toList();
    }

    private Order buildOrder(OrderCreationRequest request,
                             List<OrderItemData> itemDataList,
                             UUID userId,
                             double totalAmount,
                             PaymentStatus paymentStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Order order = Order.builder()
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(paymentStatus)
                .totalAmount(totalAmount)
                .status(OrderStatus.PENDING)
                .user(user)
                .build();

        List<OrderItem> orderItems = itemDataList.stream()
                .map(data -> OrderItem.builder()
                        .order(order)
                        .book(data.getBook())
                        .title(data.getBook().getTitle())
                        .thumbnail(data.getBook().getThumbnail())
                        .price(data.getBook().getPrice())
                        .discountPercentage(data.getBook().getDiscountPercentage())
                        .quantity(data.getQuantity())
                        .build())
                .toList();

        order.setOrderItems(orderItems);
        return order;
    }

    private void decreaseStock(List<OrderItemData> itemDataList) {
        itemDataList.forEach(data -> {
            Book book = data.getBook();
            book.setStock(book.getStock() - data.getQuantity());
            bookRepository.save(book);
        });
    }

    private double calculateFinalPrice(Book book) {
        Double discount = book.getDiscountPercentage();
        if (discount != null && discount > 0) {
            return book.getPrice() * (1 - discount / 100);
        }
        return book.getPrice();
    }

    // ===========================================================================
    // Notification content builders
    // ============================================================================

    private String buildOrderPlacedContent(String orderId, Double totalAmount) {
        return String.format(
                "Đơn hàng #%s của bạn đã được đặt thành công. " +
                        "Tổng thanh toán: %,.0f₫. Chúng tôi sẽ xử lý đơn hàng sớm nhất có thể.",
                orderId, totalAmount);
    }

    private String buildOrderStatusTitle(OrderStatus status) {
        return switch (status) {
            case CONFIRMED -> "Đơn hàng đã được xác nhận";
            case SHIPPING  -> "Đơn hàng đang được giao";
            case COMPLETED -> "Đơn hàng đã hoàn thành";
            case CANCELLED -> "Đơn hàng đã bị huỷ";
            default        -> "Cập nhật trạng thái đơn hàng";
        };
    }

    private String buildOrderStatusContent(String orderId, OrderStatus status) {
        return switch (status) {
            case CONFIRMED -> String.format(
                    "Đơn hàng #%s của bạn đã được xác nhận và đang được chuẩn bị.", orderId);
            case SHIPPING  -> String.format(
                    "Đơn hàng #%s đang trên đường giao đến bạn. Vui lòng chú ý điện thoại.", orderId);
            case COMPLETED -> String.format(
                    "Đơn hàng #%s đã được giao thành công. Cảm ơn bạn đã mua hàng!", orderId);
            case CANCELLED -> String.format(
                    "Đơn hàng #%s đã bị huỷ. Nếu có thắc mắc vui lòng liên hệ hỗ trợ.", orderId);
            default        -> String.format("Trạng thái đơn hàng #%s đã được cập nhật.", orderId);
        };
    }


}
