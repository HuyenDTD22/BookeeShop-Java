package com.huyen.bookeeshop.service;

import com.huyen.bookeeshop.dto.request.AdminReplyCommentRequest;
import com.huyen.bookeeshop.dto.request.CommentCreationRequest;
import com.huyen.bookeeshop.dto.response.BookCommentResponse;
import com.huyen.bookeeshop.dto.response.CommentResponse;
import com.huyen.bookeeshop.entity.Book;
import com.huyen.bookeeshop.entity.Comment;
import com.huyen.bookeeshop.entity.User;
import com.huyen.bookeeshop.exception.AppException;
import com.huyen.bookeeshop.exception.ErrorCode;
import com.huyen.bookeeshop.mapper.CommentMapper;
import com.huyen.bookeeshop.repository.BookRepository;
import com.huyen.bookeeshop.repository.CommentRepository;
import com.huyen.bookeeshop.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CommentService {

    CommentRepository commentRepository;
    BookRepository bookRepository;
    UserRepository userRepository;
    CommentMapper commentMapper;
    CloudinaryService cloudinaryService;

    /**
     * 1. CLIENT/ADMIN - Get all comments of a book in a tree structure
     */
    @Transactional(readOnly = true)
    public BookCommentResponse getCommentsByBookId(UUID bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }

        List<Comment> rootComments = commentRepository.findRootCommentsByBookId(bookId);
        List<CommentResponse> commentTree = rootComments.stream()
                .map(this::mapWithMaskedDeleted)
                .toList();

        int totalActive = (int) rootComments.stream()
                .filter(c -> !c.getDeleted())
                .count();

        return BookCommentResponse.builder()
                .totalComments(totalActive)
                .comments(commentTree)
                .build();
    }

    /**
     * 2. CLIENT - Create a new comment for a book (or reply to an existing comment)
     */
    @Transactional
    public CommentResponse createComment(CommentCreationRequest request, MultipartFile thumbnail) {
        User currentUser = getCurrentUser();
        Book book = getActiveBook(request.getBookId());

        // Check if user has purchased the book
        if (!commentRepository.hasUserPurchasedBook(currentUser.getId(), book.getId())) {
            throw new AppException(ErrorCode.COMMENT_NOT_PURCHASED);
        }

        // Resolve parent comment (if is reply)
        Comment parentComment = null;
        if (request.getParentId() != null) {
            parentComment = commentRepository.findByIdAndDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.COMMENT_PARENT_NOT_FOUND));

            // Ensure parent comment belongs to the same book
            if (!parentComment.getBook().getId().equals(book.getId())) {
                throw new AppException(ErrorCode.COMMENT_PARENT_BOOK_MISMATCH);
            }
        }

        String thumbnailUrl = uploadThumbnailIfPresent(thumbnail);

        Comment comment = Comment.builder()
                .content(request.getContent())
                .thumbnail(thumbnailUrl)
                .user(currentUser)
                .book(book)
                .parent(parentComment)
                .build();

        Comment savedComment = commentRepository.save(comment);

        return commentMapper.toCommentResponse(savedComment);
    }

    /**
     * 3. CLIENT - Delete own comment (soft delete)
     */
    @Transactional
    public void deleteComment(UUID commentId) {
        Comment comment = commentRepository.findByIdAndUserId(commentId, getCurrentUser().getId())
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        comment.setDeleted(true);
        commentRepository.save(comment);
    }

    /**
     * 4. ADMIN - Admin reply to a comment of customer
     */
    @Transactional
    public CommentResponse adminReplyComment(UUID parentCommentId, AdminReplyCommentRequest request, MultipartFile thumbnail) {
        User adminUser = getCurrentUser();

        Comment parentComment = commentRepository.findByIdAndDeletedFalse(parentCommentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_PARENT_NOT_FOUND));

        String thumbnailUrl = uploadThumbnailIfPresent(thumbnail);

        Comment reply = Comment.builder()
                .content(request.getContent())
                .thumbnail(thumbnailUrl)
                .user(adminUser)
                .book(parentComment.getBook())
                .parent(parentComment)
                .build();

        Comment savedReply = commentRepository.save(reply);

        return commentMapper.toCommentResponse(savedReply);
    }

    /**
     * 5. ADMIN - Delete a comment of customer (soft delete)
     */
    @Transactional
    public void adminDeleteComment(UUID commentId) {
        Comment comment = commentRepository.findByIdAndDeletedFalse(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        comment.setDeleted(true);
        commentRepository.save(comment);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameAndDeletedFalseAndLockedFalse(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private Book getActiveBook(UUID bookId) {
        return bookRepository.findByIdAndDeletedFalse(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
    }

    private String uploadThumbnailIfPresent(MultipartFile thumbnail) {
        if (thumbnail != null && !thumbnail.isEmpty()) {
            return cloudinaryService.uploadFile(thumbnail);
        }
        return null;
    }

    /**
     * Map the comment to a response object. Hide its content if it is deleted
     */
    private CommentResponse mapWithMaskedDeleted(Comment comment) {
        CommentResponse response = commentMapper.toCommentResponse(comment);

        if (Boolean.TRUE.equals(comment.getDeleted())) {
            response.setContent("[Bình luận đã bị xóa]");
            response.setThumbnail(null);
            response.setUser(null);
        }

        // Resolve recursion for children
        if (comment.getChildren() != null && !comment.getChildren().isEmpty()) {
            List<CommentResponse> childResponses = comment.getChildren().stream()
                    .filter(child -> !child.getDeleted() || !child.getChildren().isEmpty())
                    .map(this::mapWithMaskedDeleted)
                    .toList();
            response.setChildren(childResponses);
        }

        return response;
    }

}