package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.request.RoleCreationRequest;
import com.huyen.bookeeshop.dto.request.RoleUpdateRequest;
import com.huyen.bookeeshop.dto.response.RoleResponse;
import com.huyen.bookeeshop.entity.Role;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleCreationRequest request);

    @Mapping(target = "permissions", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateRole(@MappingTarget Role role, RoleUpdateRequest request);

    RoleResponse toRoleResponse(Role role);
}
