package com.vk.sentiment.controllers

import com.vk.api.sdk.client.VkApiClient
import com.vk.api.sdk.client.actors.UserActor
import com.vk.api.sdk.httpclient.HttpTransportClient
import com.vk.sentiment.core.DialogProcessor
import com.vk.sentiment.core.PythonClient
import com.vk.sentiment.data.SentimentalMessageRepository
import kotlinx.coroutines.sync.Mutex
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class Controller(val pythonClient: PythonClient, val sentimentalRepo: SentimentalMessageRepository) {

  @Value("\${app.id}")
  private var appId: Int = 0

  @Value("\${app.secret}")
  private lateinit var appSecret: String

  private val mutex = Mutex()

  @GetMapping("init")
  fun init(@RequestParam("code") code: String, @RequestParam("redirectUri") redirectUri: String): Int {
    val vk = VkApiClient(HttpTransportClient())
    val authResponse = vk.oauth()
      .userAuthorizationCodeFlow(appId, appSecret, redirectUri, code)
      .execute()

    val actor = UserActor(authResponse.userId, authResponse.accessToken)

    DialogProcessor(mutex, actor, vk, pythonClient, sentimentalRepo).processAll()

    return authResponse.userId
  }
}