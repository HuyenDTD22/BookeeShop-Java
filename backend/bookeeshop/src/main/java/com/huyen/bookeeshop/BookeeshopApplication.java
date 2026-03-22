package com.huyen.bookeeshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BookeeshopApplication {

public static void main(String[] args) {
    SpringApplication.run(BookeeshopApplication.class, args);
}

}
