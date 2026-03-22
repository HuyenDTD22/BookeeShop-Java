package com.huyen.bookeeshop.repository.projection;

import java.util.UUID;

public interface TopCustomerProjection {
    UUID getUserId();
    String getFullName();
    String getUsername();
    String getAvatar();
    Long getTotalOrders();
    Double getTotalSpent();
}