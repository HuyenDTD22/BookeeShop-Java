package com.huyen.bookeeshop.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "books")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(updatable = false, nullable = false)
    UUID id;

    @Column(nullable = false)
    String title;

    @Column(nullable = false)
    String thumbnail;

    @Column(nullable = false)
    String description;

    @Column(nullable = false)
    Double price;

    @Column(name = "discount_percentage")
    Double discountPercentage;

    @Column(nullable = false)
    Integer stock;

    @Column(nullable = false)
    String author;

    @Column(nullable = false)
    String supplier;

    @Column(nullable = false)
    String publisher;

    @Column(nullable = false)
    Integer publishYear;

    @Column(nullable = false)
    String language;

    @Column(nullable = false)
    String size;

    @Column(nullable = false)
    Double weight;

    @Column(name = "page_count", nullable = false)
    Integer pageCount;

    @Column(nullable = false)
    String status;

    @Column(nullable = false)
    Boolean feature;

    @Column(nullable = false)
    Integer position;

    @Column(nullable = false)
    Boolean deleted = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @OneToMany(mappedBy = "book")
    List<CartItem> cartItems;

    @OneToMany(mappedBy = "book")
    List<OrderItem> orderItems;

    @OneToMany(mappedBy = "book")
    List<Comment> comments;

    @OneToMany(mappedBy = "book")
    List<Rating> ratings;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    Category category;


}
