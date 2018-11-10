package com.vk.sentiment

import com.vk.sentiment.core.PythonClient
import com.vk.sentiment.core.UsersHolder
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.support.GenericApplicationContext
import org.springframework.context.support.beans

class BeansInitializer : ApplicationContextInitializer<GenericApplicationContext> {
  override fun initialize(ctx: GenericApplicationContext) = beans {
    bean { UsersHolder() }
    bean { PythonClient() }
  }.initialize(ctx)
}