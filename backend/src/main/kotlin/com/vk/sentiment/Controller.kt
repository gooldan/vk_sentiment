package com.vk.sentiment

import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api")
class Controller {

  @GetMapping("hello")
  fun hello(): String {
    return "Kolyan durak"
  }
}