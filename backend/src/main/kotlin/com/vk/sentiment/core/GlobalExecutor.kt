package com.vk.sentiment.core

import java.util.concurrent.*

class GlobalExecutor {
  val queue = ConcurrentLinkedDeque<Pair<() -> Any, CompletableFuture<Any>>>()

  init {
    Executors
      .newSingleThreadScheduledExecutor()
      .scheduleWithFixedDelay(command, 0, 300, TimeUnit.MILLISECONDS)
  }

  private val command: Runnable
    get() = Runnable {
      val (action, future) = queue.pollFirst() ?: return@Runnable
      future.complete(action())
      Unit
    }

  inline fun <reified T> add(noinline action: () -> T): CompletableFuture<T> {
    val future = CompletableFuture<Any>()
    queue.addLast((action as () -> Any) to future)
    return future.thenApply { it as T }
  }

  inline fun <reified T> addToFront(noinline action: () -> T): CompletableFuture<T> {
    val future = CompletableFuture<Any>()
    queue.addFirst((action as () -> Any) to future)
    return future.thenApply { it as T }
  }
}