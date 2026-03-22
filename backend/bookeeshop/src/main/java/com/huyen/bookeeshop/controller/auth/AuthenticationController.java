package com.huyen.bookeeshop.controller.auth;

import java.text.ParseException;

import com.huyen.bookeeshop.dto.request.AuthenticationRequest;
import com.huyen.bookeeshop.dto.request.IntrospectRequest;
import com.huyen.bookeeshop.dto.request.LogoutRequest;
import com.huyen.bookeeshop.dto.request.RefreshRequest;
import com.huyen.bookeeshop.dto.response.ApiResponse;
import com.huyen.bookeeshop.dto.response.AuthenticationResponse;
import com.huyen.bookeeshop.dto.response.IntrospectResponse;
import com.huyen.bookeeshop.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nimbusds.jose.JOSEException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Tag(name = "Authentication", description = "Authentication APIs for client and admin")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;

    @Operation(summary = "Login with username and password to get access token")
    @PostMapping("/login")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody @Valid AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);

        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @Operation(summary = "Introspect an access token to check if it's valid and get its information")
    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody @Valid IntrospectRequest request)
            throws JOSEException, ParseException {
        var result = authenticationService.introspect(request);

        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    @Operation(summary = "Refresh an access token using a refresh token")
    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refreshToken(@RequestBody @Valid RefreshRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);

        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @Operation(summary = "Logout by invalidating the access token")
    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody @Valid LogoutRequest request) throws JOSEException, ParseException {
        authenticationService.logout(request);

        return ApiResponse.<Void>builder().build();
    }
}
