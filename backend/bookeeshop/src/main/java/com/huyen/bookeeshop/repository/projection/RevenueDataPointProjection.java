package com.huyen.bookeeshop.repository.projection;

public interface RevenueDataPointProjection {
    String getLabel();
    Double getRevenue();
    Long getOrderCount();
}