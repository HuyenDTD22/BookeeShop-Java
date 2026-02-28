package com.huyen.bookeeshop.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/*
 * Mỗi request vào server → nếu là API public thì cho qua → nếu không thì phải có JWT hợp lệ
 */

@Configuration
@EnableWebSecurity // Bật Spring Security cho toàn bộ ứng dụng
@EnableMethodSecurity
public class SecurityConfig {

    // Các API không cần đăng nhập
    private static final String[] PUBLIC_ENDPOINTS = {
        "/users/register", "/auth/login", "/auth/introspect", "/auth/logout", "/auth/refresh"
    };

    private final CustomJwtDecoder customJwtDecoder;

    public SecurityConfig(CustomJwtDecoder customJwtDecoder) {
        this.customJwtDecoder = customJwtDecoder;
    }

    // Luồng bảo mật - Mỗi request đi vào server → phải đi qua chuỗi bảo vệ này
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        // Cấu hình ai được phép gọi API
        httpSecurity.authorizeHttpRequests(request -> request.requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS)
                .permitAll()
                .anyRequest()
                .authenticated());

        // Cấu hình xác thực bằng JWT - Khi có token -> Dùng jwtDecoder() để kiểm tra token
        httpSecurity.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwtConfigurer -> jwtConfigurer
                        .decoder(customJwtDecoder)
                        .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint()));

        // Tắt bảo vệ CSRF
        httpSecurity.csrf(AbstractHttpConfigurer::disable);

        // Hoàn tất cấu hình bảo mật -> Trả về cho Spring sử dụng
        return httpSecurity.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();

        corsConfiguration.addAllowedOrigin("http://localhost:3000");
        corsConfiguration.addAllowedMethod("*"); // Cho phép tất cả các method
        corsConfiguration.addAllowedHeader("*"); // Cho phép tất cả các header

        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration(
                "/**", corsConfiguration); // Áp dụng cho tất cả các endpoint (đường dẫn)

        return new CorsFilter(urlBasedCorsConfigurationSource);
    }

    // Customize(Tuỳ chỉnh)
    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix(""); // Chuyển từ SCOPE_ về ROLE_

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }

    // Do PasswordEncoder được sử dụng ở nhiều nơi nên init nó thành 1 cái Bean để dùng luôn
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
