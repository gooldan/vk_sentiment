package com.vk.sentiment.controllers

import com.vk.api.sdk.client.actors.UserActor
import com.vk.sentiment.core.*
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
class InitController(val dialogProcessor: DialogProcessor, val usersHolder: UsersHolder, val smartVkClient: SmartVkClient) {

  @Value("\${app.id}")
  private lateinit var appId: String

  @Value("\${app.secret}")
  private lateinit var appSecret: String

  private val logger: Logger = LoggerFactory.getLogger(InitController::class.java)

  @GetMapping("init")
  fun init(@RequestParam("code") code: String, @RequestParam("redirectUri") redirectUri: String): Int {
    logger.info("Login request received")
    val authResponse = smartVkClient.auth(appId, appSecret, redirectUri, code)

    val actor = UserActor(authResponse.userId, authResponse.accessToken)
    usersHolder.put(actor.id, actor)

    dialogProcessor.processAll(actor)

    return authResponse.userId
  }
}