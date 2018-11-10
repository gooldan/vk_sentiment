package com.vk.sentiment.core

import com.vk.api.sdk.client.actors.UserActor
import java.util.concurrent.ConcurrentHashMap


class UsersHolder {
  private val usersMap = ConcurrentHashMap<Int, UserActor>()

  fun put(userId: Int, actor: UserActor) {
    usersMap[userId] = actor
  }

  fun get(userId: Int): UserActor? = usersMap[userId]
}