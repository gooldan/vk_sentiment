package com.vk.sentiment.controllers

import com.vk.sentiment.data.SentimentalMessage
import com.vk.sentiment.data.SentimentalMessageRepository
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class ActionController(val sentimentalRepo: SentimentalMessageRepository) {

  @GetMapping("sentiment")
  fun sentiment(@RequestParam("userId") userId: Int, @RequestParam("messageId") messageId: Int): SentimentalResult? {
    val message = sentimentalRepo.findByUserIdAndMessageId(userId, messageId)
    return SentimentalResult(message != null, message)
  }
}

data class SentimentalResult(val status: Boolean, val sentimentalMessage: SentimentalMessage?)