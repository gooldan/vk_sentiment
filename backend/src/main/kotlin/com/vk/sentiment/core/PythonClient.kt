package com.vk.sentiment.core

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.web.client.RestTemplate

class PythonClient {

  @Value("\${pythonEvalUrl}")
  private lateinit var pythonEvalUrl: String

  fun sendMessage(body: String): MlResponse {
    val restTemplate = RestTemplate()
    val request = HttpEntity(MessageDto(body))
    return restTemplate.postForEntity(pythonEvalUrl, request, MlResponse::class.java).body!!
  }
}

private data class MessageDto(val message: String)
data class MlResponse(val neg: Double, val pos: Double)