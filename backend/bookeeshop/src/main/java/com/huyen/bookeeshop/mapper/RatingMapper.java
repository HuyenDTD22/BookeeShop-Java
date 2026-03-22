package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.response.RatingResponse;
import com.huyen.bookeeshop.entity.Rating;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RatingMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "userUsername")
    RatingResponse toRatingResponse(Rating rating);

}