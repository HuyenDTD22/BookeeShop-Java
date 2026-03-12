package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.request.CustomerCreationRequest;
import com.huyen.bookeeshop.dto.request.CustomerUpdateRequest;
import com.huyen.bookeeshop.dto.request.StaffCreationRequest;
import com.huyen.bookeeshop.dto.request.StaffUpdateRequest;
import com.huyen.bookeeshop.dto.response.CustomerResponse;
import com.huyen.bookeeshop.dto.response.StaffResponse;
import com.huyen.bookeeshop.dto.response.UserResponse;
import com.huyen.bookeeshop.entity.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toCustomer(CustomerCreationRequest request);

    @Mapping(target = "roles", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateCustomer(@MappingTarget User user, CustomerUpdateRequest request);

    CustomerResponse toCustomerResponse(User user);

    @Mapping(target = "roles", ignore = true)
    User toStaff(StaffCreationRequest request);

    @Mapping(target = "roles", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateStaff(@MappingTarget User user, StaffUpdateRequest request);

    StaffResponse toStaffResponse(User user);

    UserResponse toUserResponse(User user);

}
