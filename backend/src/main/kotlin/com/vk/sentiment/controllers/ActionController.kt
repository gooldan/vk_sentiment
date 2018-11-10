package com.vk.sentiment.controllers

import com.vk.api.sdk.client.VkApiClient
import com.vk.api.sdk.httpclient.HttpTransportClient
import com.vk.sentiment.core.UsersHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class ActionController(val usersHolder: UsersHolder) {

  private val vk = VkApiClient(HttpTransportClient())

  @GetMapping("messages")
  fun printMessages(@RequestParam("userId") userId: Int) {
//    val user = usersHolder.get(userId)!!
//
//    val getResponse = vk.messages()
//      .get(user)
//      .filters(8)
//      .count(10)
//      .execute()
//
//    getResponse.items.forEach {
//      println(it.body)
//    }
  }
}