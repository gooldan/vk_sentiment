package com.vk.sentiment

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import com.vk.sentiment.core.*
import com.vk.sentiment.data.SentimentalService
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.support.GenericApplicationContext
import org.springframework.context.support.beans
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter

class BeansInitializer : ApplicationContextInitializer<GenericApplicationContext> {
  override fun initialize(ctx: GenericApplicationContext) = beans {
    bean { UsersHolder() }
    bean { SentimentalService(ref(), ref()) }
    bean { PythonClient() }
    bean {
      val objectMapper = ObjectMapper().registerKotlinModule()
      val messageConverter = MappingJackson2HttpMessageConverter()
      messageConverter.setPrettyPrint(false)
      messageConverter.objectMapper = objectMapper
    }
    bean { DialogProcessor(ref(), ref()) }
  }.initialize(ctx)
}