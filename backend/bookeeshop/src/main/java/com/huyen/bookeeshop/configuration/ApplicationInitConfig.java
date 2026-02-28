package com.huyen.bookeeshop.configuration;

import com.huyen.bookeeshop.service.InitService;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {

    private final InitService initService;

    @Bean
    ApplicationRunner applicationRunner() {
        return args -> initService.init();
    }
}
