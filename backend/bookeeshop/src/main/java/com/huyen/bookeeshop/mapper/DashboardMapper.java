package com.huyen.bookeeshop.mapper;

import com.huyen.bookeeshop.dto.response.RevenueDataPoint;
import com.huyen.bookeeshop.dto.response.TopBookResponse;
import com.huyen.bookeeshop.dto.response.TopCustomerResponse;
import com.huyen.bookeeshop.repository.projection.RevenueDataPointProjection;
import com.huyen.bookeeshop.repository.projection.TopBookProjection;
import com.huyen.bookeeshop.repository.projection.TopCustomerProjection;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DashboardMapper {

    TopBookResponse toTopBookResponse(TopBookProjection projection);
    List<TopBookResponse> toTopBookResponseList(List<TopBookProjection> projections);

    TopCustomerResponse toTopCustomerResponse(TopCustomerProjection projection);
    List<TopCustomerResponse> toTopCustomerResponseList(List<TopCustomerProjection> projections);

    RevenueDataPoint toRevenueDataPoint(RevenueDataPointProjection projection);
    List<RevenueDataPoint> toRevenueDataPointList(List<RevenueDataPointProjection> projections);
}