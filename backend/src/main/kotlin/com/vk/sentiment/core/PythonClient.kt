package com.vk.sentiment.core

import com.vk.sentiment.data.SentimentalMessage
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.web.client.RestTemplate

class PythonClient {

  @Value("\${pythonEvalUrl}")
  private lateinit var pythonEvalUrl: String

  fun sendMessage(messageId: Int, userId: Int, body: String, timestamp: Int): SentimentalMessage {
    val restTemplate = RestTemplate()
    val request = HttpEntity(MessageDto(messageId, userId, body))
    val response = restTemplate.postForEntity(pythonEvalUrl, request, MlResponse::class.java).body!!
    return SentimentalMessage(userId, messageId, response.neg, response.pos, timestamp)
  }
}

private data class MessageDto(val messageID: Int, val userID: Int, val message: String)
data class MlResponse(val neg: Double, val pos: Double)