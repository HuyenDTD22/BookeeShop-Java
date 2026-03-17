package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.response.RatingResponse;
import com.huyen.bookeeshop.dto.response.UserInRatingResponse;
import com.huyen.bookeeshop.entity.Rating;
import com.huyen.bookeeshop.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RatingMapper {

    RatingResponse toRatingResponse(Rating rating);

    @Mapping(target = "fullName", source = "fullName")
    @Mapping(target = "avatar", source = "avatar")
    UserInRatingResponse toUserInRatingResponse(User user);

}