package com.vk.sentiment.core

import java.util.concurrent.*

class GlobalExecutor {
  val queue = ConcurrentLinkedQueue<Pair<() -> Any, CompletableFuture<Any>>>()

  init {
    Executors
      .newSingleThreadScheduledExecutor()
      .scheduleWithFixedDelay(command, 0, 300, TimeUnit.MILLISECONDS)
  }

  private val command: Runnable
    get() = Runnable {
      val (action, future) = queue.poll() ?: return@Runnable
      future.complete(action())
      Unit
    }

  inline fun <reified T> add(noinline action: () -> T): CompletableFuture<T> {
    val future = CompletableFuture<Any>()
    queue.add((action as () -> Any) to future)
    return future.thenApply { it as T }
  }

  inline fun <reified T> addAll(actions: Collection<() -> T>): List<CompletableFuture<T>> = actions.map { add(it) }
}