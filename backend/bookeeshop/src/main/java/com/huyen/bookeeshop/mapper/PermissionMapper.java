package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.response.PermissionResponse;
import com.huyen.bookeeshop.entity.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    PermissionResponse toPermissionResponse(Permission permission);

}