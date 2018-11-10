package com.vk.sentiment.core

import org.springframework.http.MediaType
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

class PythonClient {

  private val webClient = WebClient
    .builder()
    .baseUrl("http://localhost:5000")
    .build()

  fun sendMessage(messageId: Int, userId: Int, body: String) {
    webClient
      .post()
      .uri("msg")
      .contentType(MediaType.APPLICATION_JSON)
      .body(BodyInserters.fromPublisher(Mono.just(MessageDto(messageId, userId, body)), MessageDto::class.java))
      .retrieve()
      .bodyToMono(MlResponse::class.java)
      .toFuture()
      .thenAccept { println(it) }
  }
}

private data class MessageDto(val messageId: Int, val userId: Int, val body: String)
private data class MlResponse(val neg: Double, val pos: Double)