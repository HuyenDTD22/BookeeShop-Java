package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {

    @Query("SELECT c FROM Cart c WHERE c.user.username = :username AND c.user.deleted = false AND c.user.locked = false")
    Optional<Cart> findByUsernameAndDeletedFalseAndLockedFalse(@Param("username") String username);

}