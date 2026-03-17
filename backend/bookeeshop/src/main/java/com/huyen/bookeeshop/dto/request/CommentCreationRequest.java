package com.huyen.bookeeshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentCreationRequest {

    @NotNull(message = "BOOK_NOT_FOUND")
    UUID bookId;

    UUID parentId;

    @NotBlank(message = "COMMENT_CONTENT_BLANK")
    @Size(max = 1000)
    String content;
}