package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    boolean existsByName(String name);
    Optional<Permission> findByName(String name);
}
