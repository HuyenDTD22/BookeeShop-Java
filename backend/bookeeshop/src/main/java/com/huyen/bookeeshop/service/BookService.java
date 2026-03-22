package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.request.AdminBookFilterRequest;
import com.huyen.bookeeshop.dto.request.BookCreationRequest;
import com.huyen.bookeeshop.dto.request.BookFilterRequest;
import com.huyen.bookeeshop.dto.request.BookUpdateRequest;
import com.huyen.bookeeshop.dto.response.BookCardResponse;
import com.huyen.bookeeshop.dto.response.BookDetailResponse;
import com.huyen.bookeeshop.dto.response.BookResponse;
import com.huyen.bookeeshop.entity.Book;
import com.huyen.bookeeshop.entity.Category;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.BookMapper;
import com.huyen.bookeeshop.repository.BookRepository;
import com.huyen.bookeeshop.repository.CategoryRepository;
import com.huyen.bookeeshop.specification.AdminBookSpecification;
import com.huyen.bookeeshop.specification.BookSpecification;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookService {
    BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    BookMapper bookMapper;
    CloudinaryService cloudinaryService;

    //==========================================================================
    // ADMIN APIs
    //==========================================================================

    /**
     * 1. ADMIN - Create a new book
     */
    @Transactional
    public BookResponse create(BookCreationRequest request, MultipartFile thumbnail) {
        Category category = categoryRepository.findByIdAndDeletedFalse(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        var book = bookMapper.toBook(request);
        book.setCategory(category);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(thumbnail);
            book.setThumbnail(imageUrl);
        }

        try {
            book = bookRepository.save(book);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.BOOK_EXISTED);
        }

        return bookMapper.toBookResponse(book);
    }

    /**
     * 2. ADMIN - Update information of an existing book
     */
    @Transactional
    public BookResponse update(UUID bookId, BookUpdateRequest request, MultipartFile thumbnail)  {
        var book = bookRepository.findByIdAndDeletedFalse(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        bookMapper.updateBook(book, request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndDeletedFalse(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            book.setCategory(category);
        }

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(thumbnail);
            book.setThumbnail(imageUrl);
        }

        return bookMapper.toBookResponse(bookRepository.save(book));
    }

    /**
     * 3. ADMIN - Get all books with pagination, filtering and sorting
     */
    @Transactional(readOnly = true)
    public Page<BookResponse> getAll(AdminBookFilterRequest filter) {
        List<UUID> categoryIds = null;

        if (filter.getCategoryId() != null) {
            categoryRepository.findByIdAndDeletedFalse(filter.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

            categoryIds = bookRepository.findAllDescendantCategoryIds(filter.getCategoryId());

            if (categoryIds.isEmpty()) {
                categoryIds = List.of(filter.getCategoryId());
            }
        }

        Specification<Book> spec = AdminBookSpecification.withFilter(filter, categoryIds);

        return bookRepository.findAll(spec, buildAdminPageable(filter))
                .map(this::enrichBookResponse);
    }

    /**
     * 4. ADMIN - Get book details by ID
     */
    @Transactional(readOnly = true)
    public BookResponse getById(UUID bookId) {
        Book book = bookRepository.findByIdAndDeletedFalse(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        return enrichBookResponse(book);
    }

    /**
     * 5. ADMIN - Deletd a book (soft delete)
     */
    @Transactional
    public void delete(UUID bookId) {
        Book book = bookRepository.findByIdAndDeletedFalse(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        book.setDeleted(true);
        book.setDeletedAt(LocalDateTime.now());

        bookRepository.save(book);
    }

    //==========================================================================
    // CLIENT APIs
    //==========================================================================

    /**
     * 1. CLIENT - Get all books with pagination, filtering and sorting
     */
    @Transactional(readOnly = true)
    public Page<BookCardResponse> getAllBooks(BookFilterRequest filter) {
        Specification<Book> spec = BookSpecification.withFilter(filter);

        return bookRepository.findAll(spec, buildPageable(filter))
                .map(this::toEnrichedCard);
    }

    /**
     * 2. CLIENT - Get featured books (isFeatured = true) with pagination, filtering and sorting
     */
    @Transactional(readOnly = true)
    public Page<BookCardResponse> getFeaturedBooks(BookFilterRequest filter) {
        Specification<Book> spec = BookSpecification.featuredWithFilter(filter);

        return bookRepository.findAll(spec, buildPageable(filter))
                .map(this::toEnrichedCard);
    }

    /**
     * 3. CLIENT - Get new books with pagination and filtering and sorting
     */
    @Transactional(readOnly = true)
    public Page<BookCardResponse> getNewestBooks(BookFilterRequest filter) {
        filter.setSortBy("createdAt");
        filter.setSortDir("desc");

        Specification<Book> spec = BookSpecification.withFilter(filter);

        return bookRepository.findAll(spec, buildPageable(filter))
                .map(this::toEnrichedCard);
    }

    /**
     * 4. CLIENT - Get all books by category (including subcategories) with pagination, filtering and sorting
     */
    @Transactional(readOnly = true)
    public Page<BookCardResponse> getBooksByCategory(UUID categoryId, BookFilterRequest filter) {
        categoryRepository.findByIdAndDeletedFalse(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Get all descendant category IDs
        List<UUID> categoryIds = bookRepository.findAllDescendantCategoryIds(categoryId);

        if (categoryIds.isEmpty()) {
            categoryIds = List.of(categoryId);
        }

        Specification<Book> spec = BookSpecification.withFilterAndCategories(filter, categoryIds);

        return bookRepository.findAll(spec, buildPageable(filter))
                .map(this::toEnrichedCard);
    }

    /**
     * 5. CLIENT - Get book details by ID
     */
    @Transactional(readOnly = true)
    public BookDetailResponse getBookById(UUID bookId) {
        Book book = bookRepository.findByIdAndDeletedFalse(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        return toEnrichedDetail(book);
    }

    /**
     * 6. CLIENT - Search books by keyword in title or author
     */
    @Transactional
    public List<BookCardResponse> searchBooks(String keyword, int size) {
        int limit = (size > 0 && size <= 50) ? size : 10;

        Specification<Book> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("deleted")));

            if (keyword != null && !keyword.isBlank()) {
                String kw = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")),  kw),
                        cb.like(cb.lower(root.get("author")), kw)
                ));
            }

            query.distinct(true);
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        return bookRepository.findAll(spec, pageable)
                .getContent()
                .stream()
                .map(this::toEnrichedCard)
                .toList();
    }

    //==========================================================================
    // HELPERS
    //==========================================================================

    /**
     * Build pageable for admin APIs with validation and default values
     */
    private Pageable buildAdminPageable(AdminBookFilterRequest filter) {
        int page = Math.max(filter.getPage(), 0);
        int size = (filter.getSize() > 0 && filter.getSize() <= 100) ? filter.getSize() : 20;

        String sortField = switch (filter.getSortBy() != null ? filter.getSortBy() : "createdAt") {
            case "title"  -> "title";
            case "price"  -> "price";
            case "stock"  -> "stock";
            default       -> "createdAt";
        };

        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDir())
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        return PageRequest.of(page, size, Sort.by(direction, sortField));
    }

    /**
     * Enrich BookResponse with average rating, total ratings and total sold
     */
    private BookResponse enrichBookResponse(Book book) {
        BookResponse response = bookMapper.toBookResponse(book);
        response.setAverageRating(bookRepository.getAverageRatingByBookId(book.getId()));
        response.setTotalRatings(bookRepository.countRatingsByBookId(book.getId()));
        response.setTotalSold(bookRepository.countPurchasesByBookId(book.getId()));
        return response;
    }

    /**
     * Enrich BookCardResponse with average rating, total ratings and purchase count
     */
    private BookCardResponse toEnrichedCard(Book book) {
        BookCardResponse card = bookMapper.toBookCardResponse(book);

        card.setAverageRating(bookRepository.getAverageRatingByBookId(book.getId()));
        card.setTotalRatings(bookRepository.countRatingsByBookId(book.getId()));
        card.setPurchaseCount(bookRepository.countPurchasesByBookId(book.getId()));

        return card;
    }

    /**
     * Enrich BookDetailResponse with average rating, total ratings and purchase count
     */
    private BookDetailResponse toEnrichedDetail(Book book) {
        BookDetailResponse detail = bookMapper.toBookDetailResponse(book);

        detail.setAverageRating(bookRepository.getAverageRatingByBookId(book.getId()));
        detail.setTotalRatings(bookRepository.countRatingsByBookId(book.getId()));
        detail.setPurchaseCount(bookRepository.countPurchasesByBookId(book.getId()));

        return detail;
    }

    /**
     * Build pageable for client APIs with validation
     */
    private Pageable buildPageable(BookFilterRequest filter) {
        int page = Math.max(filter.getPage(), 0);
        int size = (filter.getSize() > 0 && filter.getSize() <= 100) ? filter.getSize() : 10;

        String sortBy = filter.getSortBy();
        if ("rating".equals(sortBy) || "purchaseCount".equals(sortBy)) {
            return PageRequest.of(page, size);
        }

        String sortField = resolveSortField(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(filter.getSortDir())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(page, size, Sort.by(direction, sortField));
    }

    private String resolveSortField(String sortBy) {
        if (sortBy == null) return "createdAt";

        return switch (sortBy) {
            case "price"     -> "price";
            case "title"     -> "title";
            case "createdAt" -> "createdAt";
            default          -> "createdAt";
        };
    }


}
