package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.request.BookCreationRequest;
import com.huyen.bookeeshop.dto.request.BookUpdateRequest;
import com.huyen.bookeeshop.dto.response.BookResponse;
import com.huyen.bookeeshop.entity.Book;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.BookMapper;
import com.huyen.bookeeshop.repository.BookRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookService {
    BookRepository bookRepository;
    BookMapper bookMapper;
    CloudinaryService cloudinaryService;

    public BookResponse create(BookCreationRequest request, MultipartFile thumbnail) {
        var book = bookMapper.toBook(request);

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

    public BookResponse update(UUID bookId, BookUpdateRequest request, MultipartFile thumbnail)  {
        var book = bookRepository.findByIdAndDeletedFalse(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        bookMapper.updateBook(book, request);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            String imageUrl = cloudinaryService.uploadFile(thumbnail);
            book.setThumbnail(imageUrl);
        }

        return bookMapper.toBookResponse(bookRepository.save(book));
    }

    public List<BookResponse> getAll() {
        try {
            return bookRepository.findAllByDeletedFalse()
                    .stream()
                    .map(bookMapper::toBookResponse)
                    .toList();

        } catch (Exception e) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }
    }

    public BookResponse getById(UUID bookId) {
        return bookRepository.findByIdAndDeletedFalse(bookId)
                .map(bookMapper::toBookResponse)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
    }

    public void delete(UUID bookId) {
        Book book = bookRepository.findByIdAndDeletedFalse(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        book.setDeleted(true);
        book.setDeletedAt(LocalDateTime.now());

        bookRepository.save(book);
    }
}
