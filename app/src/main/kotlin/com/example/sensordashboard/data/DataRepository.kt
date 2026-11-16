package com.example.sensordashboard.data

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

interface DataRepository {
    val dashboardData: Flow<DashboardData>
    fun startListening()
    fun stopListening()
    fun resetMinMax()
}

class DefaultDataRepository(private val firebaseRepository: FirebaseRepository = FirebaseRepository()) : DataRepository {

    private val _dashboardData = MutableStateFlow(DashboardData())
    override val dashboardData: Flow<DashboardData> = _dashboardData.asStateFlow()

    override fun startListening() {
        firebaseRepository.startListening()
        // Forward Firebase data to our state flow
        CoroutineScope(Dispatchers.Main).launch {
            firebaseRepository.dashboardData.collect { data ->
                _dashboardData.value = data
            }
        }
    }

    override fun stopListening() {
        firebaseRepository.stopListening()
    }

    override fun resetMinMax() {
        firebaseRepository.resetMinMax()
    }
}