package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Order;
import com.huyen.bookeeshop.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByIdAndDeletedFalse(UUID id);

    List<Order> findByIdInAndDeletedFalse(List<UUID> ids);

    @Modifying
    @Query("UPDATE Order o SET o.status = :status WHERE o.id IN :ids AND o.deleted = false")
    int bulkUpdateStatus(@Param("ids") List<UUID> ids, @Param("status") OrderStatus status);

    List<Order> findAllByDeletedFalse();
}
