package com.huyen.bookeeshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminReplyCommentRequest {

    @NotBlank(message = "COMMENT_CONTENT_BLANK")
    @Size(max = 1000)
    String content;

}