package com.vk.sentiment.controllers

import com.vk.sentiment.data.SentimentalMessage
import com.vk.sentiment.data.SentimentalMessageRepository
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
class ActionController(val sentimentalRepo: SentimentalMessageRepository) {

  @GetMapping("sentiment")
  fun sentiment(@RequestParam("userId") userId: Int, @RequestParam("messageId") messageId: Int): SentimentalResult? {
    val messages = sentimentalRepo.findAllByUserIdAndMessageId(userId, messageId)
    return if (messages.isNotEmpty()) SentimentalResult(true, messages[0]) else SentimentalResult(false, null)
  }
}

data class SentimentalResult(val status: Boolean, val sentimentalMessage: SentimentalMessage?)