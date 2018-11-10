package com.vk.sentiment.core

import com.vk.api.sdk.client.actors.UserActor
import com.vk.api.sdk.objects.messages.Dialog
import com.vk.api.sdk.objects.messages.responses.GetHistoryResponse
import com.vk.sentiment.data.SentimentalService
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory


class DialogProcessor(
  private val pythonClient: PythonClient,
  private val sentimentalService: SentimentalService,
  private val smartVkClient: SmartVkClient,
  private val globalExecutor: GlobalExecutor
) {

  private val logger = LoggerFactory.getLogger(DialogProcessor::class.java)

  fun processAll(actor: UserActor) {
    globalExecutor
      .add { smartVkClient.getDialogs(actor) }
      .thenApply { dialogs -> dialogs.items.forEach { processDialog(actor, it) } }
  }

  private fun processDialog(actor: UserActor, dialog: Dialog) {
    val chatId = dialog.message.userId
    globalExecutor
      .add { smartVkClient.getHistory(actor, chatId) }
      .thenApply { history -> processHistory(history, actor) }
  }

  private fun processHistory(history: GetHistoryResponse, actor: UserActor) {
    history.items.forEach {
      GlobalScope.launch {
        if (sentimentalService.getDto(actor.id, it.id) == null) {
          try {
            val mlResponse = pythonClient.sendMessage(it.body)
            sentimentalService.save(actor.id, it, mlResponse.neg, mlResponse.pos)
          } catch (e: Exception) {
            logger.error("Ml state error", e)
          }
        }
      }
    }
  }
}