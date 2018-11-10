package com.vk.sentiment.core

import com.vk.api.sdk.client.VkApiClient
import com.vk.api.sdk.client.actors.UserActor
import com.vk.api.sdk.httpclient.HttpTransportClient
import com.vk.api.sdk.objects.messages.Message

class SmartVkClient(val usersHolder: UsersHolder) {
  private val vk = VkApiClient(HttpTransportClient())

  fun auth(appId: String, appSecret: String, redirectUri: String, code: String) = vk.oauth()
    .userAuthorizationCodeFlow(appId.toInt(), appSecret, redirectUri, code)
    .execute()!!

  fun getHistory(actor: UserActor, peerId: Int) =
    vk.messages().getHistory(actor).count(200).peerId(peerId).execute()!!

  fun getDialogs(actor: UserActor) = vk.messages().getDialogs(actor).count(200).execute()!!

  fun getMessage(actor: UserActor, messageId: Int): Message? {
    val messages = vk.messages().getById(actor, messageId).execute().items
    return if (messages.isEmpty()) null else messages[0]
  }

  fun getMessage(userId: Int, messageId: Int): Message? {
    val actor = usersHolder.get(userId) ?: return null
    return getMessage(actor, messageId)
  }
}