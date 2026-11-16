package com.example.sensordashboard

import android.app.Application
import com.google.firebase.FirebaseApp
import com.google.firebase.database.FirebaseDatabase

class SensorDashboardApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize Firebase
        FirebaseApp.initializeApp(this)
        // Enable offline persistence for Realtime Database
        FirebaseDatabase.getInstance().setPersistenceEnabled(true)
    }
}