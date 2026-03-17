package com.huyen.bookeeshop.controller.client;

import com.huyen.bookeeshop.dto.request.CommentCreationRequest;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CommentController {

    CommentService commentService;

    @GetMapping("/books/{bookId}")
    ApiResponse<BookCommentResponse> getCommentsByBookId(@PathVariable UUID bookId) {
        return ApiResponse.<BookCommentResponse>builder()
                .result(commentService.getCommentsByBookId(bookId))
                .build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    ApiResponse<CommentResponse> createComment(
            @RequestPart("data") @Valid CommentCreationRequest request,
            @RequestPart(value = "thumbnail", required = false) MultipartFile thumbnail) {
        return ApiResponse.<CommentResponse>builder()
                .result(commentService.createComment(request, thumbnail))
                .build();
    }

    @DeleteMapping("/{commentId}")
    ApiResponse<Void> deleteComment(@PathVariable UUID commentId) {
        commentService.deleteComment(commentId);
        return ApiResponse.<Void>builder()
                .message("Comment deleted successfully")
                .build();
    }

}