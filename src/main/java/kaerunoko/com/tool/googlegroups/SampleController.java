package kaerunoko.com.tool.googlegroups;

import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@Slf4j
public class SampleController {
	@RequestMapping("/sample")
	public ModelAndView hello(ModelAndView mav) {
		mav.setViewName("sample");
		mav.addObject("msg", "これはThymeleafを使ったサンプルです。");
		return mav;
	}
}
