package com.vk.sentiment.controllers

import com.vk.api.sdk.client.VkApiClient
import com.vk.api.sdk.client.actors.UserActor
import com.vk.api.sdk.httpclient.HttpTransportClient
import com.vk.sentiment.core.DialogProcessor
import com.vk.sentiment.core.UsersHolder
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class Controller(val dialogProcessor: DialogProcessor, val usersHolder: UsersHolder) {

  @Value("\${app.id}")
  private lateinit var appId: String

  @Value("\${app.secret}")
  private lateinit var appSecret: String

  @GetMapping("init")
  fun init(@RequestParam("code") code: String, @RequestParam("redirectUri") redirectUri: String): Int {
    val vk = VkApiClient(HttpTransportClient())
    val authResponse = vk.oauth()
      .userAuthorizationCodeFlow(appId.toInt(), appSecret, redirectUri, code)
      .execute()

    val actor = UserActor(authResponse.userId, authResponse.accessToken)
    usersHolder.put(actor.id, actor)

    dialogProcessor.processAll(vk, actor)

    return authResponse.userId
  }
}