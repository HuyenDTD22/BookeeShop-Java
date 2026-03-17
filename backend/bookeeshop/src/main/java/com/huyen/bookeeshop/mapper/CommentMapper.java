package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.response.CommentResponse;
import com.huyen.bookeeshop.dto.response.UserInCommentResponse;
import com.huyen.bookeeshop.entity.Comment;
import com.huyen.bookeeshop.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "user", source = "user")
    @Mapping(target = "children", source = "children")
    CommentResponse toCommentResponse(Comment comment);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "fullName", source = "fullName")
    @Mapping(target = "avatar", source = "avatar")
    UserInCommentResponse toUserInCommentResponse(User user);

}