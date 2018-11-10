package com.vk.sentiment.core

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.springframework.http.HttpEntity
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.web.client.RestTemplate

class PythonClient {

  fun sendMessage(messageId: Int, userId: Int, body: String) {
    val objectMapper = ObjectMapper().registerKotlinModule()
    val messageConverter = MappingJackson2HttpMessageConverter()
    messageConverter.setPrettyPrint(false)
    messageConverter.objectMapper = objectMapper
    val restTemplate = RestTemplate()
    val request = HttpEntity(MessageDto(messageId, userId, body))
    val response = restTemplate.postForEntity("http://192.168.1.39:5000/get_score_pos_neg", request, MlResponse::class.java)
    println(response)
  }
}

private data class MessageDto(val messageID: Int, val userID: Int, val message: String)
data class MlResponse(val neg: Double, val pos: Double)