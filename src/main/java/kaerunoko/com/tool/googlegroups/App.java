package kaerunoko.com.tool.googlegroups;

import kaerunoko.com.tool.googlegroups.config.AppConfig;
import kaerunoko.com.tool.googlegroups.service.SampleService;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Hello world!
 *
 */
@RestController
@SpringBootApplication
@Import(AppConfig.class)
@Slf4j
public class App {
	@RequestMapping("/")
	// URLのパスの指定
	public String index() {
		return sampleService.test();
		// return "Hello Spring Boot!";
	}

	@Autowired
	SampleService sampleService;

	public static void main(String[] args) {
		log.info("server starting...");
		SpringApplication.run(App.class, args);
		log.info("group manager is running!");
	}
}
