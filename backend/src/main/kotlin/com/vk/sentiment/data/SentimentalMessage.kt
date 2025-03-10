package com.vk.sentiment.data

import com.vk.api.sdk.objects.messages.Message
import com.vk.sentiment.controllers.*
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.repository.MongoRepository


class SentimentalService(val sentimentalRepo: SentimentalMessageRepository) {

  fun save(userId: Int, message: Message, neg: Double, pos: Double) {
    sentimentalRepo.save(
      SentimentalMessage(
        userId, message.id, neg, pos, message.date,
        message.userId, message.isOut, uniqueId(userId, message.id)
      )
    )
  }

  fun getDto(userId: Int, messageId: Int): SentimentalMessageDto? {
    val message = sentimentalRepo.findByUniqueId(uniqueId(userId, messageId)) ?: return null
    return SentimentalMessageDto(message.neg, message.pos, message.timestamp)
  }

  fun history(userId: Int, peerId: Int): GraphResponse {
    val messages = sentimentalRepo.findAllByUserIdAndPeerId(userId, peerId).sortedBy { it.timestamp }.takeLast(200)
    val ownMessages = messages.filter { it.owner }.map { GraphPoint(it.messageId, it.neg, it.pos, it.timestamp) }
    val others = messages.filterNot { it.owner }.map { GraphPoint(it.messageId, it.neg, it.pos, it.timestamp) }
    return GraphResponse(ownMessages, others)
  }
}

interface SentimentalMessageRepository : MongoRepository<SentimentalMessage, String> {
  fun findByUniqueId(uniqueId: Long): SentimentalMessage?
  fun findAllByUserIdAndPeerId(userId: Int, peerId: Int): List<SentimentalMessage>
}

fun uniqueId(userId: Int, messageId: Int) = userId.toLong() shl 32 or (messageId.toLong() and 0xFFFFFFFL)

data class SentimentalMessage(
  val userId: Int,
  val messageId: Int,
  val neg: Double,
  val pos: Double,
  val timestamp: Int,
  val peerId: Int,
  val owner: Boolean,
  @Id
  val uniqueId: Long? = null
)