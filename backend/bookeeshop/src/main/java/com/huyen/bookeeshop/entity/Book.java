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
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    UUID id;

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "thumbnail", nullable = false)
    String thumbnail;

    @Column(name = "description", nullable = false)
    String description;

    @Column(name = "price", nullable = false)
    Double price;

    @Column(name = "discount_percentage")
    Double discountPercentage;

    @Column(name = "stock", nullable = false)
    Integer stock;

    @Column(name = "author", nullable = false)
    String author;

    @Column(name = "supplier", nullable = false)
    String supplier;

    @Column(name = "publisher", nullable = false)
    String publisher;

    @Column(name = "publish_year", nullable = false)
    Integer publishYear;

    @Column(name = "language", nullable = false)
    String language;

    @Column(name = "size", nullable = false)
    String size;

    @Column(name = "weight", nullable = false)
    Double weight;

    @Column(name = "page_count", nullable = false)
    Integer pageCount;

    @Column(name = "status", nullable = false)
    String status;

    @Column(name = "feature", nullable = false)
    Boolean feature;

    @Column(name = "position", nullable = false)
    Integer position;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
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
