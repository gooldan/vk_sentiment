package com.vk.sentiment.core

import com.vk.api.sdk.client.VkApiClient
import com.vk.api.sdk.client.actors.UserActor
import com.vk.api.sdk.httpclient.HttpTransportClient
import com.vk.api.sdk.objects.messages.Dialog
import com.vk.sentiment.data.SentimentalService
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory
import java.util.concurrent.*


class DialogProcessor(
  private val pythonClient: PythonClient,
  private val sentimentalService: SentimentalService
) {

  private val logger = LoggerFactory.getLogger(DialogProcessor::class.java)
  private val executor = FixRateExecutor { userActor, dialog -> processDialog(userActor, dialog) }

  private val vk = VkApiClient(HttpTransportClient())

  fun processAll(vk: VkApiClient, actor: UserActor) {
    val dialogs = vk.messages().getDialogs(actor).count(200).execute()
    val tasks = dialogs.items.map { actor to it }
    executor.add(tasks)
  }

  private fun processDialog(actor: UserActor, dialog: Dialog) {
    val chatId = dialog.message.userId
    val history = vk.messages().getHistory(actor).count(200).peerId(chatId).execute()
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

class FixRateExecutor(val action: (UserActor, Dialog) -> Unit) {
  private val queue = ConcurrentLinkedQueue<Pair<UserActor, Dialog>>()

  init {
    Executors
      .newSingleThreadScheduledExecutor()
      .scheduleWithFixedDelay({ next() }, 0, 300, TimeUnit.MILLISECONDS)
  }

  fun add(dialog: List<Pair<UserActor, Dialog>>) {
    queue.addAll(dialog)
  }

  private fun next() {
    val head = queue.poll() ?: return
    action(head.first, head.second)
  }
}