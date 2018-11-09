package com.vk.sentiment

import com.vk.api.sdk.client.VkApiClient
import com.vk.api.sdk.client.actors.UserActor
import com.vk.api.sdk.httpclient.HttpTransportClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api")
class Controller {

  @Value("\${app.id}")
  private var appId: Int = 0

  @Value("\${app.secret}")
  private lateinit var appSecret: String

  @GetMapping("messages")
  fun hello(code: String, redirectUri: String): String {
    val vk = VkApiClient(HttpTransportClient())
    val authResponse = vk.oauth()
      .userAuthorizationCodeFlow(appId, appSecret, redirectUri, code)
      .execute()

    val actor = UserActor(authResponse.userId, authResponse.accessToken)

    val getResponse = vk.wall().get(actor)
      .ownerId(authResponse.userId)
      .count(10)
      .execute()

    getResponse.items.forEach {
      print(it.likes.count)
    }

    return "Kolyan durak"
  }

  @GetMapping("callback")
  fun callback(): String {
    println("***\n\n\ntest")
    return "lolol"
  }

  @GetMapping("login")
  fun login() {

  }
}