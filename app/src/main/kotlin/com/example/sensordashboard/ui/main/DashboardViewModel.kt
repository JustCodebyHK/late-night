package com.example.sensordashboard.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.sensordashboard.data.DataRepository
import com.example.sensordashboard.data.DashboardData
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class DashboardViewModel(private val dataRepository: DataRepository) : ViewModel() {

    // Start listening when ViewModel is created
    init {
        dataRepository.startListening()
    }

    override fun onCleared() {
        super.onCleared()
        dataRepository.stopListening()
    }

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState

    init {
        viewModelScope.launch {
            dataRepository.dashboardData.collect { dashboardData ->
                val current = dashboardData.current
                val minMax = dashboardData.minMax

                // Calculate heat index
                val heatIndex = calculateHeatIndex(current.temperature, current.humidity)

                // Calculate dew point
                val dewPoint = calculateDewPoint(current.temperature, current.humidity)

                _uiState.value = DashboardUiState.Success(
                    temperature = current.temperature,
                    humidity = current.humidity,
                    gasPercent = current.gasPercent,
                    heatIndex = heatIndex,
                    dewPoint = dewPoint,
                    minTemp = minMax.minTemp,
                    maxTemp = minMax.maxTemp,
                    minTempTime = minMax.minTempTime,
                    maxTempTime = minMax.maxTempTime,
                    minGas = minMax.minGas,
                    maxGas = minMax.maxGas,
                    minGasTime = minMax.minGasTime,
                    maxGasTime = minMax.maxGasTime,
                    isOnline = dashboardData.isOnline,
                    lastUpdate = dashboardData.lastUpdate
                )
            }
        }
    }

    fun resetMinMax() {
        dataRepository.resetMinMax()
    }

    private fun calculateHeatIndex(temp: Double?, humidity: Double?): Double? {
        if (temp == null || humidity == null) return null
        val T = temp
        val RH = humidity
        return Math.round((T + 0.33 * RH - 0.7 * T * RH / 100 - 4.0) * 10.0) / 10.0
    }

    private fun calculateDewPoint(temp: Double?, humidity: Double?): Double? {
        if (temp == null || humidity == null) return null
        val a = 17.27
        val b = 237.7
        val alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100.0)
        return Math.round((b * alpha) / (a - alpha) * 10.0) / 10.0
    }
}

sealed interface DashboardUiState {
    object Loading : DashboardUiState
    data class Error(val throwable: Throwable) : DashboardUiState
    data class Success(
        val temperature: Double?,
        val humidity: Double?,
        val gasPercent: Int?,
        val heatIndex: Double?,
        val dewPoint: Double?,
        val minTemp: Double?,
        val maxTemp: Double?,
        val minTempTime: Long?,
        val maxTempTime: Long?,
        val minGas: Int?,
        val maxGas: Int?,
        val minGasTime: Long?,
        val maxGasTime: Long?,
        val isOnline: Boolean,
        val lastUpdate: Long
    ) : DashboardUiState
}