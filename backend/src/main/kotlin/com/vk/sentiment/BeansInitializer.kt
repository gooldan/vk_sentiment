package com.vk.sentiment

import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.support.GenericApplicationContext
import org.springframework.context.support.beans

class BeansInitializer : ApplicationContextInitializer<GenericApplicationContext> {
  override fun initialize(ctx: GenericApplicationContext) = beans {
    bean {}
  }.initialize(ctx)
}