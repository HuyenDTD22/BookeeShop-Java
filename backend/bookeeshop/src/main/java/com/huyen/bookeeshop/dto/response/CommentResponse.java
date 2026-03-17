package com.huyen.bookeeshop.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommentResponse {

    UUID id;
    String content;
    String thumbnail;
    Boolean deleted;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    UserInCommentResponse user;

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    List<CommentResponse> children;

}