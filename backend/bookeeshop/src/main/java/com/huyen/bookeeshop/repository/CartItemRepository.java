package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.CartItem;
import com.huyen.bookeeshop.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID>, JpaSpecificationExecutor<Order> {

    @Query("SELECT ci FROM CartItem ci JOIN ci.cart c WHERE ci.id = :cartItemId AND c.user.id = :userId AND c.user.deleted = false And c.user.locked = false")
    Optional<CartItem> findByIdAndUserId(@Param("cartItemId") UUID cartItemId, @Param("userId") UUID userId);

    @Query("SELECT ci FROM CartItem ci JOIN ci.cart c WHERE ci.id IN :cartItemIds AND c.user.id = :userId AND c.user.deleted = false And c.user.locked = false")
    List<CartItem> findByIdsAndUserId(@Param("cartItemIds") List<UUID> cartItemIds, @Param("userId") UUID userId);

}
