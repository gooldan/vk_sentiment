package com.vk.sentiment.core

import com.vk.api.sdk.client.VkApiClient
import com.vk.api.sdk.client.actors.UserActor
import com.vk.api.sdk.objects.messages.Dialog
import com.vk.sentiment.data.SentimentalMessageRepository
import kotlinx.coroutines.*


class DialogProcessor(
  private val actor: UserActor,
  private val vk: VkApiClient,
  private val pythonClient: PythonClient,
  private val sentimentalRepo: SentimentalMessageRepository
) {

  fun processAll() {
    val dialogs = vk.messages().getDialogs(actor).count(200).execute()

    GlobalScope.launch {
      dialogs.items.forEach {
        processDialog(it)
        delay(300)
      }
    }
  }

  private fun processDialog(dialog: Dialog) {
    val chatId = dialog.message.userId
    val history = vk.messages().getHistory(actor).count(200).peerId(chatId).execute()
    history.items.forEach {
      GlobalScope.launch {
        val sentimentalMessage = pythonClient.sendMessage(it.id, actor.id, it.body, it.date)
        sentimentalRepo.save(sentimentalMessage)
      }
    }
  }
}