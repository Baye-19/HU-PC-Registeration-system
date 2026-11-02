package edu.hu.campusguard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class CampusGuardApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusGuardApplication.java, args);
        System.out.println("====================================================================");
        System.out.println("  CAMPUSGUARD BACKEND INITIALIZED - HAWASSA UNIVERSITY, ETHIOPIA    ");
        System.out.println("  Automated Campus Laptop Registration & Gate Access Control System ");
        System.out.println("====================================================================");
    }
}
