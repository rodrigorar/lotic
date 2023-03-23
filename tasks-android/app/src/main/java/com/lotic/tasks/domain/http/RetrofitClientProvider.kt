package com.lotic.tasks.domain.http

import android.util.Log
import com.lotic.tasks.domain.modules.auth.AuthTokenProvider
import com.lotic.tasks.domain.shared.Provider
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClientProvider : Provider<Retrofit?> {
    private const val SERVER_URL = "http://lotic.eu:8080/api/v1"

    private var client: Retrofit? = null;
    @Volatile
    private var semaphor: Any = ""

    override fun execute(): Retrofit? {
        synchronized(semaphor) {
            if (this.client == null) {
                Log.d("RetrofitClientProvider", "Initializing client")

                val httpClient = OkHttpClient.Builder()
                    .addInterceptor(AuthorizationInterceptor(AuthTokenProvider))
                    .build()
                this.client = Retrofit.Builder()
                    .baseUrl(SERVER_URL)
                    .addConverterFactory(GsonConverterFactory.create())
                    .client(httpClient)
                    .build()
            }

            Log.d("RetrofitClientProvider", "Returning retrofit client")
            return this.client
        }
    }
}