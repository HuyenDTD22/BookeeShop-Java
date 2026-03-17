package com.huyen.bookeeshop.controller.admin;

import com.huyen.bookeeshop.dto.request.AdminReplyCommentRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.BookCommentResponse;
import com.huyen.bookeeshop.dto.response.CommentResponse;
import com.huyen.bookeeshop.service.CommentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/admin/comments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminCommentController {

    CommentService commentService;

    @GetMapping("/books/{bookId}")
    @PreAuthorize("hasAuthority('COMMENT_LIST_VIEW')")
    ApiResponse<BookCommentResponse> getCommentsByBookId(@PathVariable UUID bookId) {
        return ApiResponse.<BookCommentResponse>builder()
                .result(commentService.getCommentsByBookId(bookId))
                .build();
    }

    @PostMapping(value = "/{parentCommentId}/reply", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('COMMENT_REPLY')")
    ApiResponse<CommentResponse> replyComment(
            @PathVariable UUID parentCommentId,
            @RequestPart("data") @Valid AdminReplyCommentRequest request,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        return ApiResponse.<CommentResponse>builder()
                .result(commentService.adminReplyComment(parentCommentId, request, thumbnail))
                .build();
    }

    @DeleteMapping("/{commentId}")
    @PreAuthorize("hasAuthority('COMMENT_DELETE')")
    ApiResponse<Void> deleteComment(@PathVariable UUID commentId) {
        commentService.adminDeleteComment(commentId);
        return ApiResponse.<Void>builder()
                .message("Comment deleted successfully")
                .build();
    }

}