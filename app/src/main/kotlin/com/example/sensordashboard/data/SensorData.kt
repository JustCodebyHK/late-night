package com.example.sensordashboard.data

import kotlinx.serialization.Serializable

@Serializable
data class SensorReading(
    val temperature: Double? = null,
    val humidity: Double? = null,
    val gasRaw: Int? = null,
    val gasPercent: Int? = null,
    val timestamp: Long = System.currentTimeMillis()
)

@Serializable
data class MinMaxData(
    val minTemp: Double? = null,
    val maxTemp: Double? = null,
    val minTempTime: Long? = null,
    val maxTempTime: Long? = null,
    val minGas: Int? = null,
    val maxGas: Int? = null,
    val minGasTime: Long? = null,
    val maxGasTime: Long? = null
)

@Serializable
data class DashboardData(
    val current: SensorReading = SensorReading(),
    val minMax: MinMaxData = MinMaxData(),
    val isOnline: Boolean = false,
    val lastUpdate: Long = 0
)