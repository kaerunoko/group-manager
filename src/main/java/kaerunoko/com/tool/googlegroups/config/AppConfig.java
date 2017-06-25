package kaerunoko.com.tool.googlegroups.config;

import kaerunoko.com.tool.googlegroups.service.SampleService;
import kaerunoko.com.tool.googlegroups.service.SampleServiceImpl;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import(ThymeleafConfig.class)
public class AppConfig {
	@Bean
	SampleService sampleService() {
		return new SampleServiceImpl();
	}
}
