package com.vk.sentiment.data

import org.springframework.data.mongodb.repository.MongoRepository


interface SentimentalMessageRepository : MongoRepository<SentimentalMessage, String> {
  fun findAllByUserIdAndMessageId(userId: Int, messageId: Int): List<SentimentalMessage>
}

data class SentimentalMessage(
  val userId: Int,
  val messageId: Int,
  val neg: Double,
  val pos: Double,
  val timestamp: Int
)