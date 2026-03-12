package com.huyen.bookeeshop.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.huyen.bookeeshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByUsername(String username);

    Optional<User> findByUsernameAndDeletedFalse(String username);

    Optional<User> findByIdAndDeletedFalse(UUID id);

    List<User> findAllByDeletedFalse();
}
