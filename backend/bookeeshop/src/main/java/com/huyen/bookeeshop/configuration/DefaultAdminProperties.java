package com.huyen.bookeeshop.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.default-admin")
public class DefaultAdminProperties {
    private String username;
    private String password;
}
