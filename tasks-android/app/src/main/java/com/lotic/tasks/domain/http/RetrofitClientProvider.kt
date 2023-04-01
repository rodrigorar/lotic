package com.lotic.tasks.domain.http

import com.google.gson.GsonBuilder
import com.lotic.tasks.domain.http.adapters.ZonedTypeTimeDeserializer
import com.lotic.tasks.domain.modules.auth.operations.AuthOperationsProvider
import com.lotic.tasks.domain.shared.Provider
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.time.ZonedDateTime

object RetrofitClientProvider : Provider<Retrofit?> {
    private const val SERVER_URL = "http://lotic.eu:8080/api/v1/"

    private var client: Retrofit? = null;
    @Volatile
    private var semaphor: Any = ""

    override fun get(): Retrofit? {
        synchronized(semaphor) {
            if (this.client == null) {
                val httpClient = OkHttpClient.Builder()
                    .addInterceptor(AuthorizationInterceptor(AuthOperationsProvider.currentActiveAuthSessionProvider()))
                    .build()

                val gson = GsonBuilder()
                    .registerTypeAdapter(ZonedDateTime::class.java, ZonedTypeTimeDeserializer())

                this.client = Retrofit.Builder()
                    .baseUrl(SERVER_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .client(httpClient)
                    .build()
            }

            return this.client
        }
    }
}