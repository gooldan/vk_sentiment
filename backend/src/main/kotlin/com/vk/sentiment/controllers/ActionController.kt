package com.vk.sentiment.controllers

import com.google.common.cache.CacheBuilder
import com.vk.sentiment.core.PythonClient
import com.vk.sentiment.data.SentimentalService
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/api")
class ActionController(
  val sentimentalService: SentimentalService,
  val pythonClient: PythonClient) {

  private val cache = CacheBuilder
    .newBuilder()
    .maximumSize(20000)
    .build<Pair<Int, Int>, SentimentalMessageDto>()

  @PostMapping("online")
  fun online(@RequestBody request: OnlineRequest): OnlineResult {
    val mlResult = pythonClient.sendMessage(request.text)
    return OnlineResult(mlResult.neg, mlResult.pos)
  }

  @GetMapping("graph")
  fun graph(@RequestParam("userId") userId: Int, @RequestParam("peerId") peerId: Int): GraphResponse {
    return sentimentalService.history(userId, peerId)
  }

  @PostMapping("sentiment")
  fun sentiment(@RequestBody request: SentimentRequest): SentimentalResult {
    val key = request.userId to request.messageId
    val value = cache.get(key) {
      val messages = sentimentalService.getDto(request.userId, request.messageId)
      if (messages != null) {
        return@get messages
      }
      val mlResult = pythonClient.sendMessage(request.text)
      val result = SentimentalMessageDto(mlResult.neg, mlResult.pos, request.ts)

      //GlobalScope.launch { sentimentalService.save(request.userId, request.messageId, result.neg, result.pos) }
      return@get result
    }
    return SentimentalResult(value != null, value)
  }
}

data class GraphResponse(val own: List<GraphPoint>, val other: List<GraphPoint>)
data class GraphPoint(val messageId: Int, val neg: Double, val pos: Double, val timestamp: Int)

data class OnlineRequest(val text: String)
data class OnlineResult(val neg: Double, val pos: Double)

data class SentimentRequest(val userId: Int, val messageId: Int, val text: String, val ts: Int)
data class SentimentalResult(val status: Boolean, val sentimentalMessage: SentimentalMessageDto?)
data class SentimentalMessageDto(val neg: Double, val pos: Double, val timestamp: Int)