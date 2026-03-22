package com.huyen.bookeeshop.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.huyen.bookeeshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    Optional<User> findByUsernameAndDeletedFalse(String username);

    Optional<User> findByUsernameAndDeletedFalseAndLockedFalse(String username);

    Optional<User> findByIdAndDeletedFalse(UUID id);

    List<User> findAllByDeletedFalse();

    Boolean existsByUsernameAndDeletedFalse(String username);

    @Query(value = """
        SELECT COUNT(DISTINCT u.id)
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles     r  ON r.id = ur.role_id
        WHERE u.deleted  = false
          AND r.deleted  = false
          AND r.name     = 'USER'
    """, nativeQuery = true)
    Long countTotalCustomers();

    @Query(value = """
        SELECT COUNT(DISTINCT u.id)
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles     r  ON r.id = ur.role_id
        WHERE u.deleted    = false
          AND r.deleted    = false
          AND r.name       = 'USER'
          AND u.created_at BETWEEN :from AND :to
    """, nativeQuery = true)
    Long countNewCustomersBetween(@Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to);

    @Query(value = """
        SELECT COUNT(DISTINCT u.id)
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles     r  ON r.id = ur.role_id
        WHERE u.deleted = false
          AND r.deleted = false
          AND r.name LIKE 'STAFF_%'
    """, nativeQuery = true)
    Long countTotalStaff();
}
