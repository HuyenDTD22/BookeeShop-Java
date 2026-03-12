package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;


@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByNameAndDeletedFalse(String name);

    boolean existsByName(String name);

    Set<Role> findAllByIdInAndDeletedFalse(Set<UUID> ids);

    Optional<Role> findByIdAndDeletedFalse(UUID id);

    List<Role> findAllByDeletedFalse();
}
