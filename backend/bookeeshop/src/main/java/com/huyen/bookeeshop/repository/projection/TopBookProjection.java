package com.huyen.bookeeshop.repository.projection;

import java.util.UUID;

public interface TopBookProjection {
    UUID getBookId();
    String getTitle();
    String getThumbnail();
    String getAuthor();
    Double getPrice();
    Long getTotalSold();
    Double getTotalRevenue();
}