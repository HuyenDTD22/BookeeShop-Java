package com.huyen.bookeeshop.repository;

import com.huyen.bookeeshop.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {

    Optional<Book> findByIdAndDeletedFalse(UUID id);

    List<Book> findAllByDeletedFalse();
}
