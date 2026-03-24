package com.studioflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StudioFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudioFlowApplication.class, args);
    }
}
