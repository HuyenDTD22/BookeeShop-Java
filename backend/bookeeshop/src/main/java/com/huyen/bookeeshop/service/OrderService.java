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
import com.huyen.bookeeshop.util.OrderCodeGenerator;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
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

    /**
     * 1. ADMIN - Get all orders with filter, pagination, sorting
     */
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

    /**
     * 2. ADMIN - Get order details by ID
     */
    @Transactional(readOnly = true)
    public OrderResponse getById(UUID orderId) {
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        return orderMapper.toOrderResponse(order);
    }

    /**
     * 3. ADMIN - Updates order status:
     * - Valid flow: PENDING → CONFIRMED → SHIPPING → COMPLETED
     * - Can CANCEL from any state except COMPLETED
     * - If COMPLETED with COD → set payment status to PAID
     * - Send notification on status change
     */
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

        // Nếu đơn hàng chuyển sang COMPLETED và payment_method là COD thì cập nhật payment_status thành PAID
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

    /**
     * 4. ADMIN - Bulk update order status
     */
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

    /**
     * 5. ADMIN - Update order's information
     * - Allowed only in PENDING or CONFIRMED
     * - Validate stock and recalculate total if quantity changes
     * - Not allowed in SHIPPING, CANCELLED, or COMPLETED
     */
    @Transactional
    public OrderResponse update(UUID orderId, OrderUpdateRequest request) {
        Order order = orderRepository.findByIdAndDeletedFalse(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if(IMMUTABLE_STATUSES.contains(order.getStatus())) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_MODIFIED);
        }

        orderMapper.updateOrder(order, request);

        // Cập nhật số lượng từng item nếu có
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (OrderItemUpdateRequest itemReq : request.getItems()) {
                OrderItem item = order.getOrderItems().stream()
                        .filter(i -> i.getId().equals(itemReq.getOrderItemId()))
                        .findFirst()
                        .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

                int oldQty = item.getQuantity();
                int newQty = itemReq.getQuantity();
                int diff   = newQty - oldQty;

                // Kiểm tra tồn kho nếu tăng số lượng
                if (diff > 0) {
                    Book book = item.getBook();
                    if (book.getStock() < diff) {
                        throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
                    }
                    book.setStock(book.getStock() - diff);
                    bookRepository.save(book);
                } else if (diff < 0) {
                    // Hoàn kho nếu giảm số lượng
                    Book book = item.getBook();
                    book.setStock(book.getStock() + Math.abs(diff));
                    bookRepository.save(book);
                }

                item.setQuantity(newQty);
            }

            // Tính lại totalAmount sau khi đổi quantity
            double newTotal = order.getOrderItems().stream()
                    .mapToDouble(item -> {
                        double price = item.getDiscountPercentage() != null && item.getDiscountPercentage() > 0
                                ? item.getPrice() * (1 - item.getDiscountPercentage() / 100)
                                : item.getPrice();
                        return price * item.getQuantity();
                    })
                    .sum();
            order.setTotalAmount(newTotal);
        }

        return orderMapper.toOrderResponse(orderRepository.save(order));
    }

    /**
     * 6. ADMIN - Delete an order (soft delete)
     * - Allowed only in PENDING or CANCELLED
     */
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

    //==========================================================================
    // CLIENT APIs
    //==========================================================================

    /**
     * 1. CLIENT - Get all orders of user
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        List<Order> orders = orderRepository
                .findByUserIdAndDeletedFalseOrderByCreatedAtDesc(getCurrentUserId());

        return orders.stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    /**
     * 2. CLIENT - Get details of a specific order by ID for user
     */
    @Transactional(readOnly = true)
    public OrderResponse getMyOrderById(UUID orderId) {
        Order order = orderRepository.findByIdAndUserIdAndDeletedFalse(orderId, getCurrentUserId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        return orderMapper.toOrderResponse(order);
    }

    /**
     * 3. CLIENT - Create a new order:
     * - Two flows: Buy Now (from book detail) or Buy from Cart
     * - Validate stock for all items before creating order
     * - For COD: create order, decrease stock immediately, send notification
     * - For VNPay: create order, generate payment URL, wait for callback to confirm and decrease stock
     */
    @Transactional
    public String createOrder(OrderCreationRequest request, HttpServletRequest httpRequest) {
        UUID userId = getCurrentUserId();

        boolean isBuyNow = request.getBookId() != null;
        boolean isBuyFromCart = request.getCartItemIds() != null
                && !request.getCartItemIds().isEmpty();

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

    /**
     * 4. CLIENT - Handle VNPay return after payment
     */
    @Transactional
    public boolean handleVNPayReturn(VNPayReturnRequest returnRequest) {

        // 1. Xác thực chữ ký
        if (!vnPayService.verifySignature(returnRequest)) {
            return false;
        }

        // 2. Parse orderId
        UUID orderId;
        try {
            orderId = UUID.fromString(returnRequest.getVnpTxnRef());
        } catch (Exception e) {
            return false;
        }

        // 3. Tìm order
        Order order = orderRepository.findByIdAndDeletedFalse(orderId).orElse(null);
        if (order == null) {
            return false;
        }

        // 4. Idempotent: đã PAID rồi → bỏ qua
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            return true;
        }

        if ("00".equals(returnRequest.getVnpResponseCode())) {
            // Thanh toán THÀNH CÔNG
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setVnpayTransactionId(returnRequest.getVnpTransactionNo());
            order.setPaidAt(LocalDateTime.now());
            orderRepository.save(order);

            // Trừ kho
            order.getOrderItems().forEach(item -> {
                Book book = item.getBook();
                book.setStock(book.getStock() - item.getQuantity());
                bookRepository.save(book);
            });

            // Thông báo
            notificationService.sendAutoNotification(
                    AutoNotificationData.builder()
                            .recipientUserId(order.getUser().getId())
                            .title("Thanh toán thành công")
                            .content(buildOrderPlacedContent(orderId.toString(), order.getTotalAmount()))
                            .type(NotificationType.ORDER_PLACED)
                            .refId(orderId.toString())
                            .build());
            return true;

        } else {
            // Thanh toán THẤT BẠI → xóa order khỏi DB
            orderRepository.delete(order);
            return false;
        }
    }

    /**
     * 5. CLIENT - Cancel owner's own order:
     * - Allowed only in PENDING status
     */
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
    // HELPERS
    // =========================================================================

    /**
     * Status not allowed to modify order info
     */
    private static final Set<OrderStatus> IMMUTABLE_STATUSES = Set.of(
            OrderStatus.SHIPPING,
            OrderStatus.CANCELLED,
            OrderStatus.COMPLETED
    );

    /**
     * Validate order status transition:
     * - Flow: PENDING → CONFIRMED → SHIPPING → COMPLETED
     * - Can CANCEL from any state except COMPLETED
     */
    private boolean isValidTransition(OrderStatus current, OrderStatus next) {
        return switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.SHIPPING || next == OrderStatus.CANCELLED;
            case SHIPPING -> next == OrderStatus.COMPLETED || next == OrderStatus.CANCELLED;
            case CANCELLED, COMPLETED -> false;
        };
    }

    private UUID getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameAndDeletedFalseAndLockedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED))
                .getId();
    }

    /**
     * Resolve order items for "Buy Now"
     */
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

    /**
     * Resolve order items for "Buy from Cart"
     */
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

    /**
     * Generate a unique order code
     */
    private String generateUniqueOrderCode() {
        String code;
        int maxRetries = 10;

        do {
            code = OrderCodeGenerator.generate();
            maxRetries--;
        } while (orderRepository.existsByOrderCode(code) && maxRetries > 0);

        return code;
    }

    /**
     * Build Order entity from request and resolved item data
     */
    private Order buildOrder(OrderCreationRequest request,
                             List<OrderItemData> itemDataList,
                             UUID userId,
                             double totalAmount,
                             PaymentStatus paymentStatus) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Order order = Order.builder()
                .orderCode(generateUniqueOrderCode())
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

    /**
     * Decrease stock for all books in the order items
     */
    private void decreaseStock(List<OrderItemData> itemDataList) {
        itemDataList.forEach(data -> {
            Book book = data.getBook();
            book.setStock(book.getStock() - data.getQuantity());
            bookRepository.save(book);
        });
    }

    /**
     * Calculate final price after discount for a book
     */
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

    /**
     * Build notification content for order placed
     */
    private String buildOrderPlacedContent(String orderId, Double totalAmount) {
        return String.format(
                "Đơn hàng #%s của bạn đã được đặt thành công. " +
                        "Tổng thanh toán: %,.0f₫. Chúng tôi sẽ xử lý đơn hàng sớm nhất có thể.",
                orderId, totalAmount);
    }

    /**
     * Build notification title based on order status
     */
    private String buildOrderStatusTitle(OrderStatus status) {
        return switch (status) {
            case CONFIRMED -> "Đơn hàng đã được xác nhận";
            case SHIPPING  -> "Đơn hàng đang được giao";
            case COMPLETED -> "Đơn hàng đã hoàn thành";
            case CANCELLED -> "Đơn hàng đã bị huỷ";
            default        -> "Cập nhật trạng thái đơn hàng";
        };
    }

    /**
     * Build notification content based on order status
     */
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
