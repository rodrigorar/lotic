package com.lotic.tasks.domain.modules.tasks

import android.content.Context
import android.util.Log
import androidx.work.Worker
import androidx.work.WorkerParameters

class SyncManagerWorker(context: Context, workerParams: WorkerParameters) : Worker(context, workerParams) {

    override fun doWork(): Result {
        try {
            SyncManager.execute()
        } catch (e: Exception) {
            Log.d("SyncManager", e.toString())
        }
        return Result.retry()
    }
}